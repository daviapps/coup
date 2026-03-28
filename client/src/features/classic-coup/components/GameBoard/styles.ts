import styled from "styled-components";

export const Wrapper = styled.div`
  grid-area: board;
  /* background: red; */
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

  span {
    align-self: center;
  }
`;
