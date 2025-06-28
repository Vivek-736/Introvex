"use client";

import React, { useState } from "react";
import styled from "styled-components";
import { supabase } from "@/services/SupabaseClient";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

const Chat = () => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useUser();

  const handleSend = async () => {
    if (input.trim() === "") return;
    setLoading(true);
    const chatId = uuidv4();
    const userEmail = user?.emailAddresses[0]?.emailAddress;

    try {
      const geminiResponse = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, chatId }),
      });

      const data = await geminiResponse.json();

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

      const messageString = [`User: ${input}`, botResponse].join(",,,,");
      const { data: insertedData, error } = await supabase
        .from("Data")
        .insert({
          created_at: new Date().toISOString(),
          userEmail,
          title: input,
          message: messageString,
          chatId,
        })
        .select();

      if (error) throw error;

      console.log("Inserted chat data:", insertedData);
      router.push(`/workspace/chat/${chatId}`);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error sending message:", error.message);
      } else {
        console.error("Error sending message:", error);
      }
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  return (
    <StyledWrapper>
      <div className="container_chat_bot">
        <div className="container-chat-options">
          <div className="chat">
            <div className="chat-bot">
              <textarea
                id="chat_bot"
                name="chat_bot"
                placeholder="Imagine Something...✦˚"
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
            </div>
            <div className="options">
              <div className="btns-add">
              </div>
              <button
                className="btn-submit"
                onClick={handleSend}
                disabled={loading}
                title="Send message"
              >
                {loading ? (
                  <span className="loading-text">Loading...</span>
                ) : (
                  <i>
                    <svg viewBox="0 0 512 512">
                      <path
                        fill="currentColor"
                        d="M473 39.05a24 24 0 0 0-25.5-5.46L47.47 185h-.08a24 24 0 0 0 1 45.16l.41.13l137.3 58.63a16 16 0 0 0 15.54-3.59L422 80a7.07 7.07 0 0 1 10 10L226.66 310.26a16 16 0 0 0-3.59 15.54l58.65 137.38c.06.2.12.38.19.57c3.2 9.27 11.3 15.81 21.09 16.25h1a24.63 24.63 0 0 0 23-15.46L478.39 64.62A24 24 0 0 0 473 39.05"
                      />
                    </svg>
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
      color: #f3f6fd;
      filter: drop-shadow(0 0 5px #ffffff);
    }
    &:focus svg {
      color: #f3f6fd;
      filter: drop-shadow(0 0 5px #ffffff);
      transform: scale(1.2) rotate(45deg) translateX(-2px) translateY(1px);
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
      font-size: 14px;
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
        border-color: #f3f6fd;
      }
    }
  }
`;

export default Chat;
