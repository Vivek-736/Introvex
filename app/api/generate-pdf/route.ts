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
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
        <style>
          body {
            font-family: 'Roboto', Arial, sans-serif;
            margin: 0;
            padding: 20px; /* Reduced outer padding for tighter layout */
            line-height: 1.5;
            color: #333;
          }
          h1 {
            text-align: center;
            font-size: 2em;
            margin: -155px 0 15px; /* Adjusted to positive margin for proper title placement */
            color: #222;
          }
          h2 {
            font-size: 1.4em;
            color: #444;
            margin: 20px 0 8px; /* Adjusted for uniform section spacing */
          }
          .abstract {
            border-left: 4px solid #000; /* Black strip */
            padding-left: 15px;
            margin: 15px 0; /* Uniform spacing around abstract */
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
            page-break-before: avoid; /* Prevent page break before table */
            page-break-inside: avoid; /* Prevent page break inside table */
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f2f2f2;
            font-weight: 700;
          }
          .section {
            margin-bottom: 15px; /* Reduced gap between sections */
          }
          p {
            margin: 8px 0; /* Tighter paragraph spacing */
          }
          ul {
            margin: 8px 0 15px 20px;
            padding-left: 20px;
          }
          /* Uniform page margins and no mid-page gaps */
          @page {
            margin: 20mm 15mm 20mm 15mm; /* Slightly reduced margins for tighter flow */
          }
          h2 { page-break-after: avoid; }
          /* Ensure content flows continuously */
          * { orphans: 2; widows: 2; }
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