import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useGame } from "../../hooks/use-game";
import type { LogData } from "@coup/shared/types";
import * as S from "./styles";

export function Chat() {
  const { state, sendChatMessage, socketId } = useGame();
  const { t } = useTranslation();
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState<string | undefined>(undefined);
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentPlayer = state.players.find((p) => p.id === socketId);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [state.logs.length]);

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
      <S.Title>{t("views.room.slot_chat_title")}</S.Title>
      <S.MessagesContainer ref={scrollRef}>
        {state.logs.map((entry, i) => (
          <ChatEntryItem
            key={i}
            entry={entry}
            currentUsername={currentPlayer?.username}
          />
        ))}
      </S.MessagesContainer>
      <S.InputArea>
        <S.TargetSelect
          value={target || ""}
          onChange={(e) => setTarget(e.target.value || undefined)}
        >
          <option value="">{t("chat.target_everyone")}</option>
          {state.players
            .filter((p) => p.id !== socketId)
            .map((p) => (
              <option key={p.username} value={p.username}>
                {t("chat.target_whisper", { player: p.username })}
              </option>
            ))}
        </S.TargetSelect>
        <S.MessageInput
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t("components.chat.input_placeholder")}
          maxLength={200}
        />
        <S.SendButton onClick={handleSend}>
          {t("components.chat.send_btn")}
        </S.SendButton>
      </S.InputArea>
    </S.Wrapper>
  );
}

function ChatEntryItem({
  entry,
  currentUsername,
}: {
  entry: LogData;
  currentUsername?: string;
}) {
  const { t } = useTranslation();

  // Game log
  if (entry.type !== "chat") {
    const { message, ...props } = entry;
    return <S.LogEntry>{t(message, props)}</S.LogEntry>;
  }

  // Whisper (private message)
  if (entry.receiver) {
    const isSender = entry.sender === currentUsername;
    const tag = isSender
      ? t("chat.whisper_to", { receiver: entry.receiver })
      : t("chat.whisper_from", { sender: entry.sender });

    return (
      <S.WhisperEntry>
        <S.WhisperTag>{tag}</S.WhisperTag>
        {entry.message}
      </S.WhisperEntry>
    );
  }

  // Public chat
  return (
    <S.ChatEntry>
      <S.ChatSender>{entry.sender}:</S.ChatSender>
      {entry.message}
    </S.ChatEntry>
  );
}

// Exported for use in mobile overlay
export { ChatEntryItem };
