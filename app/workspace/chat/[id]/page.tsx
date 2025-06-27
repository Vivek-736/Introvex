"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Prism from "prismjs";
import { supabase } from "@/services/SupabaseClient";
import CustomLoading from "@/components/CustomLoading";
import { toast } from "sonner";
import ChatButton from "@/components/workspaceUI/ChatButton";

const ChatIdPage = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const chatIdFromParams = params.id;
  const chatIdFromQuery = searchParams.get("chatId");
  const chatId = chatIdFromParams || chatIdFromQuery;

  type Message = { sender: string; text: string; language?: string };
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchChatData = async () => {
      if (!chatId) {
        console.warn("No chatId found in params or query");
        setIsLoading(false);
        return;
      }

      console.log("Fetching chat with chatId:", chatId);

      try {
        const { data, error } = await supabase
          .from("Data")
          .select("message")
          .eq("chatId", chatId)
          .maybeSingle();

        if (error) {
          console.error("Error fetching chat:", error.message);
          setIsLoading(false);
          return;
        }

        if (data && data.message) {
          const messageString = data.message;
          const allMessages = messageString.split(",,,,");
          const processedMessages: Message[] = [];

          for (let i = 0; i < allMessages.length; i += 2) {
            const userText =
              allMessages[i]?.trim().replace(/^User: /, "") || "";
            const botText = allMessages[i + 1]?.trim().replace(/^ /, "") || "";

            if (userText) {
              processedMessages.push({ sender: "user", text: userText });
            }
            if (botText) {
              const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
              let lastIndex = 0;
              let match;

              while ((match = codeBlockRegex.exec(botText))) {
                const [fullMatch, language, code] = match;
                const beforeText = botText.slice(lastIndex, match.index).trim();
                if (beforeText) {
                  processedMessages.push({
                    sender: "bot",
                    text: cleanText(beforeText),
                  });
                }
                processedMessages.push({
                  sender: "bot",
                  text: code.trim(),
                  language: language || "plaintext",
                });
                lastIndex = match.index + fullMatch.length;
              }

              const remainingText = botText.slice(lastIndex).trim();
              if (remainingText) {
                processedMessages.push({
                  sender: "bot",
                  text: cleanText(remainingText),
                });
              }
            }
          }

          setMessages(processedMessages);
        }
      } catch (error) {
        console.error("Error in useEffect:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatData();
  }, [chatId]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    Prism.highlightAll();
  }, [messages]);

  const handleSend = async () => {
    if (input.trim() === "") return;
    setSending(true);
    const newUserMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, newUserMessage]);

    try {
      console.log("Sending message with chatId:", chatId);
      const { data: currentData, error: fetchError } = await supabase
        .from("Data")
        .select("message")
        .eq("chatId", chatId)
        .maybeSingle();

      if (fetchError) {
        console.error("Fetch error:", fetchError.message);
        throw new Error(fetchError.message);
      }

      const currentMessage = currentData?.message || "";
      const geminiResponse = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, chatId }),
      });
      const data = await geminiResponse.json();
      console.log("Gemini API response:", data);

      if (!geminiResponse.ok) {
        throw new Error(`API error: ${data.error || "Unknown error"}`);
      }

      const botResponse =
        data.response ||
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No response";
      if (!botResponse || typeof botResponse !== "string") {
        throw new Error("Invalid bot response from Gemini API");
      }

      const updatedMessage = [
        ...(currentMessage ? currentMessage.split(",,,,") : []),
        `User: ${input}`,
        `Assistant: ${botResponse}`,
      ].join(",,,,");

      const { data: updateData, error } = await supabase
        .from("Data")
        .update({
          message: updatedMessage,
          created_at: new Date().toISOString(),
        })
        .eq("chatId", chatId)
        .select();

      if (error) {
        console.error("Update error:", error.message);
        throw error;
      }

      if (updateData && updateData.length > 0) {
        console.log("Updated chat data:", updateData);
      } else {
        console.warn("No rows updated, possible chatId mismatch:", chatId);
      }

      const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
      let lastIndex = 0;
      const processedMessages: {
        sender: string;
        text: string;
        language?: string;
      }[] = [];
      let match;

      while ((match = codeBlockRegex.exec(botResponse))) {
        const [fullMatch, language, code] = match;
        const beforeText = botResponse.slice(lastIndex, match.index).trim();
        if (beforeText) {
          processedMessages.push({
            sender: "bot",
            text: cleanText(beforeText),
          });
        }
        processedMessages.push({
          sender: "bot",
          text: code.trim(),
          language: language || "plaintext",
        });
        lastIndex = match.index + fullMatch.length;
      }

      const remainingText = botResponse.slice(lastIndex).trim();
      if (remainingText) {
        processedMessages.push({
          sender: "bot",
          text: cleanText(remainingText),
        });
      }

      setMessages((prev) => [...prev, ...processedMessages]);
      setTimeout(() => Prism.highlightAll(), 0);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error sending message:", error.message);
      } else {
        console.error("Error sending message:", JSON.stringify(error));
      }
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Error: Unable to get response" },
      ]);
    } finally {
      setSending(false);
      setInput("");
    }
  };

  const cleanText = (text: string) => {
    return text.replace(/\*{1,2}([^*]+)\*{1,2}/g, "'$1'");
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard!");
  };

  return (
    <div className="min-h-screen w-full text-white bg-black flex flex-col items-center justify-center p-4 sm:p-10">
      <div className="w-full max-w-4xl flex flex-col h-[88vh] rounded-lg shadow-lg">
        <div
          className="flex-1 overflow-y-auto px-4 pb-4 space-y-4"
          ref={chatContainerRef}
        >
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex w-full p-4 ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] p-4 rounded-lg shadow-md ${
                  msg.sender === "user" ? "bg-white text-black" : "bg-gray-800"
                }`}
              >
                {msg.language ? (
                  <div className="relative">
                    <pre
                      className={`language-${msg.language} bg-gray-950 rounded-lg p-4 overflow-x-auto text-sm font-mono max-h-96`}
                    >
                      <code className={`language-${msg.language}`}>
                        {msg.text}
                      </code>
                    </pre>
                    <button
                      className="absolute top-2 right-2 bg-gray-700 text-white text-xs px-2 py-1 rounded hover:bg-gray-600 transition"
                      onClick={() => handleCopy(msg.text)}
                      title="Copy code"
                    >
                      Copy
                    </button>
                  </div>
                ) : isLoading && index === messages.length - 1 ? (
                  <p>Loading...</p>
                ) : (
                  <p className="text-base leading-relaxed whitespace-pre-wrap">
                    {msg.text}
                  </p>
                )}
              </div>
            </div>
          ))}
          {sending && <CustomLoading />}
        </div>

        <div className="p-4 rounded-lg border-t border-gray-700 bg-gray-900">
          <div className="flex items-center bg-gray-800 rounded-xl p-3 shadow-inner">
            <textarea
              placeholder="Type your message... ✦"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={sending}
              className="flex-1 p-3 bg-transparent border-none text-white text-sm resize-none h-14 focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder:text-gray-400 disabled:opacity-60 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 rounded-lg"
            />
            <div className="flex items-center gap-3 ml-3">
              <ChatButton
                text={sending ? ".........." : "Send"}
                onClick={handleSend}
                disabled={sending}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatIdPage;
