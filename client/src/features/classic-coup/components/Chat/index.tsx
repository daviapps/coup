import { useTranslation } from "react-i18next";
import { useGame } from "../../hooks/use-game";
import * as S from "./styles";

export function Chat() {
  const { state } = useGame();
  const { t } = useTranslation();
  return (
    <S.Wrapper>
      <S.Title>Chat</S.Title>
      <div>
        {state.logs.map(({ message, ...props }, i) => (
          <div key={i}>{t(message, props)}</div>
        ))}
      </div>
    </S.Wrapper>
  );
}
