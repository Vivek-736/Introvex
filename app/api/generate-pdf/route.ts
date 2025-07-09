import { NextResponse } from "next/server";

const isDev = !process.env.AWS_REGION;

export async function POST(request: Request) {
  try {
    const { html, chatId } = await request.json();

    if (!html || !chatId) {
      return NextResponse.json(
        { error: "HTML content and chatId are required" },
        { status: 400 }
      );
    }

    const cleanedHtml = html
      .replace(/^\s*html\s*/i, "")
      .replace(/^\s*```html\s*\n?/, "")
      .replace(/\s*```\s*$/, "")
      .trim();

    const browser = await (async () => {
      if (isDev) {
        const puppeteer = await import("puppeteer");
        return puppeteer.default.launch({
          headless: true,
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });
      } else {
        const chromium = await import("chrome-aws-lambda");
        const puppeteer = await import("puppeteer-core");

        // @ts-ignore
        let executablePath = await chromium.executablePath;

        if (!executablePath) {
          executablePath = "/var/task/node_modules/chrome-aws-lambda/bin/chromium";
          console.warn("⚠️ Falling back to hardcoded executablePath:", executablePath);
        }

        return puppeteer.default.launch({
          // @ts-ignore
          args: chromium.args,
          executablePath,
          // @ts-ignore
          headless: chromium.headless,
        });
      }
    })();

    const page = await browser.newPage();

    await page.setContent(cleanedHtml, {
      waitUntil: "domcontentloaded",
      timeout: 90000,
    });

    // @ts-ignore
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
      format: "A4",
      printBackground: true,
      margin: {
        top: "20mm",
        bottom: "20mm",
        left: "20mm",
        right: "20mm",
      },
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