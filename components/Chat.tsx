"use client";

import { Mic } from "lucide-react";
import React, { useState } from "react";
import styled from "styled-components";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";

const Chat = () => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSend = async () => {
    if (input.trim() === "") return;
    setLoading(true);
    const conversationId = uuidv4();

    try {
      const response = await axios.post("/api/gemini", { message: input });
      const botResponse = response.data.response;

      router.push(
        `/workspace/${conversationId}?message=${encodeURIComponent(
          input
        )}&response=${encodeURIComponent(botResponse)}`
      );
    } catch (error) {
      console.error("Error sending message:", error);
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
                <button disabled={loading} title="Attach file">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={20}
                    height={20}
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 8v8a5 5 0 1 0 10 0V8m-5-5v3h0"
                    />
                  </svg>
                </button>
                <button disabled={loading} title="Voice input">
                  <Mic className="w-5 h-5" />
                </button>
                <button disabled={loading} title="Settings">
                  <svg
                    viewBox="0 0 24 24"
                    height={20}
                    width={20}
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10s-4.477 10-10 10m-2.29-2.333A17.9 17.9 0 0 1 8.027 13H4.062a8.01 8.01 0 0 0 5.648 6.667M10.03 13c.151 2.439.848 4.73 1.97 6.752A15.9 15.9 0 0 0 13.97 13zm9.908 0h-3.965a17.9 17.9 0 0 1-1.683 6.667A8.01 8.01 0 0 0 19.938 13M4.062 11h3.965A17.9 17.9 0 0 1 9.71 4.333A8.01 8.01 0 0 0 4.062 11m5.969 0h3.938A15.9 15.9 0 0 0 12 4.248A15.9 15.9 0 0 0 10.03 11m4.259-6.667A17.9 17.9 0 0 1 15.973 11h3.965a8.01 8.01 0 0 0-5.648-6.667"
                      fill="currentColor"
                    />
                  </svg>
                </button>
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
          <span>Analyze the chat and draft a research paper</span>
          <span>Write a code to generate a summary</span>
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
