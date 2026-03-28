import { media } from "@/styles/media";
import styled from "styled-components";
import { Wrapper as Chat } from "@/features/classic-coup/components/Chat/styles";

export const Wrapper = styled.div`
  height: 100%;

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
