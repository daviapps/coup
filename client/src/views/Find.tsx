import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import api from "../services/api";
import { RoomInfo } from "@coup/shared/types";

export default function Find() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string>("");

  const { data: roomList } = useQuery(
    "rooms",
    async () => {
      return (await api.get("/rooms")).data.result as RoomInfo[];
    },
    {
      refetchInterval: 2000,
    },
  );

  const selectRoom = useCallback(
    (room_id: string) => {
      const username = localStorage.getItem("username") || "";

      if (!username) {
        localStorage.setItem("room_id", room_id.toUpperCase());
        navigate("/join");
      }

      api
        .post(`/rooms/${room_id}/check`, { username })
        .then(() => {
          localStorage.setItem("username", username);
          localStorage.setItem("room_id", room_id.toUpperCase());
          navigate(`/room/${room_id.toUpperCase()}`);
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
    [navigate],
  );

  return (
    <section className="container join-container d-flex">
      <Header />

      <div className="d-flex flex-column form--center">
        <center className="mb-3">
          <h1>{t("global.find_game")}</h1>
          <p>
            {t("global.app_developed_by")}{" "}
            <a href="https://github.com/daviinacio" target="_blank">
              daviinacio
            </a>
            .
          </p>
        </center>

        <table>
          <thead>
            <tr>
              <th
                align="left"
                style={{
                  width: "50%",
                }}
              >
                Code
              </th>
              <th
                align="left"
                style={{
                  width: "50%",
                }}
              >
                Players
              </th>
              <th
                align="left"
                style={{
                  width: "1%",
                }}
              ></th>
            </tr>
          </thead>
          <tbody>
            {roomList?.map((room) => (
              <tr key={room.id} onClick={() => selectRoom(room.id)}>
                <td>{String(room.id).toUpperCase()}</td>
                {/* <td>{`${room.player_count}/${room.player_max}`}</td> */}
                <td>➜</td>
              </tr>
            ))}
          </tbody>
        </table>

        {errorMessage && (
          <span className="validation-error">{t(errorMessage)}</span>
        )}

        <div className="d-flex g-3 mt-3">
          <Link to={"/new"} className="btn btn-primary flex-grow-1">
            {t("global.new_game")}
          </Link>
          <Link to={"/join"} className="btn flex-grow-1">
            {t("global.join_game")}
          </Link>
        </div>
      </div>
    </section>
  );
}
