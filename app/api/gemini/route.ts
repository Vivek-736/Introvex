import { NextResponse } from "next/server";
import { supabase } from "@/services/SupabaseClient";

async function extractPDFText(pdfUrl: string): Promise<string> {
  try {
    console.log(`🔍 Attempting to extract text from: ${pdfUrl}`);
    
    const response = await fetch(pdfUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.status}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const pdfString = new TextDecoder('latin1').decode(uint8Array);
    
    let extractedText = "";
    
    const textRegex = /\(([^)]+)\)/g;
    let match;
    const foundTexts = [];
    
    while ((match = textRegex.exec(pdfString)) !== null) {
      const text = match[1]
        .replace(/\\n/g, ' ')
        .replace(/\\r/g, ' ')
        .replace(/\\t/g, ' ')
        .replace(/\\\(/g, '(')
        .replace(/\\\)/g, ')')
        .replace(/\\\\/g, '\\');
      
      if (text.length > 2 && /[a-zA-Z]/.test(text)) {
        foundTexts.push(text);
      }
    }

    // @ts-ignore
    const textObjectRegex = /BT\s+(.*?)\s+ET/gs;
    const textObjects = pdfString.match(textObjectRegex) || [];
    
    textObjects.forEach(obj => {
      const showTextRegex = /\(([^)]*)\)\s*Tj/g;
      let objMatch;
      while ((objMatch = showTextRegex.exec(obj)) !== null) {
        const text = objMatch[1].replace(/\\n/g, ' ').replace(/\\r/g, ' ');
        if (text.length > 2 && /[a-zA-Z]/.test(text)) {
          foundTexts.push(text);
        }
      }
    });
    
    extractedText = foundTexts.join(' ').trim();

    extractedText = extractedText
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s.,!?;:()"'\-]/g, '')
      .substring(0, 20000);
    
    console.log(`✅ Extracted ${extractedText.length} characters from PDF`);
    console.log(`📄 First 200 chars: ${extractedText.substring(0, 200)}...`);
    
    return extractedText || "Could not extract readable text from this PDF";
    
  } catch (error) {
    console.error(`❌ Error extracting PDF text:`, error);
    return `Error processing PDF: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("🚀 RAW REQUEST BODY:", JSON.stringify(body, null, 2));
    
    const { message, chatId, pdfUrls } = body;

    console.log("📋 PARSED VALUES:");
    console.log("- message:", message);
    console.log("- chatId:", chatId);
    console.log("- pdfUrls:", pdfUrls);
    console.log("- pdfUrls type:", typeof pdfUrls);
    console.log("- pdfUrls length:", pdfUrls?.length);

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

    console.log("📚 Fetching chat data from database...");
    const { data: existingData, error: fetchError } = await supabase
      .from("Data")
      .select("message, pdfUrl")
      .eq("chatId", chatId)
      .maybeSingle();

    if (fetchError) {
      console.error("❌ Database error:", fetchError);
      throw new Error(fetchError.message);
    }

    console.log("💾 DATABASE DATA:");
    console.log("- existingData:", existingData);
    console.log("- existingData.pdfUrl:", existingData?.pdfUrl);

    let context = "";
    const existingMessages = existingData?.message || "";

    if (existingMessages) {
      const messageHistory = existingMessages.split(",,,,").slice(-8);
      context += "=== Recent Conversation ===\n";
      messageHistory.forEach((msg: string) => {
        if (msg.trim()) context += msg.trim() + "\n";
      });
      context += "\n";
    }

    let pdfUrlsToProcess = [];
    
    if (pdfUrls && Array.isArray(pdfUrls) && pdfUrls.length > 0) {
      pdfUrlsToProcess = pdfUrls.filter(url => url && url.trim());
      console.log("📎 Using PDFs from request:", pdfUrlsToProcess);
    } else if (existingData?.pdfUrl) {
      pdfUrlsToProcess = existingData.pdfUrl.split(",").filter((url: string) => url && url.trim());
      console.log("📎 Using PDFs from database:", pdfUrlsToProcess);
    }

    console.log(`🔢 Total PDFs to process: ${pdfUrlsToProcess.length}`);

    if (pdfUrlsToProcess.length > 0) {
      context += "=== Document Content ===\n";
      
      for (let i = 0; i < pdfUrlsToProcess.length; i++) {
        const url = pdfUrlsToProcess[i];
        console.log(`📄 Processing PDF ${i + 1}/${pdfUrlsToProcess.length}: ${url}`);
        
        const pdfText = await extractPDFText(url);
        context += `--- PDF ${i + 1} ---\n${pdfText}\n\n`;
      }
    }

    if (message) {
      context += "=== Current Question ===\n";
      context += message + "\n\n";
    }

    context += "=== Instructions ===\n";
    context += "Please provide a helpful response. If the question relates to the document content above, use specific information from those documents. Be conversational and informative.\n\n";

    console.log(`📏 Total context length: ${context.length} characters`);
    console.log(`📝 Context preview (first 500 chars):\n${context.substring(0, 500)}...`);

    console.log("🤖 Calling Gemini API...");
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyBUjsjCQomz4PRKpNs1PZUq3emp_V7Y-nw`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: context }] }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Gemini API error:", response.status, errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const botResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!botResponse) {
      console.error("❌ No response from Gemini:", data);
      throw new Error("No response from Gemini");
    }

    console.log(`✅ Generated response: ${botResponse.length} characters`);
    console.log(`📤 Response preview: ${botResponse.substring(0, 200)}...`);

    return NextResponse.json({
      response: botResponse,
      debug: {
        pdfUrlsReceived: pdfUrls?.length || 0,
        pdfUrlsFromDb: existingData?.pdfUrl ? existingData.pdfUrl.split(",").length : 0,
        pdfUrlsProcessed: pdfUrlsToProcess.length,
        contextLength: context.length,
      }
    });

  } catch (error) {
    console.error("💥 FATAL ERROR:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}