export type Player = {
  socket_id: string;
  username: string;
  active: boolean;

  influences?: string[];
  money?: number;
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

