import { logger } from "@/services/logger";
import {
  GameSnapshot,
  LogData,
  Player,
  SyncEventData,
} from "@coup/shared/types";
import { Server } from "socket.io";

let io: Server;

export const initEmitter = (ioInstance: Server) => {
  io = ioInstance;
};

export const GameEmitter = {
  playerJoined(roomId: string, player: Player) {
    io.to(roomId).emit("player:joined", { player });
  },

  playerLeaved(roomId: string, username: string) {
    io.to(roomId).emit("player:leaved", { username });
  },

  playerReconnected(roomId: string, username: string) {
    io.to(roomId).emit("player:reconnected", { username });
  },

  playerDisconnected(roomId: string, username: string) {
    io.to(roomId).emit("player:disconnected", { username });
  },

  syncGame(target: string, snapshot: GameSnapshot) {
    io.to(target).emit("game:sync", {
      snapshot,
    });
  },

  logRoom(roomId: string, log: LogData) {
    io.to(roomId).emit("room:log", {
      log,
    });
  },

  serverAnnouncement(message: string) {
    io.emit("server:announcement", { message, timestamp: Date.now() });
  },

  error(targetId: string, message: string) {
    io.to(targetId).emit("error", { message });
  },
};
