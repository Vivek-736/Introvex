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
      You are an expert research assistant tasked with drafting a comprehensive research paper in HTML format with embedded CSS, following the structure and style of the provided example. Use MathJax for accurate rendering of mathematical notation (e.g., GBM equations). Include Google Fonts (Roboto Serif) for a professional academic look. Output ONLY the complete HTML document with <style> tags for CSS, without any additional commentary, markdown code fences, or extraneous text such as "html" at the beginning of the output. Ensure the output starts with <!DOCTYPE html> and contains no prefixes or artifacts before the DOCTYPE.

      The paper must follow this structure:
      - Title: Relevant to Monte Carlo option pricing with variance reduction.
      - Author: Use "${userName}".
      - Date: Current date and time in IST (July 08, 2025, 06:52 PM IST).
      - Abstract: 150–200 words summarizing purpose, methods, and findings.
      - Introduction: Introduce option pricing, its significance, and objectives.
      - Literature Review: Summarize relevant research on Monte Carlo methods and variance reduction.
      - Methodology: Describe the Monte Carlo simulation approach, including the GBM equation S_t = S_0 e^((r - q - σ^2/2)t + σW_t).
      - Results and Discussion: Analyze results with a table comparing methods (similar to Table 1 in the example).
      - Conclusion: Summarize key points and suggest future research.
      - References: Use a simple unordered list for citations.

      Requirements:
      - Use semantic HTML5 tags (e.g., <h1>, <section>, <table>).
      - Include a table with 4 rows comparing pricing methods (Standard MC, Antithetic Variates, Control Variates, Combined).
      - Use MathJax CDN (https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js) for equations.
      - Use Google Fonts (Roboto Serif) via CDN (https://fonts.googleapis.com/css2?family=Roboto+Serif:wght@400;700&display=swap).
      - Minimum length: ~1000–1200 words.
      - Use a formal academic tone.

      Example HTML structure to follow:
      <!DOCTYPE html>
      <html>
      <head>
        <script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
        <link href="https://fonts.googleapis.com/css2?family=Roboto+Serif:wght@400;700&display=swap" rel="stylesheet">
        <style>
          body { font-family: 'Roboto Serif', serif; margin: 0; padding: 20px; line-height: 1.6; }
          h1 { text-align: center; color: #333; }
          h2 { color: #555; margin-top: 20px; }
          .abstract { padding-left: 15px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .section { margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <h1>...</h1>
        <p><strong>Author:</strong> ...</p>
        <p><strong>Date:</strong> ...</p>
        <div class="abstract"><h2>Abstract</h2><p>...</p></div>
        <div class="section"><h2>Introduction</h2><p>...</p></div>
        <div class="section"><h2>Methodology</h2><p>\\( S_t = S_0 e^{(r - q - \\sigma^2/2)t + \\sigma W_t} \\)</p></div>
        <div class="section"><h2>Results and Discussion</h2>
          <table><tr><th>Method</th><th>Price</th><th>Standard Error</th></tr><tr><td>Standard MC</td><td>...</td><td>...</td></tr></table>
        </div>
        <div class="section"><h2>Conclusion</h2><p>...</p></div>
        <div class="section"><h2>References</h2><ul><li>...</li></ul></div>
      </body>
      </html>

      Conversation context:
      ${context}

      Draft the HTML paper now, ensuring no extraneous text like "html" appears before the DOCTYPE.
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