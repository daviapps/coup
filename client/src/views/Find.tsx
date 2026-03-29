import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import type { RoomInfo } from "@coup/shared/types";
import { ArrowRightIcon, LockIcon } from "lucide-react";
import { LANGUAGES } from "@/lib/constants";
import { useLocalState } from "@daviapps/react-utils";
import * as S from "./lobby-styles";

export default function Find() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [passwordPrompt, setPasswordPrompt] = useState<string | null>(null);
  const [password, setPassword] = useState("");

  const [username] = useLocalState<string | undefined>({
    key: "username",
  });

  const { data: roomList } = useQuery(
    "rooms",
    async () => {
      return (await api.get("/rooms")).data as RoomInfo[];
    },
    {
      refetchInterval: 2000,
    },
  );

  const joinRoom = useCallback(
    (roomId: string, pwd?: string) => {
      if (!username) {
        localStorage.setItem("room_id", roomId.toUpperCase());
        navigate("/join");
        return;
      }

      api
        .post(`/rooms/${roomId}/analyze`, { username, password: pwd })
        .then(() => {
          localStorage.setItem("room_password", pwd || "");
          navigate(`/room/${roomId.toUpperCase()}`);
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
    [navigate, username],
  );

  const selectRoom = useCallback(
    (room: RoomInfo) => {
      setErrorMessage("");
      if (room.hasPassword) {
        setPasswordPrompt(room.id);
        setPassword("");
      } else {
        joinRoom(room.id);
      }
    },
    [joinRoom],
  );

  const submitPassword = () => {
    if (passwordPrompt) {
      joinRoom(passwordPrompt, password);
      setPasswordPrompt(null);
      setPassword("");
    }
  };

  return (
    <S.Page>
      <S.Card>
        <S.Title>{t("global.find_game")}</S.Title>
        <S.Subtitle>
          {t("global.app_developed_by")}
          <a
            href={`${location.protocol}//${location.hostname.split(".").splice(-2).join(".")}`}
            target="_blank"
          >
            {location.hostname.split(".")[1]}
          </a>
        </S.Subtitle>

        {passwordPrompt && (
          <S.FieldGroup>
            <S.Label>{t("global_fields.password.label")}</S.Label>
            <S.Input
              type="password"
              value={password}
              placeholder={t("global_fields.password.placeholder") || ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
              onKeyDown={(e: React.KeyboardEvent) =>
                e.key === "Enter" && submitPassword()
              }
              autoFocus
            />
            <S.ButtonRow>
              <S.PrimaryButton type="button" onClick={submitPassword}>
                {t("views.join.submit")}
              </S.PrimaryButton>
              <S.SecondaryButton
                type="button"
                onClick={() => setPasswordPrompt(null)}
              >
                {t("game.back")}
              </S.SecondaryButton>
            </S.ButtonRow>
          </S.FieldGroup>
        )}

        {!passwordPrompt &&
          (roomList && roomList.length > 0 ? (
            <S.Table>
              <thead>
                <tr>
                  <S.Th style={{ width: "35%" }}>
                    {t("views.find.table_code")}
                  </S.Th>
                  <S.Th style={{ width: "30%" }}>
                    {t("views.find.table_players")}
                  </S.Th>
                  <S.Th style={{ width: "15%" }}></S.Th>
                  <S.Th style={{ width: "20%" }}></S.Th>
                </tr>
              </thead>
              <tbody>
                {roomList.map((room) => (
                  <S.Tr key={room.id} onClick={() => selectRoom(room)}>
                    <S.Td style={{ fontWeight: "bold", letterSpacing: "2px" }}>
                      {String(room.id).toUpperCase()}
                    </S.Td>
                    <S.Td>{room.playerCount}</S.Td>
                    <S.Td style={{ textAlign: "center", opacity: 0.5 }}>
                      {room.hasPassword && <LockIcon size={14} />}
                    </S.Td>
                    <S.Td style={{ textAlign: "right" }}>
                      <ArrowRightIcon size={16} />
                    </S.Td>
                  </S.Tr>
                ))}
              </tbody>
            </S.Table>
          ) : (
            <S.EmptyState>{t("views.find.no_rooms")}</S.EmptyState>
          ))}

        {errorMessage && <S.ErrorMessage>{t(errorMessage)}</S.ErrorMessage>}

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
