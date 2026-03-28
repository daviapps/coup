import { roomManager } from "@/game/room-manager";
import { BadRequestError } from "http-errors-enhanced";
import { Server, Socket } from "socket.io";
import { logger } from "@/services/logger";
import {
  PlayerActionEventPayload,
  PlayerChallengeEventPayload,
  PlayerJoinEventPayload,
} from "@coup/shared/types";
import { GameEmitter } from "../emitter";

export const registerHandlers = (io: Server, socket: Socket) => {
  socket.on("player:join", ({ username, roomId }: PlayerJoinEventPayload) => {
    if (typeof username !== "string")
      return GameEmitter.error(socket.id, "Username is mandatory");
    if (typeof roomId !== "string")
      return GameEmitter.error(socket.id, "RoomId is mandatory");

    const room = roomManager.findRoomById(roomId);
    if (!room) return GameEmitter.error(socket.id, "room_not_found");

    room.handleJoin(socket, username);
  });

  socket.on("game:start", () => {
    const room = roomManager.findRoomByPlayerSocket(socket);
    room?.handleStart(socket);
  });

  socket.on("player:action", (payload: PlayerActionEventPayload) => {
    const room = roomManager.findRoomByPlayerSocket(socket);
    room?.handlePlayerAction(socket, payload);
  });

  socket.on("player:challenge", (payload: PlayerChallengeEventPayload) => {
    const room = roomManager.findRoomByPlayerSocket(socket);
    room?.handleChallenge(socket, payload.challenge);
  });

  socket.on("disconnect", () => {
    const room = roomManager.findRoomByPlayerSocket(socket);
    room?.handleDisconnect(socket);
  });
};
