import { media } from "@/styles/media";
import styled from "styled-components";

export const Wrapper = styled.div`
  grid-area: players;
  display: flex;
  padding: 1rem;
  min-height: fit-content;

  gap: 1rem;

  overflow-x: auto;

  /* height: 250px; */
`;

export const Title = styled.h3`
  /* text-align: center; */
`;

export const Player = styled.div`
  border-radius: 16px;
  padding: 12px;
  border: 2px solid transparent;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: fit-content;

  &[data-current="true"] {
    background: #ffffff11;
    border-color: #ffffff77;

    &[data-myself="true"] {
      background: #1eb5f122;
      border-color: var(--colors-primary);
    }
  }
`;

export interface PlayerNameProps {
  $active: boolean;
}

export const PlayerName = styled.span<PlayerNameProps>`
  font-weight: bold;
  color: ${({ $active }) => ($active ? "lime" : "red")};
  /* padding-bottom: 0.5rem; */
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

  svg {
    width: 18px;
    height: 18px;
  }
`;
