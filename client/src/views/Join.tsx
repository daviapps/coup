import { FormEventHandler, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useLocalState } from "@daviapps/react-utils";
import { LANGUAGES } from "@/lib/constants";
import * as S from "./lobby-styles";

export default function Join() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [password, setPassword] = useState("");

  const [username, setUsername] = useLocalState<string | undefined>({
    key: "username",
  });

  const [roomId, setRoomId] = useLocalState<string | undefined>({
    key: "room_id ",
  });

  useEffect(() => setErrorMessage(""), [username, roomId]);

  const handleJoin = useCallback<FormEventHandler>(
    (e) => {
      e.preventDefault();

      api
        .post(`/rooms/${roomId}/analyze`, {
          username,
          password: password || undefined,
        })
        .then(() => {
          setUsername(username);
          localStorage.setItem("room_password", password || "");
          navigate(`/room/${(roomId || "").toUpperCase()}`);
        })
        .catch((err) => {
          if (err.response) {
            const { message } = err.response.data;
            setErrorMessage(message || "global.unexpected_error");
          } else {
            setErrorMessage("global.unexpected_error");
          }
        });
    },
    [navigate, roomId, username, setUsername],
  );

  return (
    <S.Page>
      <S.Card as="form" onSubmit={handleJoin}>
        <S.Title>{t("global.join_game")}</S.Title>
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
          <S.Label htmlFor="roomId">{t("global_fields.room_id.label")}</S.Label>
          <S.Input
            id="roomId"
            value={roomId}
            required
            pattern="^[a-zA-Z0-9]+$"
            placeholder={t("global_fields.room_id.placeholder") || ""}
            maxLength={4}
            type="text"
            onChange={(e) =>
              setRoomId(
                e.target.value.toUpperCase().replace(/[^\da-zA-Z]+/g, ""),
              )
            }
          />
        </S.FieldGroup>

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

        {errorMessage && <S.ErrorMessage>{t(errorMessage)}</S.ErrorMessage>}

        <S.ButtonRow>
          <S.PrimaryButton type="submit">
            {t("views.join.submit")}
          </S.PrimaryButton>
          <S.SecondaryButton
            as={Link}
            to="/find"
            style={{ textAlign: "center", textDecoration: "none" }}
          >
            {t("views.join.find")}
          </S.SecondaryButton>
        </S.ButtonRow>

        <S.FormLink>
          <Link to="/new">{t("views.join.link_new")}</Link>
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
