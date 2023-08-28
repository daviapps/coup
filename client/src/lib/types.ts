export type Player = {
  socket_id: string;
  username: string;
  influences: string[];
  money: number;
  active: boolean;
}

export type JoinCallbackProps = {
  success: boolean;
  message: string;
}

export type LogEvent = {
  origin: string;
  message: string;
  sender: string;
  receiver?: string;
};

export type State = {
  players: Player[];
  log: LogEvent[];
};

export type RoomInfo = {
  id: string;
  player_count: number;
  player_max: number;
}
