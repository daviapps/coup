import { useTranslation } from "react-i18next";
import { LANGUAGES } from "@/lib/constants";
import { useGame } from "../../hooks/use-game";
import * as S from "./styles";

export function StatusBar() {
  const { state } = useGame();
  const { t, i18n } = useTranslation();

  const onChangeLang = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang_code = e.target.value;
    localStorage.setItem("lang", lang_code);
    i18n.changeLanguage(lang_code);
  };

  return (
    <S.Wrapper $phase={state.phase}>
      <span>{t(`game.phase.${state.phase}`)}</span>
      <S.LangSelect defaultValue={i18n.language} onChange={onChangeLang}>
        {LANGUAGES.map(({ code, label }) => (
          <option key={code} value={code}>
            {label}
          </option>
        ))}
      </S.LangSelect>
    </S.Wrapper>
  );
}
