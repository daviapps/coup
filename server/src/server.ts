import fastify from "fastify";
import fastifyIO from "fastify-socket.io";
import routes from "./routes";
import { rooms } from "./lib/global";
import Room from "models/room";
import { JoinCallbackProps, LogEvent } from "lib/types";

const app = fastify();
app.register(fastifyIO, {
  pingTimeout: parseInt(process.env.SOCKET_IO_PING_TIMEOUT || '60000'),
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// app.get("/", (req, reply) => {
//   app.io.emit("hello");
// });

app.ready().then(() => {
  // Mockup
  rooms['xpto'] = new Room(app.io);

  app.io.on("connection", (socket) => {
    const { username, room_id } = socket.handshake.query;
    if(typeof username !== 'string') return;
    if(typeof room_id !== 'string') return;

    const room = rooms[room_id] || undefined;

    //Try reconnect
    if(room && room.hasPlayer(username) && !room.findPlayer(username)?.active){
      room.playerReconnected(socket.id, username);
      console.log(`User '${username}' [${socket.id}] reconnected.`);
    }
    else {
      console.log(`User '${username}' [${socket.id}] connected.`);
    }
    
    socket.on('join', ({}, callback: (p: JoinCallbackProps) => void) => {
      const room = rooms[room_id];

      if(!room){
        return callback({
          success: false,
          message: 'global.room_not_found'
        });
      }

      const player = room.findPlayer(username);
      if(player && player.socket_id !== socket.id){
        return callback({
          success: false,
          message: 'global.player_already_connected'
        });
      }

      if(!room.hasPlayer(username)){
        room.playerJoin(socket.id, username);

        return callback({
          success: true,
          message: `Connected | Room ${room_id.toUpperCase()}`
        });
      }

      return callback({
        success: true,
        message: `Reconnected | Room ${room_id.toUpperCase()}`
      });
    });

    socket.on('log', ({ message }: LogEvent) => {
      if(!room) return;
      room.log(username.trim(), message.trim());
      room.notifyState();
    });

    socket.on('leave', () => {
      console.log(`User '${username}' [${socket.id}] leaved.`);
      if(!room) return;
      room.playerLeave(username);
    });

    socket.on('disconnect', () => {
      console.log(`User '${username}' [${socket.id}] disconnected.`);
      if(room)
      room.playerDisconnected(socket.id, username);
    });
  });
});

app.addHook('preHandler', (req, res, done) => {
  const allowedPaths = ["/rooms"];
  if (allowedPaths.includes(req.url) || true) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "*");
    res.header("Access-Control-Allow-Headers",  "*");
  }

  const isPreflight = /options/i.test(req.method);
  if (isPreflight) {
    return res.send();
  }
      
  done();
});

app.register(routes);

app.listen({
  host: '0.0.0.0',
  port: process.env.PORT ? Number(process.env.PORT) : 3333
}).then(() => {
  console.log('Coup Server Running');
});
