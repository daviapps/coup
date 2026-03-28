import createSocket from "@/services/socket-io";
import {
  ChatMessageEventPayload,
  ErrorEventData,
  GameSnapshot,
  LogEventData,
  PlayerActionEventPayload,
  PlayerBlockEventPayload,
  PlayerChallengeEventPayload,
  PlayerDiscardEventPayload,
  PlayerDisconnectedEventData,
  PlayerJoinedEventData,
  PlayerJoinEventPayload,
  PlayerLeavedEventData,
  PlayerReconnectedEventData,
  ServerAnnouncementEventData,
  SyncEventData,
} from "@coup/shared/types";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useEffect,
  useReducer,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { Socket } from "socket.io-client";
import { gameReducer, initialState } from "../store/game-reducer";

type SocketContextState = {
  state: GameSnapshot;
  join: () => void;
  start: () => void;
  restart: () => void;
  action: (payload: PlayerActionEventPayload) => void;
  block: (payload: PlayerBlockEventPayload) => void;
  challenge: (payload: PlayerChallengeEventPayload) => void;
  discard: (payload: PlayerDiscardEventPayload) => void;
  sendChatMessage: (message: string, targetUsername?: string) => void;
  socketId: string;
  myTurn: boolean;
};

export const SocketContext = createContext<SocketContextState | null>(null);

export type SocketProviderProps = PropsWithChildren & {
  username: string;
  roomId: string;
  password?: string;
  onDisconnect?: () => void;
};

export function SocketProvider({
  children,
  username,
  roomId,
  password,
  onDisconnect,
}: SocketProviderProps) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const { t } = useTranslation();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const socket = createSocket({
      query: { username, roomId },
    });

    setSocket(socket);

    return () => {
      socket.disconnect();
      setSocket(null);
    };
  }, [setSocket, roomId, username]);

  useEffect(() => {
    if (!socket) return;

    const onSync = (data: SyncEventData) => {
      dispatch({ type: "SYNC", data });
    };
    const onPlayerJoined = (data: PlayerJoinedEventData) => {
      dispatch({ type: "PLAYER_JOINED", data });
    };
    const onPlayerLeaved = (data: PlayerLeavedEventData) => {
      dispatch({ type: "PLAYER_LEAVED", data });
    };
    const onPlayerDisconnected = (data: PlayerDisconnectedEventData) => {
      dispatch({ type: "PLAYER_DISCONNECTED", data });
    };
    const onPlayerReconnected = (data: PlayerReconnectedEventData) => {
      dispatch({ type: "PLAYER_RECONNECTED", data });
    };
    const onRoomLog = (data: LogEventData) => {
      dispatch({ type: "ROOM_LOG", data });
    };
    const onChatMessage = (data: LogEventData) => {
      dispatch({ type: "CHAT_MESSAGE", data });
    };
    const onAnnouncement = ({ message }: ServerAnnouncementEventData) => {
      toast.info(t(message), { autoClose: 1000 });
    };
    const onError = ({ message }: ErrorEventData) => {
      toast.error(t(message) || message, { autoClose: 1000 });
    };
    const onDisconnectEvent = () => {
      onDisconnect?.();
    };

    socket.on("game:sync", onSync);
    socket.on("player:joined", onPlayerJoined);
    socket.on("player:leaved", onPlayerLeaved);
    socket.on("player:disconnected", onPlayerDisconnected);
    socket.on("player:reconnected", onPlayerReconnected);
    socket.on("room:log", onRoomLog);
    socket.on("chat:message", onChatMessage);
    socket.on("server:announcement", onAnnouncement);
    socket.on("error", onError);
    socket.on("disconnect", onDisconnectEvent);

    return () => {
      socket.off("game:sync", onSync);
      socket.off("player:joined", onPlayerJoined);
      socket.off("player:leaved", onPlayerLeaved);
      socket.off("player:disconnected", onPlayerDisconnected);
      socket.off("player:reconnected", onPlayerReconnected);
      socket.off("room:log", onRoomLog);
      socket.off("chat:message", onChatMessage);
      socket.off("server:announcement", onAnnouncement);
      socket.off("error", onError);
      socket.off("disconnect", onDisconnectEvent);
    };
  }, [socket, t, onDisconnect]);

  const handleJoin = useCallback<SocketContextState["join"]>(() => {
    socket?.emit("player:join", {
      roomId: roomId,
      username: username,
      password: password || undefined,
    } satisfies PlayerJoinEventPayload);
  }, [roomId, socket, username, password]);

  const handleStart = useCallback<SocketContextState["start"]>(() => {
    socket?.emit("game:start");
  }, [socket]);

  const handleRestart = useCallback<SocketContextState["restart"]>(() => {
    socket?.emit("game:restart");
  }, [socket]);

  const handleAction = useCallback<SocketContextState["action"]>(
    (payload) => {
      socket?.emit("player:action", payload);
    },
    [socket],
  );

  const handleBlock = useCallback<SocketContextState["block"]>(
    (payload) => {
      socket?.emit("player:block", payload);
    },
    [socket],
  );

  const handleChallenge = useCallback<SocketContextState["challenge"]>(
    (payload) => {
      socket?.emit("player:challenge", payload);
    },
    [socket],
  );

  const handleDiscard = useCallback<SocketContextState["discard"]>(
    (payload) => {
      socket?.emit("player:discard", payload);
    },
    [socket],
  );

  const handleSendChatMessage = useCallback<
    SocketContextState["sendChatMessage"]
  >(
    (message, targetUsername) => {
      socket?.emit("chat:message", {
        message,
        targetUsername,
      } satisfies ChatMessageEventPayload);
    },
    [socket],
  );

  return (
    <SocketContext.Provider
      value={{
        socketId: socket?.id || "",
        myTurn: socket?.id === state.currentTurn,
        state,
        join: handleJoin,
        start: handleStart,
        restart: handleRestart,
        action: handleAction,
        block: handleBlock,
        challenge: handleChallenge,
        discard: handleDiscard,
        sendChatMessage: handleSendChatMessage,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

// function SocketEmitter<Payload, Result extends EventResult = EventResult>(
//   socket: Socket | null,
//   ev: string,
// ) {
//   return function (payload?: Payload): Promise<Result> {
//     return new Promise((resolve, reject) => {
//       if (!socket) return;
//       socket.emit(ev, payload, (result: Result) => {
//         if (result.success) {
//           resolve(result);
//         } else {
//           toast.error(result.message);
//           return reject(new Error(result.message));
//         }
//       });
//     });
//   };
// }
