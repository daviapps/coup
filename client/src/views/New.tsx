import { FormEventHandler, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function New(){
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [errorMessage, setErrorMessage] = useState<string>('');
  const [username, setUsername] = useState<string>(
    localStorage.getItem('username') || ''
  );

  useEffect(() => setErrorMessage(''), [username]);

  const handleCreate = useCallback<FormEventHandler>((e) => {
    e.preventDefault();
    localStorage.setItem('username', username);
  
    api.post('/rooms', { username }).then((response) => {
      const { room_id } = response.data;
      localStorage.setItem('room_id', room_id);
      navigate(`/room/${room_id}`);
    })
    .catch((err) => {
      if(err.response){
        console.log(err.response);
        const { message } = err.response.data;
        setErrorMessage(message);
      }
    });
    
  }, [navigate, username]);

  return (
    <section className="container join-container d-flex">
      <form onSubmit={(e) => handleCreate(e)} className="d-flex flex-column form--center">
        <center className="mb-3">
          <h1>{t("new_game")}</h1>
          <p>{t("app_developed_by")} <a href="https://github.com/daviinacio">daviinacio</a>.</p>
        </center>

        <div className="field-container">
          <label htmlFor="username">{t("field_label_username")}</label>
          <input
            id="username"
            value={username}
            required
            type='text'
            onChange={(e) => setUsername(e.target.value)}
          />
          {errorMessage && (
            <span className="validation-error">{errorMessage}</span>
          )}
        </div>

        <button type="submit" className="btn btn-primary mt-3">{t('new_submit_btn')}</button>
        <Link to={'/join'} className="form-link">{t('new_under_submit_link')}</Link>
      </form>
    </section>
  )
}
