import { Player, State } from "lib/types";
import { getRandomInt } from "lib/utils";
import { Server } from "socket.io";

export default class Room {
  io: Server;
  state: State;

  constructor(io: Server, owner_username?:string){
    this.io = io;
    this.state = {
      players: [],
      log: []
    }
  }

  playerJoin(socket_id: string, username: string){
    const indexOfPlayer = this.state.players.findIndex((p => p.username === username));

    if(indexOfPlayer !== -1) {
      this.state.players[indexOfPlayer].socket_id = socket_id;
      this.state.players[indexOfPlayer].active = true;
    }
    else {
      this.state.players.push({
        socket_id,
        active: true,
        username: username
      });
      this.log('server', `${username} joined the room`);
    }

    this.#notifyState();
  }

  playerLeave(username: string){
    const indexOfPlayer = this.state.players.findIndex((p => p.username === username));
    if(indexOfPlayer === -1) return;

    this.state.players.splice(indexOfPlayer, 1);
    this.log('server', `${username} leaved the room`);
    this.#notifyState();
  }

  playerReconnected(socket_id: string, username: string){
    const player = this.state.players.find((p => p.username === username));
    if(!player) return;
    player.active = true;
    player.socket_id = socket_id;
    this.log('server', `${username} reconnected`);
    this.#notifyState();
  }

  playerDisconnected(socket_id: string, username: string): void{
    const player = this.state.players.find((p => p.socket_id === socket_id));
    if(!player) return;
    player.active = false;
    this.log('server', `${username} disconnected`);
    this.#notifyState();
  }

  hasPlayer(username: string): boolean {
    return this.state.players.findIndex(p => p.username === username) !== -1;
  }

  findPlayer(username: string): Player | undefined {
    return this.state.players.find(p => p.username === username);
  }

  log(origin: string, message: string, notify = false){
    if(!message || !origin) return;
    this.state.log.push({
      origin, message
    });

    if(notify)
      this.#notifyState();
  }

  #notifyState(){
    for(let player of this.state.players){
      this.io.to(player.socket_id).emit('state', this.state);
    }
  }
}

function getRandomInfluence(){
  const allInfluences = ['Duke', 'Assassin', 'Contessa', 'Captain', 'Ambassador'];
  return allInfluences[getRandomInt(0, allInfluences.length)];
}
