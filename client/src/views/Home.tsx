import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LANGUAGES } from "@/lib/constants";
import * as S from "./lobby-styles";

export default function Home() {
  const { t, i18n } = useTranslation();

  return (
    <S.Page>
      <S.Card>
        <S.Title>{t("global.app_name")}</S.Title>
        <S.Subtitle>
          {t("global.app_developed_by")}
          <a
            href={`${location.protocol}//${location.hostname.split(".").splice(-2).join(".")}`}
            target="_blank"
          >
            {location.hostname.split(".")[1]}
          </a>
        </S.Subtitle>

        <S.Description>{t("rules.overview")}</S.Description>

        <S.ButtonRow>
          <S.PrimaryButton
            as={Link}
            to="/new"
            style={{ textAlign: "center", textDecoration: "none" }}
          >
            {t("global.new_game")}
          </S.PrimaryButton>
          <S.SecondaryButton
            as={Link}
            to="/join"
            style={{ textAlign: "center", textDecoration: "none" }}
          >
            {t("global.join_game")}
          </S.SecondaryButton>
        </S.ButtonRow>
      </S.Card>

      <S.LangSelector
        defaultValue={i18n.language}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
          localStorage.setItem("lang", e.target.value);
          i18n.changeLanguage(e.target.value);
        }}
      >
        {LANGUAGES.map(({ code, label }) => (
          <option key={code} value={code}>
            {label}
          </option>
        ))}
      </S.LangSelector>
    </S.Page>
  );
}
