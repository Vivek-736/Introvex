export class PDFProcessor {
  /**
   * Extract text from PDF URL using built-in browser APIs
   */
  static async extractTextFromURL(pdfUrl: string): Promise<string> {
    try {
      console.log(`Extracting text from PDF: ${pdfUrl}`);

      const response = await fetch(pdfUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF: ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const text = await this.extractTextFromArrayBuffer(arrayBuffer);

      console.log(`Extracted ${text.length} characters from PDF`);
      return text;
    } catch (error) {
      console.error("Error extracting PDF text:", error);
      return `Error processing PDF: ${
        error instanceof Error ? error.message : "Unknown error"
      }`;
    }
  }

  /**
   * Extract text from PDF ArrayBuffer
   */
  private static async extractTextFromArrayBuffer(
    buffer: ArrayBuffer
  ): Promise<string> {
    const uint8Array = new Uint8Array(buffer);

    // Convert to string for pattern matching
    const pdfString = new TextDecoder("latin1").decode(uint8Array);

    let extractedText = "";

    // Strategy 1: Extract from text objects (most reliable)
    extractedText += this.extractFromTextObjects(pdfString);

    // Strategy 2: Extract from content streams
    if (extractedText.length < 100) {
      extractedText += this.extractFromStreams(pdfString);
    }

    // Strategy 3: Fallback - extract parenthesized strings
    if (extractedText.length < 100) {
      extractedText += this.extractParenthesizedText(pdfString);
    }

    // Clean and return
    return this.cleanText(extractedText);
  }

  /**
   * Extract text from PDF text objects (BT...ET blocks)
   */
  private static extractFromTextObjects(pdfString: string): string {
    let text = "";

    try {
      // Find all text objects
      const textObjectRegex = /BT\s+([\s\S]*?)\s+ET/g;
      const textObjects = pdfString.match(textObjectRegex) || [];

      for (const textObject of textObjects) {
        // Extract text using various show operators
        const patterns = [
          /\(([^)]*)\)\s*Tj/g, // (text) Tj
          /\(([^)]*)\)\s*TJ/g, // (text) TJ
          /\[\s*\(([^)]*)\)\s*\]\s*TJ/g, // [(text)] TJ
        ];

        for (const pattern of patterns) {
          let match;
          while ((match = pattern.exec(textObject)) !== null) {
            const extractedString = this.decodePDFString(match[1]);
            if (this.isValidText(extractedString)) {
              text += extractedString + " ";
            }
          }
        }
      }
    } catch (error) {
      console.error("Error in extractFromTextObjects:", error);
    }

    return text;
  }

  /**
   * Extract text from PDF content streams
   */
  private static extractFromStreams(pdfString: string): string {
    let text = "";

    try {
      // Find content streams
      const streamRegex = /stream\s+([\s\S]*?)\s+endstream/g;
      const streams = pdfString.match(streamRegex) || [];

      for (const stream of streams) {
        const content = stream
          .replace(/^stream\s*/, "")
          .replace(/\s*endstream$/, "");

        // Look for text patterns in stream
        const textPattern = /\(([^)]+)\)/g;
        let match;

        while ((match = textPattern.exec(content)) !== null) {
          const extractedString = this.decodePDFString(match[1]);
          if (this.isValidText(extractedString)) {
            text += extractedString + " ";
          }
        }
      }
    } catch (error) {
      console.error("Error in extractFromStreams:", error);
    }

    return text;
  }

  /**
   * Fallback: Extract any parenthesized text
   */
  private static extractParenthesizedText(pdfString: string): string {
    let text = "";

    try {
      const stringRegex = /\(([^)]{3,})\)/g;
      let match;

      while ((match = stringRegex.exec(pdfString)) !== null) {
        const extractedString = this.decodePDFString(match[1]);
        if (this.isValidText(extractedString) && extractedString.length > 2) {
          text += extractedString + " ";
        }
      }
    } catch (error) {
      console.error("Error in extractParenthesizedText:", error);
    }

    return text;
  }

  /**
   * Decode PDF string (handle escape sequences)
   */
  private static decodePDFString(str: string): string {
    return str
      .replace(/\\n/g, " ")
      .replace(/\\r/g, " ")
      .replace(/\\t/g, " ")
      .replace(/\\b/g, " ")
      .replace(/\\f/g, " ")
      .replace(/\\\(/g, "(")
      .replace(/\\\)/g, ")")
      .replace(/\\\\/g, "\\")
      .replace(/\\([0-7]{1,3})/g, (_, octal) => {
        try {
          return String.fromCharCode(parseInt(octal, 8));
        } catch {
          return "";
        }
      });
  }

  /**
   * Check if extracted text is valid/readable
   */
  private static isValidText(text: string): boolean {
    if (!text || text.length < 2) return false;

    // Check for reasonable letter-to-total ratio
    const letters = (text.match(/[a-zA-Z]/g) || []).length;
    const ratio = letters / text.length;

    // At least 40% letters and some common characters
    return ratio >= 0.4 && /[a-zA-Z\s]/.test(text);
  }

  /**
   * Clean extracted text
   */
  private static cleanText(text: string): string {
    if (!text) return "";

    return text
      .replace(/\s+/g, " ") // Normalize whitespace
      .replace(/[^\w\s.,!?;:()"'\-]/g, "") // Remove special chars
      .replace(/(.)\1{4,}/g, "$1") // Remove excessive repetition
      .trim()
      .substring(0, 50000); // Limit length
  }
}

/**
 * Process multiple PDFs and combine their text
 */
export async function processMultiplePDFs(pdfUrls: string[]): Promise<string> {
  if (!pdfUrls || pdfUrls.length === 0) {
    return "";
  }

  console.log(`Processing ${pdfUrls.length} PDF(s)...`);

  const results = await Promise.all(
    pdfUrls.map(async (url, index) => {
      try {
        const text = await PDFProcessor.extractTextFromURL(url);

        if (!text || text.startsWith("Error")) {
          return `--- PDF ${
            index + 1
          } ---\n⚠️ Could not extract text from this PDF\n`;
        }

        if (text.length < 50) {
          return `--- PDF ${
            index + 1
          } ---\n⚠️ Minimal text extracted from this PDF\n${text}\n`;
        }

        return `--- PDF ${index + 1} ---\n${text}\n`;
      } catch (error) {
        console.error(`Error processing PDF ${index + 1}:`, error);
        return `--- PDF ${index + 1} ---\n❌ Error processing this PDF\n`;
      }
    })
  );

  const combinedText = results.join("\n");
  console.log(`Combined PDF text length: ${combinedText.length} characters`);

  return combinedText;
}