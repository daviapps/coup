export type Player = {
  socket_id: string;
  username: string;
  influences: string[];
  money: number;
  active: boolean;
}

export type State = {
  players: Player[]
};

export type JoinCallbackProps = {
  success: boolean;
  message: string;
}
