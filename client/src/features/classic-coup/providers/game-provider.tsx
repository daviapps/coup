import createSocket from "@/services/socket-io";
import {
  ErrorEventData,
  GameSnapshot,
  LogEventData,
  PlayerActionEventPayload,
  PlayerBlockEventPayload,
  PlayerChallengeEventPayload,
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
  action: (payload: PlayerActionEventPayload) => void;
  block: (payload: PlayerBlockEventPayload) => void;
  challenge: (payload: PlayerChallengeEventPayload) => void;
  socketId: string;
  myTurn: boolean;
};

export const SocketContext = createContext<SocketContextState | null>(null);

export type SocketProviderProps = PropsWithChildren & {
  username: string;
  roomId: string;
  onDisconnect?: () => void;
};

export function SocketProvider({
  children,
  username,
  roomId,
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
    socket.on("game:sync", (data: SyncEventData) => {
      console.debug("game:sync", data);
      dispatch({ type: "SYNC", data });
    });

    socket.on("player:joined", (data: PlayerJoinedEventData) => {
      console.debug("player:joined", data);
      dispatch({ type: "PLAYER_JOINED", data });
    });

    socket.on("player:leaved", (data: PlayerLeavedEventData) => {
      console.debug("player:leaved", data);
      dispatch({ type: "PLAYER_LEAVED", data });
    });

    socket.on("player:disconnected", (data: PlayerDisconnectedEventData) => {
      console.debug("player:disconnected", data);
      dispatch({ type: "PLAYER_DISCONNECTED", data });
    });

    socket.on("player:reconnected", (data: PlayerReconnectedEventData) => {
      console.debug("player:reconnected", data);
      dispatch({ type: "PLAYER_RECONNECTED", data });
    });

    socket.on("room:log", (data: LogEventData) => {
      console.debug("room:log", data);
      dispatch({ type: "ROOM_LOG", data });
    });

    socket.on(
      "server:announcement",
      ({ message }: ServerAnnouncementEventData) => {
        console.debug("server:announcement", t(message));
        toast.info(message, {
          autoClose: 1000,
        });
      },
    );

    socket.on("error", ({ message }: ErrorEventData) => {
      console.debug("error", message);
      toast.error(message || "Unknown error", {
        autoClose: 1000,
      });
    });

    socket.on("disconnect", () => {
      onDisconnect && onDisconnect();
    });
  }, [socket, t, onDisconnect]);

  const handleJoin = useCallback<SocketContextState["join"]>(() => {
    socket?.emit("player:join", {
      roomId: roomId,
      username: username,
    } satisfies PlayerJoinEventPayload);
  }, [roomId, socket, username]);

  const handleStart = useCallback<SocketContextState["start"]>(() => {
    socket?.emit("game:start");
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

  console.log({ currentTurn: state.currentTurn, socketId: socket?.id });

  return (
    <SocketContext.Provider
      value={{
        socketId: socket?.id || "",
        myTurn: socket?.id === state.currentTurn,
        state,
        join: handleJoin,
        start: handleStart,
        action: handleAction,
        block: handleBlock,
        challenge: handleChallenge,
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
