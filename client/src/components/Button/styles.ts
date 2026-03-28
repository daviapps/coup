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
  }

  &:hover {
    filter: brightness(110%);
  }

  &:active {
    filter: brightness(90%);
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;
