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
      You are an expert research assistant tasked with drafting a comprehensive research paper in LaTeX format, following the structure and style of the provided example, including mathematical formulas and tables. Output ONLY the LaTeX code for the research paper, without any additional commentary or markdown code fences.

      The paper must follow this structure:
      - Title: Relevant to the topic from the context.
      - Author: Use "${userName}".
      - Abstract: 150–200 words summarizing purpose, methods, and findings.
      - Introduction: Introduce the topic, its significance, and objectives.
      - Literature Review: Summarize relevant research from the context.
      - Methodology: Describe a hypothetical or relevant research approach, including equations (e.g., Geometric Brownian Motion as in the example).
      - Results and Discussion: Analyze results with a table comparing methods (similar to Table 1 in the example).
      - Conclusion: Summarize key points and suggest future research.
      - References: Use APA format in BibTeX.

      Requirements:
      - Use the article document class with amsmath, amssymb, booktabs, and natbib packages.
      - Include at least one table (e.g., comparing pricing methods) and mathematical equations (e.g., GBM formula).
      - Ensure the LaTeX code is compilable with PDFLaTeX.
      - Minimum length: ~1000–1200 words.
      - Include a table similar to the example's Table 1 for European call option pricing.
      - Use formal academic tone.

      Example LaTeX structure to follow:
      \\documentclass{article}
      \\usepackage{amsmath, amssymb, booktabs, natbib}
      \\begin{document}
      \\title{...}
      \\author{...}
      \\maketitle
      \\begin{abstract}
      ...
      \\end{abstract}
      \\section{Introduction}
      ...
      \\section{Literature Review}
      ...
      \\section{Methodology}
      \\begin{equation}
      dS_t = (r - q)S_t dt + \\sigma S_t dW_t
      \\end{equation}
      ...
      \\section{Results and Discussion}
      \\begin{table}[h]
      \\centering
      \\begin{tabular}{lcc}
      \\toprule
      Method & Price & Standard Error \\\\
      \\midrule
      Standard MC & ... & ... \\\\
      Antithetic Variates & ... & ... \\\\
      Control Variates & ... & ... \\\\
      \\bottomrule
      \\end{tabular}
      \\caption{Example Results for European Call Option Pricing}
      \\label{tab:results}
      \\end{table}
      ...
      \\section{Conclusion}
      ...
      \\begin{thebibliography}{9}
      ...
      \\end{thebibliography}
      \\end{document}

      Conversation context:
      ${context}

      Draft the LaTeX paper now.
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