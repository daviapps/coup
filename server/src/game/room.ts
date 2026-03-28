import {
  PlayerActionEventPayload,
  RoomInfo,
  LogData,
  Character,
  PendingAction,
} from "@coup/shared/types";
import { distinct, generateSimpleIdentifier } from "@coup/shared/utils";
import { GameState } from "./state";
import { Server, Socket } from "socket.io";
import { GameEmitter } from "@/socket/emitter";
import { logger } from "@/services/logger";
import { GAME_ACTIONS } from "@coup/shared/rules";

export class GameRoom {
  public id = generateSimpleIdentifier().toUpperCase();
  private timeoutId?: NodeJS.Timeout;

  private state;

  constructor(owner: string) {
    this.state = new GameState(owner);
  }

  private log(serverMessage: string, data?: LogData) {
    logger.info(`[${this.id}] | ${serverMessage}`);
    if (!data) return;
    this.state.log(data);
    GameEmitter.logRoom(this.id, data);
  }

  private broadcastSync() {
    this.state.players.forEach((player, socketId) => {
      const personalSnapshot = this.state.getPublicSnapshot(player.username);
      GameEmitter.syncGame(socketId, personalSnapshot);
    });
  }

  public playerSync(username: string) {
    const socketId = this.state.findSocketIdByUsername(username);
    if (!socketId) return;
    const personalSnapshot = this.state.getPublicSnapshot(username);
    GameEmitter.syncGame(socketId, personalSnapshot);
  }

  public findPlayerBySocketId(socketId: string) {
    return this.state.players.get(socketId);
  }

  public findPlayerByUsername(username: string) {
    return this.state.findPlayerByUsername(username);
  }

  public playerCount() {
    return this.state.players.size;
  }

  public info(): RoomInfo {
    return {
      id: this.id,
      owner: this.state.owner,
      playerCount: this.playerCount(),
      phase: this.state.phase,
    };
  }

  public phase() {
    return this.state.phase;
  }

  // Game actions

  public handleStart(socket: Socket) {
    const player = this.state.players.get(socket.id);

    if (player?.username !== this.state.owner)
      return GameEmitter.error(socket.id, "You are not the owner of the room");
    const startError = this.state.startMatch();
    if (startError) return GameEmitter.error(socket.id, startError);

    this.broadcastSync();

    this.log(`"${player?.username}" started the game`, {
      message: "Game started",
      sender: player?.username,
    });
  }

  public handleJoin(socket: Socket, username: string) {
    const previousPlayerSession = this.state.updatePlayerId(
      socket.id,
      username,
    );

    if (previousPlayerSession?.active)
      GameEmitter.error(socket.id, "Player already connected");

    const player =
      previousPlayerSession || this.state.addPlayer(socket.id, username);

    socket.join(this.id);

    player.active = true;
    this.playerSync(username);

    if (previousPlayerSession) {
      GameEmitter.playerReconnected(this.id, player.username);
      this.log(`Player "${username}" reconnected`, {
        message: "log.player_reconnected",
        sender: player.username,
      });
    } else {
      GameEmitter.playerJoined(this.id, player);
      this.log(`Player "${username}" has joined the room`, {
        message: "log.player_Joined",
        sender: player.username,
      });
    }
  }

  public handleLeave(socket: Socket) {
    const player = this.state.players.get(socket.id);
    if (!player) return;
    this.state.players.delete(player.id);
    GameEmitter.playerLeaved(this.id, player.username);
    this.log(`Player "${player.username}" has leaved the room`, {
      message: "log.player_left",
      sender: player.username,
    });
  }

  public handleDisconnect(socket: Socket) {
    const player = this.state.players.get(socket.id);
    if (!player) return;
    player.active = false;
    GameEmitter.playerDisconnected(this.id, player.username);
    this.log(`Player "${player.username}" has disconnected`, {
      message: "log.player_disconnected",
      sender: player.username,
    });
  }

  public handleAbort() {
    this.state.abortMatch();
    // TODO: Notify players
  }

  // public handlePlayerAction(
  //   username: string,
  //   action: PlayerActionEventPayload,
  // ) {
  //   // this.state.playerAction(username, action);
  //   // this.broadcastSync();
  //   // this.log(
  //   //   `Player "${username}" performed ${action.type} ${action.targetPlayer ? `against ${action.targetPlayer}` : ""}`,
  //   //   {
  //   //     message: `Action ${action.type}`,
  //   //     sender: username,
  //   //   },
  //   // );
  //   // TODO: Notify players
  // }

