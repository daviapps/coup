import { FormEventHandler, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useLocalState } from "@daviapps/react-utils";
import { RoomControllerCreateResult } from "@coup/shared/types";
import { LANGUAGES } from "@/lib/constants";
import * as S from "./lobby-styles";

export default function New() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [errorMessage, setErrorMessage] = useState<string>("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useLocalState<string | undefined>({
    key: "username",
  });

  useEffect(() => setErrorMessage(""), [username]);

  const handleCreate = useCallback<FormEventHandler>(
    (e) => {
      e.preventDefault();
      api
        .post("/rooms", { username, password: password || undefined })
        .then((response) => {
          const { id } = response.data as RoomControllerCreateResult;
          localStorage.setItem("room_password", password || "");
          navigate(`/room/${id}`);
        })
        .catch((err) => {
          if (err.response) {
            const { message } = err.response.data;
            setErrorMessage(message);
          }
        });
    },
    [navigate, username],
  );

  return (
    <S.Page>
      <S.Card as="form" onSubmit={handleCreate}>
        <S.Title>{t("global.new_game")}</S.Title>
        <S.Subtitle>
          {t("global.app_developed_by")}
          <a
            href={`${location.protocol}//${location.hostname.split(".").splice(-2).join(".")}`}
            target="_blank"
          >
            {location.hostname.split(".")[1]}
          </a>
        </S.Subtitle>

        <S.FieldGroup>
          <S.Label htmlFor="username">
            {t("global_fields.username.label")}
          </S.Label>
          <S.Input
            id="username"
            value={username}
            required
            type="text"
            placeholder={t("global_fields.username.placeholder") || ""}
            onChange={(e) => setUsername(e.target.value)}
          />
          {errorMessage && <S.ErrorMessage>{t(errorMessage)}</S.ErrorMessage>}
        </S.FieldGroup>

        <S.FieldGroup>
          <S.Label htmlFor="password">
            {t("global_fields.password.label")}
          </S.Label>
          <S.Input
            id="password"
            value={password}
            type="password"
            placeholder={t("global_fields.password.placeholder") || ""}
            onChange={(e) => setPassword(e.target.value)}
          />
        </S.FieldGroup>

        <S.ButtonRow>
          <S.PrimaryButton type="submit">
            {t("views.new.submit")}
          </S.PrimaryButton>
        </S.ButtonRow>

        <S.FormLink>
          <Link to="/join">{t("views.new.link_join")}</Link>
        </S.FormLink>
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
