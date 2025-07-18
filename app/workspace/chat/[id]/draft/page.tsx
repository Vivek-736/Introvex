"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Prism from "prismjs";
import { supabase } from "@/services/SupabaseClient";
import CustomLoading from "@/components/CustomLoading";
import { toast } from "sonner";
import { useVapi } from "@/context/VapiContext";
import { useUser } from "@clerk/nextjs";
import { Bot, Phone } from "lucide-react";

const DraftPage = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const vapi = useVapi();
  const { user } = useUser();
  const chatIdFromParams = params.id;
  const chatIdFromQuery = searchParams.get("chatId");
  const chatId = chatIdFromParams || chatIdFromQuery;

  type Message = { sender: string; text: string; language?: string };
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [vapiConversation, setVapiConversation] = useState<any[]>([]);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isVoiceLoading, setIsVoiceLoading] = useState(false);
  const [isDraftLoading, setIsDraftLoading] = useState(false);
  const vapiConversationRef = useRef<any[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messageSetRef = useRef<Set<string>>(new Set());

  const userEmail = user?.emailAddresses[0]?.emailAddress || "";

  useEffect(() => {
    const fetchChatData = async () => {
      if (!chatId) {
        console.warn("No chatId found in params or query");
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("Data")
          .select("message, vapi_chat")
          .eq("chatId", chatId)
          .eq("userEmail", userEmail)
          .maybeSingle();

        if (error) {
          console.error("Error fetching chat:", error.message);
          setIsLoading(false);
          return;
        }

        const processedMessages: Message[] = [];

        if (data && data.message) {
          const messageString = data.message;
          const allMessages = messageString.split(",,,,");
          for (let i = 0; i < allMessages.length; i += 2) {
            const userText =
              allMessages[i]?.trim().replace(/^User: /, "") || "";
            const botText =
              allMessages[i + 1]?.trim().replace(/^Assistant: /, "") || "";

            if (userText) {
              processedMessages.push({ sender: "user", text: userText });
              messageSetRef.current.add(`User: ${userText}`);
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
                  messageSetRef.current.add(
                    `Assistant: ${cleanText(beforeText)}`
                  );
                }
                processedMessages.push({
                  sender: "bot",
                  text: code.trim(),
                  language: language || "plaintext",
                });
                messageSetRef.current.add(
                  `Assistant: \`\`\`${
                    language || "plaintext"
                  }\n${code.trim()}\`\`\``
                );
                lastIndex = match.index + fullMatch.length;
              }

              const remainingText = botText.slice(lastIndex).trim();
              if (remainingText) {
                processedMessages.push({
                  sender: "bot",
                  text: cleanText(remainingText),
                });
                messageSetRef.current.add(
                  `Assistant: ${cleanText(remainingText)}`
                );
              }
            }
          }
        }

        if (data && data.vapi_chat) {
          const vapiChat = data.vapi_chat;
          vapiChat.forEach((msg: { Assistant: string; user: string }) => {
            if (msg.Assistant) {
              const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
              let lastIndex = 0;
              let match;

              while ((match = codeBlockRegex.exec(msg.Assistant))) {
                const [fullMatch, language, code] = match;
                const beforeText = msg.Assistant.slice(
                  lastIndex,
                  match.index
                ).trim();
                if (beforeText) {
                  processedMessages.push({
                    sender: "bot",
                    text: cleanText(beforeText),
                  });
                  messageSetRef.current.add(
                    `Assistant: ${cleanText(beforeText)}`
                  );
                }
                processedMessages.push({
                  sender: "bot",
                  text: code.trim(),
                  language: language || "plaintext",
                });
                messageSetRef.current.add(
                  `Assistant: \`\`\`${
                    language || "plaintext"
                  }\n${code.trim()}\`\`\``
                );
                lastIndex = match.index + fullMatch.length;
              }

              const remainingText = msg.Assistant.slice(lastIndex).trim();
              if (remainingText) {
                processedMessages.push({
                  sender: "bot",
                  text: cleanText(remainingText),
                });
                messageSetRef.current.add(
                  `Assistant: ${cleanText(remainingText)}`
                );
              }
            }
            if (msg.user) {
              processedMessages.push({ sender: "user", text: msg.user });
              messageSetRef.current.add(`User: ${msg.user}`);
            }
          });
        }

        setMessages(processedMessages);
      } catch (error) {
        console.error("Error in fetchChatData:", error);
        toast.error("Failed to load chat data.");
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

  const updateSupabaseWithMessage = async (
    newMessages: { Assistant: string; user: string }[]
  ) => {
    if (!chatId || !newMessages.length) return;

    try {
      const { data: currentData, error: fetchError } = await supabase
        .from("Data")
        .select("vapi_chat")
        .eq("chatId", chatId)
        .maybeSingle();

      if (fetchError) {
        console.error("Error fetching current messages:", fetchError.message);
        toast.error("Failed to fetch current messages.");
        return;
      }

      const existingMessages = currentData?.vapi_chat || [];
      const uniqueNewMessages = newMessages.filter(
        (newMsg) =>
          !existingMessages.some(
            (existingMsg: any) =>
              existingMsg.user === newMsg.user &&
              existingMsg.Assistant === newMsg.Assistant
          )
      );

      if (uniqueNewMessages.length === 0) {
        return;
      }

      const updatedMessages = [...existingMessages, ...uniqueNewMessages];

      const { data: updateData, error: updateError } = await supabase
        .from("Data")
        .upsert(
          {
            chatId,
            vapi_chat: updatedMessages,
            created_at: new Date().toISOString(),
          },
          {
            onConflict: "chatId",
            ignoreDuplicates: false,
          }
        )
        .select();

      if (updateError) {
        console.error(
          "Error updating Supabase with messages:",
          updateError.message
        );
        toast.error("Failed to save conversation.");
        return;
      }
    } catch (error) {
      console.error("Error in updateSupabaseWithMessage:", error);
      toast.error("Failed to process conversation.");
    }
  };

  useEffect(() => {
    const handleCallStart = () => {
      toast.success("Research assistant connected. Please speak to continue.");
      setIsCallActive(true);
      setIsVoiceLoading(false);
    };

    const handleSpeechStart = () => {};

    const handleSpeechEnd = () => {};

    const handleCallEnd = () => {
      toast.success("Research assistant call ended...");
      setIsCallActive(false);
      setIsVoiceLoading(false);
    };

    const handleMessage = (message: any) => {
      try {
        if (message?.conversation) {
          setVapiConversation(message.conversation);
          vapiConversationRef.current = message.conversation;

          const newMessages: Message[] = [];
          const supabaseMessages: { Assistant: string; user: string }[] = [];
          let currentPair: { Assistant: string; user: string } = {
            Assistant: "",
            user: "",
          };

          message.conversation
            .filter((msg: any) => msg.role !== "system")
            .forEach((msg: any) => {
              const messageKey = `${
                msg.role === "user" ? "User" : "Assistant"
              }: ${msg.content.trim()}`;
              if (!messageSetRef.current.has(messageKey)) {
                messageSetRef.current.add(messageKey);

                const sender = msg.role === "user" ? "user" : "bot";
                const text = msg.content.trim();
                const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
                let lastIndex = 0;
                let match;

                while ((match = codeBlockRegex.exec(text))) {
                  const [fullMatch, language, code] = match;
                  const beforeText = text.slice(lastIndex, match.index).trim();
                  if (beforeText) {
                    newMessages.push({
                      sender,
                      text: cleanText(beforeText),
                    });
                    messageSetRef.current.add(
                      `${sender === "user" ? "User" : "Assistant"}: ${cleanText(
                        beforeText
                      )}`
                    );
                    if (sender === "bot") {
                      currentPair.Assistant += beforeText
                        ? `${cleanText(beforeText)}\n`
                        : "";
                    } else {
                      currentPair.user += beforeText ? `${beforeText}\n` : "";
                    }
                  }
                  newMessages.push({
                    sender,
                    text: code.trim(),
                    language: language || "plaintext",
                  });
                  messageSetRef.current.add(
                    `${sender === "user" ? "User" : "Assistant"}: \`\`\`${
                      language || "plaintext"
                    }\n${code.trim()}\`\`\``
                  );
                  if (sender === "bot") {
                    currentPair.Assistant += `\`\`\`${
                      language || "plaintext"
                    }\n${code.trim()}\`\`\`\n`;
                  } else {
                    currentPair.user += `\`\`\`${
                      language || "plaintext"
                    }\n${code.trim()}\`\`\`\n`;
                  }
                  lastIndex = match.index + fullMatch.length;
                }

                const remainingText = text.slice(lastIndex).trim();
                if (remainingText) {
                  newMessages.push({
                    sender,
                    text: cleanText(remainingText),
                  });
                  messageSetRef.current.add(
                    `${sender === "user" ? "User" : "Assistant"}: ${cleanText(
                      remainingText
                    )}`
                  );
                  if (sender === "bot") {
                    currentPair.Assistant += cleanText(remainingText);
                  } else {
                    currentPair.user += remainingText;
                  }
                }

                if (currentPair.Assistant || currentPair.user) {
                  supabaseMessages.push({ ...currentPair });
                  currentPair = { Assistant: "", user: "" };
                }
              }
            });

          if (currentPair.Assistant || currentPair.user) {
            supabaseMessages.push(currentPair);
          }

          if (newMessages.length > 0) {
            setMessages((prev) => [...prev, ...newMessages]);
            updateSupabaseWithMessage(supabaseMessages);
          }
        } else {
          console.warn(
            "Received undefined conversation from vapi.on(message)",
            message
          );
        }
      } catch (error) {
        console.error("Error handling Vapi message:", error, { message });
      }
    };

    const handleError = (error: any) => {
      console.error("Vapi error (raw):", error);
      console.error("Vapi error details:", {
        status: error?.status,
        errorType: error?.type,
        errorMsg: error?.error?.message || error?.msg || "Unknown error",
        errorDetails: error?.error?.details || error?.details,
        endedReason: error?.endedReason,
      });
      let errorMessage =
        "Failed to start voice call. An unexpected error occurred.";
      if (error?.status === 400) {
        errorMessage = `Invalid assistant configuration: ${
          error?.error?.message || "Bad Request"
        }. Please check your Vapi settings.`;
      } else if (error?.msg?.includes("Meeting has ended")) {
        errorMessage =
          "Voice call was ejected. Please check your Vapi configuration or microphone.";
      } else if (error?.endedReason?.includes("silence-timed-out")) {
        errorMessage =
          "Call ended due to silence timeout. Please speak after the assistant or check settings.";
      } else if (
        error?.endedReason?.includes("pipeline-error-11labs-request-timed-out")
      ) {
        errorMessage =
          "Voice provider (ElevenLabs) timed out. Please configure ElevenLabs credentials in Vapi dashboard or use a different voice provider.";
      } else if (!error) {
        errorMessage =
          "Unknown Vapi error. Please check your API key or network connection.";
      }
      toast.error(errorMessage);
      setIsCallActive(false);
      setIsVoiceLoading(false);
      vapi.stop();
    };

    vapi.on("call-start", handleCallStart);
    vapi.on("speech-start", handleSpeechStart);
    vapi.on("speech-end", handleSpeechEnd);
    vapi.on("call-end", handleCallEnd);
    vapi.on("message", handleMessage);
    vapi.on("error", handleError);

    return () => {
      vapi.off("call-start", handleCallStart);
      vapi.off("speech-start", handleSpeechStart);
      vapi.off("speech-end", handleSpeechEnd);
      vapi.off("call-end", handleCallEnd);
      vapi.off("message", handleMessage);
      vapi.off("error", handleError);
    };
  }, [vapi]);

  const cleanText = (text: string) => {
    return text.replace(/\*{1,2}([^*]+)\*{1,2}/g, "'$1'");
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard!");
  };

  const handleVoiceAgentChat = async () => {
    setIsVoiceLoading(true);
    try {
      const userName = user?.firstName || "User";
      const conversationHistory = messages
        .slice(-6)
        .map((msg) =>
          msg.sender === "user"
            ? `User: ${msg.text}`
            : `Assistant: ${msg.text}${
                msg.language ? `\nLanguage: ${msg.language}` : ""
              }`
        )
        .join("\n")
        .slice(0, 1500);

      const assistantOptions = {
        name: "AI Research Assistant",
        firstMessage: `Hello ${userName}! I'm here to help you draft, refine, and structure your research paper. Just let me know your topic and how you'd like to begin.`,
        transcriber: {
          provider: "deepgram",
          model: "nova-2",
          language: "en",
        },
        voice: {
          provider: "11labs",
          voiceId: "sarah",
          stability: 0.4,
          similarityBoost: 0.8,
          speed: 0.9,
          style: 0.5,
          useSpeakerBoost: true,
        },
        model: {
          provider: "openai",
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: `
                  You are an AI research assistant conducting a real-time voice conversation to help a user draft a research paper.

                  Context of the conversation:
                  ${conversationHistory}

                  Your objective:
                  - Understand the user’s research topic and assist them in structuring their paper.
                  - Ask clarifying questions to better understand their goals.
                  - Recommend outlines, thesis statements, literature review strategies, or citation formats as needed.

                  Tone & Style:
                  - Speak clearly and professionally.
                  - Keep responses concise and easy to follow (since this is a voice chat).
                  - Avoid overly long or robotic answers.
                  - Use code blocks if the user asks for code snippets in specific programming languages.
                  - If asked about formatting, give LaTeX, APA, or MLA examples as needed.

                  Be polite, efficient, and keep the conversation productive. Always offer to err on the side of clarity if the user sounds confused.
              `.trim(),
            },
          ],
        },
      };

      // @ts-ignore
      await vapi.start(assistantOptions);
    } catch (error: any) {
      console.error("Vapi start failed:", error, {
        status: error?.response?.status,
        data: error?.response?.data,
        message: error?.message,
      });
      let errorMessage =
        "Failed to start Vapi call. Please check your configuration.";
      if (error?.response?.status === 400) {
        errorMessage = `Invalid Vapi configuration: ${
          error?.response?.data?.message || "Bad Request"
        }. Please verify your assistant settings.`;
      } else if (error?.endedReason?.includes("silence-timed-out")) {
        errorMessage =
          "Call ended due to silence timeout. Please speak after the assistant or check settings.";
      } else if (
        error?.endedReason?.includes("pipeline-error-11labs-request-timed-out")
      ) {
        errorMessage =
          "Voice provider (ElevenLabs) timed out. Please configure ElevenLabs credentials in Vapi dashboard or use a different voice provider.";
      } else if (!error) {
        errorMessage =
          "Unknown Vapi error. Please check your API key or network connection.";
      }
      toast.error(errorMessage);
      setIsVoiceLoading(false);
      vapi.stop();
    }
  };

  const handleStopCall = () => {
    try {
      vapi.stop();
      toast.info("Voice call stopped.");
    } catch (error) {
      console.error("Error stopping Vapi call:", error);
      toast.error("Failed to stop voice call.");
    }
  };

  const handleDraftResearchPaper = async () => {
    setIsDraftLoading(true);
    try {
      const userName = user?.firstName || "User";
      const response = await fetch("/api/draft-research-paper", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ chatId, userName }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error from draft-research-paper API:", errorData);
        toast.error(errorData.error || "Failed to generate research paper.");
        setIsDraftLoading(false);
        return;
      }

      const data = await response.json();
      toast.success("Research paper generated successfully!");
      router.push(`/workspace/chat/${chatId}/research`);
    } catch (error) {
      console.error("Error in handleDraftResearchPaper:", error);
      toast.error("Failed to initiate research paper generation.");
      setIsDraftLoading(false);
    }
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
                  msg.sender === "user"
                    ? "bg-white text-black"
                    : "bg-gray-800 text-white"
                }`}
              >
                {msg.language ? (
                  <div className="relative">
                    <pre
                      className={`language-${msg.language} bg-gray-950 rounded-lg p-4 overflow-x-auto md:text-sm text-xs font-mono max-h-96`}
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
                  <p className="md:text-base text-xs leading-relaxed whitespace-pre-wrap">
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
            <div className="relative">
              {isCallActive && (
                <span className="absolute inset-0 rounded-full bg-cyan-400 opacity-75 animate-ping" />
              )}
              <button
                className="relative bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs md:text-base font-semibold md:px-6 md:py-3 p-2 rounded-lg shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 animate-glitter flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleVoiceAgentChat}
                disabled={isCallActive || isVoiceLoading}
              >
                {isVoiceLoading ? (
                  <div className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Loading...</span>
                  </div>
                ) : isCallActive ? (
                  <Bot className="h-5 w-5" />
                ) : (
                  "Voice Agent Chat"
                )}
                <span className="absolute inset-0 glitter"></span>
              </button>
            </div>
            {isCallActive && (
              <button
                className="relative bg-rose-600 text-white text-xs md:text-base font-semibold px-6 py-3 rounded-lg shadow-lg hover:bg-rose-700 transition-all duration-300"
                onClick={handleStopCall}
              >
                <Phone className="h-5 w-5 md:inline-block mr-2 hidden" />
                Stop Call
              </button>
            )}
            <button
              className="relative bg-white text-black text-xs md:text-base font-semibold p-2 md:px-6 md:py-3 rounded-lg shadow-lg hover:bg-gray-200 transition-all duration-300 border-2 border-gray-800 animate-pulse disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleDraftResearchPaper}
              disabled={isDraftLoading}
            >
              {isDraftLoading ? (
                <div className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-black"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Loading...</span>
                </div>
              ) : (
                "Draft a Research Paper"
              )}
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
            @keyframes ping {
              75%,
              100% {
                transform: scale(2);
                opacity: 0;
              }
            }
            .animate-ping {
              animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
            }
          `}</style>
        </div>
      </div>
    </div>
  );
};

export default DraftPage;
