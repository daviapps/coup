import { State } from "lib/types";
import { getRandomInt } from "lib/utils";
import { Server } from "socket.io";

export default class Room {
  io: Server;
  state: State;

  constructor(io: Server){
    this.io = io;
    this.state = {
      players: []
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
        username: username,
        influences: [getRandomInfluence(), getRandomInfluence()],
        money: 2
      });
    }

    this.#notifyState();
  }

  playerLeave(username: string){
    const player = this.state.players.find((p => p.username === username));
    if(!player) return;
    player.active = false;
    this.#notifyState();
  }

  hasPlayer(username: string): boolean {
    return this.state.players.findIndex(p => p.username === username) !== -1;
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
