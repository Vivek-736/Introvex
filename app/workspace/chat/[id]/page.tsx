"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Prism from "prismjs";
import { supabase } from "@/services/SupabaseClient";
import CustomLoading from "@/components/CustomLoading";
import { toast } from "sonner";
import ChatButton from "@/components/workspaceUI/ChatButton";
import { useUser } from "@clerk/nextjs";
import {
  Import,
  CheckCircle,
  AlertCircle,
  Search,
  Upload,
  Sparkles,
  Globe,
  FileText,
  Copy,
} from "lucide-react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/configs/firebaseConfigs";

const ChatIdPage = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const chatIdFromParams = params.id;
  const chatIdFromQuery = searchParams.get("chatId");
  const chatId = chatIdFromParams || chatIdFromQuery;

  type Message = {
    sender: string;
    text: string;
    language?: string;
    isSearch?: boolean;
  };
  const [messages, setMessages] = useState<Message[]>([]);
  const [pdfUrls, setPdfUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [searchMode, setSearchMode] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [pdfProcessingStatus, setPdfProcessingStatus] = useState<
    "idle" | "processing" | "success" | "error"
  >("idle");
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useUser();
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
          .select("message, pdfUrl")
          .eq("chatId", chatId)
          .eq("userEmail", userEmail)
          .maybeSingle();

        if (error) {
          console.error("Error fetching chat:", error.message);
          toast.error("Failed to load chat history");
          setIsLoading(false);
          return;
        }

        if (data) {
          if (data.pdfUrl) {
            const urls = data.pdfUrl
              .split(",")
              .filter((url: any) => url.trim());
            setPdfUrls(urls);
            if (urls.length > 0) {
              setPdfProcessingStatus("success");
            }
          }

          if (data.message) {
            const messageString = data.message;
            const allMessages = messageString.split(",,,,");
            const processedMessages: Message[] = [];

            for (let i = 0; i < allMessages.length; i += 2) {
              const userText =
                allMessages[i]?.trim().replace(/^User: /, "") || "";
              const botText =
                allMessages[i + 1]?.trim().replace(/^Assistant: /, "") || "";

              if (userText) {
                processedMessages.push({ sender: "user", text: userText });
              }

              if (botText) {
                const isSearch = botText.includes("🔍 **Web Search Results**");
                const cleanedBotText = botText.replace(
                  "🔍 **Web Search Results**\n\n",
                  ""
                );

                const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
                let lastIndex = 0;
                let match;

                while ((match = codeBlockRegex.exec(cleanedBotText))) {
                  const [fullMatch, language, code] = match;
                  const beforeText = cleanedBotText
                    .slice(lastIndex, match.index)
                    .trim();
                  if (beforeText) {
                    processedMessages.push({
                      sender: "bot",
                      text: cleanText(beforeText),
                      isSearch,
                    });
                  }
                  processedMessages.push({
                    sender: "bot",
                    text: code.trim(),
                    language: language || "plaintext",
                    isSearch,
                  });
                  lastIndex = match.index + fullMatch.length;
                }

                const remainingText = cleanedBotText.slice(lastIndex).trim();
                if (remainingText) {
                  processedMessages.push({
                    sender: "bot",
                    text: cleanText(remainingText),
                    isSearch,
                  });
                }
              }
            }
            setMessages(processedMessages);
          }
        }
      } catch (error) {
        console.error("Error in useEffect:", error);
        toast.error("Failed to load chat data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatData();
  }, [chatId, userEmail]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    Prism.highlightAll();
  }, [messages]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(selectedFiles);
      toast.success(`${selectedFiles.length} file(s) selected`);
    }
  };

  const uploadFiles = async (files: File[]) => {
    if (!user) {
      toast.error("User not authenticated");
      return [];
    }

    const pdfUrls: string[] = [];

    try {
      for (const file of files) {
        if (file.type !== "application/pdf") {
          toast.error(`${file.name} is not a PDF file`);
          continue;
        }
        const storageRef = ref(storage, `pdfs/${chatId}/${file.name}`);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        pdfUrls.push(downloadURL);
      }
      return pdfUrls;
    } catch (error) {
      console.error("Error uploading files:", error);
      throw error;
    }
  };

  const handleSend = async () => {
    if (input.trim() === "" && files.length === 0) return;

    setSending(true);
    const newUserMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, newUserMessage]);

    // Show PDF processing status if PDFs are involved
    if (pdfUrls.length > 0 || files.length > 0) {
      setPdfProcessingStatus("processing");
    }

    try {
      const { data: currentData, error: fetchError } = await supabase
        .from("Data")
        .select("message, pdfUrl")
        .eq("chatId", chatId)
        .maybeSingle();

      if (fetchError) {
        console.error("Fetch error:", fetchError.message);
        throw new Error(fetchError.message);
      }

      const currentMessage = currentData?.message || "";
      let pdfUrlsFromDb = currentData?.pdfUrl
        ? currentData.pdfUrl.split(",").filter((url: any) => url.trim())
        : [];

      // Upload new files if any
      let newPdfUrls: string[] = [];
      if (files.length > 0) {
        newPdfUrls = await uploadFiles(files);
        if (newPdfUrls.length > 0) {
          toast.success(`${newPdfUrls.length} PDF(s) uploaded!`);
        }
      }

      const allPdfUrls = [...pdfUrls, ...pdfUrlsFromDb, ...newPdfUrls];
      const uniquePdfUrls = Array.from(new Set(allPdfUrls));

      // Choose API endpoint based on search mode
      const apiEndpoint = searchMode ? "/api/search" : "/api/gemini";
      const requestBody = searchMode
        ? { message: input, chatId }
        : { message: input, chatId, pdfUrls: uniquePdfUrls };

      console.log(`Sending request to ${apiEndpoint}...`);
      if (!searchMode && uniquePdfUrls.length > 0) {
        console.log(
          "PDF URLs being sent:",
          uniquePdfUrls.length,
          uniquePdfUrls
        );
      }

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("API Error:", data);
        throw new Error(`API error: ${data.error || "Unknown error"}`);
      }

      const botResponse = data.response;
      if (!botResponse || typeof botResponse !== "string") {
        throw new Error("Invalid bot response from API");
      }

      // Update PDF processing status
      if (uniquePdfUrls.length > 0 && !searchMode) {
        setPdfProcessingStatus("success");
        setPdfUrls(uniquePdfUrls);
      }

      // Update database
      const updatedMessage = [
        ...(currentMessage ? currentMessage.split(",,,,") : []),
        `User: ${input}`,
        `Assistant: ${botResponse}`,
      ].join(",,,,");

      const updateData: any = {
        message: updatedMessage,
        created_at: new Date().toISOString(),
      };

      if (uniquePdfUrls.length > 0 && !searchMode) {
        updateData.pdfUrl = uniquePdfUrls.join(",");
      }

      const { error } = await supabase
        .from("Data")
        .update(updateData)
        .eq("chatId", chatId);

      if (error) {
        console.error("Update error:", error.message);
        throw error;
      }

      // Process bot response for display
      const isSearch = botResponse.includes("🔍 **Web Search Results**");
      const cleanedBotResponse = botResponse.replace(
        "🔍 **Web Search Results**\n\n",
        ""
      );

      const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
      let lastIndex = 0;
      const processedMessages: {
        sender: string;
        text: string;
        language?: string;
        isSearch?: boolean;
      }[] = [];
      let match;

      while ((match = codeBlockRegex.exec(cleanedBotResponse))) {
        const [fullMatch, language, code] = match;
        const beforeText = cleanedBotResponse
          .slice(lastIndex, match.index)
          .trim();
        if (beforeText) {
          processedMessages.push({
            sender: "bot",
            text: cleanText(beforeText),
            isSearch,
          });
        }
        processedMessages.push({
          sender: "bot",
          text: code.trim(),
          language: language || "plaintext",
          isSearch,
        });
        lastIndex = match.index + fullMatch.length;
      }

      const remainingText = cleanedBotResponse.slice(lastIndex).trim();
      if (remainingText) {
        processedMessages.push({
          sender: "bot",
          text: cleanText(remainingText),
          isSearch,
        });
      }

      setMessages((prev) => [...prev, ...processedMessages]);
      setTimeout(() => Prism.highlightAll(), 0);
    } catch (error) {
      console.error("Error sending message:", error);
      setPdfProcessingStatus("error");
      toast.error("Failed to send message. Please try again.");
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Sorry, I encountered an error while processing your request. Please try again.",
        },
      ]);
    } finally {
      setSending(false);
      setInput("");
      setFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const cleanText = (text: string) => {
    return text.replace(/\*{1,2}([^*]+)\*{1,2}/g, "'$1'");
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard!");
  };

  const handleDraftRedirect = () => {
    router.push(`/workspace/chat/${chatId}/draft`);
  };

  const getPdfStatusIcon = () => {
    switch (pdfProcessingStatus) {
      case "processing":
        return (
          <div className="animate-spin w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full" />
        );
      case "success":
        return <CheckCircle size={16} className="text-green-400" />;
      case "error":
        return <AlertCircle size={16} className="text-red-400" />;
      default:
        return <FileText size={16} />;
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

            {/* Mode Toggle */}
            <div className="flex items-center gap-3 bg-black/30 p-2 rounded-2xl border border-purple-500/30">
              <button
                onClick={() => setSearchMode(false)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                  !searchMode
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg"
                    : "hover:bg-white/10"
                }`}
                disabled={sending}
              >
                <Sparkles size={16} />
                <span className="text-sm font-medium md:block hidden">AI Chat</span>
              </button>
              <button
                onClick={() => setSearchMode(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                  searchMode
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg"
                    : "hover:bg-white/10"
                }`}
                disabled={sending}
              >
                <Globe size={16} />
                <span className="text-sm font-medium md:block hidden">Web Search</span>
              </button>
            </div>

            {/* PDF Status */}
            {pdfUrls.length > 0 && (
              <div className="flex items-center gap-2 bg-purple-500/20 px-3 py-2 rounded-xl border border-purple-500/30">
                {getPdfStatusIcon()}
                <span className="text-sm text-purple-200">
                  {pdfUrls.length} PDF(s)
                </span>
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
                      : msg.isSearch
                      ? "bg-gradient-to-br from-indigo-900/60 to-purple-900/60 border-indigo-400/30 shadow-indigo-500/20"
                      : "bg-gradient-to-br from-gray-900/80 to-black/80 border-gray-600/30 shadow-gray-500/20"
                  }`}
                >
                  {/* Message Header for bot messages */}
                  {msg.sender === "bot" && (
                    <div className="flex items-center gap-2 px-4 pt-3 pb-1">
                      {msg.isSearch ? (
                        <>
                          <Search size={16} className="text-indigo-300" />
                          <span className="text-xs font-medium text-indigo-300 uppercase tracking-wide">
                            Web Search Results
                          </span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={16} className="text-purple-300" />
                          <span className="text-xs font-medium text-purple-300 uppercase tracking-wide">
                            AI Assistant
                          </span>
                        </>
                      )}
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
            {sending && (
              <div className="flex justify-start">
                <div className="bg-gradient-to-br from-gray-900/80 to-black/80 border border-gray-600/30 rounded-2xl p-4">
                  <CustomLoading />
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-6 border-t border-purple-500/20 bg-gradient-to-r from-purple-900/10 to-indigo-900/10">
            {/* File Upload Area */}
            {!searchMode && files.length > 0 && (
              <div className="mb-4 p-3 bg-purple-500/10 rounded-xl border border-purple-500/30">
                <div className="flex flex-wrap gap-2">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-purple-600/20 px-3 py-1 rounded-lg text-sm"
                    >
                      <FileText size={14} className="text-purple-300" />
                      <span className="text-purple-200">{file.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-end gap-4 bg-black/40 backdrop-blur-sm rounded-2xl border border-purple-500/30 p-4 shadow-xl">
              <input
                type="file"
                accept="application/pdf"
                multiple
                style={{ display: "none" }}
                onChange={handleFileChange}
                ref={fileInputRef}
                disabled={sending || searchMode}
              />

              <div className="flex-1">
                <textarea
                  placeholder={
                    searchMode
                      ? "Search the web for information...🔍"
                      : files.length > 0
                      ? `Ask questions about your ${files.length} uploaded file(s)...✦`
                      : "Type your message...✦"
                  }
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  disabled={sending}
                  className="w-full h-20 resize-none bg-transparent border-none text-white placeholder:text-purple-300/70 focus:outline-none text-sm leading-relaxed scrollbar-thin scrollbar-thumb-purple-500/30 scrollbar-track-transparent"
                />
              </div>

              <div className="flex items-center gap-3">
                {!searchMode && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={sending}
                    className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-600/20 to-indigo-600/20 hover:from-purple-600/40 hover:to-indigo-600/40 border border-purple-500/30 rounded-xl transition-all duration-200 disabled:opacity-50 group"
                    title="Upload PDFs"
                  >
                    <Upload
                      size={18}
                      className="text-purple-300 group-hover:text-purple-200"
                    />
                  </button>
                )}

                <button
                  onClick={handleDraftRedirect}
                  className="flex items-center gap-2 px-4 py-3 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 hover:from-indigo-600/40 hover:to-purple-600/40 border border-indigo-500/30 rounded-xl transition-all duration-200 group"
                  title="Import chat to draft"
                >
                  <Import
                    size={16}
                    className="text-indigo-300 group-hover:text-indigo-200"
                  />
                  <span className="text-sm text-indigo-300 group-hover:text-indigo-200 hidden sm:block">
                    Draft
                  </span>
                </button>

                <ChatButton
                  text={sending ? "Sending..." : searchMode ? "Search" : "Send"}
                  onClick={handleSend}
                  disabled={sending || (!input.trim() && files.length === 0)}
                />

              </div>
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

        /* Animation for gradient backgrounds */
        @keyframes gradient-shift {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        /* Glow effects */
        .shadow-purple-500\/20 {
          box-shadow: 0 25px 50px -12px rgba(147, 51, 234, 0.2);
        }
        .shadow-indigo-500\/20 {
          box-shadow: 0 25px 50px -12px rgba(99, 102, 241, 0.2);
        }
        .shadow-gray-500\/20 {
          box-shadow: 0 25px 50px -12px rgba(107, 114, 128, 0.2);
        }
      `}</style>
    </div>
  );
};

export default ChatIdPage;
