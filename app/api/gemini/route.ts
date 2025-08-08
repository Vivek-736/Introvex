import { NextResponse } from "next/server";
import { supabase } from "@/services/SupabaseClient";
import { processMultiplePDFs } from "@/lib/pdfProcessor";

export const runtime = "edge";

export async function POST(request: Request) {
  const startTime = Date.now();

  try {
    const { message, chatId, pdfUrls } = await request.json();

    if (!message && (!pdfUrls || pdfUrls.length === 0)) {
      return NextResponse.json(
        { error: "Message or PDF URLs are required" },
        { status: 400 }
      );
    }

    if (!chatId) {
      return NextResponse.json(
        { error: "chatId is required" },
        { status: 400 }
      );
    }

    console.log(
      `[${chatId}] Processing request - Message: ${
        message ? "Yes" : "No"
      }, PDFs: ${pdfUrls?.length || 0}`
    );

    const { data: existingData, error: fetchError } = await supabase
      .from("Data")
      .select("message, pdfUrl")
      .eq("chatId", chatId)
      .maybeSingle();

    if (fetchError) {
      console.error(`[${chatId}] Database fetch error:`, fetchError.message);
      return NextResponse.json(
        { error: "Failed to fetch chat history" },
        { status: 500 }
      );
    }

    let context = "";
    const existingMessages = existingData?.message || "";

    if (existingMessages) {
      const messageHistory = existingMessages.split(",,,,").slice(-12);
      if (messageHistory.length > 0) {
        context += "=== Previous Conversation ===\n";
        messageHistory.forEach((msg: string, index: number) => {
          if (msg.trim()) {
            const cleanMsg = msg.trim().replace(/^(User|Assistant): /, "");
            const prefix = index % 2 === 0 ? "User" : "Assistant";
            context += `${prefix}: ${cleanMsg}\n`;
          }
        });
        context += "\n";
      }
    }

    let pdfProcessingTime = 0;
    if (pdfUrls && pdfUrls.length > 0) {
      const pdfStartTime = Date.now();
      console.log(`[${chatId}] Processing ${pdfUrls.length} PDF(s)...`);

      try {
        const pdfContent = await processMultiplePDFs(pdfUrls);
        pdfProcessingTime = Date.now() - pdfStartTime;

        if (pdfContent && pdfContent.trim()) {
          context += "=== Document Content ===\n";
          // Clean and format PDF content
          const cleanedContent = pdfContent
            .replace(/\s+/g, ' ')
            .replace(/\n\s*\n/g, '\n')
            .trim();
          context += cleanedContent;
          context += "\n\n";
          console.log(
            `[${chatId}] PDF processing completed in ${pdfProcessingTime}ms - ${cleanedContent.length} chars extracted`
          );
        } else {
          context += "=== Document Content ===\n";
          context += "⚠️ No readable text could be extracted from the provided PDF documents. The documents might be image-based, password-protected, or corrupted.\n\n";
          console.warn(`[${chatId}] No text extracted from PDFs`);
        }
      } catch (error) {
        pdfProcessingTime = Date.now() - pdfStartTime;
        console.error(`[${chatId}] PDF processing failed:`, error);
        context += "=== Document Content ===\n";
        context += `❌ Error occurred while processing PDF documents: ${error instanceof Error ? error.message : 'Unknown error'}\n\n`;
      }
    }

    if (message?.trim()) {
      context += "=== Current Question ===\n";
      context += `${message.trim()}\n\n`;
    }

    context += "=== Instructions ===\n";
    context += "You are a helpful AI assistant. ";
    if (pdfUrls && pdfUrls.length > 0) {
      context += "The user has provided document(s) above. Please analyze the document content carefully and provide accurate, specific answers based on the information contained within. If the user's question relates to the document content, cite specific details from the documents. If you cannot find relevant information in the documents, please state this clearly. ";
    }
    context += "Provide comprehensive, well-structured responses. Use formatting like bullet points, numbered lists, or sections when appropriate to improve readability.\n\n";

    const maxContextLength = 30000;
    if (context.length > maxContextLength) {
      console.warn(`[${chatId}] Context too long (${context.length}), truncating...`);

      const parts = context.split("=== Document Content ===");
      if (parts.length > 1) {
        const beforeDoc = parts[0];
        const afterDoc = parts[1].split("=== Current Question ===");
        const docContent = afterDoc[0];
        const currentQuestion = afterDoc.length > 1 ? "=== Current Question ===" + afterDoc[1] : "";

        const reservedSpace = beforeDoc.length + currentQuestion.length + 1000;
        const availableForDoc = maxContextLength - reservedSpace;
        
        if (availableForDoc > 2000) {
          const truncatedDoc = docContent.substring(0, availableForDoc) + "\n[Document content truncated for length]\n\n";
          context = beforeDoc + "=== Document Content ===\n" + truncatedDoc + currentQuestion;
        } else {
          context = beforeDoc + "=== Document Content ===\n[Large document provided - please ask specific questions about the content]\n\n" + currentQuestion;
        }
      } else {
        context = context.substring(0, maxContextLength) + "\n[Context truncated]";
      }
    }

    console.log(`[${chatId}] Final context: ${context.length} characters`);

    const geminiStartTime = Date.now();
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyBUjsjCQomz4PRKpNs1PZUq3emp_V7Y-nw`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: context }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
          ],
        }),
      }
    );

    const geminiTime = Date.now() - geminiStartTime;

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error(
        `[${chatId}] Gemini API error ${geminiResponse.status}:`,
        errorText
      );

      if (geminiResponse.status === 429) {
        return NextResponse.json(
          { error: "Rate limit exceeded. Please try again in a moment." },
          { status: 429 }
        );
      } else if (geminiResponse.status === 400) {
        return NextResponse.json(
          { error: "Invalid request format. Please try again." },
          { status: 400 }
        );
      } else {
        return NextResponse.json(
          { error: "AI service temporarily unavailable. Please try again." },
          { status: 502 }
        );
      }
    }

    const responseData = await geminiResponse.json();

    if (!responseData.candidates?.length) {
      console.error(`[${chatId}] Invalid response structure:`, responseData);
      return NextResponse.json(
        { error: "Invalid response from AI service" },
        { status: 502 }
      );
    }

    const candidate = responseData.candidates[0];
    
    if (candidate.finishReason === "SAFETY") {
      return NextResponse.json(
        { error: "Response was filtered for safety reasons. Please try rephrasing your question." },
        { status: 400 }
      );
    }

    if (!candidate.content?.parts?.length) {
      console.error(`[${chatId}] No content in response:`, candidate);
      return NextResponse.json(
        { error: "Empty response from AI service" },
        { status: 502 }
      );
    }

    const botResponse = candidate.content.parts[0].text;

    if (!botResponse || typeof botResponse !== "string" || !botResponse.trim()) {
      console.error(`[${chatId}] Invalid bot response:`, botResponse);
      return NextResponse.json(
        { error: "Invalid response content from AI service" },
        { status: 502 }
      );
    }

    const totalTime = Date.now() - startTime;
    console.log(
      `[${chatId}] Request completed in ${totalTime}ms (PDF: ${pdfProcessingTime}ms, Gemini: ${geminiTime}ms)`
    );
    console.log(
      `[${chatId}] Response length: ${botResponse.trim().length} characters`
    );

    return NextResponse.json({
      response: botResponse.trim(),
      metadata: {
        processingTime: totalTime,
        pdfProcessingTime,
        geminiResponseTime: geminiTime,
        contextLength: context.length,
        pdfCount: pdfUrls?.length || 0,
        responseLength: botResponse.trim().length,
        source: "gemini"
      },
    });
  } catch (error) {
    const totalTime = Date.now() - startTime;
    let chatId = "unknown";
    try {
      const body = await request.json();
      chatId = body?.chatId || "unknown";
    } catch {}

    console.error(`[${chatId}] Error after ${totalTime}ms:`, error);

    let errorMessage = "An unexpected error occurred";
    let statusCode = 500;

    if (error instanceof Error) {
      const message = error.message.toLowerCase();

      if (message.includes("fetch") || message.includes("network")) {
        errorMessage = "Network error. Please check your connection and try again.";
        statusCode = 503;
      } else if (message.includes("timeout")) {
        errorMessage = "Request timed out. Please try again.";
        statusCode = 408;
      } else if (message.includes("api_key") || message.includes("unauthorized")) {
        errorMessage = "Service configuration error";
        statusCode = 500;
      } else if (message.includes("too large") || message.includes("token")) {
        errorMessage = "Request too large. Please try with shorter content.";
        statusCode = 413;
      } else {
        errorMessage = error.message;
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        metadata: {
          processingTime: totalTime,
          errorType: error instanceof Error ? error.constructor.name : "UnknownError",
        },
      },
      { status: statusCode }
    );
  }
}