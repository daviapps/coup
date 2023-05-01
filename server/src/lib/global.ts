import { Server } from "socket.io";
import Room from "../models/room";
import { RoomInfo } from "./types";
import { generateSimpleIdentifier } from "./utils";
//import { UserSession } from "./types";

//export const connectedUsers: {[key: string]: UserSession} = {};
//export const rooms:{[key: string]: Room} = {};

const room_list:{[key: string]: Room} = {};

export const rooms = {
  find: (room_id: string) : Room | null => {
    return room_list[room_id.toLowerCase()] || null
  },
  create: (io: Server, owner_username?:string, room_id?: string) : string | null => {
    for(let attempts = 0; attempts < 3; attempts++){
      const id = (room_id || generateSimpleIdentifier()).toLowerCase();
      if(rooms.find(id)) continue;
      room_list[id] = new Room(io, owner_username);
      console.log(`Room [${id.toUpperCase()}] was created${
        owner_username ? ` by ${owner_username}` : ''
      }`);
      return id;
    }
    return null;
  },
  destroy: (room_id: string) : boolean => {
    const room = rooms.find(room_id);
    if(!room) return false;
    room.finish();
    delete room_list[room_id];
    console.log(`Room [${room_id.toUpperCase()}] was destroyed`);
    return true;
  },
  info: (room_id: string) : RoomInfo | null => {
    const room = rooms.find(room_id);
    if(!room) return null;
    return {
      id: room_id,
      player_count: room.state.players.length
    };
  },
  list_info: () : RoomInfo[] => {
    return Object.keys(room_list).map((room_id: string) => rooms.info(room_id) as RoomInfo);
  }
};

