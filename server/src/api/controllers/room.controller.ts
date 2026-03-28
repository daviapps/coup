import { roomManager } from "@/game/room-manager";
import {
  RoomControllerAnalyzeBody,
  RoomControllerAnalyzeParams,
  RoomControllerCreatePayload,
  RoomControllerInfoParams,
} from "@coup/shared/types";
import { FastifyReply, FastifyRequest } from "fastify";
import { BadRequestError } from "http-errors-enhanced";

export async function createRoom(
  req: FastifyRequest<{ Body: RoomControllerCreatePayload }>,
  res: FastifyReply,
) {
  const { username } = req.body;
  if (!username) throw new BadRequestError("Username is mandatory");

  const room = roomManager.createRoom(username);
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
  if (!roomId) throw new BadRequestError("RoomId is mandatory");

  const room = roomManager.findRoomById(roomId);
  if (!room) throw new BadRequestError("Room not found");

  const { username } = req.body;
  if (!username) throw new BadRequestError("Username is mandatory");

  const usernameAlreadyOnRoom = room.findPlayerByUsername(username)?.active;

  if (usernameAlreadyOnRoom)
    throw new BadRequestError("This username is already taken");

  if (room.phase() !== "LOBBY")
    throw new BadRequestError("This game was already started");

  return res.send(room.info());
}

export async function getAllRoomsInfo(req: FastifyRequest, res: FastifyReply) {
  const infos = roomManager.list().map((it) => it.info());
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
  if (!room) throw new BadRequestError("Room not found");

  return res.send(room.info());
}
