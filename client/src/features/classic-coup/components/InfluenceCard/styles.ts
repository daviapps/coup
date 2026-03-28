import { media } from "@/styles/media";
import styled from "styled-components";

export const Wrapper = styled.div`
  /* background-color: red; */
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
  justify-content: center;
  aspect-ratio: 3 / 4;
  border-radius: 12px;
  border-width: 3px;
  border-style: solid;

  svg {
    transition:
      width 0.2s,
      height 0.2s;
    width: 40px;
    height: 40px;

    ${media.tablet} {
      width: 55px;
      height: 55px;
    }

    ${media.desktop} {
      width: 70px;
      height: 70px;
    }
  }

  span {
    font-weight: bold;
    font-size: 10px;

    ${media.tablet} {
      font-size: 12px;
    }

    ${media.desktop} {
      font-size: 16px;
    }
  }

  &[data-revealed="true"] {
    opacity: 0.4;
  }

  &[data-character="UNKNOWN"] {
    background-color: #06b891;
    border-color: #b4fded;
    color: #b4fded;
    font-weight: bold;
    font-size: 80px;
  }

  &[data-character="DUKE"] {
    background-color: #951442;
    border-color: #fab1cb;
    color: #fab1cb;
  }

  &[data-character="ASSASSIN"] {
    background-color: #575151;
    border-color: #bbbbbb;
    color: #bbbbbb;
  }

  &[data-character="AMBASSADOR"] {
    background-color: #a5a90a;
    border-color: #f7f9b3;
    color: #f7f9b3;
  }

  &[data-character="CAPTAIN"] {
    background-color: #5d95af;
    border-color: #c6e7f7;
    color: #c6e7f7;
  }

  &[data-character="CONTESSA"] {
    background-color: #7f1515;
    border-color: #fbb8b8;
    color: #fbb8b8;
  }
`;
