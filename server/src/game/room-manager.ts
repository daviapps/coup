import { logger } from "@/services/logger";
import { Socket } from "socket.io";
import { GameRoom } from "./room";

class RoomManager {
  private rooms: Map<string, GameRoom> = new Map();

  constructor() {
    if (process.env.NODE_ENV !== "production") {
      const demoRoom = new GameRoom("Pardall");
      demoRoom.id = "XPTO";
      this.rooms.set(demoRoom.id, demoRoom);
    }
  }

  public createRoom(owner: string): GameRoom {
    let room;

    do {
      room = new GameRoom(owner);
    } while (this.rooms.get(room.id));

    this.rooms.set(room.id, room);

    logger.info(`Room created [${room.id.toUpperCase()}]`);
    return room;
  }

  public destroyRoom(roomId: string) {
    const room = roomManager.findRoomById(roomId);
    if (!room) throw new Error("room_not_found");

    room.abort();
    this.rooms.delete(roomId);
  }

  public findRoomByPlayerSocket(socket: Socket) {
    for (let [_, room] of this.rooms.entries()) {
      if (room.findPlayerBySocketId(socket.id)) return room;
    }
  }

  public findRoomById(roomId: string): GameRoom | undefined {
    return this.rooms.get(roomId.toUpperCase());
  }

  public list() {
    return Array.from(this.rooms.values());
  }
}

export const roomManager = new RoomManager();