  public handlePlayerAction(socket: Socket, action: PlayerActionEventPayload) {
    if (this.state.phase !== "ACTION_SELECTION")
      return GameEmitter.error(
        socket.id,
        "Game is not in action selection phase",
      );

    this.log(
      `Socket: ${socket.id} perform: ${action.type} to ${action.targetId}`,
    );
    const config = GAME_ACTIONS[action.type];

    this.state.pendingAction = {
      actorId: socket.id,
      targetId: action.targetId,
      type: action.type,
      playersRefusedChallenge: [],
      isChallenged: false,
    };

    if (config.challengeable) {
      this.state.phase = "CHALLENGE_WINDOW";
      this.startTimer();
    } else if (config.blockableBy.length > 0) {
      this.state.phase = "BLOCK_WINDOW";
      this.startTimer();
    } else {
      this.state.applyActionEffect();
      this.state.nextTurn();
    }

    this.broadcastSync();
  }

  handleChallenge(socket: Socket, challenge: boolean) {
    const action = this.state.pendingAction;
    if (!action) return;

    if (!challenge) {
      action.playersRefusedChallenge = action.playersRefusedChallenge
        .concat(socket.id)
        .filter(distinct());

      if (
        this.state.players.size - 1 ===
        action.playersRefusedChallenge.length
      ) {
        this.stopTimer();
        this.resolvePendingAction();
      }

      return this.broadcastSync();
    }

    this.stopTimer();

    let character: Character | undefined, actorId, challengerId;
    const config = GAME_ACTIONS[action.type];

    if (this.state.phase === "CHALLENGE_WINDOW") {
      character = config.characterRequired;
      actorId = action.actorId;
      challengerId = socket.id;
      action.isChallenged = true;
    } else if (this.state.phase === "BLOCK_CHALLENGE_WINDOW") {
      character = action.blockCharacter;
      actorId = action.blockedBy;
      challengerId = action.challengerId;
    }

    this.broadcastSync();

    if (!character || !actorId || !challengerId) return console.log("Erro 123");

    const hasCard = this.state.players
      .get(actorId)
      ?.cards.some((it) => !it.revealed && it.type === character);

    console.log({ hasCard, character, actorId, challengerId });

    this.state.resolveChallenge(actorId, challengerId, character);
    this.broadcastSync();
  }

  handleBlock(socket: Socket, character: Character) {
    const action = this.state.pendingAction;
    if (!action) return;

    action.blockedBy = socket.id;
    action.blockCharacter = character;

    this.state.phase = "BLOCK_CHALLENGE_WINDOW";

    this.stopTimer();
    this.startTimer();

    this.broadcastSync();
  }

  private startTimer() {
    this.timeoutId = setTimeout(() => this.resolvePendingAction(), 5000);
  }

  private stopTimer() {
    if (!this.timeoutId) return;
    clearTimeout(this.timeoutId);
  }

  private resolvePendingAction() {
    this.state.applyActionEffect();

    this.state.nextTurn();
    this.broadcastSync();
  }

  // handleChallenge(socket: Socket) {
  //   const action = this.state.pendingAction;
  //   if (!action) return;

  //   const targetId = action.blockedBy; // O alvo do desafio é quem bloqueou
  //   const requiredCard = action.blockCharacter;

  //   // this.state.resolveChallenge(targetId, socketContestante.id, requiredCard);
  // }

  // handleChallenge(challengerId: string) {
  //   const action = this.state.pendingAction;
  //   if (!action) return

  //   this.stopTimer();

  //   const isBlockChallenge = this.state.phase === "BLOCK_CHALLENGE_WINDOW";
  //   const challengedId = isBlockChallenge ? action.blockedBy : action.actorId;
  //   const cardToProve = isBlockChallenge
  //     ? action.blockCharacter
  //     : action.requiredCard;

  //   const hasCard = this.state.checkCard(challengedId, cardToProve);

  //   if (hasCard) {
  //     // Desafiado provou: Desafiante perde carta
  //     this.state.swapCard(challengedId, cardToProve);
  //     this.goToDiscard(challengerId, () => this.resumeFlow());
  //   } else {
  //     // Desafiado mentiu: Ele perde carta
  //     this.goToDiscard(challengedId, () => this.cancelOrComplete());
  //   }
  // }

  // resolvePendingAction() {
  //   const action = this.state.pendingAction;
  //   if (!action) return this.state.nextTurn();

  //   // Se a ação foi bloqueada e o bloqueio não foi desmascarado -> Fim de papo.
  //   if (action.blockedBy && !action.blockChallengeFailed) {
  //     return this.state.nextTurn();
  //   }

  //   // Se a ação foi contestada e o autor mentiu -> Fim de papo.
  //   if (action.actionChallengeFailed) {
  //     return this.state.nextTurn();
  //   }

  //   // Se chegou aqui, a ação FINALMENTE acontece
  //   this.state.applyActionEffect(action);

  //   // Se o efeito não exige um descarte (ex: Taxa, Renda), passa o turno
  //   if (this.state.phase !== "DISCARD_INFLUENCE") {
  //     this.state.nextTurn();
  //   }
  // }
}
