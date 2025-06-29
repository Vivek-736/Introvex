import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

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

function sanitizeMarkdown(md: string): string[] {
  return md
    .replace(/\*\*(.*?)\*\*/g, '$1') // remove bold markdown
    .replace(/\*(.*?)\*/g, '$1')      // remove italics *
    .replace(/_(.*?)_/g, '$1')        // remove italics _
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);
}

export async function POST(req: Request) {
  try {
    const { latex: markdown, chatId } = await req.json();
    if (!markdown || !chatId) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([595.28, 841.89]); // A4
    const { width, height } = page.getSize();

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const fontSize = 12;
    const lineSpacing = fontSize + 4;
    const margin = 50;
    const maxTextWidth = width - margin * 2;
    let y = height - margin;

    const lines = sanitizeMarkdown(markdown);

    let isFirstLine = true;

    const sectionHeaders = [
      "Abstract", "Introduction", "Literature Review", "Methodology", "Discussion", "Conclusion",
      "References", "Participants", "Measures", "Procedure", "Data Analysis", "Ethical Considerations"
    ];

    for (let line of lines) {
      // Remove heading markdown
      const cleanLine = line.replace(/^#+\s*/, "").trim();

      // Title
      if (isFirstLine) {
        const titleFontSize = 18;
        const titleLines = wrapText(cleanLine, maxTextWidth, bold, titleFontSize);
        for (const line of titleLines) {
          const textWidth = bold.widthOfTextAtSize(line, titleFontSize);
          page.drawText(line, {
            x: (width - textWidth) / 2,
            y,
            font: bold,
            size: titleFontSize,
            color: rgb(0, 0, 0),
          });
          y -= titleFontSize + 4;
        }
        y -= 10;
        isFirstLine = false;
        continue;
      }

      // Author line
      if (cleanLine.toLowerCase().startsWith("author:")) {
        const authorFontSize = 12;
        const authorWidth = bold.widthOfTextAtSize(cleanLine, authorFontSize);
        page.drawText(cleanLine, {
          x: (width - authorWidth) / 2,
          y,
          font: bold,
          size: authorFontSize,
          color: rgb(0.1, 0.1, 0.1),
        });
        y -= authorFontSize + 14;
        continue;
      }

      // Section header
      const isHeader = sectionHeaders.some(
        (header) => cleanLine.toLowerCase() === header.toLowerCase()
      );

      if (isHeader) {
        y -= 4;
        page.drawText(cleanLine, {
          x: margin,
          y,
          font: bold,
          size: fontSize + 2,
          color: rgb(0, 0, 0),
        });
        y -= lineSpacing;
        continue;
      }

      // Paragraph
      const wrappedLines = wrapText(cleanLine, maxTextWidth, font, fontSize);
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