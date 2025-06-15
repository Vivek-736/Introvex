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
              Effortless <i>Research</i> with Difras.
            </span>
          </div>
        </button>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .light-button button.bt {
    position: relative;
    height: 200px;
    display: flex;
    align-items: flex-end;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
  }

  .light-button button.bt .button-holder {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: black;
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
    color: rgba(120, 140, 255, 1);
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

  .light-button button.bt .light-holder {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    height: 220px;
    width: 100%;
    display: flex;
    justify-content: center;
    pointer-events: none;
    z-index: 0;
  }

  .light-button button.bt .light-holder .dot {
    position: absolute;
    top: 0;
    width: 10px;
    height: 10px;
    background-color: black;
    border-radius: 50%;
    z-index: 2;
  }

  .light-button button.bt .light-holder .light {
    position: absolute;
    top: 0;
    width: 800px;
    height: 300px;
    clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
    background: radial-gradient(
      circle at 50% 0%,
      rgba(88, 101, 242, 0.8) 0%,
      rgba(88, 101, 242, 0.2) 50%,
      rgba(255, 255, 255, 0) 100%
    );
    filter: blur(15px);
    opacity: 1;
  }
`;

export default ChatHeader;
