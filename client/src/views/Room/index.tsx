import {
  Chat,
  GameBoard,
  PlayerCards,
  SocketProvider,
  StatusBar,
} from "@/features/classic-coup";
import { useGame } from "@/features/classic-coup";
import { ChatEntryItem } from "@/features/classic-coup/components/Chat";
import { useLocalState } from "@daviapps/react-utils";
import { MessageCircleIcon, XIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
    <SocketProvider roomId={id} username={username}>
      <RoomContent />
    </SocketProvider>
  );
}

function RoomContent() {
  const { state, sendChatMessage, socketId } = useGame();
  const { t } = useTranslation();
  const [chatOpen, setChatOpen] = useState(false);
  const [lastSeenCount, setLastSeenCount] = useState(0);
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState<string | undefined>(undefined);
  const scrollRef = useRef<HTMLDivElement>(null);

  const hasUnread = state.logs.length > lastSeenCount;
  const currentPlayer = state.players.find((p) => p.id === socketId);

  useEffect(() => {
    if (chatOpen) {
      setLastSeenCount(state.logs.length);
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }
  }, [chatOpen, state.logs.length]);

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed) return;
    sendChatMessage(trimmed, target);
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <S.Wrapper>
      <GameBoard />
      <PlayerCards />
      <Chat />
      <StatusBar />

      <S.MobileChatToggle
        data-open={String(chatOpen)}
        onClick={() => setChatOpen((o) => !o)}
      >
        {chatOpen ? <XIcon /> : <MessageCircleIcon />}
        {!chatOpen && hasUnread && <S.MobileChatBadge />}
      </S.MobileChatToggle>

      {chatOpen && (
        <S.MobileChatOverlay>
          <S.MobileChatMessages ref={scrollRef}>
            {state.logs.map((entry, i) => (
              <ChatEntryItem
                key={i}
                entry={entry}
                currentUsername={currentPlayer?.username}
              />
            ))}
          </S.MobileChatMessages>
          <S.MobileChatInput>
            <select
              value={target || ""}
              onChange={(e) => setTarget(e.target.value || undefined)}
              style={{
                background: "var(--colors-current-line)",
                color: "var(--colors-foreground)",
                border: "1px solid var(--colors-comment)",
                borderRadius: 4,
                padding: "4px",
                fontSize: 11,
                maxWidth: 100,
              }}
            >
              <option value="">{t("chat.target_everyone")}</option>
              {state.players
                .filter((p) => p.id !== socketId)
                .map((p) => (
                  <option key={p.username} value={p.username}>
                    {t("chat.target_whisper", { player: p.username })}
                  </option>
                ))}
            </select>
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("components.chat.input_placeholder")}
              maxLength={200}
              style={{
                flex: 1,
                background: "var(--colors-current-line)",
                color: "var(--colors-foreground)",
                border: "1px solid var(--colors-comment)",
                borderRadius: 4,
                padding: "4px 8px",
                fontSize: 13,
                minWidth: 0,
              }}
            />
            <button
              onClick={handleSend}
              style={{
                background: "var(--colors-primary)",
                color: "var(--colors-background)",
                border: "none",
                borderRadius: 4,
                padding: "4px 10px",
                fontSize: 12,
                fontWeight: "bold",
                cursor: "pointer",
                textTransform: "uppercase",
              }}
            >
              {t("components.chat.send_btn")}
            </button>
          </S.MobileChatInput>
        </S.MobileChatOverlay>
      )}
    </S.Wrapper>
  );
}
