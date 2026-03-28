import { FastifyReply, FastifyRequest } from "fastify";

export function ok(req: FastifyRequest, res: FastifyReply) {
  return res.send("ok");
}
