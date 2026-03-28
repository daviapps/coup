import styled, { keyframes } from "styled-components";
import { media } from "@/styles/media";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const Page = styled.section`
  min-height: 100%;
  height: 100%;
  min-height: -webkit-fill-available;
  height: -webkit-fill-available;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 1rem 2rem;
`;

export const Card = styled.div`
  width: 100%;
  max-width: 420px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--colors-current-line);
  border-radius: 16px;
  padding: 2rem;
  animation: ${fadeIn} 0.4s ease-out;

  ${media.tablet} {
    padding: 2.5rem;
  }
`;

export const Title = styled.h1`
  font-size: 2rem;
  color: var(--colors-primary);
  text-align: center;
  margin-bottom: 0.25rem;
`;

export const Subtitle = styled.p`
  text-align: center;
  font-size: 13px;
  color: var(--colors-comment);
  margin-bottom: 1.5rem;

  a {
    color: var(--colors-comment);
    text-decoration: underline;
  }
`;

export const Description = styled.p`
  font-size: 13px;
  color: var(--colors-foreground);
  opacity: 0.7;
  text-align: justify;
  line-height: 1.5;
  margin-bottom: 1.5rem;
`;

export const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
`;

export const Label = styled.label`
  font-size: 13px;
  font-weight: bold;
  color: var(--colors-foreground);
  margin-bottom: 0.4rem;
`;

export const Input = styled.input`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--colors-current-line);
  color: var(--colors-foreground);
  font-size: 15px;
  border-radius: 8px;
  padding: 0.6rem 0.85rem;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: var(--colors-primary);
  }

  &::placeholder {
    color: var(--colors-comment);
    font-size: 14px;
  }
`;

export const ErrorMessage = styled.span`
  font-size: 13px;
  margin-top: 0.4rem;
  color: var(--colors-red);
`;

export const ButtonRow = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
`;

export const PrimaryButton = styled.button`
  flex: 1;
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

export const SecondaryButton = styled.button`
  flex: 1;
  padding: 0.65rem 1rem;
  border: 2px solid var(--colors-foreground);
  background: transparent;
  color: var(--colors-foreground);
  font-size: 14px;
  font-weight: bold;
  text-transform: uppercase;
  border-radius: 8px;
  cursor: pointer;
  transition:
    filter 0.15s,
    transform 0.15s;

  &:hover {
    filter: brightness(80%);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(1px);
  }
`;

export const FormLink = styled.span`
  display: block;
  text-align: center;
  margin-top: 1rem;
  font-size: 13px;

  a {
    color: var(--colors-primary);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
      filter: none;
    }
  }
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 0.5rem;
`;

export const Th = styled.th`
  text-align: left;
  padding: 0.5rem 0.75rem;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--colors-primary);
  border-bottom: 1px solid var(--colors-current-line);
`;

export const Tr = styled.tr`
  cursor: pointer;
  transition: background-color 0.15s;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`;

export const Td = styled.td`
  padding: 0.6rem 0.75rem;
  font-size: 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
`;

export const EmptyState = styled.p`
  text-align: center;
  color: var(--colors-comment);
  font-size: 14px;
  padding: 2rem 0;
  font-style: italic;
`;

export const LangSelector = styled.select`
  position: fixed;
  bottom: 16px;
  right: 16px;
  background: rgba(0, 0, 0, 0.4);
  color: var(--colors-foreground);
  border: 1px solid var(--colors-current-line);
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 13px;
  cursor: pointer;
  z-index: 50;

  &:focus {
    outline: none;
    border-color: var(--colors-primary);
  }

  option {
    background: var(--colors-background);
    color: var(--colors-foreground);
  }
`;
