"use client";

import React, { useState } from "react";
import styled from "styled-components";
import { supabase } from "@/services/SupabaseClient";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/configs/firebaseConfigs";
import { Upload, Search, Sparkles, Send } from "lucide-react";

const Chat = () => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [searchMode, setSearchMode] = useState(false);
  const router = useRouter();
  const { user } = useUser();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(selectedFiles);
      toast.success(`${selectedFiles.length} file(s) selected`);
    }
  };

  const uploadFiles = async (
    files: File[]
  ): Promise<{ chatId: string; pdfUrls: string[] }> => {
    if (!user) {
      toast.error("User not authenticated");
      return { chatId: uuidv4(), pdfUrls: [] };
    }

    const chatId = uuidv4();
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
      return { chatId, pdfUrls };
    } catch (error) {
      console.error("Error uploading files:", error);
      toast.error("Error uploading files");
      return { chatId, pdfUrls };
    }
  };

  const handleSend = async () => {
    if (input.trim() === "" && files.length === 0) return;

    setLoading(true);
    const userEmail = user?.emailAddresses[0]?.emailAddress;

    try {
      let chatId = uuidv4();
      let pdfUrls: string[] = [];

      if (files.length > 0) {
        const uploadResult = await uploadFiles(files);
        chatId = uploadResult.chatId;
        pdfUrls = uploadResult.pdfUrls;

        if (pdfUrls.length > 0) {
          toast.success(`${pdfUrls.length} PDF(s) uploaded successfully!`);
        }
      }

      const apiEndpoint = searchMode ? "/api/search" : "/api/gemini";
      const requestBody = searchMode
        ? { message: input, chatId }
        : { message: input, chatId, pdfUrls };

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(`API error: ${data.error || "Unknown error"}`);
      }

      const botResponse = data.response;
      if (!botResponse || typeof botResponse !== "string") {
        throw new Error("Invalid bot response");
      }

      const messageString = [
        `User: ${input}`,
        `Assistant: ${botResponse}`,
      ].join(",,,,");
      const { error } = await supabase
        .from("Data")
        .insert({
          created_at: new Date().toISOString(),
          userEmail,
          title: input || "File Upload",
          message: messageString,
          chatId,
          pdfUrl: pdfUrls.length > 0 ? pdfUrls.join(",") : null,
        })
        .select();

      if (error) throw error;

      if (searchMode) {
        toast.success("Search completed successfully!");
      } else {
        toast.success("Response generated successfully!");
      }

      router.push(`/workspace/chat/${chatId}`);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to process request");
    } finally {
      setLoading(false);
      setInput("");
      setFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <StyledWrapper>
      <div className="container_chat_bot">
        <div className="mode-selector">
          <button
            className={`mode-btn ${!searchMode ? "active" : ""}`}
            onClick={() => setSearchMode(false)}
            disabled={loading}
          >
            <Sparkles size={20} />
            AI Chat
          </button>
          <button
            className={`mode-btn ${searchMode ? "active" : ""}`}
            onClick={() => setSearchMode(true)}
            disabled={loading}
          >
            <Search size={20} />
            Web Search
          </button>
        </div>

        <div
          className={`container-chat-options ${
            searchMode ? "search-mode" : ""
          }`}
        >
          <div className="chat">
            <div className="chat-bot">
              <textarea
                id="chat_bot"
                name="chat_bot"
                placeholder={
                  searchMode
                    ? "Search the web for information...🔍"
                    : files.length > 0
                    ? `Ask questions about your ${files.length} uploaded file(s)...✦`
                    : "Imagine Something...✦˚"
                }
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                disabled={loading}
              />
              {files.length > 0 && (
                <div className="file-indicator">
                  {files.map((file, index) => (
                    <div key={index} className="file-tag">
                      📄 {file.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="options">
              <div className="btns-add">
                {!searchMode && (
                  <>
                    <input
                      type="file"
                      accept="application/pdf"
                      multiple
                      style={{ display: "none" }}
                      onChange={handleFileChange}
                      ref={fileInputRef}
                      disabled={loading}
                    />
                    <button
                      className="btn-upload"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={loading}
                      title="Upload PDFs"
                    >
                      <Upload size={24} />
                    </button>
                  </>
                )}
              </div>
              <button
                className="btn-submit"
                onClick={handleSend}
                disabled={loading}
                title={searchMode ? "Search web" : "Send message"}
              >
                {loading ? (
                  <span className="loading-text">Processing...</span>
                ) : (
                  <i>
                    {searchMode ? <Search size={24} /> : <Send size={24} />}
                  </i>
                )}
              </button>
            </div>
          </div>
        </div>
        <div className="tags">
          <span
            onClick={() => {
              const prompt = "Analyze the chat and draft a research paper";
              navigator.clipboard.writeText(prompt);
              toast.success("Prompt copied to clipboard!");
            }}
          >
            Analyze the chat and draft a research paper
          </span>
          <span
            onClick={() => {
              const prompt = "Write a code to generate a summary";
              navigator.clipboard.writeText(prompt);
              toast.success("Prompt copied to clipboard!");
            }}
          >
            Write a code to generate a summary
          </span>
          <span
            onClick={() => {
              const prompt = searchMode
                ? "What are the latest trends in AI technology?"
                : "Explain this concept in simple terms";
              navigator.clipboard.writeText(prompt);
              toast.success("Prompt copied to clipboard!");
            }}
          >
            {searchMode ? "Latest prominent AI trends" : "Explain in simple terms"}
          </span>
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .container_chat_bot {
    display: flex;
    flex-direction: column;
    max-width: 700px;
    width: 100%;
    margin: 0 auto;
    padding: 20px 0;
  }

  .mode-selector {
    display: flex;
    gap: 8px;
    margin-bottom: 20px;
    justify-content: center;
  }

  .mode-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    background: rgba(0, 0, 0, 0.3);
    border: 2px solid #363636;
    border-radius: 16px;
    color: #ffffff;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 14px;
    font-weight: 500;

    &:hover {
      border-color: #7c3aed;
      background: rgba(124, 58, 237, 0.1);
      transform: translateY(-2px);
    }

    &.active {
      background: linear-gradient(135deg, #7c3aed, #a855f7);
      border-color: #7c3aed;
      box-shadow: 0 0 20px rgba(124, 58, 237, 0.3);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }
  }

  .container-chat-options {
    position: relative;
    display: flex;
    background: linear-gradient(
      to bottom right,
      #7e7e7e,
      #363636,
      #363636,
      #363636,
      #363636
    );
    border-radius: 20px;
    padding: 2px;
    overflow: hidden;
    transition: all 0.3s ease;

    &.search-mode {
      background: linear-gradient(
        to bottom right,
        #7c3aed,
        #363636,
        #363636,
        #363636,
        #7c3aed
      );
      box-shadow: 0 0 30px rgba(124, 58, 237, 0.2);
    }
  }

  .chat {
    display: flex;
    flex-direction: column;
    background-color: rgba(0, 0, 0, 0.5);
    border-radius: 18px;
    width: 100%;
    overflow: hidden;
  }

  .chat-bot {
    position: relative;
    display: flex;
    flex-direction: column;
  }

  .chat-bot textarea {
    background-color: transparent;
    border-radius: 18px 18px 0 0;
    border: none;
    width: 100%;
    height: 120px;
    color: #ffffff;
    font-family: sans-serif;
    font-size: 14px;
    font-weight: 400;
    padding: 14px;
    resize: none;
    outline: none;

    &::-webkit-scrollbar {
      width: 10px;
    }
    &::-webkit-scrollbar-thumb {
      background: #888;
      border-radius: 5px;
    }
    &::-webkit-scrollbar-thumb:hover {
      background: #555;
    }

    &::placeholder {
      color: #f3f6fd;
      transition: all 0.3s ease;
    }
    &:focus::placeholder {
      color: #363636;
    }
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  .file-indicator {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 8px 14px 0;
  }

  .file-tag {
    background: rgba(124, 58, 237, 0.2);
    border: 1px solid #7c3aed;
    border-radius: 8px;
    padding: 4px 8px;
    font-size: 12px;
    color: #a855f7;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 14px;
    background-color: rgba(0, 0, 0, 0.5);
    border-radius: 0 0 18px 18px;
  }

  .btns-add {
    display: flex;
    gap: 10px;

    & button {
      display: flex;
      color: rgba(255, 255, 255, 0.3);
      background-color: transparent;
      border: none;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-3px);
        color: #ffffff;
      }
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
      }
    }
  }

  .btn-upload {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    background-image: linear-gradient(to top, #292929, #555555, #292929);
    border-radius: 12px;
    box-shadow: inset 0 6px 2px -4px rgba(255, 255, 255, 0.5);
    cursor: pointer;
    border: none;
    outline: none;
    transition: all 0.15s ease;

    & svg {
      width: 24px;
      height: 24px;
      color: #8b8b8b;
      transition: all 0.3s ease;
    }
    &:hover svg {
      color: #7c3aed;
      filter: drop-shadow(0 0 5px #7c3aed);
    }
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }
  }

  .btn-submit {
    display: flex;
    padding: 4px;
    background-image: linear-gradient(to top, #292929, #555555, #292929);
    border-radius: 12px;
    box-shadow: inset 0 6px 2px -4px rgba(255, 255, 255, 0.5);
    cursor: pointer;
    border: none;
    outline: none;
    transition: all 0.15s ease;

    & i {
      width: 36px;
      height: 36px;
      padding: 6px;
      background: rgba(0, 0, 0, 0.1);
      border-radius: 12px;
      backdrop-filter: blur(3px);
      color: #8b8b8b;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    & svg {
      width: 24px;
      height: 24px;
      transition: all 0.3s ease;
    }
    &:hover svg {
      color: #7c3aed;
      filter: drop-shadow(0 0 5px #7c3aed);
    }
    &:focus svg {
      color: #7c3aed;
      filter: drop-shadow(0 0 5px #7c3aed);
      transform: scale(1.1);
    }
    &:active {
      transform: scale(0.92);
    }
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }
    .loading-text {
      color: #f3f6fd;
      font-size: 12px;
      padding: 0 8px;
    }
  }

  .tags {
    padding: 16px 0;
    display: flex;
    flex-wrap: wrap;
    color: #ffffff;
    font-size: 12px;
    gap: 8px;
    justify-content: center;

    & span {
      padding: 6px 12px;
      background-color: #1b1b1b;
      border: 1.5px solid #363636;
      border-radius: 12px;
      cursor: pointer;
      user-select: none;
      transition: all 0.3s ease;
      &:hover {
        background-color: #363636;
        border-color: #7c3aed;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(124, 58, 237, 0.2);
      }
    }
  }
`;

export default Chat;
