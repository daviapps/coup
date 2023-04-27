import { FormEventHandler, useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Join(){
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
      <form onSubmit={(e) => handleJoin(e)} className="d-flex flex-column form--center">
        <center className="mb-3"><h1>Join room</h1></center>

        <div className="field-container">
          <label>Room ID</label>
          <input
            id="room"
            value={room_id}
            required
            pattern="^[a-zA-Z0-9]+$"
            placeholder="XXXX"
            maxLength={4}
            type='text'
            onChange={(e) => setRoomId(e.target.value
              .toUpperCase()
              .replace(/[^\da-zA-Z]+/g, ''))}
          />
        </div>

        <div className="field-container">
          <label>Username</label>
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

        <button type="submit" className="btn btn-primary mt-3">Entrar</button>
        
        <Link to={'/new'} className="form-link">Click here to create a new room</Link>
      </form>
    </section>
  )
}
