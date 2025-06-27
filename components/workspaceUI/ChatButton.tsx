"use client";

import React from "react";
import styled from "styled-components";

interface ChatButtonProps {
  text: string;
  onClick: () => void;
  disabled?: boolean;
}

const ChatButton: React.FC<ChatButtonProps> = ({ text, onClick, disabled }) => {
  return (
    <StyledWrapper>
      <button className="frutiger-button" onClick={onClick} disabled={disabled}>
        <div className="inner">
          <div className="top-white" />
          <span className="text">{text}</span>
        </div>
      </button>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .frutiger-button {
    cursor: pointer;
    position: relative;
    padding: 2px;
    border-radius: 6px;
    border: 0;
    text-shadow: 1px 1px #000a;
    background: linear-gradient(#6b21a8, #c084fc);
    box-shadow: 0px 4px 6px 0px #0008;
    transition: 0.3s all;
    width: 50px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .frutiger-button:hover {
    box-shadow: 0px 6px 12px 0px #0009;
  }

  .frutiger-button:active {
    box-shadow: 0px 0px 0px 0px #0000;
  }

  .frutiger-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .inner {
    position: relative;
    inset: 0px;
    padding: 0.5em;
    border-radius: 4px;
    background: radial-gradient(circle at 50% 100%, #d8b4fe 10%, #d8b4fe00 55%),
      linear-gradient(#4c1d95, #a855f7);
    overflow: hidden;
    transition: inherit;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .inner::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(-65deg, #0000 40%, #fff7 50%, #0000 70%);
    background-size: 200% 100%;
    background-repeat: no-repeat;
    animation: thing 3s ease infinite;
  }

  @keyframes thing {
    0% {
      background-position: 130%;
      opacity: 1;
    }

    to {
      background-position: -166%;
      opacity: 0;
    }
  }

  .top-white {
    position: absolute;
    border-radius: inherit;
    inset: 0 -8em;
    background: radial-gradient(
      circle at 50% -270%,
      #fff 45%,
      #fff6 60%,
      #fff0 60%
    );
    transition: inherit;
  }

  .inner::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    transition: inherit;
    box-shadow: inset 0px 2px 8px -2px #0000;
  }

  .frutiger-button:active .inner::after {
    box-shadow: inset 0px 2px 8px -2px #000a;
  }

  .text {
    position: relative;
    z-index: 1;
    color: white;
    font-weight: 550;
    font-size: 14px;
    transition: inherit;
  }
`;

export default ChatButton;
