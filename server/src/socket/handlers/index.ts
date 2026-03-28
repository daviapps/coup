import { roomManager } from "@/game/room-manager";
import { Server, Socket } from "socket.io";
import {
  ChatMessageEventPayload,
  PlayerActionEventPayload,
  PlayerBlockEventPayload,
  PlayerChallengeEventPayload,
  PlayerDiscardEventPayload,
  PlayerJoinEventPayload,
} from "@coup/shared/types";
import { GameEmitter } from "../emitter";

export const registerHandlers = (io: Server, socket: Socket) => {
  socket.on(
    "player:join",
    ({ username, roomId, password }: PlayerJoinEventPayload) => {
      if (typeof username !== "string")
        return GameEmitter.error(socket.id, "Username is mandatory");
      if (typeof roomId !== "string")
        return GameEmitter.error(socket.id, "RoomId is mandatory");

      const room = roomManager.findRoomById(roomId);
      if (!room) return GameEmitter.error(socket.id, "global.room_not_found");

      // Allow reconnection without password
      const existingPlayer = room.findPlayerByUsername(username);
      if (!existingPlayer && room.password && room.password !== password) {
        return GameEmitter.error(socket.id, "global.wrong_password");
      }

      room.handleJoin(socket, username);
    },
  );

  socket.on("game:start", () => {
    const room = roomManager.findRoomByPlayerSocket(socket);
    room?.handleStart(socket);
  });

  socket.on("game:restart", () => {
    const room = roomManager.findRoomByPlayerSocket(socket);
    room?.handleRestart(socket);
  });

  socket.on("player:action", (payload: PlayerActionEventPayload) => {
    const room = roomManager.findRoomByPlayerSocket(socket);
    room?.handlePlayerAction(socket, payload);
  });

  socket.on("player:challenge", (payload: PlayerChallengeEventPayload) => {
    const room = roomManager.findRoomByPlayerSocket(socket);
    room?.handleChallenge(socket, payload.challenge);
  });

  socket.on("player:block", (payload: PlayerBlockEventPayload) => {
    const room = roomManager.findRoomByPlayerSocket(socket);
    room?.handleBlock(socket, payload.character);
  });

  socket.on("player:discard", (payload: PlayerDiscardEventPayload) => {
    const room = roomManager.findRoomByPlayerSocket(socket);
    room?.handleDiscard(socket, payload.cardIndex);
  });

  socket.on(
    "chat:message",
    ({ message, targetUsername }: ChatMessageEventPayload) => {
      if (typeof message !== "string" || message.trim().length === 0) return;
      if (message.length > 200) return;

      const room = roomManager.findRoomByPlayerSocket(socket);
      if (!room) return;

      room.handleChatMessage(socket, message.trim(), targetUsername);
    },
  );

  socket.on("disconnect", () => {
    const room = roomManager.findRoomByPlayerSocket(socket);
    room?.handleDisconnect(socket);
  });
};
