import type { FastifyReply, FastifyRequest } from "fastify";
import { rooms } from "lib/global";

interface BodyType {
  username: string;
}

interface ParamsType {
  room_id: string;
}

async function index(){
  const list = rooms.list_info();

  return {
    result: list
  };
}

async function read(req: FastifyRequest<{ Params: ParamsType }>, res: FastifyReply){
  const { room_id } = req.params;
  const info = rooms.info(room_id);

  if(!info){
    res.status(400);
    return {
      message: 'global.room_not_found',
      error: 'Room Not Found'
    }
  }

  return {
    result: info
  };
}

async function check(req: FastifyRequest<{ Body: BodyType, Params: ParamsType }>, res: FastifyReply){
  const { room_id } = req.params;
  const { username } = req.body;

  const room = rooms.find(room_id);

  if(!room){
    res.status(400);
    return {
      message: 'global.room_not_found',
      error: 'Room Not Found'
    }
  }

  const player = room.findPlayer(username);

  if(player && player.active){
    res.status(400);
    return {
      message: 'global.player_already_connected',
      error: "There's already a player with this username in this room"
    }
  }

  const info = rooms.info(room_id);

  return {
    result: info
  };
}

async function store(req: FastifyRequest<{ Body: BodyType }>, res: FastifyReply){
  const { username } = req.body;

  if(!username){
    res.status(400);
    return {
      message: 'Username is mandatory'
    }
  }

  const room_id = rooms.create(req.server.io, username);

  if(!room_id){
    res.status(400);
    return {
      message: "global.probabilistic_error",
      error: "Probabilistic Error"
    }
  }

  return {
    room_id
  }
}

async function destroy(req: FastifyRequest<{ Params: ParamsType }>, res: FastifyReply){
  const { room_id } = req.params;
  const success = rooms.destroy(room_id);

  return {
    success
  }
}

const RoomController = {
  index,
  read,
  check,
  store,
  destroy
};

export default RoomController;
