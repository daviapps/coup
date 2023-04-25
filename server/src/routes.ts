import { FastifyInstance } from "fastify";
import RoomController from './controllers/RoomController';

export default function routes(app: FastifyInstance, opts, done){
  app.get('/', (req) => {
    return {
      message: 'Teste'
    }
  });

  app.post('/room', RoomController.store);

  done();
}
