import { useContext } from "react";
import { SocketContext } from "../providers/game-provider";

export const useGame = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error("SocketProvider required");
  return context;
};
