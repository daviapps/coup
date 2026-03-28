import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import Header from "../components/Header";
import { useLocalState } from "@daviapps/react-utils";

export default function Join() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string>("");
  // const [roomId, setRoomId] = useState<string>(
  //   (localStorage.getItem("roomId") || "").toUpperCase(),
  // );
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
        .post(`/rooms/${roomId}/analyze`, { username })
        .then(() => {
          setUsername(username);
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
    <section className="container join-container d-flex">
      <Header />

      <form
        onSubmit={(e) => handleJoin(e)}
        className="d-flex flex-column form--center"
      >
        <center className="mb-3">
          <h1>{t("global.join_game")}</h1>
          <p>
            {t("global.app_developed_by")}{" "}
            <a href="https://github.com/daviinacio" target="_blank">
              daviinacio
            </a>
            .
          </p>
        </center>

        <div className="field-container">
          <label htmlFor="roomId">{t("global_fields.room_id.label")}</label>
          <input
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
        </div>

        <div className="field-container">
          <label htmlFor="username">{t("global_fields.username.label")}</label>
          <input
            id="username"
            value={username}
            required
            type="text"
            placeholder={t("global_fields.username.placeholder") || ""}
            onChange={(e) => setUsername(e.target.value)}
          />
          {errorMessage && (
            <span className="validation-error">{t(errorMessage)}</span>
          )}
        </div>

        <div className="d-flex g-3 mt-3">
          <button type="submit" className="btn btn-primary flex-grow-1">
            {t("views.join.submit")}
          </button>
          <Link to={"/find"} className="btn flex-grow-1">
            {t("views.join.find")}
          </Link>
        </div>

        <Link to={"/new"} className="form-link">
          {t("views.join.link_new")}
        </Link>
      </form>
    </section>
  );
}
