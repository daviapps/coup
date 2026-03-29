import {
  Chat,
  GameBoard,
  PlayerCards,
  SocketProvider,
  StatusBar,
} from "@/features/classic-coup";
import { useGame } from "@/features/classic-coup";
import { ChatEntryItem } from "@/features/classic-coup/components/Chat";
import { Room3d } from "./Room3d";
import { useLocalState } from "@daviapps/react-utils";
import { BoxIcon, LockIcon, MessageCircleIcon, MonitorIcon, XIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "@/services/api";
import type { RoomInfo } from "@coup/shared/types";
import * as S from "./styles";

export default function GameRoom() {
  const { id } = useParams();
  const { t } = useTranslation();

  const [username] = useLocalState<string | undefined>({
    key: "username",
  });

  const [, setRoomId] = useLocalState<string>({
    key: "room_id ",
    initialState: id,
  });

  const [password, setPassword] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [needsPassword, setNeedsPassword] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    id && setRoomId(id);
  }, [id, setRoomId]);

  // Check room info on mount — verify password if room is protected
  useEffect(() => {
    if (!id) return;

    api
      .get(`/rooms/${id}`)
      .then((res) => {
        const info = res.data as RoomInfo;
        if (!info.hasPassword) {
          setAuthorized(true);
          setLoading(false);
          return;
        }

        // Room has password — try stored password
        const stored = localStorage.getItem("room_password") || "";
        if (stored) {
          api
            .post(`/rooms/${id}/check-password`, { password: stored })
            .then(() => {
              setPassword(stored);
              setAuthorized(true);
              setLoading(false);
            })
            .catch(() => {
              localStorage.removeItem("room_password");
              setNeedsPassword(true);
              setLoading(false);
            });
        } else {
          setNeedsPassword(true);
          setLoading(false);
        }
      })
      .catch(() => {
        setError("global.room_not_found");
        setLoading(false);
      });
  }, [id]);

  const handlePasswordSubmit = useCallback(() => {
    if (!id) return;
    setError("");

    api
      .post(`/rooms/${id}/check-password`, { password })
      .then(() => {
        localStorage.setItem("room_password", password);
        setAuthorized(true);
      })
      .catch((err) => {
        if (err.response) {
          setError(err.response.data.message || "global.unexpected_error");
        } else {
          setError("global.unexpected_error");
        }
      });
  }, [id, password]);

  if (!id || !username) return <Navigate to="/join" />;

  if (loading) return null;

  if (error && !needsPassword) {
    return (
      <S.PasswordGate>
        <S.PasswordCard>
          <S.PasswordError>{t(error)}</S.PasswordError>
        </S.PasswordCard>
      </S.PasswordGate>
    );
  }

  if (needsPassword && !authorized) {
    return (
      <S.PasswordGate>
        <S.PasswordCard>
          <LockIcon
            size={32}
            style={{ alignSelf: "center", color: "var(--colors-comment)" }}
          />
          <S.PasswordTitle>{t("global_fields.password.label")}</S.PasswordTitle>
          <S.PasswordSubtitle>
            {t("game.password_required", { room: id.toUpperCase() })}
          </S.PasswordSubtitle>
          <S.PasswordInput
            type="password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setPassword(e.target.value)
            }
            onKeyDown={(e: React.KeyboardEvent) =>
              e.key === "Enter" && handlePasswordSubmit()
            }
            placeholder="••••••"
            autoFocus
          />
          {error && <S.PasswordError>{t(error)}</S.PasswordError>}
          <S.PasswordButton onClick={handlePasswordSubmit}>
            {t("views.join.submit")}
          </S.PasswordButton>
        </S.PasswordCard>
      </S.PasswordGate>
    );
  }

  return (
    <SocketProvider roomId={id} username={username} password={password}>
      <RoomContent />
    </SocketProvider>
  );
}

function RoomContent() {
  const { state, sendChatMessage, socketId } = useGame();
  const { t } = useTranslation();
  const [chatOpen, setChatOpen] = useState(false);
  const [view3d, setView3d] = useState(false);
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

  if (view3d) {
    return (
      <div style={{ width: "100%", height: "100%", position: "relative" }}>
        <Room3d />
        <S.ViewToggle onClick={() => setView3d(false)}>
          <MonitorIcon /> 2D
        </S.ViewToggle>
      </div>
    );
  }

  return (
    <S.Wrapper>
      <GameBoard />
      <PlayerCards />
      <Chat />
      <StatusBar />

      <S.ViewToggle onClick={() => setView3d(true)}>
        <BoxIcon /> 3D
      </S.ViewToggle>

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
              placeholder={t("components.chat.input_placeholder") || ""}
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
