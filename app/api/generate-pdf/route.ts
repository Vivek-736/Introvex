import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export const config = {
  runtime: "nodejs",
};

function sanitizeMarkdown(md: string): string[] {
  return md
    .replace(/```[\s\S]*?```/g, "")
    .replace(/^```.*$/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/_(.*?)_/g, "$1")
    .replace(/^#{1,6}\s*/gm, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function wrapText(
  text: string,
  maxWidth: number,
  font: any,
  fontSize: number
): string[] {
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

    const contentLines = sanitizeMarkdown(markdown);
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([595.28, 841.89]);
    const { width, height } = page.getSize();

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const baseFontSize = 12;
    const titleFontSize = baseFontSize * 1.5;
    const lineSpacing = baseFontSize * 1.5;
    const margin = width * 0.1;
    const maxTextWidth = width - margin * 2;
    const sectionGap = baseFontSize * 2;
    const headingToContentGap = baseFontSize * 1.2;
    const paragraphGap = baseFontSize * 0.8;
    let y = height - margin;

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

    let isFirstParagraph = true;

    for (let i = 0; i < contentLines.length; i++) {
      const p = contentLines[i];

      if (isFirstParagraph && p.toLowerCase().startsWith("title:")) {
        const titleText = p.replace(/^title:\s*/i, "").trim();
        const titleLines = wrapText(
          titleText,
          maxTextWidth,
          bold,
          titleFontSize
        );
        for (const line of titleLines) {
          const textWidth = bold.widthOfTextAtSize(line, titleFontSize);
          if (y < margin + titleFontSize + lineSpacing) {
            page = pdfDoc.addPage([width, height]);
            y = height - margin;
          }
          page.drawText(line, {
            x: (width - textWidth) / 2,
            y,
            font: bold,
            size: titleFontSize,
            color: rgb(0, 0, 0),
          });
          y -= lineSpacing;
        }
        y -= sectionGap;
        isFirstParagraph = false;
        continue;
      }

      if (p.toLowerCase().startsWith("author:")) {
        const authorText = p.replace(/^author:\s*/i, "").trim();
        const authorFontSize = baseFontSize;
        const authorStr = `Author: ${authorText}`;
        const authorWidth = bold.widthOfTextAtSize(authorStr, authorFontSize);

        if (y < margin + authorFontSize + sectionGap) {
          page = pdfDoc.addPage([width, height]);
          y = height - margin;
        }

        page.drawText(authorStr, {
          x: (width - authorWidth) / 2,
          y,
          font: bold,
          size: authorFontSize,
          color: rgb(0.1, 0.1, 0.1),
        });
        y -= lineSpacing + sectionGap;
        continue;
      }

      const isHeader = sectionHeaders.some((h) =>
        p.toLowerCase().startsWith(h.toLowerCase() + ":")
      );
      if (isHeader) {
        const split = p.split(":");
        const header = split[0].trim();
        const content = split.slice(1).join(":").trim();

        const headerHeight = baseFontSize * 1.1 + headingToContentGap;
        const contentLines = wrapText(
          content,
          maxTextWidth,
          font,
          baseFontSize
        );
        const contentHeight = contentLines.length * lineSpacing;

        if (y < margin + headerHeight + contentHeight) {
          page = pdfDoc.addPage([width, height]);
          y = height - margin;
        }

        y -= sectionGap;
        page.drawText(`${header}:`, {
          x: margin,
          y,
          font: bold,
          size: baseFontSize * 1.1,
          color: rgb(0, 0, 0),
        });

        y -= headingToContentGap;

        for (const line of contentLines) {
          if (y < margin + lineSpacing) {
            page = pdfDoc.addPage([width, height]);
            y = height - margin;
          }

          page.drawText(line, {
            x: margin,
            y,
            font,
            size: baseFontSize,
            color: rgb(0, 0, 0),
          });
          y -= lineSpacing;
        }

        y -= paragraphGap;
        continue;
      }

      const lines = wrapText(p, maxTextWidth, font, baseFontSize);
      const blockHeight = lines.length * lineSpacing;

      if (y < margin + blockHeight) {
        page = pdfDoc.addPage([width, height]);
        y = height - margin;
      }

      for (const line of lines) {
        page.drawText(line, {
          x: margin,
          y,
          font,
          size: baseFontSize,
          color: rgb(0, 0, 0),
        });
        y -= lineSpacing;
      }

      y -= paragraphGap;
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