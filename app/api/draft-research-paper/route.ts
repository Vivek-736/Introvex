import { NextResponse } from "next/server";
import { supabase } from "@/services/SupabaseClient";

export async function POST(request: Request) {
  try {
    const { chatId, userName } = await request.json();
    console.log("Received request for research paper:", { chatId, userName });

    if (!chatId) {
      return NextResponse.json(
        { error: "chatId is required" },
        { status: 400 }
      );
    }
    if (!userName) {
      return NextResponse.json(
        { error: "userName is required" },
        { status: 400 }
      );
    }

    const { data: existingData, error: fetchError } = await supabase
      .from("Data")
      .select("message, vapi_chat")
      .eq("chatId", chatId)
      .maybeSingle();

    if (fetchError) {
      console.error("Error fetching chat data:", fetchError.message);
      return NextResponse.json(
        { error: `Failed to fetch chat data: ${fetchError.message}` },
        { status: 500 }
      );
    }

    let context = "";
    if (existingData?.message) {
      context += existingData.message + "\n";
    }
    if (existingData?.vapi_chat) {
      const vapiChat = existingData.vapi_chat;
      vapiChat.forEach((msg: { Assistant: string; user: string }) => {
        if (msg.user) context += `User: ${msg.user}\n`;
        if (msg.Assistant) context += `Assistant: ${msg.Assistant}\n`;
      });
    }
    context = context.trim();
    console.log("Full context for Gemini:", context);

    const prompt = `
      You are an expert research assistant tasked with drafting a comprehensive research paper based on the provided conversation context. The paper must meet the following requirements:
      - **Title**: Create a clear and relevant title based on the main topic discussed in the context.
      - **Author**: Use "${userName}" as the author of the paper.
      - **Length**: Generate content for at least 4 pages (approximately 1000-1200 words, assuming 250-300 words per page).
      - **Structure**: Include the following sections:
        - **Abstract**: A concise summary (150-200 words) of the paper's purpose, methods, and findings.
        - **Introduction**: Introduce the topic, its significance, and the paper's objectives.
        - **Literature Review**: Summarize relevant research or discussions from the context, citing any mentioned sources or ideas.
        - **Methodology**: Describe a hypothetical or relevant research approach based on the context.
        - **Discussion**: Analyze the topic, incorporating insights from the context.
        - **Conclusion**: Summarize key points and suggest future research directions.
        - **References**: List any references mentioned in the context or inferred as relevant (in APA format).
      - **Tone and Style**: Use a formal, academic tone suitable for a research paper.
      - **Formatting**: Structure the content clearly with section headings. If code or technical details are mentioned in the context, include them appropriately (e.g., in a methodology or appendix).
      - **Context**: Here is the conversation context to base the paper on:\n\n${context}\n\n
      Draft the complete research paper, ensuring all sections are well-developed and the content is cohesive and relevant to the context provided.
    `;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyBUjsjCQomz4PRKpNs1PZUq3emp_V7Y-nw`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      return NextResponse.json(
        { error: `Gemini API error: ${response.status}, ${errorText}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    const researchPaper = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!researchPaper || typeof researchPaper !== "string") {
      console.warn("Invalid research paper response:", data);
      return NextResponse.json(
        { error: "Invalid response from Gemini API" },
        { status: 500 }
      );
    }

    const { data: updateData, error: updateError } = await supabase
      .from("Data")
      .upsert(
        {
          chatId,
          research_paper: researchPaper,
          created_at: new Date().toISOString(),
        },
        {
          onConflict: "chatId",
          ignoreDuplicates: false,
        }
      )
      .select();

    if (updateError) {
      console.error("Error storing research paper:", updateError.message);
      return NextResponse.json(
        { error: `Failed to store research paper: ${updateError.message}` },
        { status: 500 }
      );
    }

    console.log("Stored research paper in Supabase:", updateData);
    
    return NextResponse.json({ success: true, researchPaper });
  } catch (error) {
    console.error("Error in draft-research-paper route:", error);
    const errorMessage =
      typeof error === "object" && error !== null && "message" in error
        ? (error as { message?: string }).message
        : "Internal server error";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}