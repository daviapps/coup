import { MouseEventHandler, useCallback, useEffect, useState } from "react";
import { Navigate, useParams, useNavigate, Link } from "react-router-dom"

import ConnectionStatus, { ConnectionStatusProps } from "../components/ConnectionStatus";
import RoomSlot from "../components/RoomSlot";
import { JoinCallbackProps, State } from "../lib/types";
import createSocket from "../services/socket-io";
import PlayerCard from "../components/PlayerCard";
import { Socket } from "socket.io-client";
import { useTranslation } from "react-i18next";

export default function Room(){
  const { t } = useTranslation();
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
      if(id)
        localStorage.setItem('room_id', id);

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
          message: t(message) || message
        });
      }
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
        message: t('room_c_conn_status_default_msg_connected', {
          room_id: (id || '').toUpperCase()
        }) || ''
      });
    });

    return () => {
      socket.disconnect();
    }
  }, [navigate, t, id]);

  const handleLeave = useCallback<MouseEventHandler<HTMLAnchorElement>>((e) => {
    if(!socket) return;
    e.preventDefault();
    socket.emit('leave');
    setTimeout(() => navigate('/join'), 500);
  }, [socket, navigate]);

  if(!id) return (
    <Navigate to='/' />
  )

  return (
    <section className="container room-container">
      <ConnectionStatus {...connectionStatus} />

      {!state && (
        <center className="my-5">
          {connectionStatus.status === 'connected' && (
            <p>{t('room_status_msg_connected')}</p>
          )}

          {connectionStatus.status === 'connecting' && (
            <p>{t('room_status_msg_connecting')}</p>
          )}

          {connectionStatus.status === 'error' && <>
            <p>{t('room_status_msg_error')}</p>

            <div className="d-flex g-3 mt-5">
              <Link to={"/new"} className="btn btn-primary flex-grow-1">{t("new_game")}</Link>
              <Link to={"/join"} className="btn flex-grow-1">{t("join_game")}</Link>
            </div>
          </>}
        </center>
      )}

      {state && <>
        <div className="row mt-3 gy-3">
          <div className="col-12 col-md-3">
            <RoomSlot title={t('room_slot_title_players')}>
              {state.players.map(player => (
                <PlayerCard key={player.socket_id} player={player} />
              ))}
            </RoomSlot>
          </div>
          <div className="col-12 col-md 6">
            <RoomSlot title={t('room_slot_title_actions')}>
              TODO: Actions Grid
            </RoomSlot>
          </div>
          <div className="col-12 col-md-3">
            <RoomSlot title={t('room_slot_title_logs')}>
              TODO: Log List
            </RoomSlot>
          </div>
        </div>
        <div className="d-flex mt-3">
          <Link
            to={'/join'}
            className="btn"
            onClick={(e) => handleLeave(e)}>{t('room_leave')}
          </Link>
        </div>
      </>}
    </section>
  )
}
