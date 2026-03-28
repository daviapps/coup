import { RoomInfo } from "./game";

export type RoomControllerCreatePayload = {
  username: string;
};

export type RoomControllerCreateResult = RoomInfo;

export type RoomControllerAnalyzeParams = {
  roomId: string;
};

export type RoomControllerAnalyzeBody = {
  username: string;
};

export type RoomControllerInfoParams = {
  roomId: string;
};
