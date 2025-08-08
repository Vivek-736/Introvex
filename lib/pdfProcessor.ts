import { extractText } from "unpdf";

export class PDFProcessor {
  static async extractTextFromURL(pdfUrl: string): Promise<string> {
    try {
      console.log(`Extracting text from PDF: ${pdfUrl}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000);

      const response = await fetch(pdfUrl, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; PDFProcessor/1.0)",
          Accept: "application/pdf,*/*",
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch PDF (${response.status}): ${response.statusText}`
        );
      }

      const contentLength = response.headers.get("content-length");
      if (contentLength && parseInt(contentLength) > 50 * 1024 * 1024) {
        throw new Error("PDF file is too large (max 50MB supported)");
      }

      const arrayBuffer = await response.arrayBuffer();

      if (arrayBuffer.byteLength === 0) {
        throw new Error("PDF file is empty or corrupted");
      }

      console.log(
        `PDF downloaded: ${Math.round(arrayBuffer.byteLength / 1024)}KB`
      );

      const text = await this.extractTextFromArrayBuffer(arrayBuffer);
      console.log(`Successfully extracted ${text.length} characters from PDF`);

      return text;
    } catch (error: any) {
      console.error("Error extracting PDF text:", error);

      if (error.name === "AbortError") {
        return `Error: PDF processing timed out (file might be too large or network is slow)`;
      }

      if (error.message?.includes("fetch")) {
        return `Error: Could not download PDF (network or URL issue)`;
      }

      return `Error: ${
        error instanceof Error ? error.message : "Unknown PDF processing error"
      }`;
    }
  }

  /**
   * Extract text from PDF ArrayBuffer using unpdf
   */
  private static async extractTextFromArrayBuffer(
    arrayBuffer: ArrayBuffer
  ): Promise<string> {
    try {
      console.log("Parsing PDF with unpdf...");

      // Convert ArrayBuffer to Uint8Array for unpdf
      const uint8Array = new Uint8Array(arrayBuffer);

      // Extract text using unpdf
      const extractedData = await extractText(uint8Array, {
        // Merge text chunks that are close together
        mergePages: false,
      });

      if (!extractedData || typeof extractedData !== "object") {
        throw new Error("No data extracted from PDF");
      }

      let fullText = "";

      // Handle different response formats from unpdf
      if (Array.isArray(extractedData)) {
        // If it's an array of pages
        extractedData.forEach((page, index) => {
          if (typeof page === "string") {
            fullText += `\n--- Page ${index + 1} ---\n${page}\n`;
          } else if (page && typeof page === "object" && page.text) {
            fullText += `\n--- Page ${index + 1} ---\n${page.text}\n`;
          }
        });
      } else if (typeof extractedData === "string") {
        // If it's a single string
        fullText = extractedData;
      } else if (extractedData.text) {
        // If it's an object with text property
        fullText = Array.isArray(extractedData.text)
          ? extractedData.text.join("\n")
          : extractedData.text;
      } else if (
        typeof extractedData === "object" &&
        "pages" in extractedData &&
        Array.isArray((extractedData as any).pages)
      ) {
        // If it has pages array
        (extractedData as any).pages.forEach(
          (page: { text: any }, index: number) => {
            const pageText = typeof page === "string" ? page : page?.text || "";
            if (pageText.trim()) {
              fullText += `\n--- Page ${index + 1} ---\n${pageText}\n`;
            }
          }
        );
      } else {
        // Try to extract any text-like properties
        const possibleTextProps = ["content", "text", "data"];
        for (const prop of possibleTextProps) {
          if ((extractedData as any)[prop]) {
            fullText = (extractedData as any)[prop];
            break;
          }
        }
      }

      if (!fullText || fullText.trim().length === 0) {
        return "No readable text found in PDF. This might be a scanned document, image-based PDF, or the PDF might be corrupted.";
      }

      const cleanedText = this.cleanText(fullText);

      console.log(
        `PDF parsing completed: ${cleanedText.length} characters extracted`
      );

      return cleanedText;
    } catch (error: any) {
      console.error("Error in extractTextFromArrayBuffer:", error);

      if (error.message?.includes("Invalid PDF")) {
        throw new Error("Invalid or corrupted PDF file");
      } else if (
        error.message?.includes("password") ||
        error.message?.includes("encrypted")
      ) {
        throw new Error("PDF is password-protected or encrypted");
      } else if (error.message?.includes("unsupported")) {
        throw new Error("PDF format not supported");
      }

      throw new Error(
        `PDF parsing failed: ${
          error instanceof Error ? error.message : "Unknown parsing error"
        }`
      );
    }
  }

  /**
   * Clean and format extracted text
   */
  private static cleanText(text: string): string {
    if (!text) return "";

    return (
      text
        // Normalize whitespace
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .replace(/\t/g, " ")
        .replace(/ {2,}/g, " ")
        // Fix common PDF extraction issues
        .replace(/([a-z])([A-Z])/g, "$1 $2") // Space between cases
        .replace(/([.!?])([A-Z])/g, "$1 $2") // Space after sentences
        .replace(/([,;:])([A-Za-z])/g, "$1 $2") // Space after punctuation
        .replace(/(\d)([A-Za-z])/g, "$1 $2") // Space between numbers and letters
        .replace(/([A-Za-z])(\d)/g, "$1 $2") // Space between letters and numbers
        // Handle bullet points and lists
        .replace(/•/g, "• ")
        .replace(/◦/g, "◦ ")
        .replace(/▪/g, "▪ ")
        .replace(/▫/g, "▫ ")
        // Fix paragraph breaks
        .replace(/\n{3,}/g, "\n\n")
        .replace(/\n\s+\n/g, "\n\n")
        // Remove control characters
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
        // Remove excessive repetition
        .replace(/(.)\1{15,}/g, "$1$1$1")
        // Clean up spacing around newlines
        .replace(/\n /g, "\n")
        .replace(/ \n/g, "\n")
        // Trim and limit
        .trim()
        .substring(0, 200000)
    ); // 200KB limit
  }

  /**
   * Validate if text extraction was successful
   */
  static isValidExtraction(text: string): boolean {
    if (!text || text.length < 25) return false;

    // Remove common PDF artifacts for validation
    const cleanedForValidation = text
      .replace(/Page \d+ of \d+/gi, "")
      .replace(/\d{1,2}\/\d{1,2}\/\d{4}/g, "")
      .replace(/\b\d+\b/g, "")
      .trim();

    if (cleanedForValidation.length < 20) return false;

    // Check for reasonable text content
    const words = cleanedForValidation
      .split(/\s+/)
      .filter((word) => word.length > 1);
    const validWords = words.filter((word) =>
      /^[a-zA-Z][a-zA-Z0-9.,!?;:()"'\-]*$/.test(word)
    );

    // At least 30% of words should be valid English-like words
    const ratio = validWords.length / Math.max(words.length, 1);

    return ratio >= 0.3 && words.length >= 5;
  }
}

