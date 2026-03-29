import { fastifyEnv } from "@fastify/env";
import fastify from "fastify";
import fastifyIO from "fastify-socket.io";

import { logger } from "@/services/logger";
import { initEmitter } from "@/socket/emitter";
import { registerHandlers } from "@/socket/handlers";
import routes from "./api/routes";

export const app = fastify();
app.register(fastifyIO, {
  pingTimeout: parseInt(process.env.SOCKET_IO_PING_TIMEOUT || "60000"),
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const schema = {
  type: "object",
  required: ["ROOM_MAX_PLAYERS"],
  properties: {
    ROOM_MAX_PLAYERS: {
      type: "number",
      default: 6,
    },
  },
};

const options = {
  confKey: "config",
  schema,
  dotenv: true,
  data: process.env,
};

app.register(fastifyEnv, options);

// app.get("/", (req, reply) => {
//   app.io.emit("hello");
// });

app.ready().then(() => {
  initEmitter(app.io);

  app.io.on("connection", (socket) => {
    registerHandlers(app.io, socket);
  });

  // app.io.on("connection", (socket) => {
  //   const { username, room_id } = socket.handshake.query;
  //   if (typeof username !== "string") return;
  //   if (typeof room_id !== "string") return;

  //   const room = rooms.find(room_id);

  //   //Try reconnect
  //   if (
  //     room &&
  //     room.hasPlayer(username) &&
  //     !room.findPlayer(username)?.active
  //   ) {
  //     room.playerReconnected(socket.id, username);
  //     //console.log(`User '${username}' [${socket.id}] reconnected.`);
  //   } else {
  //     //console.log(`User '${username}' [${socket.id}] connected.`);
  //   }

  //   socket.on("join", ({}, callback: (p: JoinCallbackProps) => void) => {
  //     const room = rooms.find(room_id);

  //     if (!room) {
  //       return callback({
  //         success: false,
  //         message: "global.room_not_found",
  //       });
  //     }

  //     const player = room.findPlayer(username);
  //     if (player && player.socket_id !== socket.id) {
  //       return callback({
  //         success: false,
  //         message: "global.player_already_connected",
  //       });
  //     }

  //     if (!room.hasPlayer(username)) {
  //       room.playerJoin(socket.id, username);

  //       return callback({
  //         success: true,
  //         message: `Connected | Room ${room_id.toUpperCase()}`,
  //       });
  //     }

  //     return callback({
  //       success: true,
  //       message: `Reconnected | Room ${room_id.toUpperCase()}`,
  //     });
  //   });

  //   socket.on("log", ({ message }: LogEvent) => {
  //     if (!room) return;
  //     room.log(username.trim(), message.trim());
  //     room.notifyState(["log"]);
  //   });

  //   socket.on("leave", (callback: Function) => {
  //     //console.log(`User '${username}' [${socket.id}] leaved.`);

  //     if (typeof callback === "function") callback();

  //     if (!room) return;
  //     room.playerLeave(username);
  //   });

  //   socket.on("disconnect", () => {
  //     //console.log(`User '${username}' [${socket.id}] disconnected.`);
  //     if (room) room.playerDisconnected(socket.id, username);
  //   });
  // });
});

app.addHook("preHandler", (req, res, done) => {
  const allowedPaths = ["/rooms"];
  if (allowedPaths.includes(req.url) || true) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "*");
    res.header("Access-Control-Allow-Headers", "*");
  }

  const isPreflight = /options/i.test(req.method);
  if (isPreflight) {
    return res.send();
  }

  done();
});

// app.addHook('onResponse', (request, reply, done) => {
//   done();
// });

app.register(routes);

// Register the global error handler
app.setErrorHandler(async (error, request, reply) => {
  request.log.error(error);
  logger.error(error);

  // Custom error handling logic
  if (error.statusCode) {
    reply.status(error.statusCode).send({
      success: false,
      message: error.message,
    });
  } else {
    // For generic/unexpected errors, return a 500
    reply.status(500).send({
      success: false,
      error: "Internal Server Error",
      message: error.message,
    });
  }
});

app
  .listen({
    host: "0.0.0.0",
    port: process.env.PORT ? Number(process.env.PORT) : 3333,
  })
  .then(() => {
    logger.info("Coup Server Running");
  });
