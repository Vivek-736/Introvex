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
      You are an expert research assistant tasked with drafting a comprehensive research paper in HTML format with embedded CSS, based on the provided conversation context. Use MathJax for accurate rendering of mathematical notation if relevant to the topic. Include Google Fonts (Roboto Serif) for a professional academic look. Output ONLY the complete HTML document with <style> tags for CSS, without any additional commentary, markdown code fences, or extraneous text such as "html" at the beginning of the output. Ensure the output starts with <!DOCTYPE html> and contains no prefixes or artifacts before the DOCTYPE.

      The paper must follow this structure:
      - Title: Derive a relevant title based on the conversation context.
      - Author: Use "${userName}".
      - Date: Current date and time in IST (July 13, 2025, 05:09 PM IST).
      - Abstract: 150–200 words summarizing purpose, methods, and findings based on the context.
      - Introduction: Introduce the topic, its significance, and objectives, inferred from the context.
      - Literature Review: Summarize relevant research related to the topic in the context.
      - Methodology: Describe the approach or methods discussed in the context, including relevant equations (e.g., mathematical models) if applicable.
      - Results and Discussion: Analyze findings with at least one table summarizing key results or comparisons.
      - Conclusion: Summarize key points and suggest future research.
      - References: Use a simple unordered list for citations, referencing works relevant to the context.

      Requirements:
      - Use semantic HTML5 tags (e.g., <h1>, <section>, <table>).
      - Include at least one table with 4 rows comparing methods, approaches, or results relevant to the context.
      - Use MathJax CDN (https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js) for equations if the context involves mathematical concepts.
      - Use Google Fonts (Roboto Serif) via CDN (https://fonts.googleapis.com/css2?family=Roboto+Serif:wght@400;700&display=swap).
      - Minimum length: ~1000–1200 words.
      - Use a formal academic tone with professional spacing (e.g., 1.8 line height, 40px section margins, 10px paragraph margins).
      - Include formulas if the context suggests mathematical or technical content.

      CSS Styling:
      - Use Roboto Serif for all text.
      - Ensure professional spacing: 1.8 line height, 40px margins between sections, 10px between paragraphs.
      - Style tables with clear borders, alternating row colors, and padding for readability.
      - Center the title and apply consistent heading styles.

      Example HTML structure to follow:
      <!DOCTYPE html>
      <html>
      <head>
        <script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
        <link href="https://fonts.googleapis.com/css2?family=Roboto+Serif:wght@400;700&display=swap" rel="stylesheet">
        <style>
          body { font-family: 'Roboto Serif', serif; margin: 0; padding: 40px; line-height: 1.8; color: #333; }
          h1 { text-align: center; color: #222; font-size: 2.2em; margin-bottom: 20px; }
          h2 { color: #444; font-size: 1.6em; margin: 40px 0 20px; }
          p { margin: 10px 0; }
          .abstract { padding-left: 20px; border-left: 4px solid black; }
          table { width: 100%; border-collapse: collapse; margin: 30px 0; }
          th, td { border: 1px solid #ccc; padding: 12px; text-align: left; }
          th { background-color: #f5f5f5; font-weight: 700; }
          tr:nth-child(even) { background-color: #fafafa; }
          .section { margin-bottom: 40px; }
          ul { margin: 20px 0; padding-left: 30px; }
          li { margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <h1>[Derived Title]</h1>
        <p><strong>Author:</strong> ${userName}</p>
        <p><strong>Date:</strong> July 13, 2025, 05:09 PM IST</p>
        <div class="abstract"><h2>Abstract</h2><p>[Abstract content]</p></div>
        <div class="section"><h2>Introduction</h2><p>[Introduction content]</p></div>
        <div class="section"><h2>Methodology</h2><p>[Methodology content, include equations if relevant]</p></div>
        <div class="section"><h2>Results and Discussion</h2><table><tr><th>Method</th><th>Metric</th><th>Value</th></tr><tr><td>[Method 1]</td><td>[Metric]</td><td>[Value]</td></tr></table></div>
        <div class="section"><h2>Conclusion</h2><p>[Conclusion content]</p></div>
        <div class="section"><h2>References</h2><ul><li>[Reference]</li></ul></div>
      </body>
      </html>

      Conversation context:
      ${context}

      Draft the HTML paper now, ensuring no extraneous text appears before the DOCTYPE.
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
      return NextResponse.json(
        { error: `Gemini API error: ${response.status}, ${errorText}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    const researchPaper = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!researchPaper || typeof researchPaper !== "string") {
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
      return NextResponse.json(
        { error: `Failed to store research paper: ${updateError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, researchPaper });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}