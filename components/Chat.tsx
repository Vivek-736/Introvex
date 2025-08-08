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
import ActionTooltip from "@/components/action-tooltip";

const Chat = () => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [searchMode, setSearchMode] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
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

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    const pdfFiles = droppedFiles.filter(file => file.type === "application/pdf");
    
    if (pdfFiles.length !== droppedFiles.length) {
      toast.error("Only PDF files are allowed");
    }
    
    if (pdfFiles.length > 0) {
      setFiles(prev => [...prev, ...pdfFiles]);
      toast.success(`${pdfFiles.length} PDF file(s) added`);
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

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    toast.success("File removed");
  };

  return (
    <StyledWrapper>
      <div className="container_chat_bot">
        <div
          className={`container-chat-options ${
            searchMode ? "search-mode" : ""
          } ${isDragOver ? "drag-over" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
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
                      <button
                        className="remove-file"
                        onClick={() => removeFile(index)}
                        title="Remove file"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {isDragOver && (
                <div className="drag-overlay">
                  <div className="drag-content">
                    <Upload size={48} />
                    <p>Drop PDF files here</p>
                  </div>
                </div>
              )}
            </div>
            <div className="options">
              <div className="mode-selector">
                <ActionTooltip label="AI Chat">
                  <button
                    className={`mode-btn ${!searchMode ? "active" : ""}`}
                    onClick={() => setSearchMode(false)}
                    disabled={loading}
                  >
                    <Sparkles size={20} />
                  </button>
                </ActionTooltip>
                <ActionTooltip label="Web Search">
                  <button
                    className={`mode-btn ${searchMode ? "active" : ""}`}
                    onClick={() => setSearchMode(true)}
                    disabled={loading}
                  >
                    <Search size={20} />
                  </button>
                </ActionTooltip>
              </div>
              
              <div className="right-controls">
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
                      <ActionTooltip label="Upload PDFs">
                        <button
                          className="btn-upload"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={loading}
                        >
                          <Upload size={24} />
                        </button>
                      </ActionTooltip>
                    </>
                  )}
                </div>
                <ActionTooltip label={searchMode ? "Search web" : "Send message"}>
                  <button
                    className="btn-submit"
                    onClick={handleSend}
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="loading-text">Processing...</span>
                    ) : (
                      <i>
                        {searchMode ? <Search size={24} /> : <Send size={24} />}
                      </i>
                    )}
                  </button>
                </ActionTooltip>
              </div>
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

    &.drag-over {
      background: linear-gradient(
        to bottom right,
        #10b981,
        #363636,
        #363636,
        #363636,
        #10b981
      );
      box-shadow: 0 0 30px rgba(16, 185, 129, 0.3);
    }
  }

  .chat {
    display: flex;
    flex-direction: column;
    background-color: rgba(0, 0, 0, 0.5);
    border-radius: 18px;
    width: 100%;
    overflow: hidden;
    position: relative;
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
    position: relative;

    .remove-file {
      background: none;
      border: none;
      color: #a855f7;
      cursor: pointer;
      font-size: 16px;
      line-height: 1;
      margin-left: 4px;
      padding: 0;
      
      &:hover {
        color: #ef4444;
      }
    }
  }

  .drag-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(16, 185, 129, 0.1);
    border: 2px dashed #10b981;
    border-radius: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;

    .drag-content {
      text-align: center;
      color: #10b981;
      
      p {
        margin: 8px 0 0 0;
        font-size: 16px;
        font-weight: 500;
      }
    }
  }

  .options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 14px;
    background-color: rgba(0, 0, 0, 0.5);
    border-radius: 0 0 18px 18px;
  }

  .mode-selector {
    display: flex;
    gap: 8px;
  }

  .mode-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: rgba(0, 0, 0, 0.3);
    border: 2px solid #363636;
    border-radius: 12px;
    color: #ffffff;
    cursor: pointer;
    transition: all 0.3s ease;

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

  .right-controls {
    display: flex;
    align-items: center;
    gap: 10px;
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
