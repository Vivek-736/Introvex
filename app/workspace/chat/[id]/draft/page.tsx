"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Prism from "prismjs";
import { supabase } from "@/services/SupabaseClient";
import CustomLoading from "@/components/CustomLoading";
import { toast } from "sonner";
import { useVapi } from "@/context/VapiContext";
import { useUser } from "@clerk/nextjs";
import { Bot, Phone, FileText, Mic, MicOff, Copy } from "lucide-react";

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
              const codeBlockRegex = /``````/g;
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
              const codeBlockRegex = /``````/g;
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
                const codeBlockRegex = /``````/g;
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
                  You are an AI research assistant conducting a real-time voice conversation to support a user in developing a research paper.

                  Context of the conversation:

                  ${conversationHistory}

                  Your objective:

                  Engage with the user to understand their research topic and guide them in structuring their paper effectively.
                  Ask thoughtful, research-based clarifying questions to deepen your understanding of their goals and help refine their thesis statement.
                  Offer suggestions for outlines, thesis refinement, literature review strategies, or citation formats (e.g., APA, MLA, LaTeX) as needed, without immediately drafting the full paper—treat the research paper draft as the final output after thorough discussion.
                  Tone & Style:

                  Speak clearly and professionally, with a warm and approachable manner.
                  Keep responses concise, easy to follow, and conversational, avoiding lengthy or robotic answers suitable for voice chat.
                  If the user requests code snippets in specific programming languages, do not read them aloud. Instead, inform them that there's code related to their research they can explore via a Google search, or assure them it will be included in the final draft, so they need not worry.
                  When discussing formatting, provide brief examples (e.g., APA, MLA, or LaTeX) without overwhelming detail, and offer to clarify if needed.
                  Guidelines:

                  Be polite, efficient, and focused on keeping the conversation productive.
                  Cross-question the user on their research topic to explore its scope, relevance, and potential thesis direction, helping them refine their ideas step-by-step.
                  Avoid jumping straight into drafting the research paper; build the foundation through discussion first.
                  If the user seems confused, proactively offer to explain further for clarity.
                  Explanation of Changes
                  Avoid Reading Code: Added a specific instruction to not read code aloud and instead suggest Google searches or assure inclusion in the final draft, addressing your concern about code handling in a voice context.
                  Cross-Questioning and Thesis Refinement: Emphasized asking clarifying, research-based questions to refine the thesis, shifting the focus from immediate drafting to a collaborative exploration phase.
                  Delayed Drafting: Clarified that the research paper draft is the final output, encouraging a step-by-step process starting with discussion and structure.
                  Tone and Clarity: Enhanced the tone to be warm and approachable while maintaining professionalism, and added a proactive offer to clarify if the user seems confused.
                  Conciseness: Streamlined language to suit voice chat, ensuring responses remain digestible and focused.
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

  if (isLoading) {
    return (
      <div className="min-h-screen w-full text-white bg-gradient-to-br from-black via-purple-950/20 to-black flex items-center justify-center">
        <CustomLoading />
      </div>
    );
  }

  return (
    <div className="min-h-screen md:mt-0 -mt-4 w-full text-white bg-gradient-to-br from-black via-purple-950/20 to-black">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative flex flex-col items-center justify-center p-4 sm:p-10 min-h-screen">
        <div className="w-full max-w-6xl flex flex-col h-[88vh] rounded-3xl shadow-2xl backdrop-blur-xl bg-black/40 border border-purple-500/20 relative overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 py-2 border-b border-purple-500/20 bg-gradient-to-r from-purple-900/20 to-indigo-900/20">
            <div className="flex items-center gap-4">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            </div>

            {/* Title */}
            <div className="flex items-center gap-3">
              <FileText size={20} className="text-purple-300" />
              <span className="text-lg font-medium text-purple-200">
                Research Draft
              </span>
            </div>

            {/* Voice Status */}
            {isCallActive && (
              <div className="flex items-center gap-2 bg-green-500/20 px-3 py-2 rounded-xl border border-green-500/30">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-200">Voice Active</span>
              </div>
            )}
          </div>

          {/* Chat Messages */}
          <div
            className="flex-1 overflow-y-auto px-6 py-4 space-y-6 scrollbar-thin scrollbar-thumb-purple-500/30 scrollbar-track-transparent"
            ref={chatContainerRef}
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex w-full ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl shadow-xl backdrop-blur-sm border transition-all duration-300 hover:shadow-2xl ${
                    msg.sender === "user"
                      ? "bg-gradient-to-br from-purple-600 to-indigo-600 text-white border-purple-400/30 shadow-purple-500/20"
                      : "bg-gradient-to-br from-gray-900/80 to-black/80 border-gray-600/30 shadow-gray-500/20"
                  }`}
                >
                  {/* Message Header for bot messages */}
                  {msg.sender === "bot" && (
                    <div className="flex items-center gap-2 px-4 pt-3 pb-1">
                      <Bot size={16} className="text-purple-300" />
                      <span className="text-xs font-medium text-purple-300 uppercase tracking-wide">
                        Research Assistant
                      </span>
                    </div>
                  )}

                  <div className="p-4">
                    {msg.language ? (
                      <div className="relative group">
                        <pre
                          className={`language-${msg.language} bg-black/60 rounded-xl p-4 overflow-x-auto text-sm font-mono max-h-96 border border-gray-700/50`}
                        >
                          <code className={`language-${msg.language}`}>
                            {msg.text}
                          </code>
                        </pre>
                        <button
                          className="absolute top-3 right-3 bg-gray-800/80 hover:bg-gray-700/80 text-white text-xs px-3 py-1.5 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100 flex items-center gap-1"
                          onClick={() => handleCopy(msg.text)}
                          title="Copy code"
                        >
                          <Copy size={12} />
                          Copy
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {msg.text}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {(isVoiceLoading || isDraftLoading) && (
              <div className="flex justify-start">
                <div className="bg-gradient-to-br from-gray-900/80 to-black/80 border border-gray-600/30 rounded-2xl p-4">
                  <CustomLoading />
                </div>
              </div>
            )}
          </div>

          {/* Control Panel */}
          <div className="p-6 border-t border-purple-500/20 bg-gradient-to-r from-purple-900/10 to-indigo-900/10">
            <div className="flex items-center justify-center gap-6">
              {/* Voice Agent Button */}
              <div className="relative">
                {isCallActive && (
                  <div className="absolute inset-0 rounded-2xl bg-purple-400/50 opacity-75 animate-ping"></div>
                )}
                <button
                  className="relative flex items-center gap-3 px-6 py-4 bg-gradient-to-br from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 border border-purple-500/30 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed group"
                  onClick={handleVoiceAgentChat}
                  disabled={isCallActive || isVoiceLoading}
                >
                  {isVoiceLoading ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                      <span className="text-sm font-medium text-white">
                        Connecting...
                      </span>
                    </>
                  ) : isCallActive ? (
                    <>
                      <Mic size={20} className="text-white animate-pulse" />
                      <span className="text-sm font-medium text-white hidden md:block">
                        Voice Active
                      </span>
                    </>
                  ) : (
                    <>
                      <MicOff
                        size={20}
                        className="text-white group-hover:scale-110 transition-transform"
                      />
                      <span className="text-sm font-medium text-white hidden md:block">
                        Start Voice Chat
                      </span>
                    </>
                  )}
                </button>
              </div>

              {/* Stop Call Button */}
              {isCallActive && (
                <button
                  className="flex items-center gap-3 px-6 py-4 bg-gradient-to-br from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 border border-red-500/30 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl"
                  onClick={handleStopCall}
                >
                  <Phone size={20} className="text-white" />
                  <span className="text-sm font-medium text-white hidden md:block">
                    End Call
                  </span>
                </button>
              )}

              {/* Draft Research Paper Button */}
              <button
                className="flex items-center gap-3 px-6 py-4 bg-gradient-to-br from-emerald-600/20 to-teal-600/20 hover:from-emerald-600/40 hover:to-teal-600/40 border border-emerald-500/30 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm group"
                onClick={handleDraftResearchPaper}
                disabled={isDraftLoading}
              >
                {isDraftLoading ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full" />
                    <span className="text-sm font-medium text-emerald-200">
                      Generating...
                    </span>
                  </>
                ) : (
                  <>
                    <FileText
                      size={20}
                      className="text-emerald-300 group-hover:scale-110 transition-transform"
                    />
                    <span className="text-sm font-medium text-emerald-200 hidden md:block">
                      Draft Research Paper
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* Custom scrollbar styles */
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(147, 51, 234, 0.3);
          border-radius: 3px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(147, 51, 234, 0.5);
        }

        /* Glassmorphism effects */
        .backdrop-blur-xl {
          backdrop-filter: blur(24px);
        }

        /* Glow effects */
        .shadow-purple-500\/20 {
          box-shadow: 0 25px 50px -12px rgba(147, 51, 234, 0.2);
        }
        .shadow-gray-500\/20 {
          box-shadow: 0 25px 50px -12px rgba(107, 114, 128, 0.2);
        }

        /* Animation for ping effect */
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
  );
};

export default DraftPage;
