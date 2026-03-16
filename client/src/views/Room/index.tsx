import { MouseEventHandler, useCallback, useEffect, useState } from "react";
import { Navigate, useParams, useNavigate, Link } from "react-router-dom"

import ConnectionStatus, { ConnectionStatusProps } from "../../components/ConnectionStatus";
import RoomSlot from "../../components/RoomSlot";
import { JoinCallbackProps, State } from "../../lib/types";
import createSocket from "../../services/socket-io";
import PlayerCard from "../../components/PlayerCard";
import { Socket } from "socket.io-client";
import { useTranslation } from "react-i18next";
import Chat from "../../components/Chat";
import Header from "../../components/Header";

export default function Room(){
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<string>();
  const [username] = useState<string>(localStorage.getItem('username') || '');
  const [socket, setSocket] = useState<Socket | undefined>()
  const [state, setState] = useState<State | null>(null);
  
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatusProps>({
    status: 'connecting'
  });

  useEffect(() => {
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
          message: message
        });
      }
    });
    
    socket.on("reconnect", () => {
      setConnectionStatus({
        status: 'connecting',
        message: 'views.room.status_message_reconnecting'
      });
    });

    socket.on("connect", () => {
      setConnectionStatus({
        status: 'connecting',
        message: 'views.room.status_message_waiting_server'
      });
    });

    socket.on("disconnect", (reason) => {
      console.log('reason', reason);
      if(reason === "ping timeout")
        return;

      setConnectionStatus({
        status: 'disconnected'
      })
    });
    
    socket.on("state", (newState: State) => {
      const keysOfNewState = Object.keys(newState) as Array<keyof typeof newState>;
      setState((state) => state ? keysOfNewState.reduce<State>((ac, key) => {
        return { ...ac, [key]: newState[key] };
      }, state) : newState);

      setConnectionStatus({
        status: 'connected',
        message: 'views.room.status_message_connected'
      });
    });

    return () => {
      socket.disconnect();
    }
  }, [navigate, id, username]);

  const handleLeave = useCallback<MouseEventHandler<HTMLAnchorElement>>((e) => {
    if(!socket) return;
    e.preventDefault();
    socket.emit('leave', () => navigate('/join'));
  }, [socket, navigate]);

  const handleChatSend = useCallback((message: string) => {
    if(!socket) return;
    socket.emit("log", {
      message: message
    });
  }, [socket]);

  if(!id) return (
    <Navigate to='/' />
  );

  return (
    <section className="container room-container">
      <ConnectionStatus
        status={connectionStatus.status}
        message={t(connectionStatus.message || '', {
          room_id: (id || '').toUpperCase()
        }) || ''}
      />
      <Header />

      {!state && (
        <center className="my-5">
          {connectionStatus.status === 'connected' && (
            <p>{t('views.room.status_text_message_fetching_data')}</p>
          )}

          {connectionStatus.status === 'connecting' && (
            <p>{t('views.room.status_text_message_connecting')}</p>
          )}

          {connectionStatus.status === 'error' && <>
            <p>{t('views.room.status_text_message_error')}</p>

            <div className="d-flex g-3 mt-5">
              <Link to={"/new"} className="btn btn-primary flex-grow-1">{t("global.new_game")}</Link>
              <Link to={"/join"} className="btn flex-grow-1">{t("global.join_game")}</Link>
            </div>
          </>}
        </center>
      )}

      {state && <>
        <div className="row mt-3 gy-3 flex-grow-1">
          <div className="col-12 col-md-3">
            <RoomSlot title={t('views.room.slot_players_title') || ''}>
              {state.players.map(player => (
                <PlayerCard key={player.socket_id} player={player} />
              ))}
            </RoomSlot>
          </div>
          <div className="col-12 col-md 6">
            <RoomSlot title={t('views.room.slot_actions_title') || ''}>
              TODO: Actions Grid
            </RoomSlot>
          </div>
          <div className="col-12 col-md-3">
            <RoomSlot title={t('views.room.slot_logs_title') || ''}>
              <Chat
                enabled={connectionStatus.status === 'connected'}
                history={state.log}
                onSend={handleChatSend}
              />
            </RoomSlot>
          </div>
        </div>
        
        <RoomSlot title="" className="d-flex mt-3">
          <Link
            to={'/join'}
            className="btn"
            onClick={(e) => handleLeave(e)}>{t('global.leave_room')}
          </Link>
        </RoomSlot>
      </>}
    </section>
  )
}
