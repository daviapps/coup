export type Player = {
  socket_id: string;
  username: string;
  active: boolean;

  influences?: string[];
  money?: number;
}

export type State = {
  players: Player[]
};

