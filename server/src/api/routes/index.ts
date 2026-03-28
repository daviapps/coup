import type { FastifyInstance } from "fastify";
import * as RoomController from "@/api/controllers/room.controller";
import * as StatusController from "@/api/controllers/status.controller";

export default function routes(
  app: FastifyInstance,
  opts: any,
  done: Function,
) {
  app.get("/", StatusController.ok);

  app.get("/rooms", RoomController.getAllRoomsInfo);
  app.get("/rooms/:roomId", RoomController.getRoomInfo);
  app.post("/rooms/:roomId/analyze", RoomController.analyzeRoom);
  app.post("/rooms/:roomId/check-password", RoomController.checkPassword);
  app.post("/rooms", RoomController.createRoom);

  done();
}
