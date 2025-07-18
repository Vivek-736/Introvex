"use client";

import React from "react";
import styled from "styled-components";

const ChatHeader = () => {
  return (
    <StyledWrapper>
      <div className="light-button">
        <button className="bt">
          <div className="light-holder">
            <div className="dot" />
            <div className="light" />
          </div>
          <div className="button-holder">
            <span className="glow-text">
              Introvex
            </span>
          </div>
        </button>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .light-button button.bt .button-holder {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.25rem 2.5rem;
    border-radius: 0.5rem;
    transition: 300ms ease;
    z-index: 1;
    position: relative;
    outline-offset: 2px;
  }

  .light-button button.bt .glow-text {
    font-size: 2.75rem;
    font-family: "Instrument Serif", serif;
    font-weight: 400;
    white-space: nowrap;
    color: white;
    text-shadow:
      0 0 10px rgba(88, 101, 242, 0.8),
      0 0 20px rgba(88, 101, 242, 0.6),
      0 0 40px rgba(88, 101, 242, 0.5);
    z-index: 2;
    position: relative;
  }

  .light-button button.bt .glow-text i {
    font-style: italic;
  }
`;

export default ChatHeader;
