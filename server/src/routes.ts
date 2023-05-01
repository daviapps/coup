import type { FastifyInstance } from "fastify";
import RoomController from "controllers/RoomController";

export default function routes(app: FastifyInstance, opts: any, done: Function){
  app.get('/', (req) => {
    return {
      message: 'Teste'
    }
  });

  app.get('/rooms', RoomController.index);
  app.get('/rooms/:room_id', RoomController.read);
  app.post('/rooms/:room_id/check', RoomController.check);
  app.post('/rooms', RoomController.store);
  app.delete('/rooms/:room_id', RoomController.destroy);

  done();
}
