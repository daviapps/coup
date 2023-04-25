import { io, ManagerOptions, SocketOptions } from "socket.io-client";

const createSocket = (opts?: Partial<ManagerOptions & SocketOptions>) => {
  return io(import.meta.env['VITE_SERVER_URL'] ||'http://localhost:3333', opts)
}

export default createSocket;
