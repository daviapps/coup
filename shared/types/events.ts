import {
  Character,
  GameSnapshot,
  LogData,
  Player,
  PlayerActionType,
} from "./game";

export type PlayerActionEventPayload = {
  type: PlayerActionType;
  targetId?: string;
};

export type PlayerBlockEventPayload = {
  character: Character;
};

export type PlayerDiscardEventPayload = {
  cardIndex: number;
};

export type ChatMessageEventPayload = {
  message: string;
  targetUsername?: string;
};

export type PlayerChallengeEventPayload = {
  challenge: boolean;
};

export type PlayerJoinEventPayload = {
  roomId: string;
  username: string;
  password?: string;
};

export type PlayerJoinedEventData = {
  player: Player;
};

export type PlayerLeavedEventData = {
  username: string;
};

export type PlayerDisconnectedEventData = {
  username: string;
};

export type PlayerReconnectedEventData = {
  username: string;
};

export type ServerAnnouncementEventData = {
  message: string;
  timestamp: Date;
};

export type ErrorEventData = {
  message: string;
};

export type SyncEventData = {
  snapshot: GameSnapshot;
};

export type LogEventData = {
  log: LogData;
};
