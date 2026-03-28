import { useGame } from "../../hooks/use-game";
import * as S from "./styles";

export function StatusBar() {
  const { state } = useGame();
  return (
    <S.Wrapper>
      <span>Phase: {state.phase}</span>
    </S.Wrapper>
  );
}
