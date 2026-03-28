import {
  Chat,
  GameBoard,
  PlayerCards,
  SocketProvider,
  StatusBar,
} from "@/features/classic-coup";
import { useLocalState } from "@daviapps/react-utils";
import { useEffect } from "react";
import { Navigate, useParams } from "react-router-dom";
import * as S from "./styles";

export default function GameRoom() {
  const { id } = useParams();
  const [username] = useLocalState<string | undefined>({
    key: "username",
  });

  const [, setRoomId] = useLocalState<string>({
    key: "room_id ",
    initialState: id,
  });

  useEffect(() => {
    id && setRoomId(id);
  }, [id, setRoomId]);

  if (!id || !username) return <Navigate to="/join" />;

  return (
    <SocketProvider
      roomId={id}
      username={username}
      // onDisconnect={() => location.reload()}
    >
      <S.Wrapper>
        <GameBoard />
        <PlayerCards />
        <Chat />
        <StatusBar />
      </S.Wrapper>
    </SocketProvider>
  );
}
