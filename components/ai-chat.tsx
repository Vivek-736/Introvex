"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  Lightbulb,
  FileText,
  Edit3,
  Zap,
  Paperclip,
  Smile,
  Sparkles,
  LucideIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Interface for Message
interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
  citations?: string[];
  isLoading?: boolean;
  error?: string;
}

// Interface for QuickAction
interface QuickAction {
  icon: LucideIcon;
  label: string;
  action: string;
}

// Interface for AiChat Props
interface AiChatProps {
  currentDocument: string | null;
}

// Interface for API Response
interface AIResponse {
  content: string;
  citations?: string[];
}

export function AiChat({ currentDocument }: AiChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "ai",
      content:
        "Hello! I'm your Difras AI research assistant. I can analyze documents, generate LaTeX drafts, or answer questions. Select a document to start!",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [inputValue]);

  // Debug input changes
  useEffect(() => {
    console.log("Input value:", inputValue);
    console.log("Current document:", currentDocument);
    console.log("Is typing:", isTyping);
  }, [inputValue, currentDocument, isTyping]);

  // Handle sending messages
  const handleSendMessage = async () => {
    if (!inputValue.trim()) {
      console.warn("Input is empty");
      return;
    }
    if (!currentDocument) {
      console.warn("No document selected");
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          type: "ai",
          content: "Please select a document to enable AI assistance.",
          timestamp: new Date(),
        },
      ]);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    const tempAiMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: "ai",
      content: "",
      timestamp: new Date(),
      isLoading: true,
    };

    setMessages((prev) => [...prev, userMessage, tempAiMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      const aiResponse = await getAIResponse(inputValue, currentDocument);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempAiMessage.id
            ? {
                ...msg,
                content: aiResponse.content,
                citations: aiResponse.citations,
                isLoading: false,
              }
            : msg
        )
      );
    } catch (error) {
      console.error("AI response error:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempAiMessage.id
            ? {
                ...msg,
                content:
                  "Sorry, I couldn't process your request. Please try again.",
                error: error instanceof Error ? error.message : "Unknown error",
                isLoading: false,
              }
            : msg
        )
      );
    } finally {
      setIsTyping(false);
    }
  };

  // Mock API response
  const getAIResponse = async (
    input: string,
    document: string | null
  ): Promise<AIResponse> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          content: `Response to "${input}" for document "${document}". Example: I can generate a LaTeX section or summarize key points.`,
          citations: document
            ? ["Page 1, Section 2.1", "Page 3, Abstract"]
            : [],
        });
      }, 1000);
    });
  };

  // Quick actions
  const quickActions: QuickAction[] = [
    {
      icon: FileText,
      label: "Summarize Document",
      action: "Can you provide a summary of this document?",
    },
    {
      icon: Edit3,
      label: "Suggest Edits",
      action: "What improvements can you suggest for this document?",
    },
    {
      icon: Lightbulb,
      label: "Key Insights",
      action: "What are the key insights from this research?",
    },
    {
      icon: Zap,
      label: "Generate Conclusion",
      action: "Can you help me write a conclusion for this paper?",
    },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <motion.div
        className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 dark:border-gray-700"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <motion.div
            className="bg-gray-900 dark:bg-white rounded-full p-1"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "loop",
            }}
          >
            <Bot className="h-4 w-4 text-white dark:text-gray-900" />
          </motion.div>
          <h2 className="font-semibold text-gray-900 dark:text-white">
            Difras AI Research Assistant
          </h2>
        </div>
        {currentDocument && (
          <motion.div
            className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 p-2 rounded flex items-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <FileText className="h-3 w-3 mr-1" />
            Analyzing:{" "}
            {currentDocument === "paper1"
              ? "Neural Networks in AI.pdf"
              : currentDocument === "paper2"
              ? "Machine Learning Basics.pdf"
              : "Chapter 1 - Introduction.doc"}
          </motion.div>
        )}
      </motion.div>

      {/* Quick Actions */}
      {currentDocument && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
            QUICK ACTIONS
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
            {quickActions.map((action, index) => (
              <motion.button
                key={index}
                className="flex items-center gap-2 p-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"
                onClick={() => {
                  setInputValue(action.action);
                  textareaRef.current?.focus();
                }}
                whileHover={{
                  backgroundColor: "rgba(0,0,0,0.05)",
                  y: -2,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 + index * 0.1 }}
                aria-label={action.label}
              >
                <action.icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                <span className="text-xs">{action.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white dark:bg-gray-900">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              className={`flex gap-3 ${
                message.type === "user" ? "justify-end" : "justify-start"
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {message.type === "ai" && (
                <div className="w-8 h-8 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-white dark:text-gray-900" />
                </div>
              )}
              <div
                className={`max-w-[80%] ${
                  message.type === "user" ? "order-first" : ""
                }`}
              >
                <motion.div
                  className={`p-3 rounded-lg ${
                    message.type === "user"
                      ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                      : message.error
                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      : "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                  }`}
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                >
                  {message.isLoading ? (
                    <div className="flex gap-1 h-6 items-center">
                      <motion.div
                        className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full"
                        animate={{ y: [0, -5, 0] }}
                        transition={{
                          duration: 0.6,
                          repeat: Number.POSITIVE_INFINITY,
                          repeatType: "loop",
                        }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full"
                        animate={{ y: [0, -5, 0] }}
                        transition={{
                          duration: 0.6,
                          delay: 0.1,
                          repeat: Number.POSITIVE_INFINITY,
                          repeatType: "loop",
                        }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full"
                        animate={{ y: [0, -5, 0] }}
                        transition={{
                          duration: 0.6,
                          delay: 0.2,
                          repeat: Number.POSITIVE_INFINITY,
                          repeatType: "loop",
                        }}
                      />
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  )}
                  {message.error && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                      {message.error}
                    </p>
                  )}
                  {message.citations && !message.isLoading && (
                    <motion.div
                      className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Citations:
                      </p>
                      {message.citations.map((citation, index) => (
                        <motion.button
                          key={index}
                          className="block text-xs text-blue-600 dark:text-blue-400 hover:underline"
                          whileHover={{ x: 2 }}
                          transition={{ duration: 0.2 }}
                          aria-label={`View citation ${citation}`}
                        >
                          {citation}
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </motion.div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              {message.type === "user" && (
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <motion.div
        className="p-4 border-t border-gray-200 bg-gradient-to-r from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 dark:border-gray-700"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                setInputValue(e.target.value);
                console.log("Textarea input:", e.target.value);
              }}
              onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  console.log("Enter pressed, sending message");
                  handleSendMessage();
                }
              }}
              placeholder={
                currentDocument
                  ? "Ask about this document or request a LaTeX draft..."
                  : "Select a document to start chatting..."
              }
              className="w-full px-4 py-3 pr-12 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-gray-900 dark:focus:border-white focus:ring-1 focus:ring-gray-900 dark:focus:ring-white resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              disabled={isTyping}
              rows={1}
              style={{ minHeight: "44px", maxHeight: "120px" }}
              aria-label="Chat input for Difras AI assistant"
            />
            <div className="absolute bottom-2 right-2 flex gap-1">
              <motion.button
                className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Attach file"
              >
                <Paperclip className="h-4 w-4" />
              </motion.button>
              <motion.button
                className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Insert emoji"
              >
                <Smile className="h-4 w-4" />
              </motion.button>
            </div>
          </div>
          <motion.button
            onClick={() => {
              console.log("Send button clicked");
              handleSendMessage();
            }}
            disabled={!inputValue.trim() || isTyping}
            className="p-3 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Send message to Difras AI"
          >
            <Send className="h-4 w-4" />
          </motion.button>
        </div>
        {currentDocument && (
          <motion.div
            className="mt-2 flex justify-between items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <Sparkles className="h-3 w-3" />
              <span>AI-powered by Difras</span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Shift + Enter for new line
            </div>
          </motion.div>
        )}
      </motion.div> 
    </div>
  );
}
