import { useCallback, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function Join(){
  const navigate = useNavigate();
  const { found } = useParams<string>();
  const [room, setRoom] = useState<string>('xpto');
  const [username, setUsername] = useState<string>('');

  const handleJoin = useCallback(() => {
    localStorage.setItem('username', username);
    navigate(`/room/${room}`);
  }, [navigate, room, username]);

  return (
    <section className="container join-container">
      <h1>Join {found}</h1>

      <label>Código da sala</label>
      <input id="room" value={room} onChange={(e) => setRoom(e.target.value)} />

      <label>Username</label>
      <input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />

      <button onClick={() => handleJoin()}>Entrar</button>
    </section>
  )
}
