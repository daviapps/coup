import styled, { keyframes } from "styled-components";

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-8px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

export const Wrapper = styled.div`
  grid-area: chat;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const Title = styled.h3`
  margin-bottom: 0.5rem;
`;

export const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-bottom: 0.5rem;
`;

// Log entries (game events)
export const LogEntry = styled.div`
  font-size: 13px;
  padding: 2px 0;
  color: var(--colors-comment);
  font-style: italic;
  animation: ${slideIn} 0.25s ease-out;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
`;

// Chat entries (player messages)
export const ChatEntry = styled.div`
  font-size: 14px;
  padding: 3px 0;
  color: var(--colors-foreground);
  animation: ${slideIn} 0.25s ease-out;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
`;

export const ChatSender = styled.span`
  font-weight: bold;
  color: var(--colors-green);
  margin-right: 4px;
`;

// Whisper entries (private messages)
export const WhisperEntry = styled.div`
  font-size: 13px;
  padding: 3px 0;
  color: var(--colors-purple);
  font-style: italic;
  animation: ${slideIn} 0.25s ease-out;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
`;

export const WhisperTag = styled.span`
  font-size: 11px;
  color: var(--colors-pink);
  margin-right: 4px;
`;

export const WhisperSender = styled.span`
  font-weight: bold;
  color: var(--colors-pink);
  margin-right: 4px;
`;

// Input area
export const InputArea = styled.div`
  display: flex;
  gap: 4px;
  padding-top: 0.5rem;
  border-top: 1px solid var(--colors-current-line);
`;

export const TargetSelect = styled.select`
  background: var(--colors-current-line);
  color: var(--colors-foreground);
  border: 1px solid var(--colors-comment);
  border-radius: 4px;
  padding: 4px;
  font-size: 11px;
  max-width: 110px;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: var(--colors-primary);
  }

  option {
    background: var(--colors-background);
    color: var(--colors-foreground);
  }
`;

export const MessageInput = styled.input`
  flex: 1;
  background: var(--colors-current-line);
  color: var(--colors-foreground);
  border: 1px solid var(--colors-comment);
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 13px;
  min-width: 0;

  &:focus {
    outline: none;
    border-color: var(--colors-primary);
  }
`;

export const SendButton = styled.button`
  background: var(--colors-primary);
  color: var(--colors-background);
  border: none;
  border-radius: 4px;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: bold;
  cursor: pointer;
  text-transform: uppercase;
  white-space: nowrap;

  &:hover {
    filter: brightness(110%);
  }

  &:active {
    filter: brightness(90%);
  }
`;
