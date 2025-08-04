export interface PDFExtractionResult {
  text: string;
  pageCount?: number;
  error?: string;
}

export class PDFProcessor {
  
  /**
   * Main method to extract text from PDF URL
   */
  static async extractTextFromURL(pdfUrl: string): Promise<PDFExtractionResult> {
    try {
      console.log(`Starting PDF text extraction from: ${pdfUrl}`);
      
      const response = await fetch(pdfUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      return await this.extractTextFromBuffer(arrayBuffer);
      
    } catch (error) {
      console.error("Error in extractTextFromURL:", error);
      return {
        text: "",
        error: error instanceof Error ? error.message : "Unknown error occurred"
      };
    }
  }
  
  /**
   * Extract text from PDF buffer using multiple strategies
   */
  static async extractTextFromBuffer(buffer: ArrayBuffer): Promise<PDFExtractionResult> {
    try {
      const uint8Array = new Uint8Array(buffer);
      
      // Strategy 1: Look for text objects in PDF structure
      const strategy1Result = this.extractUsingTextObjects(uint8Array);
      
      // Strategy 2: Extract from content streams
      const strategy2Result = this.extractFromContentStreams(uint8Array);
      
      // Strategy 3: Basic string extraction
      const strategy3Result = this.extractBasicStrings(uint8Array);
      
      // Combine results, prioritizing the one with most content
      const results = [strategy1Result, strategy2Result, strategy3Result]
        .filter(result => result.length > 0)
        .sort((a, b) => b.length - a.length);
      
      const bestResult = results[0] || "";
      
      // Clean and format the extracted text
      const cleanedText = this.cleanExtractedText(bestResult);
      
      console.log(`PDF text extraction completed. Extracted ${cleanedText.length} characters.`);
      
      return {
        text: cleanedText,
        pageCount: this.estimatePageCount(uint8Array)
      };
      
    } catch (error) {
      console.error("Error in extractTextFromBuffer:", error);
      return {
        text: "",
        error: error instanceof Error ? error.message : "Failed to extract text"
      };
    }
  }
  
  /**
   * Strategy 1: Extract text using PDF text objects
   */
  private static extractUsingTextObjects(uint8Array: Uint8Array): string {
    try {
      const pdfString = new TextDecoder('latin1').decode(uint8Array);
      let extractedText = "";
      
      // Look for text objects (BT...ET blocks)
      const textObjectRegex = /BT\s+([\s\S]*?)\s+ET/g;
      const textObjects = pdfString.match(textObjectRegex) || [];
      
      textObjects.forEach(textObject => {
        // Extract text from show operators: (text) Tj, (text) TJ, [(text)] TJ
        const showTextRegex = /\(((?:[^()\\]|\\.|\\[0-7]{1,3})*)\)\s*T[jJ]/g;
        const arrayTextRegex = /\[\s*\(((?:[^()\\]|\\.|\\[0-7]{1,3})*)\)\s*\]\s*TJ/g;
        
        let match;
        while ((match = showTextRegex.exec(textObject)) !== null) {
          extractedText += this.decodeTextString(match[1]) + " ";
        }
        
        while ((match = arrayTextRegex.exec(textObject)) !== null) {
          extractedText += this.decodeTextString(match[1]) + " ";
        }
      });
      
      return extractedText;
    } catch (error) {
      console.error("Error in extractUsingTextObjects:", error);
      return "";
    }
  }
  
  /**
   * Strategy 2: Extract from content streams
   */
  private static extractFromContentStreams(uint8Array: Uint8Array): string {
    try {
      const pdfString = new TextDecoder('latin1').decode(uint8Array);
      let extractedText = "";
      
      // Find content streams
      const streamRegex = /stream\s+([\s\S]*?)\s+endstream/g;
      const streams = pdfString.match(streamRegex) || [];
      
      streams.forEach(stream => {
        const content = stream.replace(/^stream\s*/, '').replace(/\s*endstream$/, '');
        
        // Look for readable text patterns in the stream
        const textPattern = /\(([^)]+)\)/g;
        let match;
        
        while ((match = textPattern.exec(content)) !== null) {
          const text = this.decodeTextString(match[1]);
          if (this.isReadableText(text)) {
            extractedText += text + " ";
          }
        }
      });
      
      return extractedText;
    } catch (error) {
      console.error("Error in extractFromContentStreams:", error);
      return "";
    }
  }
  
  /**
   * Strategy 3: Basic string extraction
   */
  private static extractBasicStrings(uint8Array: Uint8Array): string {
    try {
      const pdfString = new TextDecoder('latin1').decode(uint8Array);
      
      // Extract all parenthesized strings
      const stringRegex = /\(([^)]*)\)/g;
      const strings: string[] = [];
      let match;
      
      while ((match = stringRegex.exec(pdfString)) !== null) {
        const decodedString = this.decodeTextString(match[1]);
        if (this.isReadableText(decodedString) && decodedString.length > 2) {
          strings.push(decodedString);
        }
      }
      
      return strings.join(" ");
    } catch (error) {
      console.error("Error in extractBasicStrings:", error);
      return "";
    }
  }
  
  /**
   * Decode PDF text string (handle escape sequences)
   */
  private static decodeTextString(str: string): string {
    return str
      .replace(/\\n/g, ' ')
      .replace(/\\r/g, ' ')
      .replace(/\\t/g, ' ')
      .replace(/\\b/g, ' ')
      .replace(/\\f/g, ' ')
      .replace(/\\\(/g, '(')
      .replace(/\\\)/g, ')')
      .replace(/\\\\/g, '\\')
      .replace(/\\([0-7]{1,3})/g, (match, octal) => {
        return String.fromCharCode(parseInt(octal, 8));
      });
  }
  
  /**
   * Check if text appears to be readable
   */
  private static isReadableText(text: string): boolean {
    // Check if text contains reasonable amount of letters
    const letterCount = (text.match(/[a-zA-Z]/g) || []).length;
    const totalLength = text.length;
    
    // At least 50% letters and minimum length of 3
    return totalLength >= 3 && letterCount / totalLength >= 0.5;
  }
  
  /**
   * Clean and format extracted text
   */
  private static cleanExtractedText(text: string): string {
    return text
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/[^\w\s.,!?;:()"'\-]/g, '') // Remove non-printable characters
      .trim()
      .substring(0, 50000);
  }

  private static estimatePageCount(uint8Array: Uint8Array): number {
    try {
      const pdfString = new TextDecoder('latin1').decode(uint8Array);
      const pageMatches = pdfString.match(/\/Type\s*\/Page[^s]/g) || [];
      return Math.max(1, pageMatches.length);
    } catch {
      return 1;
    }
  }
}

export async function extractTextFromMultiplePDFs(pdfUrls: string[]): Promise<string> {
  const results = await Promise.all(
    pdfUrls.map(async (url, index) => {
      const result = await PDFProcessor.extractTextFromURL(url);
      
      if (result.error) {
        console.error(`Error processing PDF ${index + 1}:`, result.error);
        return `--- PDF ${index + 1} ---\nError: ${result.error}\n`;
      }
      
      if (result.text.length < 10) {
        return `--- PDF ${index + 1} ---\nWarning: Could not extract meaningful text from this PDF\n`;
      }
      
      return `--- PDF ${index + 1} (${result.pageCount} pages) ---\n${result.text}\n`;
    })
  );
  
  return results.join('\n');
}