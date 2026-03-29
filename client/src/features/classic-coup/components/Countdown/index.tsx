import { useEffect, useState } from "react";
import * as S from "./styles";

function getColor(time: number, total: number) {
  const ratio = time / total;
  if (ratio > 0.6) return "var(--colors-green)";
  if (ratio > 0.2) return "var(--colors-orange)";
  return "var(--colors-red)";
}

export interface CountdownProps {
  duration?: number;
}

export function Countdown({ duration = 5 }: CountdownProps) {
  const [time, setTime] = useState(duration);

  useEffect(() => {
    setTime(duration);
    const interval = setInterval(() => {
      setTime((p) => Math.max(p - 1, 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [duration]);

  return (
    <S.Wrapper>
      <S.BarTrack>
        <S.BarFill $duration={duration} $color={getColor(time, duration)} />
      </S.BarTrack>
      <S.TimeLabel style={{ color: getColor(time, duration) }}>
        {time}s
      </S.TimeLabel>
    </S.Wrapper>
  );
}
