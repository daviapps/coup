import styled from "styled-components";

export const Wrapper = styled.button`
  border: none;
  background-color: transparent;
  cursor: pointer;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-transform: uppercase;
  transition: transform 0.15s ease, filter 0.15s ease, box-shadow 0.15s ease;

  &[data-variant="default"] {
    border-radius: 5px;
    border: 2px solid var(--colors-primary);
    padding: 0.5rem 1rem;
    background: var(--colors-primary);
  }

  &[data-variant="link"] {
    color: var(--colors-primary);

    &:hover {
      text-decoration: underline;
    }
  }

  &[data-disabled="true"] {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }

  &:hover:not([data-disabled="true"]) {
    filter: brightness(110%);
    transform: translateY(-1px);
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.25);
  }

  &:active:not([data-disabled="true"]) {
    filter: brightness(90%);
    transform: translateY(1px) scale(0.98);
    box-shadow: none;
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;
