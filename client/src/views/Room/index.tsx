import { useEffect, useState } from "react";
import { Navigate, useParams, useNavigate } from "react-router-dom"

import './style.css';

import ConnectionStatus from "../../components/ConnectionStatus";
import RoomSlot from "../../components/RoomSlot";
import { State } from "../../lib/types";
import createSocket from "../../services/socket-io";
import PlayerCard from "../../components/PlayerCard";

export default function Room(){
  const navigate = useNavigate();
  const { id } = useParams<string>();
  const [isConnected, setIsConnected] = useState(false);
  const [state, setState] = useState<State | null>(null);

  useEffect(() => {
    const username = localStorage.getItem('username');

    if(!username){
      navigate('/join');
      return;
    }

    const socket = createSocket({
      query: { username }
    });

    socket.emit('join', { room_id: id }, ({ found, state }: { found: boolean, state: State }) => {
      if(!found) {
        navigate('/join', {
          state: { found: false }
        });
        return;
      }

      setState(state);
      console.log(state);
    });

    socket.on("connect", () => {
      setIsConnected(socket.connected);
    });

    socket.on("disconnect", () => {
      setIsConnected(socket.connected);
    });
    
    socket.on("state", (state) => {
      setState(state);
    });

    return () => {
      socket.disconnect();
    }
  }, [id, navigate]);

  if(!id) return (
    <Navigate to='/' />
  )

  return (
    <section className="container room-container">
      <ConnectionStatus isConnected={isConnected}>
        Conectado | Sala {id.toUpperCase()}
      </ConnectionStatus>

      {!state && (
        <center className="my-5">
          <p>Carregando dados da sala..<br />Por favor aguarde um momento..</p>
        </center>
      )}

      {state && (
        <div className="row mt-3 gy-3">
          <div className="col-12 col-md-3">
            <RoomSlot title="Players">
              {state.players.map(player => (
                <PlayerCard key={player.socket_id} player={player} />
              ))}
            </RoomSlot>
          </div>
          <div className="col-12 col-md 6">
            <RoomSlot title="Ações">
              Grid Ações
            </RoomSlot>
          </div>
          <div className="col-12 col-md-3">
            <RoomSlot title="Logs">
              Lista Log
            </RoomSlot>
          </div>
        </div>
      )}
    </section>
  )
}
