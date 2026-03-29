import { useEffect, useState } from "react";
import * as S from "./styles";

const TOTAL = 5;

function getColor(time: number) {
  if (time > 3) return "var(--colors-green)";
  if (time > 1) return "var(--colors-orange)";
  return "var(--colors-red)";
}

export function Countdown() {
  const [time, setTime] = useState(TOTAL);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((p) => Math.max(p - 1, 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <S.Wrapper>
      <S.BarTrack>
        <S.BarFill $duration={TOTAL} $color={getColor(time)} />
      </S.BarTrack>
      <S.TimeLabel style={{ color: getColor(time) }}>{time}s</S.TimeLabel>
    </S.Wrapper>
  );
}
