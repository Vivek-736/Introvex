import { NextResponse } from "next/server";
import puppeteer from "puppeteer";

export async function POST(request: Request) {
  try {
    const { html, chatId } = await request.json();

    if (!html) {
      return NextResponse.json(
        { error: "HTML content is required" },
        { status: 400 }
      );
    }
    
    if (!chatId) {
      return NextResponse.json(
        { error: "chatId is required" },
        { status: 400 }
      );
    }

    const cleanedHtml = html
      .replace(/^\s*html\s*/i, "")
      .replace(/^\s*```html\s*\n?/, "")
      .replace(/\s*```\s*$/, "")
      .trim();

    const browser = await puppeteer.launch({
      // @ts-ignore
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--font-render-hinting=none",
      ],
      executablePath: process.env.CHROMIUM_PATH || undefined,
      timeout: 60000,
    });

    const page = await browser.newPage();

    await page.setContent(cleanedHtml, {
      waitUntil: "domcontentloaded",
      timeout: 90000,
    });

    await page.evaluate(() => {
      return new Promise((resolve) => {
        // @ts-ignore
        if (window.MathJax) {
          // @ts-ignore
          window.MathJax.typesetPromise().then(resolve).catch(resolve);
        } else {
          resolve(null);
        }
      });
    });

    const pdfBuffer = await page.pdf({
      // @ts-ignore
      format: "A4",
      printBackground: true,
      margin: {
        top: "20mm",
        bottom: "20mm",
        left: "20mm",
        right: "20mm",
      },
      timeout: 90000,
    });

    await browser.close();

    // @ts-ignore
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=research-paper-${chatId}.pdf`,
      },
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: `PDF generation failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}