import { FormEventHandler, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import Header from "../components/Header";

export default function Join(){
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [room_id, setRoomId] = useState<string>(
    (localStorage.getItem('room_id') || '').toUpperCase()
  );
  const [username, setUsername] = useState<string>(
    localStorage.getItem('username') || ''
  );

  useEffect(() => setErrorMessage(''), [username, room_id]);

  const handleJoin = useCallback<FormEventHandler>((e) => {
    e.preventDefault();

    api.get(`/rooms/${room_id}?username=${username}`).then(() => {
      localStorage.setItem('username', username);
      localStorage.setItem('room_id', room_id.toLowerCase());
      navigate(`/room/${room_id.toLowerCase()}`);
    })
    .catch((err) => {
      if(err.response){
        const { message } = err.response.data;
        setErrorMessage(message);
      }
    });
  }, [navigate, room_id, username]);

  return (
    <section className="container join-container d-flex">
      <Header />

      <form onSubmit={(e) => handleJoin(e)} className="d-flex flex-column form--center">
        <center className="mb-3">
          <h1>{t("global.join_game")}</h1>
          <p>{t("global.app_developed_by")} <a href="https://github.com/daviinacio">daviinacio</a>.</p>
        </center>

        <div className="field-container">
          <label htmlFor="room_id">{t("global_fields.room_id.label")}</label>
          <input
            id="room_id"
            value={room_id}
            required
            pattern="^[a-zA-Z0-9]+$"
            placeholder={t("global_fields.room_id.placeholder") || ''}
            maxLength={4}
            type='text'
            onChange={(e) => setRoomId(e.target.value
              .toUpperCase()
              .replace(/[^\da-zA-Z]+/g, ''))}
          />
        </div>

        <div className="field-container">
          <label htmlFor="username">{t("global_fields.username.label")}</label>
          <input
            id="username"
            value={username}
            required
            type='text'
            placeholder={t("global_fields.username.placeholder") || ''}
            onChange={(e) => setUsername(e.target.value)}
          />
          {errorMessage && (
            <span className="validation-error">{t(errorMessage)}</span>
          )}
        </div>

        <button type="submit" className="btn btn-primary mt-3">{t('views.join.submit')}</button>
        <Link to={'/new'} className="form-link">{t('views.join.link_new')}</Link>
      </form>
    </section>
  )
}
