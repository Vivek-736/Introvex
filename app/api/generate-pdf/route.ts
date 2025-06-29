import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import MarkdownIt from "markdown-it";

export const config = {
  runtime: "nodejs",
};

function wrapText(text: string, maxWidth: number, font: any, fontSize: number): string[] {
  const words = text.split(" ");
  const lines = [];
  let line = "";

  for (const word of words) {
    const width = font.widthOfTextAtSize(line + word, fontSize);
    if (width > maxWidth) {
      lines.push(line.trim());
      line = word + " ";
    } else {
      line += word + " ";
    }
  }

  if (line) lines.push(line.trim());
  return lines;
}

export async function POST(req: Request) {
  try {
    const { latex: markdown, chatId } = await req.json();
    if (!markdown || !chatId) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const md = new MarkdownIt();
    const html = md.render(markdown);
    const plainText = html.replace(/<\/?[^>]+(>|$)/g, "");

    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([595.28, 841.89]); // A4
    const { width, height } = page.getSize();

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const fontSize = 12;
    const lineSpacing = fontSize + 4;
    const headingSpacing = 8;
    const margin = 50;
    const maxTextWidth = width - margin * 2;
    let y = height - margin;

    const paragraphs = plainText
      .split(/\n+/)
      .map((p) => p.trim())
      .filter(Boolean);

    let isFirstParagraph = true;

    for (let p of paragraphs) {
      // Title
      if (isFirstParagraph) {
        const titleFontSize = 16;
        const titleLines = wrapText(p, maxTextWidth, bold, titleFontSize);
        for (const line of titleLines) {
          const textWidth = bold.widthOfTextAtSize(line, titleFontSize);
          page.drawText(line, {
            x: (width - textWidth) / 2,
            y,
            font: bold,
            size: titleFontSize,
            color: rgb(0, 0, 0),
          });
          y -= titleFontSize + 2;
        }
        y -= 10;
        isFirstParagraph = false;
        continue;
      }

      if (p.toLowerCase().startsWith("author:")) {
        const authorFontSize = 12;
        const authorWidth = font.widthOfTextAtSize(p, authorFontSize);
        page.drawText(p, {
          x: (width - authorWidth) / 2,
          y,
          font,
          size: authorFontSize,
          color: rgb(0.2, 0.2, 0.2),
        });
        y -= authorFontSize + 16;
        continue;
      }

      const sectionHeaders = [
        "Abstract",
        "Introduction",
        "Literature Review",
        "Methodology",
        "Discussion",
        "Conclusion",
        "References",
        "Participants",
        "Measures",
        "Procedure",
        "Data Analysis",
        "Ethical Considerations",
      ];

      const isHeader = sectionHeaders.some(
        (h) => p.toLowerCase() === h.toLowerCase()
      );

      if (isHeader) {
        y -= 6;
        page.drawText(p, {
          x: margin,
          y,
          font: bold,
          size: fontSize + 1,
          color: rgb(0, 0, 0),
        });
        y -= lineSpacing + 4;
        continue;
      }

      const wrappedLines = wrapText(p, maxTextWidth, font, fontSize);
      for (const line of wrappedLines) {
        if (y < margin + lineSpacing) {
          page = pdfDoc.addPage([width, height]);
          y = height - margin;
        }

        page.drawText(line, {
          x: margin,
          y,
          font,
          size: fontSize,
          color: rgb(0, 0, 0),
        });

        y -= lineSpacing;
      }

      y -= 6;
    }

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="research-paper-${chatId}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("🔥 PDF Generation Error:", error);
    return NextResponse.json(
      { error: "PDF generation failed", details: error.message },
      { status: 500 }
    );
  }
}