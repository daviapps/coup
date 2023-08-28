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

export type RoomInfo = {
  id: string;
  player_count: number;
  player_max: number;
}

// const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const

// type Values = { [K in typeof sizes[number]]: number }

// const values: Values = {
// 	xs: 0,
// 	sm: 600,
// 	md: 960,
// 	lg: 1280,
// 	xl: 1920
// }
