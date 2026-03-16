import { Player, State } from "../lib/types";
import { getRandomInt } from "../lib/utils";
import type { Server } from "socket.io";

export default class Room {
  io: Server;
  state: State;

  constructor(io: Server, owner_username?: string) {
    this.io = io;
    this.state = {
      players: [],
      log: [],
    };
  }

  playerJoin(socket_id: string, username: string) {
    const indexOfPlayer = this.state.players.findIndex(
      (p) => p.username === username,
    );

    if (indexOfPlayer !== -1) {
      this.state.players[indexOfPlayer].socket_id = socket_id;
      this.state.players[indexOfPlayer].active = true;
    } else {
      this.state.players.push({
        socket_id,
        active: true,
        username: username,
      });
      this.log("server", "log.player_Joined", username);
    }

    this.notifyState(["log", "players"]);
  }

  playerLeave(username: string) {
    const indexOfPlayer = this.state.players.findIndex(
      (p) => p.username === username,
    );
    if (indexOfPlayer === -1) return;

    this.io.to(this.state.players[indexOfPlayer].socket_id).disconnectSockets();
    this.state.players.splice(indexOfPlayer, 1);
    this.log("server", "log.player_left", username);
    this.notifyState(["log", "players"]);
  }

  playerReconnected(socket_id: string, username: string) {
    const player = this.state.players.find((p) => p.username === username);
    if (!player) return;
    player.active = true;
    player.socket_id = socket_id;
    this.log("server", "log.player_reconnected", username);
    this.notifyState(["log", "players"]);
  }

  playerDisconnected(socket_id: string, username: string): void {
    const player = this.state.players.find((p) => p.socket_id === socket_id);
    if (!player) return;
    player.active = false;
    this.log("server", "log.player_disconnected", username);
    this.notifyState(["log", "players"]);
  }

  hasPlayer(username: string): boolean {
    return this.state.players.findIndex((p) => p.username === username) !== -1;
  }

  findPlayer(username: string): Player | undefined {
    return this.state.players.find((p) => p.username === username);
  }

  playerCount(): number {
    return this.state.players.length;
  }

  log(origin: string, message: string, sender?: string, receiver?: string) {
    if (!message || !origin) return;
    this.state.log.push({
      origin,
      message,
      sender: sender || origin,
      receiver,
    });
  }

  finish(): void {
    this.#disconnectAll();
  }

  notifyState(keys?: Array<keyof State>, username_list?: string[]) {
    const keysOfState = Object.keys(this.state) as Array<
      keyof typeof this.state
    >;
    const stateToNotify = keysOfState.reduce<Partial<State>>((ac, key) => {
      if (keys && !keys.includes(key)) return ac;
      return { ...ac, [key]: this.state[key] };
    }, {});

    const playersByUsername = username_list
      ? this.state.players.filter((p) => username_list.includes(p.username))
      : [];
    const playersToNotify =
      playersByUsername.length > 0 ? playersByUsername : this.state.players;

    for (let player of playersToNotify) {
      this.io.to(player.socket_id).emit("state", stateToNotify);
    }
  }

  #disconnectAll() {
    for (let player of this.state.players) {
      this.io.to(player.socket_id).disconnectSockets();
    }
  }
}

function getRandomInfluence() {
  const allInfluences = [
    "Duke",
    "Assassin",
    "Contessa",
    "Captain",
    "Ambassador",
  ];
  return allInfluences[getRandomInt(0, allInfluences.length)];
}
