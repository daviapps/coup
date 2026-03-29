import { media } from "@/styles/media";
import styled, { keyframes } from "styled-components";
import { Wrapper as Chat } from "@/features/classic-coup/components/Chat/styles";

export const Wrapper = styled.div`
  min-height: 100%;
  height: 100%;
  min-height: -webkit-fill-available;
  height: -webkit-fill-available;

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
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease;

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

export const Hud3d = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  z-index: 5;
`;

export const HudTop = styled.div`
  pointer-events: auto;
`;

export const HudCenter = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
`;

export const ViewToggle = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 11;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid var(--colors-current-line);
  background: rgba(40, 42, 54, 0.85);
  color: var(--colors-foreground);
  font-size: 12px;
  font-weight: bold;
  cursor: pointer;
  transition: border-color 0.2s, background-color 0.2s;

  svg {
    width: 14px;
    height: 14px;
  }

  &:hover {
    border-color: var(--colors-primary);
    background: rgba(40, 42, 54, 1);
  }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const PasswordGate = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

export const PasswordCard = styled.div`
  width: 100%;
  max-width: 360px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--colors-current-line);
  border-radius: 16px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  animation: ${fadeIn} 0.4s ease-out;
`;

export const PasswordTitle = styled.h2`
  color: var(--colors-primary);
  text-align: center;
  font-size: 1.5rem;
`;

export const PasswordSubtitle = styled.p`
  color: var(--colors-comment);
  text-align: center;
  font-size: 13px;
`;

export const PasswordInput = styled.input`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--colors-current-line);
  color: var(--colors-foreground);
  font-size: 15px;
  border-radius: 8px;
  padding: 0.6rem 0.85rem;
  text-align: center;
  letter-spacing: 2px;

  &:focus {
    outline: none;
    border-color: var(--colors-primary);
  }
`;

export const PasswordButton = styled.button`
  padding: 0.65rem 1rem;
  border: 2px solid var(--colors-primary);
  background: var(--colors-primary);
  color: var(--colors-background);
  font-size: 14px;
  font-weight: bold;
  text-transform: uppercase;
  border-radius: 8px;
  cursor: pointer;
  transition:
    filter 0.15s,
    transform 0.15s;

  &:hover {
    filter: brightness(110%);
    transform: translateY(-1px);
  }

  &:active {
    filter: brightness(90%);
    transform: translateY(1px);
  }
`;

export const PasswordError = styled.span`
  color: var(--colors-red);
  font-size: 13px;
  text-align: center;
`;
