import { useEffect, useState } from "react";
import * as S from "./styles";

export function Countdown() {
  const [time, setTime] = useState(5);
  useEffect(() => {
    const interval = setInterval(() => {
      setTime((p) => Math.max(p - 1, 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);
  return (
    <S.Wrapper>
      <span>{time}s</span>
    </S.Wrapper>
  );
}
