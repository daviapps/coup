import { FormEventHandler, useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function New(){
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
        <center className="mb-3"><h1>Create room</h1></center>
        <div className="field-container">
          <label>Username</label>
          <input
            id="username"
            value={username}
            type='text'
            onChange={(e) => setUsername(e.target.value)}
          />
          {errorMessage && (
            <span className="validation-error">{errorMessage}</span>
          )}
        </div>

        <button type="submit" className="btn btn-primary mt-3">Open</button>

        <Link to={'/join'} className="form-link">Click here to join a friend's room</Link>
      </form>
    </section>
  )
}
