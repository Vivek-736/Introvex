import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { latex: latexInput, chatId } = await req.json();

    if (!latexInput || !chatId) {
      return NextResponse.json({ error: "Missing latex or chatId" }, { status: 400 });
    }

    const formData = new FormData();
    const texBlob = new Blob([latexInput], { type: "text/plain" });
    
    formData.append("file", texBlob, "main.tex");

    const response = await fetch("https://latexonline.cc/compile", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to generate PDF from latexonline.cc");
    }

    const pdfBuffer = await response.arrayBuffer();

    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="research-paper-${chatId}.pdf"`,
      },
    });
  } catch (err: any) {
    console.error("🔥 LaTeX PDF Generation Error:", err.message);
    return NextResponse.json(
      { error: "PDF generation failed", details: err.message },
      { status: 500 }
    );
  }
}