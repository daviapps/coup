import styled, { keyframes, css } from "styled-components";

const fadeSlideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const staggerIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const pulseGlow = keyframes`
  0%, 100% { box-shadow: 0 0 6px rgba(255, 85, 85, 0.4); }
  50% { box-shadow: 0 0 18px rgba(255, 85, 85, 0.8); }
`;

export const Wrapper = styled.div`
  grid-area: board;
  min-height: 200px;
  min-width: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 20px;
  animation: ${fadeSlideIn} 0.3s ease-out;

  span {
    align-self: center;
  }

  /* Stagger children buttons */
  > button, > a {
    animation: ${staggerIn} 0.25s ease-out both;
  }

  > button:nth-child(1), > a:nth-child(1) { animation-delay: 0ms; }
  > button:nth-child(2), > a:nth-child(2) { animation-delay: 40ms; }
  > button:nth-child(3), > a:nth-child(3) { animation-delay: 80ms; }
  > button:nth-child(4), > a:nth-child(4) { animation-delay: 120ms; }
  > button:nth-child(5), > a:nth-child(5) { animation-delay: 160ms; }
  > button:nth-child(6), > a:nth-child(6) { animation-delay: 200ms; }
  > button:nth-child(7), > a:nth-child(7) { animation-delay: 240ms; }
`;

export const ActionInfoText = styled.span`
  font-size: 16px;
  font-weight: bold;
  color: var(--colors-yellow);
  letter-spacing: 0.5px;
`;

export const PhaseLabel = styled.span`
  font-size: 14px;
  color: var(--colors-comment);
  text-transform: uppercase;
  letter-spacing: 1px;
`;

export const PassedLabel = styled.span`
  font-size: 14px;
  color: var(--colors-comment);
  font-style: italic;
`;

export const WaitingLabel = styled.span`
  font-size: 16px;
  color: var(--colors-foreground);
  opacity: 0.6;
`;

export const DiscardPrompt = styled.span`
  font-size: 18px;
  font-weight: bold;
  color: var(--colors-red);
  animation: ${pulseGlow} 1.5s ease-in-out infinite;
  padding: 4px 12px;
  border-radius: 8px;
`;

const gameOverAppear = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.6);
  }
  60% {
    opacity: 1;
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

const glowPulse = keyframes`
  0%, 100% { text-shadow: 0 0 10px rgba(241, 250, 140, 0.4); }
  50% { text-shadow: 0 0 30px rgba(241, 250, 140, 0.8), 0 0 60px rgba(241, 250, 140, 0.3); }
`;

export const SpectatorBanner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 6px 16px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--colors-comment);
  font-size: 13px;
  color: var(--colors-comment);
  text-transform: uppercase;
  letter-spacing: 1.5px;
  animation: ${fadeSlideIn} 0.3s ease-out;

  svg {
    width: 14px;
    height: 14px;
  }
`;

export const GameOverTitle = styled.span`
  font-size: 28px;
  font-weight: bold;
  color: var(--colors-yellow);
  animation:
    ${gameOverAppear} 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both,
    ${glowPulse} 2s ease-in-out 0.6s infinite;
`;

export const GameOverWinner = styled.span`
  font-size: 20px;
  color: var(--colors-green);
  animation: ${fadeSlideIn} 0.4s ease-out 0.3s both;
`;