/**
 * Process multiple PDFs and combine their text
 */
export async function processMultiplePDFs(pdfUrls: string[]): Promise<string> {
  if (!pdfUrls || pdfUrls.length === 0) {
    console.log("No PDF URLs provided");
    return "";
  }

  console.log(`Starting to process ${pdfUrls.length} PDF(s)...`);
  const results: string[] = [];
  const errors: string[] = [];
  const processedInfo: { success: number; failed: number; totalSize: number } =
    {
      success: 0,
      failed: 0,
      totalSize: 0,
    };

  // Process PDFs sequentially to avoid memory issues and rate limits
  for (let i = 0; i < pdfUrls.length; i++) {
    const url = pdfUrls[i];
    const fileName = url.split("/").pop() || `PDF_${i + 1}`;

    try {
      console.log(`Processing PDF ${i + 1}/${pdfUrls.length}: ${fileName}`);

      const startTime = Date.now();
      const text = await PDFProcessor.extractTextFromURL(url);
      const processingTime = Date.now() - startTime;

      if (text.startsWith("Error:")) {
        errors.push(`${fileName}: ${text}`);
        results.push(`\n=== PDF ${i + 1}: ${fileName} ===\n⚠️ ${text}\n`);
        processedInfo.failed++;
      } else if (!PDFProcessor.isValidExtraction(text)) {
        const preview = text.substring(0, 150);
        errors.push(`${fileName}: Minimal or invalid text extracted`);
        results.push(
          `\n=== PDF ${
            i + 1
          }: ${fileName} ===\n⚠️ Minimal text extracted (possibly scanned/image PDF)\nPreview: ${preview}${
            text.length > 150 ? "..." : ""
          }\n`
        );
        processedInfo.failed++;
      } else {
        console.log(
          `✅ PDF ${i + 1} processed successfully in ${processingTime}ms: ${
            text.length
          } characters`
        );
        results.push(`\n=== PDF ${i + 1}: ${fileName} ===\n${text}\n`);
        processedInfo.success++;
        processedInfo.totalSize += text.length;
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      console.error(`❌ Error processing PDF ${i + 1} (${fileName}):`, error);
      errors.push(`${fileName}: ${errorMsg}`);
      results.push(
        `\n=== PDF ${
          i + 1
        }: ${fileName} ===\n❌ Processing failed: ${errorMsg}\n`
      );
      processedInfo.failed++;
    }

    // Small delay between PDFs to prevent overwhelming the system
    if (i < pdfUrls.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  const combinedText = results.join("\n");

  console.log(`🏁 PDF processing completed:`, {
    total: pdfUrls.length,
    successful: processedInfo.success,
    failed: processedInfo.failed,
    totalTextLength: processedInfo.totalSize,
    combinedLength: combinedText.length,
  });

  if (errors.length > 0) {
    console.warn(`⚠️ ${errors.length} PDF(s) had issues:`, errors);
  }

  // Add comprehensive summary for multiple PDFs
  if (pdfUrls.length > 1) {
    const summary = `
=== PDF PROCESSING SUMMARY ===
📊 Total PDFs: ${pdfUrls.length}
✅ Successfully processed: ${processedInfo.success}
❌ Failed to process: ${processedInfo.failed}
📝 Total text extracted: ${processedInfo.totalSize.toLocaleString()} characters
📄 Combined output length: ${combinedText.length.toLocaleString()} characters

${
  errors.length > 0
    ? `⚠️ Issues encountered:\n${errors
        .map((e, i) => `${i + 1}. ${e}`)
        .join("\n")}\n`
    : "✨ All PDFs processed successfully!\n"
}
===============================
`;
    return summary + combinedText;
  }

  return combinedText;
}