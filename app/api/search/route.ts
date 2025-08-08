import { NextResponse } from "next/server";
import { supabase } from "@/services/SupabaseClient";

export const runtime = "edge";

export async function POST(request: Request) {
  const startTime = Date.now();

  try {
    const { message, chatId } = await request.json();

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    if (!chatId) {
      return NextResponse.json(
        { error: "chatId is required" },
        { status: 400 }
      );
    }

    console.log(`[${chatId}] Processing search request: "${message}"`);

    const { data: existingData, error: fetchError } = await supabase
      .from("Data")
      .select("message")
      .eq("chatId", chatId)
      .maybeSingle();

    if (fetchError) {
      console.error(`[${chatId}] Database fetch error:`, fetchError.message);
      return NextResponse.json(
        { error: "Failed to fetch chat history" },
        { status: 500 }
      );
    }

    let conversationContext = "";
    const existingMessages = existingData?.message || "";
    if (existingMessages) {
      const messageHistory = existingMessages.split(",,,,").slice(-6);
      if (messageHistory.length > 0) {
        conversationContext = "Recent conversation:\n";
        messageHistory.forEach((msg: string, index: number) => {
          if (msg.trim()) {
            const cleanMsg = msg.trim().replace(/^(User|Assistant): /, "");
            const prefix = index % 2 === 0 ? "User" : "Assistant";
            conversationContext += `${prefix}: ${cleanMsg}\n`;
          }
        });
        conversationContext += "\n";
      }
    }

    const searchStartTime = Date.now();
    console.log(`[${chatId}] Performing Tavily search...`);

    const tavilyResponse = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: process.env.TAVILY_API_KEY,
        query: message.trim(),
        search_depth: "advanced",
        include_answer: true,
        include_images: false,
        include_raw_content: false,
        max_results: 5,
        exclude_domains: [],
      }),
    });

    const searchTime = Date.now() - searchStartTime;

    if (!tavilyResponse.ok) {
      const errorText = await tavilyResponse.text();
      console.error(
        `[${chatId}] Tavily API error ${tavilyResponse.status}:`,
        errorText
      );
      
      if (tavilyResponse.status === 429) {
        return NextResponse.json(
          { error: "Search rate limit exceeded. Please try again later." },
          { status: 429 }
        );
      } else if (tavilyResponse.status === 401) {
        return NextResponse.json(
          { error: "Search service authentication failed." },
          { status: 500 }
        );
      } else {
        return NextResponse.json(
          { error: "Search service temporarily unavailable." },
          { status: 502 }
        );
      }
    }

    const searchData = await tavilyResponse.json();
    console.log(`[${chatId}] Search completed in ${searchTime}ms`);

    let context = "";
    
    if (conversationContext) {
      context += conversationContext;
    }

    context += `=== Web Search Results for: "${message}" ===\n\n`;

    if (searchData.answer && searchData.answer.trim()) {
      context += `Direct Answer: ${searchData.answer.trim()}\n\n`;
    }

    if (searchData.results && searchData.results.length > 0) {
      context += "Sources:\n";
      searchData.results.forEach((result: any, index: number) => {
        context += `${index + 1}. ${result.title}\n`;
        context += `   URL: ${result.url}\n`;
        if (result.content && result.content.trim()) {
          const content = result.content.trim();
          const truncatedContent = content.length > 500 
            ? content.substring(0, 500) + "..." 
            : content;
          context += `   Content: ${truncatedContent}\n`;
        }
        context += "\n";
      });
    } else {
      context += "No specific search results were found for this query.\n\n";
    }

    context += `=== Current User Question ===\n${message.trim()}\n\n`;
    context += `=== Instructions ===\n`;
    context += `You are a helpful AI assistant with access to current web information. Based on the search results above, provide a comprehensive and accurate answer to the user's question. `;
    context += `Always cite your sources when referencing specific information from the search results. `;
    context += `If the search results don't contain enough information to fully answer the question, clearly state what information is missing. `;
    context += `Format your response clearly with proper structure, bullet points, or numbered lists when appropriate.\n\n`;

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
      return NextResponse.json(
        { error: "Failed to process search results" },
        { status: 502 }
      );
    }

    const responseData = await geminiResponse.json();

    if (!responseData.candidates?.length) {
      console.error(`[${chatId}] Invalid Gemini response:`, responseData);
      return NextResponse.json(
        { error: "Invalid response from AI service" },
        { status: 502 }
      );
    }

    const candidate = responseData.candidates[0];
    
    if (candidate.finishReason === "SAFETY") {
      return NextResponse.json(
        { error: "Response was filtered for safety reasons." },
        { status: 400 }
      );
    }

    if (!candidate.content?.parts?.length) {
      console.error(`[${chatId}] No content in Gemini response:`, candidate);
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
      `[${chatId}] Search request completed in ${totalTime}ms (Search: ${searchTime}ms, Gemini: ${geminiTime}ms)`
    );

    const finalResponse = `🔍 **Web Search Results**\n\n${botResponse.trim()}`;

    return NextResponse.json({
      response: finalResponse,
      searchResults: searchData.results || [],
      metadata: {
        processingTime: totalTime,
        searchTime,
        geminiResponseTime: geminiTime,
        resultsCount: searchData.results?.length || 0,
        contextLength: context.length,
        responseLength: finalResponse.length,
        source: "web_search"
      },
    });
  } catch (error) {
    const totalTime = Date.now() - startTime;
    let chatId = "unknown";
    try {
      const body = await request.json();
      chatId = body?.chatId || "unknown";
    } catch {}

    console.error(`[${chatId}] Search error after ${totalTime}ms:`, error);

    let errorMessage = "An unexpected error occurred during search";
    let statusCode = 500;

    if (error instanceof Error) {
      const message = error.message.toLowerCase();

      if (message.includes("fetch") || message.includes("network")) {
        errorMessage = "Network error during search. Please try again.";
        statusCode = 503;
      } else if (message.includes("timeout")) {
        errorMessage = "Search request timed out. Please try again.";
        statusCode = 408;
      } else if (message.includes("api_key") || message.includes("unauthorized")) {
        errorMessage = "Search service configuration error";
        statusCode = 500;
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