import { media } from "@/styles/media";
import styled, { keyframes } from "styled-components";
import { Wrapper as Chat } from "@/features/classic-coup/components/Chat/styles";

export const Wrapper = styled.div`
  height: 100%;
  position: relative;

  display: grid;
  grid-template-columns: 3fr 1fr;
  grid-template-rows: auto 1fr;

  grid-template-areas:
    "players players"
    "board board"
    "status status";

  ${media.tablet} {
    grid-template-areas:
      "players players"
      "board chat"
      "status status";
  }

  ${Chat} {
    display: none;

    ${media.tablet} {
      display: block;
    }
  }
`;

export const UnreadyOverlay = styled.div``;

const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(100%);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const MobileChatOverlay = styled.div`
  position: absolute;
  bottom: 30px;
  left: 0;
  right: 0;
  max-height: 60%;
  background: var(--colors-background);
  border-top: 2px solid var(--colors-current-line);
  z-index: 10;
  animation: ${slideUp} 0.25s ease-out;
  padding: 1rem;
  display: flex;
  flex-direction: column;

  ${media.tablet} {
    display: none;
  }
`;

export const MobileChatToggle = styled.button`
  position: absolute;
  bottom: 42px;
  right: 12px;
  z-index: 11;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid var(--colors-current-line);
  background: var(--colors-background);
  color: var(--colors-foreground);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease, border-color 0.2s ease;

  svg {
    width: 18px;
    height: 18px;
  }

  &[data-open="true"] {
    background: var(--colors-current-line);
    border-color: var(--colors-primary);
    color: var(--colors-primary);
  }

  ${media.tablet} {
    display: none;
  }
`;

export const MobileChatBadge = styled.span`
  position: absolute;
  top: -4px;
  right: -4px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--colors-red);
`;

export const MobileChatMessages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-bottom: 0.5rem;
`;

export const MobileChatInput = styled.div`
  display: flex;
  gap: 4px;
  padding-top: 0.5rem;
  border-top: 1px solid var(--colors-current-line);
`;
