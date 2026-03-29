import styled from "styled-components";

const phaseColors: Record<string, string> = {
  LOBBY: "var(--colors-comment)",
  ACTION_SELECTION: "var(--colors-purple)",
  CHALLENGE_WINDOW: "var(--colors-orange)",
  BLOCK_WINDOW: "var(--colors-pink)",
  BLOCK_CHALLENGE_WINDOW: "var(--colors-red)",
  DISCARD_INFLUENCE: "var(--colors-red)",
  EXCHANGE_SELECTION: "var(--colors-green)",
  GAME_OVER: "var(--colors-yellow)",
};

export interface WrapperProps {
  $phase?: string;
}

export const Wrapper = styled.div<WrapperProps>`
  grid-area: status;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: background-color 0.3s ease;
  background-color: ${({ $phase }) =>
    $phase ? phaseColors[$phase] || "var(--colors-comment)" : "var(--colors-comment)"};
`;

export const LangSelect = styled.select`
  background: rgba(0, 0, 0, 0.25);
  color: inherit;
  border: none;
  font-size: 11px;
  font-weight: bold;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 4px;

  &:focus {
    outline: none;
  }

  option {
    background: var(--colors-background);
    color: var(--colors-foreground);
  }
`;
