import { NextResponse } from "next/server";
import puppeteer from "puppeteer";

export const config = {
  runtime: "nodejs",
};

export async function POST(req: Request) {
  try {
    const { html: htmlInput, chatId } = await req.json();

    if (!htmlInput || !chatId) {
      return NextResponse.json(
        { error: "Missing html or chatId" },
        { status: 400 }
      );
    }

    // Remove ```html and ``` markers and clean OCR artifacts
    const cleanedHtml = htmlInput
      .replace(/```html\s*|```/g, "")
      .replace(/Where:\s*S\s*=\s*S\.e\(r\(t\)\s*(?=\s*Where:|$)/g, "") // Remove repetitive OCR noise
      .replace(/2011\s*11:12/g, "") // Remove timestamp noise
      .trim();

    // Basic validation for HTML structure
    if (!cleanedHtml.includes("<html") || !cleanedHtml.includes("<body>")) {
      return NextResponse.json(
        { error: "Invalid HTML structure: Missing <html> or <body>" },
        { status: 400 }
      );
    }

    //@ts-ignore
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    // Inject CSS with adjusted spacing and Google Fonts
    const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&family=Outfit:wght@500;700&display=swap" rel="stylesheet">
        <style>
          body {
            font-family: 'Merriweather', serif;
            margin: 0;
            padding: 20px;
            line-height: 1.6;
            color: #333;
            font-size: 14px;
          }

          h1, h2 {
            font-family: 'Outfit', sans-serif;
            color: #1a1a1a;
          }

          h1 {
            text-align: center;
            font-size: 2.2em;
            margin: -155px 0 20px; /* Retain your original title position */
          }

          h2 {
            font-size: 1.6em;
            margin: 30px 0 15px;
          }

          .abstract {
            border-left: 4px solid #000; /* Changed to black */
            padding-left: 16px;
            margin: 20px 0 25px;
          }

          .section {
            margin-bottom: 30px;
          }

          p {
            margin: 10px 0;
          }

          ul {
            padding-left: 20px;
            margin: 10px 0 20px;
          }

          table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            margin: 10px 0 25px 0; /* Reduced margin above table */
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 5px rgba(0, 0, 0, 0.08);
          }

          th, td {
            border: 1px solid #ccc;
            padding: 10px 12px;
            text-align: left;
            background-color: #fff;
          }

          th {
            background-color: #f5f5f5;
            font-weight: 700;
          }

          /* Prevent page breaks in bad places */
          h1, h2 {
            page-break-after: avoid;
          }

          table, tr, td, th {
            page-break-inside: avoid !important;
          }

          @page {
            margin: 20mm 15mm;
          }

          * {
            orphans: 2;
            widows: 2;
          }
        </style>
      </head>
      <body>${cleanedHtml}</body>
      </html>
    `;

    await page.setContent(fullHtml, { waitUntil: "networkidle0" });

    // @ts-ignore
    const pdfBuffer = await page.pdf({ format: "A4" });

    await browser.close();

    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new Error("PDF generation resulted in an empty file");
    }

    // @ts-ignore
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="research-paper-${chatId}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("🔥 PDF Generation Error:", error.message);
    return NextResponse.json(
      { error: "PDF generation failed", details: error.message },
      { status: 500 }
    );
  }
}