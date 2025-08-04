import { NextResponse } from "next/server";
import { supabase } from "@/services/SupabaseClient";
import { PDFDocument } from "pdf-lib";

export async function POST(request: Request) {
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

    const { data: existingData, error: fetchError } = await supabase
      .from("Data")
      .select("message, pdfUrl")
      .eq("chatId", chatId)
      .maybeSingle();

    if (fetchError) {
      console.error("Error fetching chat history:", fetchError.message);
      throw new Error(fetchError.message);
    }

    const currentMessage = existingData?.message || "";
    let fullContext = currentMessage ? `${currentMessage}\n` : "";

    let pdfContent = "";
    if (pdfUrls && pdfUrls.length > 0) {
      for (const url of pdfUrls) {
        try {
          const response = await fetch(url);
          const arrayBuffer = await response.arrayBuffer();
          const pdfDoc = await PDFDocument.load(arrayBuffer);
          const pages = pdfDoc.getPages();
          let text = "";
          for (const page of pages) {
            text += await page
              .getTextContent()
              .then((content: any) =>
                content.items.map((item: any) => item.str).join(" ")
              );
          }
          pdfContent += `\nPDF Content: ${text.trim()}`;
        } catch (error) {
          console.error(`Error processing PDF ${url}:`, error);
        }
      }
      fullContext += pdfContent;
    }

    if (message) {
      fullContext += `\nUser: ${message}`.trim();
    }

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
                  text: fullContext,
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
      throw new Error(`HTTP error! status: ${response.status}, ${errorText}`);
    }

    const data = await response.json();
    const botResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!botResponse || typeof botResponse !== "string") {
      console.warn("Invalid bot response:", data);
      throw new Error("Invalid response from Gemini API");
    }

    return NextResponse.json({ response: botResponse });
  } catch (error) {
    console.error("Error fetching Gemini API:", error);
    const errorMessage =
      typeof error === "object" && error !== null && "message" in error
        ? (error as { message?: string }).message
        : undefined;
    return NextResponse.json(
      { error: errorMessage || "Internal server error" },
      { status: 500 }
    );
  }
}