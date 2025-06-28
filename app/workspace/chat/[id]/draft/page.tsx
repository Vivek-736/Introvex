"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Prism from "prismjs";
import { supabase } from "@/services/SupabaseClient";
import CustomLoading from "@/components/CustomLoading";
import { toast } from "sonner";

const DraftPage = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const chatIdFromParams = params.id;
  const chatIdFromQuery = searchParams.get("chatId");
  const chatId = chatIdFromParams || chatIdFromQuery;

  type Message = { sender: string; text: string; language?: string };
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  const cleanText = (text: string) => {
    return text.replace(/\*{1,2}([^*]+)\*{1,2}/g, "'$1'");
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard!");
  };

  const handleVoiceAgentChat = () => {
    // Placeholder for Voice Agent Chat navigation or action
    router.push(`/workspace/chat/${chatId}/voice`);
  };

  const handleDraftResearchPaper = () => {
    // Placeholder for Draft Research Paper navigation or action
    router.push(`/workspace/chat/${chatId}/research`);
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
          {isLoading && <CustomLoading />}
        </div>

        <div className="p-4 rounded-lg border-t border-gray-700 bg-gray-900">
          <div className="flex items-center justify-center gap-6">
            <button
              className="relative bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-base font-semibold px-6 py-3 rounded-lg shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 animate-glitter"
              onClick={handleVoiceAgentChat}
            >
              Voice Agent Chat
              <span className="absolute inset-0 glitter"></span>
            </button>
            <button
              className="relative bg-white text-black text-base font-semibold px-6 py-3 rounded-lg shadow-lg hover:bg-gray-200 transition-all duration-300 border-2 border-gray-800 animate-pulse"
              onClick={handleDraftResearchPaper}
            >
              Draft a Research Paper
            </button>
          </div>
          <style jsx>{`
            @keyframes glitter {
              0% {
                background: radial-gradient(
                  circle,
                  rgba(255, 255, 255, 0.3) 0%,
                  transparent 70%
                );
                background-size: 200% 200%;
                background-position: 0% 0%;
              }
              50% {
                background: radial-gradient(
                  circle,
                  rgba(255, 255, 255, 0.5) 0%,
                  transparent 70%
                );
                background-size: 150% 150%;
                background-position: 100% 100%;
              }
              100% {
                background: radial-gradient(
                  circle,
                  rgba(255, 255, 255, 0.3) 0%,
                  transparent 70%
                );
                background-size: 200% 200%;
                background-position: 0% 0%;
              }
            }
            .glitter {
              animation: glitter 1.5s infinite;
              pointer-events: none;
              mix-blend-mode: overlay;
            }
            @keyframes pulse {
              0% {
                transform: scale(1);
                box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.2);
              }
              50% {
                transform: scale(1.02);
                box-shadow: 0 0 10px 5px rgba(255, 255, 255, 0.3);
              }
              100% {
                transform: scale(1);
                box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.2);
              }
            }
            .animate-pulse {
              animation: pulse 2s infinite;
            }
          `}</style>
        </div>
      </div>
    </div>
  );
};

export default DraftPage;
