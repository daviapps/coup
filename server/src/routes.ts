import type { FastifyInstance } from "fastify";
import { rooms } from "lib/global";
import Room from "models/room";
import RoomController from './controllers/RoomController';
import { generateSimpleIdentifier } from './lib/utils';

interface BodyType {
  username: string
}

export default function routes(app: FastifyInstance, opts: any, done: Function){
  app.get('/', (req) => {
    return {
      message: 'Teste'
    }
  });

  app.get<{ Params: BodyType }>('/rooms/:room_id', (req:any, res) => {
    const { room_id } = req.params;
    const { username } = req.query;

    const room = rooms[room_id.toLowerCase()];
    if(!room){
      res.status(400);
      return {
        message: 'global.room_not_found'
      }
    }

    const player = room.findPlayer(username);
    if(player && player.active){
      res.status(400);
      return {
        message: 'global.player_already_connected'
      }
    }

    return {
      message: 'Room exists'
    }
  });

  app.post<{ Body: BodyType }>('/rooms', (req, res) => {
    const { username } = req.body;

    if(!username){
      res.status(400);
      return {
        message: 'Username is mandatory'
      }
    }

    for(let attempts = 0; attempts < 3; attempts++){
      const room_id = generateSimpleIdentifier();
      if(rooms[room_id]) continue;

      rooms[room_id] = new Room(app.io, username);
      
      return {
        room_id
      }
    }
    
    res.status(400);
    return {
      message: "Probabilistic Error"
    }
  });

  done();
}
