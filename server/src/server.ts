import fastify from "fastify";
import fastifyIO from "fastify-socket.io";
import routes from "./routes";
import { rooms } from "./lib/global";
import Room from "models/room";

const app = fastify();
app.register(fastifyIO, {
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
    /* Player connection */
    const { username } = socket.handshake.query;
    if(typeof username !== 'string') return;

    console.log(`User '${username}' [${socket.id}] connected.`);
    
    socket.on('join', ({ room_id }, callback) => {
      const room = rooms[room_id];

      if(!room)
        return callback({ found: false });

      room.playerJoin(socket.id, username);

      callback({ found: true, state: room.state });
    });

    socket.on('disconnect', () => {
      console.log(`User '${username}' [${socket.id}] disconnected.`);

      const room = Object.values(rooms).find(room => room.hasPlayer(username));
      if(!room) return;

      room.playerLeave(username);
    });
  });
});

app.addHook('preHandler', (req, res, done) => {
  // example logic for conditionally adding headers
  //const allowedPaths = ["/some", "/list", "/of", "/paths"];
  //if (allowedPaths.includes(req.routerPath)) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "*");
    res.header("Access-Control-Allow-Headers",  "*");
  //}

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
