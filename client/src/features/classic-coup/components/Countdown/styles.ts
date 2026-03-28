import styled, { keyframes } from "styled-components";

const shrink = keyframes`
  from { width: 100%; }
  to { width: 0%; }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  animation: ${fadeIn} 0.2s ease-out;
  width: 100%;
`;

export const BarTrack = styled.div`
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
`;

export interface BarFillProps {
  $duration: number;
  $color: string;
}

export const BarFill = styled.div<BarFillProps>`
  height: 100%;
  border-radius: 3px;
  background: ${({ $color }) => $color};
  animation: ${shrink} ${({ $duration }) => $duration}s linear forwards;
  box-shadow: 0 0 8px ${({ $color }) => $color}66;
`;

export const TimeLabel = styled.span`
  font-size: 13px;
  font-weight: bold;
  font-variant-numeric: tabular-nums;
`;
