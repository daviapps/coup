import { media } from "@/styles/media";
import styled, { keyframes } from "styled-components";

const turnPulse = keyframes`
  0%, 100% { box-shadow: 0 0 8px rgba(139, 233, 253, 0.3); }
  50% { box-shadow: 0 0 20px rgba(139, 233, 253, 0.6); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateX(8px); }
  to { opacity: 1; transform: translateX(0); }
`;

const coinPop = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.15); }
  100% { transform: scale(1); }
`;

export const Wrapper = styled.div`
  grid-area: players;
  display: flex;
  padding: 1rem;
  min-height: fit-content;
  gap: 1rem;
  overflow-x: auto;
`;

export const Title = styled.h3``;

export const Player = styled.div`
  border-radius: 16px;
  padding: 12px;
  border: 2px solid transparent;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: fit-content;
  transition: border-color 0.3s ease, background-color 0.3s ease, box-shadow 0.3s ease;
  animation: ${fadeIn} 0.3s ease-out;

  &[data-current="true"] {
    background: #ffffff11;
    border-color: #ffffff77;

    &[data-myself="true"] {
      background: #1eb5f122;
      border-color: var(--colors-primary);
      animation: ${turnPulse} 2s ease-in-out infinite;
    }
  }

  &[data-eliminated="true"] {
    opacity: 0.35;
  }
`;

export interface PlayerNameProps {
  $active: boolean;
}

export const PlayerName = styled.span<PlayerNameProps>`
  font-weight: bold;
  color: ${({ $active }) => ($active ? "lime" : "red")};
  transition: color 0.3s ease;
`;

export const CardDeck = styled.div`
  display: flex;
  gap: 1rem;
`;

export const CardSlot = styled.div`
  aspect-ratio: 3 / 4;
  border-radius: 12px;
  height: fit-content;
  transition: width 0.2s;

  &:empty {
    border: 2px dashed cyan;
  }

  width: 80px;

  ${media.tablet} {
    width: 100px;
  }

  ${media.desktop} {
    width: 140px;
  }
`;

export const PlayerCoins = styled.div`
  color: orange;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
  gap: 4px;
  transition: color 0.3s ease;

  svg {
    width: 18px;
    height: 18px;
    animation: ${coinPop} 0.3s ease-out;
  }
`;
