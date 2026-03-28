import type {
  GameSnapshot,
  LogEventData,
  PlayerDisconnectedEventData,
  PlayerJoinedEventData,
  PlayerLeavedEventData,
  PlayerReconnectedEventData,
  SyncEventData,
} from "@coup/shared/types";
import { distinct } from "@daviapps/node-utils";

export const initialState: GameSnapshot = {
  players: [],
  logs: [],
  phase: "LOBBY",
  currentTurn: "",
  owner: "",
  deckCount: 0,
};

export type GameReducerAction =
  | {
      type: "SYNC";
      data: SyncEventData;
    }
  | {
      type: "PLAYER_JOINED";
      data: PlayerJoinedEventData;
    }
  | {
      type: "PLAYER_LEAVED";
      data: PlayerLeavedEventData;
    }
  | {
      type: "PLAYER_DISCONNECTED";
      data: PlayerDisconnectedEventData;
    }
  | {
      type: "PLAYER_RECONNECTED";
      data: PlayerReconnectedEventData;
    }
  | {
      type: "ROOM_LOG";
      data: LogEventData;
    };

export function gameReducer(
  state: GameSnapshot,
  action: GameReducerAction,
): GameSnapshot {
  switch (action.type) {
    case "SYNC":
      return action.data.snapshot;
    case "PLAYER_JOINED":
      return {
        ...state,
        players: state.players
          .concat(action.data.player)
          .filter(distinct("username")),
      };
    case "PLAYER_LEAVED":
      return {
        ...state,
        players: state.players.filter(
          (it) => it.username !== action.data.username,
        ),
      };
    case "PLAYER_RECONNECTED":
      return {
        ...state,
        players: state.players.map((it) => {
          if (it.username === action.data.username) {
            it.active = true;
          }
          return it;
        }),
      };
    case "PLAYER_DISCONNECTED":
      return {
        ...state,
        players: state.players.map((it) => {
          if (it.username === action.data.username) {
            it.active = false;
          }
          return it;
        }),
      };
    case "ROOM_LOG":
      return {
        ...state,
        logs: state.logs.concat(action.data.log),
      };
  }

  return state;
}
