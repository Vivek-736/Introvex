import { NextResponse } from "next/server";
import { supabase } from "@/services/SupabaseClient";

export async function POST(request: Request) {
  try {
    const { chatId, userName } = await request.json();

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
      // console.error("Error fetching chat data:", fetchError.message);
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

    const prompt = `
        You are an expert research assistant tasked with drafting a comprehensive research paper **immediately** and **only** outputting the paper content itself — without any additional commentary like "Here's the draft..." or markdown formatting (e.g., no triple backticks or \`\`\`markdown).

        Please generate a **complete research paper** that follows this structure:

        - **Title**: Create a clear and relevant title based on the main topic discussed in the context.
        - **Author**: Use "${userName}" as the author of the paper.
        - **Abstract**: A concise summary (150–200 words) of the paper's purpose, methods, and findings.
        - **Introduction**: Introduce the topic, its significance, and the objectives.
        - **Literature Review**: Summarize relevant research or ideas from the context.
        - **Methodology**: Describe a hypothetical or relevant research approach.
        - **Discussion**: Analyze the topic, incorporating insights from the conversation.
        - **Conclusion**: Summarize key points and suggest future research directions.
        - **References**: Add references in APA format.

        **Requirements**:
        - Do NOT include \`\`\`, markdown syntax, or any formatting instructions.
        - Do NOT say “Sure, here’s the paper” or anything conversational.
        - Output ONLY the research paper content.
        - Use a formal academic tone throughout.
        - Minimum length: ~1000–1200 words.

        Here is the full conversation context to base the paper on:

        ${context}

      Draft the paper now based on the above.`;

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

    return NextResponse.json({ success: true, researchPaper });
  } catch (error) {
    console.error("Error in draft-research-paper route:", error);
    const errorMessage =
      typeof error === "object" && error !== null && "message" in error
        ? (error as { message?: string }).message
        : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}