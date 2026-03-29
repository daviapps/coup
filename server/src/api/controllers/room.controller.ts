import { roomManager } from "@/game/room-manager";
import {
  RoomControllerAnalyzeBody,
  RoomControllerAnalyzeParams,
  RoomControllerCreatePayload,
  RoomControllerInfoParams,
} from "@coup/shared/types";
import { FastifyReply, FastifyRequest } from "fastify";

function badRequest(res: FastifyReply, message: string) {
  return res.status(400).send({ success: false, message });
}

export async function createRoom(
  req: FastifyRequest<{ Body: RoomControllerCreatePayload }>,
  res: FastifyReply,
) {
  const { username, password } = req.body;
  if (!username) return badRequest(res, "Username is mandatory");

  const room = roomManager.createRoom(username, password);
  return res.send(room.info());
}

export async function analyzeRoom(
  req: FastifyRequest<{
    Params: RoomControllerAnalyzeParams;
    Body: RoomControllerAnalyzeBody;
  }>,
  res: FastifyReply,
) {
  const { roomId } = req.params;
  if (!roomId) return badRequest(res, "RoomId is mandatory");

  const room = roomManager.findRoomById(roomId);
  if (!room) return badRequest(res, "global.room_not_found");

  const { username, password } = req.body;
  if (!username) return badRequest(res, "Username is mandatory");

  if (room.password && room.password !== password) {
    return badRequest(res, "global.wrong_password");
  }

  const usernameAlreadyOnRoom = room.findPlayerByUsername(username)?.active;

  if (usernameAlreadyOnRoom)
    return badRequest(res, "global.player_already_connected");

  if (room.phase() !== "LOBBY")
    return badRequest(res, "global.game_already_started");

  return res.send(room.info());
}

export async function checkPassword(
  req: FastifyRequest<{
    Params: RoomControllerAnalyzeParams;
    Body: { password?: string };
  }>,
  res: FastifyReply,
) {
  const { roomId } = req.params;
  const room = roomManager.findRoomById(roomId);
  if (!room) return badRequest(res, "global.room_not_found");

  if (room.password && room.password !== req.body?.password) {
    return badRequest(res, "global.wrong_password");
  }

  return res.send({ success: true });
}

export async function getAllRoomsInfo(req: FastifyRequest, res: FastifyReply) {
  const infos = roomManager
    .list()
    .filter((room) => room.phase() === "LOBBY")
    .map((it) => it.info());
  return res.send(infos);
}

export async function getRoomInfo(
  req: FastifyRequest<{
    Params: RoomControllerInfoParams;
  }>,
  res: FastifyReply,
) {
  const { roomId } = req.params;
  const room = roomManager.findRoomById(roomId);
  if (!room) return badRequest(res, "global.room_not_found");

  return res.send(room.info());
}
