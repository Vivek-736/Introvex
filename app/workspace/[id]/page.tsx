"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Prism from "prismjs";
import { Mic } from "lucide-react";
import axios from "axios";
import CustomLoading from "@/components/CustomLoading";
import { toast } from "sonner";

const WorkspaceIdPage = () => {
  const searchParams = useSearchParams();

  type Message = { sender: string; text: string; language?: string };
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const message = searchParams.get("message");
    const response = searchParams.get("response");

    if (!message || !response) {
      setIsLoading(false);
      return;
    }

    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let lastIndex = 0;
    const processedMessages = [{ sender: "user", text: message }];
    let match;

    while ((match = codeBlockRegex.exec(response))) {
      const [fullMatch, language, code] = match;
      const beforeText = response.slice(lastIndex, match.index).trim();
      if (beforeText) {
        processedMessages.push({ sender: "bot", text: cleanText(beforeText) });
      }
      processedMessages.push({
        sender: "bot",
        text: code.trim(),
        // @ts-ignore
        language: language || "plaintext",
      });
      lastIndex = match.index + fullMatch.length;
    }

    const remainingText = response.slice(lastIndex).trim();
    if (remainingText) {
      processedMessages.push({ sender: "bot", text: cleanText(remainingText) });
    }

    setMessages(processedMessages);
    setIsLoading(false);
  }, [searchParams]);

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
    setInput("");

    try {
      const response = await axios.post("/api/gemini", { message: input });
      const botResponse = response.data.response;

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
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Error: Unable to get response" },
      ]);
    } finally {
      setSending(false);
    }
  };

  const cleanText = (text: string) => {
    return text.replace(/\*{1,2}([^*]+)\*{1,2}/g, "'$1'");
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard!");
  };

  if (!searchParams.get("message") || !searchParams.get("response")) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Conversation not found
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-black text-white flex flex-col items-center justify-center p-4 sm:p-10">
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
          <div className="flex items-center bg-gray-800 rounded-lg p-2 shadow-inner">
            <textarea
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={sending}
              className="flex-1 mt-2 bg-transparent border-none text-white text-sm p-2 resize-none h-12 focus:outline-none placeholder:text-gray-400 disabled:opacity-60 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
            />
            <div className="flex items-center gap-2 ml-2">
              <button
                disabled={sending}
                title="Voice input"
                className="text-gray-400 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Mic className="w-5 h-5" />
              </button>
              <button
                onClick={handleSend}
                disabled={sending}
                title="Send message"
                className="bg-gray-700 p-2 rounded-lg hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? (
                  <span className="text-xs text-white">Sending...</span>
                ) : (
                  <svg
                    viewBox="0 0 512 512"
                    className="w-5 h-5 text-gray-400 hover:text-white"
                  >
                    <path
                      fill="currentColor"
                      d="M473 39.05a24 24 0 0 0-25.5-5.46L47.47 185h-.08a24 24 0 0 0 1 45.16l.41.13l137.3 58.63a16 16 0 0 0 15.54-3.59L422 80a7.07 7.07 0 0 1 10 10L226.66 310.26a16 16 0 0 0-3.59 15.54l58.65 137.38c.06.2.12.38.19.57c3.2 9.27 11.3 15.81 21.09 16.25h1a24.63 24.63 0 0 0 23-15.46L478.39 64.62A24 24 0 0 0 473 39.05"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceIdPage;
