import { useCallback, useEffect, useState } from "react";
import { Navigate, useParams, useNavigate, Link } from "react-router-dom"

import './style.css';

import ConnectionStatus, { ConnectionStatusProps } from "../../components/ConnectionStatus";
import RoomSlot from "../../components/RoomSlot";
import { JoinCallbackProps, State } from "../../lib/types";
import createSocket from "../../services/socket-io";
import PlayerCard from "../../components/PlayerCard";
import { Socket } from "socket.io-client";

export default function Room(){
  const navigate = useNavigate();
  const { id } = useParams<string>();
  const [socket, setSocket] = useState<Socket | undefined>()
  const [state, setState] = useState<State | null>(null);
  
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatusProps>({
    status: 'connecting'
  });

  //useEffect(() => console.log('status changed', connectionStatus), [connectionStatus]);

  useEffect(() => {
    const username = localStorage.getItem('username');

    if(!username){
      navigate('/join');
      return;
    }

    const socket = createSocket({
      query: { username, room_id: id }
    });

    setSocket(socket);

    socket.emit('join', {}, ({ success, message }: JoinCallbackProps) => {
      if(!success){
        socket.disconnect();

        setConnectionStatus({
          status: success ? 'connected' : 'error',
          message: message
        });
      }

      // if(!found) {
      //   navigate('/join', {
      //     state: { found: false }
      //   });
      //   return;
      // }
    });
    
    socket.on("reconnect", () => {
      setConnectionStatus({
        status: 'connecting',
        message: 'reconnecting'
      });
    });

    socket.on("connect", () => {
      setConnectionStatus({
        status: 'connecting',
        message: 'Waiting server response..'
      });
    });

    socket.on("disconnect", (reason) => {
      console.log('reason', reason);
      if(reason === "ping timeout"){
        console.log('Refreshing connection');
        return;
      }

      setConnectionStatus({
        status: 'disconnected'
      })
    });
    
    socket.on("state", (state: State) => {
      setState(state);

      setConnectionStatus({
        status: 'connected',
        message: `Connected | Room ${(id || '').toUpperCase()}`
      });
    });

    return () => {
      socket.emit('leave');
      socket.disconnect();
    }
  }, [id, navigate]);

  const handleLeave = useCallback(() => {
    if(!socket) return;

    socket.emit('leave');
    socket.disconnect();
    navigate('/join');
  }, [socket, navigate]);

  if(!id) return (
    <Navigate to='/' />
  )

  return (
    <section className="container room-container">
      <ConnectionStatus {...connectionStatus} />

      {!state && (
        <center className="my-5">
          {connectionStatus.status === 'connecting' && (
            <p>Connecting to the server<br />Please wait..</p>
          )}

          {connectionStatus.status === 'connected' && (
            <p>Fetching room data<br />Please wait..</p>
          )}

          {connectionStatus.status === 'error' && <>
            <p>Error on fetching room data.</p>
            <div className="d-flex mt-3 g-3 justify-content-center">
              <Link to={'/join'}>Join another room</Link>
              <Link to={'/new'}>Create a room</Link>
            </div>
          </>}
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

      <a onClick={() => handleLeave()}>Leave Room</a>
    </section>
  )
}
