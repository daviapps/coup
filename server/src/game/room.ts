import {
  PlayerActionEventPayload,
  RoomInfo,
  LogData,
  Character,
} from "@coup/shared/types";
import { distinct, generateSimpleIdentifier } from "@coup/shared/utils";
import { GameState } from "./state";
import { Socket } from "socket.io";
import { GameEmitter } from "@/socket/emitter";
import { logger } from "@/services/logger";
import { GAME_ACTIONS } from "@coup/shared/rules";

export class GameRoom {
  public id = generateSimpleIdentifier().toUpperCase();
  public password?: string;
  private timeoutId?: NodeJS.Timeout;
  private afterDiscardCallback?: () => void;

  private state;

  constructor(owner: string, password?: string) {
    this.state = new GameState(owner);
    this.password = password?.trim() || undefined;
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
      hasPassword: !!this.password,
    };
  }

  public phase() {
    return this.state.phase;
  }

  // Timer management

  private startTimer() {
    this.timeoutId = setTimeout(() => this.onTimerExpired(), 5000);
  }

  private stopTimer() {
    if (!this.timeoutId) return;
    clearTimeout(this.timeoutId);
    this.timeoutId = undefined;
  }

  // Eligible player counting

  private getEligibleChallengerCount(): number {
    const action = this.state.pendingAction;
    if (!action) return 0;

    let excludeId: string;
    if (this.state.phase === "CHALLENGE_WINDOW") {
      excludeId = action.actorId;
    } else if (this.state.phase === "BLOCK_CHALLENGE_WINDOW") {
      excludeId = action.blockedBy!;
    } else {
      return 0;
    }

    return Array.from(this.state.players.keys()).filter(
      (id) => id !== excludeId && !this.state.isPlayerEliminated(id),
    ).length;
  }

  private getEligibleBlockerCount(): number {
    const action = this.state.pendingAction;
    if (!action) return 0;

    const config = GAME_ACTIONS[action.type];

    // For targeted blockable actions (STEAL, ASSASSINATE), only target can block
    if (config.targetRequired && action.targetId) {
      return this.state.isPlayerEliminated(action.targetId) ? 0 : 1;
    }

    // For non-targeted blockable actions (FOREIGN_AID), anyone except actor
    return Array.from(this.state.players.keys()).filter(
      (id) => id !== action.actorId && !this.state.isPlayerEliminated(id),
    ).length;
  }

  // Discard flow

  private enterDiscardPhase(playerId: string, afterDiscard: () => void) {
    const unrevealedCount = this.state.getUnrevealedCardCount(playerId);

    if (unrevealedCount === 0) {
      // Already eliminated, just continue
      afterDiscard();
      return;
    }

    if (unrevealedCount === 1) {
      // Auto-reveal the last card
      const player = this.state.players.get(playerId);
      if (!player) return afterDiscard();

      const cardIndex = player.cards.findIndex((c) => !c.revealed);
      this.state.revealCard(playerId, cardIndex);

      this.log(`${player.username} lost their last influence`, {
        type: "log",
        message: "log.player_eliminated",
        sender: player.username,
      });

      // Check game over after auto-reveal
      if (this.state.getAlivePlayerCount() <= 1) {
        this.state.nextTurn(); // Sets GAME_OVER
        this.broadcastSync();
        return;
      }

      afterDiscard();
      return;
    }

    // Player has 2 unrevealed cards — they must choose
    this.state.phase = "DISCARD_INFLUENCE";
    this.state.victimId = playerId;
    this.afterDiscardCallback = afterDiscard;
    this.broadcastSync();
  }

  // Apply action effect and continue

  private applyAndContinue() {
    const result = this.state.applyActionEffect();

    if (result === "discard_target") {
      const targetId = this.state.pendingAction?.targetId;
      if (!targetId || this.state.isPlayerEliminated(targetId)) {
        // Target already eliminated (e.g. lost influence in challenge)
        this.state.nextTurn();
        this.broadcastSync();
        return;
      }

      this.enterDiscardPhase(targetId, () => {
        this.state.nextTurn();
        this.broadcastSync();
      });
      return;
    }

    if (result === "exchange") {
      // TODO: Implement ambassador exchange card selection
      this.state.nextTurn();
      this.broadcastSync();
      return;
    }

    // "done" — coins already transferred
    this.state.nextTurn();
    this.broadcastSync();
  }

  // Timer expiry handler

  private onTimerExpired() {
    const action = this.state.pendingAction;
    if (!action) return;

    if (this.state.phase === "CHALLENGE_WINDOW") {
      // Nobody challenged → check for blocks
      const config = GAME_ACTIONS[action.type];
      if (config.blockableBy.length > 0 && this.getEligibleBlockerCount() > 0) {
        action.playersRefusedChallenge = [];
        this.state.phase = "BLOCK_WINDOW";
        this.startTimer();
        this.broadcastSync();
        return;
      }
      this.applyAndContinue();
      return;
    }

    if (this.state.phase === "BLOCK_WINDOW") {
      // Nobody blocked → apply action
      this.applyAndContinue();
      return;
    }

    if (this.state.phase === "BLOCK_CHALLENGE_WINDOW") {
      // Nobody challenged the block → block succeeds, action cancelled
      this.log("Block not challenged, action cancelled");
      this.state.nextTurn();
      this.broadcastSync();
      return;
    }
  }

  // Connection handlers

  public handleStart(socket: Socket) {
    const player = this.state.players.get(socket.id);

    if (player?.username !== this.state.owner)
      return GameEmitter.error(socket.id, "You are not the owner of the room");
    const startError = this.state.startMatch();
    if (startError) return GameEmitter.error(socket.id, startError);

    this.broadcastSync();

    this.log(`"${player?.username}" started the game`, {
      type: "log",
      message: "log.game_started",
      sender: player?.username,
    });
  }

  public handleRestart(socket: Socket) {
    const player = this.state.players.get(socket.id);

    if (player?.username !== this.state.owner)
      return GameEmitter.error(socket.id, "You are not the owner of the room");

    if (this.state.phase !== "GAME_OVER")
      return GameEmitter.error(socket.id, "Game is not over yet");

    this.stopTimer();
    this.afterDiscardCallback = undefined;
    this.state.restartMatch();
    this.broadcastSync();

    this.log(`"${player?.username}" restarted the game`, {
      type: "log",
      message: "log.game_restarted",
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
        type: "log",
        message: "log.player_reconnected",
        sender: player.username,
      });
    } else {
      GameEmitter.playerJoined(this.id, player);
      this.log(`Player "${username}" has joined the room`, {
        type: "log",
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
      type: "log",
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
      type: "log",
      message: "log.player_disconnected",
      sender: player.username,
    });
  }

  public handleAbort() {
    this.state.abortMatch();
  }

  // Game action handlers

  public handlePlayerAction(socket: Socket, action: PlayerActionEventPayload) {
    if (this.state.phase !== "ACTION_SELECTION") {
      return GameEmitter.error(
        socket.id,
        "Game is not in action selection phase",
      );
    }

    if (this.state.currentTurn !== socket.id) {
      return GameEmitter.error(socket.id, "It's not your turn");
    }

    const player = this.state.players.get(socket.id);
    if (!player) return;

    const config = GAME_ACTIONS[action.type];

    // Mandatory coup at 10+ coins
    if (player.coins >= 10 && action.type !== "COUP") {
      return GameEmitter.error(
        socket.id,
        "You must coup when you have 10 or more coins",
      );
    }

    // Validate cost
    if (config.cost > 0 && player.coins < config.cost) {
      return GameEmitter.error(socket.id, "Not enough coins");
    }

    // Validate target
    if (config.targetRequired && !action.targetId) {
      return GameEmitter.error(socket.id, "Target is required");
    }

    if (
      action.targetId &&
      this.state.isPlayerEliminated(action.targetId)
    ) {
      return GameEmitter.error(socket.id, "Target is already eliminated");
    }

    // Pay cost upfront (coins are lost even if challenged/blocked)
    if (config.cost > 0) {
      this.state.payCost(socket.id, config.cost);
    }

    this.state.pendingAction = {
      actorId: socket.id,
      targetId: action.targetId,
      type: action.type,
      playersRefusedChallenge: [],
      playersRefusedBlock: [],
      isChallenged: false,
    };

    const targetPlayer = action.targetId
      ? this.state.players.get(action.targetId)
      : undefined;

    this.log(
      `${player.username} performs ${action.type}${targetPlayer ? ` on ${targetPlayer.username}` : ""}`,
      {
        type: "log",
        message: `log.action_${action.type.toLowerCase()}`,
        sender: player.username,
        receiver: targetPlayer?.username,
      },
    );

    if (config.challengeable) {
      this.state.phase = "CHALLENGE_WINDOW";
      this.startTimer();
    } else if (config.blockableBy.length > 0) {
      this.state.phase = "BLOCK_WINDOW";
      this.startTimer();
    } else {
      // Not challengeable, not blockable (INCOME, COUP)
      this.applyAndContinue();
      return; // applyAndContinue handles broadcastSync
    }

    this.broadcastSync();
  }

  public handleChallenge(socket: Socket, challenge: boolean) {
    const action = this.state.pendingAction;
    if (!action) return;

    const player = this.state.players.get(socket.id);
    if (!player || this.state.isPlayerEliminated(socket.id)) return;

    // In BLOCK_WINDOW, challenge=false means "pass on blocking"
    if (this.state.phase === "BLOCK_WINDOW") {
      if (challenge) return; // Can't "challenge" during block window
      this.handlePassOnBlock(socket);
      return;
    }

    if (
      this.state.phase !== "CHALLENGE_WINDOW" &&
      this.state.phase !== "BLOCK_CHALLENGE_WINDOW"
    ) {
      return;
    }

    // Can't challenge your own action/block
    if (
      this.state.phase === "CHALLENGE_WINDOW" &&
      socket.id === action.actorId
    )
      return;
    if (
      this.state.phase === "BLOCK_CHALLENGE_WINDOW" &&
      socket.id === action.blockedBy
    )
      return;

    if (!challenge) {
      // Pass on challenging
      action.playersRefusedChallenge = action.playersRefusedChallenge
        .concat(socket.id)
        .filter(distinct());

      const eligibleCount = this.getEligibleChallengerCount();
      if (action.playersRefusedChallenge.length >= eligibleCount) {
        this.stopTimer();

        if (this.state.phase === "CHALLENGE_WINDOW") {
          // Nobody challenged → check for blocks
          const config = GAME_ACTIONS[action.type];
          if (
            config.blockableBy.length > 0 &&
            this.getEligibleBlockerCount() > 0
          ) {
            action.playersRefusedChallenge = [];
            this.state.phase = "BLOCK_WINDOW";
            this.startTimer();
          } else {
            this.applyAndContinue();
            return; // applyAndContinue handles broadcastSync
          }
        } else if (this.state.phase === "BLOCK_CHALLENGE_WINDOW") {
          // Nobody challenged the block → block succeeds, action cancelled
          this.log("Block not challenged, action cancelled");
          this.state.nextTurn();
        }
      }

      this.broadcastSync();
      return;
    }

    // Player challenges!
    this.stopTimer();

    if (this.state.phase === "CHALLENGE_WINDOW") {
      this.resolveChallengeWindow(socket);
    } else if (this.state.phase === "BLOCK_CHALLENGE_WINDOW") {
      this.resolveBlockChallengeWindow(socket);
    }
  }

  private resolveChallengeWindow(challengerSocket: Socket) {
    const action = this.state.pendingAction!;
    const config = GAME_ACTIONS[action.type];
    const character = config.characterRequired;
    if (!character) return;

    action.isChallenged = true;
    action.challengerId = challengerSocket.id;

    const actorPlayer = this.state.players.get(action.actorId);
    const challengerPlayer = this.state.players.get(challengerSocket.id);

    const actorHadCard = this.state.resolveChallenge(
      action.actorId,
      challengerSocket.id,
      character,
    );

    this.log(
      `${challengerPlayer?.username} challenges ${actorPlayer?.username}'s ${character}`,
      {
        type: "log",
        message: "log.challenge",
        sender: challengerPlayer?.username || "",
        receiver: actorPlayer?.username,
      },
    );

    this.broadcastSync();

    if (actorHadCard) {
      // Challenge failed — challenger loses influence
      this.log(
        `${actorPlayer?.username} had ${character}! ${challengerPlayer?.username} loses influence`,
        {
          type: "log",
        message: "log.challenge_failed",
          sender: challengerPlayer?.username || "",
          receiver: actorPlayer?.username,
        },
      );

      this.enterDiscardPhase(challengerSocket.id, () => {
        // After challenger discards, action continues → block window or apply
        const config = GAME_ACTIONS[action.type];
        if (
          config.blockableBy.length > 0 &&
          this.getEligibleBlockerCount() > 0
        ) {
          action.playersRefusedChallenge = [];
          action.playersRefusedBlock = [];
          this.state.phase = "BLOCK_WINDOW";
          this.startTimer();
          this.broadcastSync();
        } else {
          this.applyAndContinue();
        }
      });
    } else {
      // Challenge succeeded — actor was bluffing, loses influence
      this.log(
        `${actorPlayer?.username} didn't have ${character}! ${actorPlayer?.username} loses influence`,
        {
          type: "log",
        message: "log.challenge_succeeded",
          sender: challengerPlayer?.username || "",
          receiver: actorPlayer?.username,
        },
      );

      this.enterDiscardPhase(action.actorId, () => {
        // Action is cancelled
        this.state.nextTurn();
        this.broadcastSync();
      });
    }
  }

  private resolveBlockChallengeWindow(challengerSocket: Socket) {
    const action = this.state.pendingAction!;
    if (!action.blockedBy || !action.blockCharacter) return;

    const blockerPlayer = this.state.players.get(action.blockedBy);
    const challengerPlayer = this.state.players.get(challengerSocket.id);

    const blockerHadCard = this.state.resolveChallenge(
      action.blockedBy,
      challengerSocket.id,
      action.blockCharacter,
    );

    this.log(
      `${challengerPlayer?.username} challenges ${blockerPlayer?.username}'s block (${action.blockCharacter})`,
      {
        type: "log",
        message: "log.block_challenge",
        sender: challengerPlayer?.username || "",
        receiver: blockerPlayer?.username,
      },
    );

    this.broadcastSync();

    if (blockerHadCard) {
      // Block challenge failed — challenger loses influence, block succeeds
      this.log(
        `${blockerPlayer?.username} had ${action.blockCharacter}! Block succeeds`,
        {
          type: "log",
        message: "log.block_challenge_failed",
          sender: challengerPlayer?.username || "",
          receiver: blockerPlayer?.username,
        },
      );

      this.enterDiscardPhase(challengerSocket.id, () => {
        // Block succeeds → action cancelled
        this.state.nextTurn();
        this.broadcastSync();
      });
    } else {
      // Block challenge succeeded — blocker was bluffing, loses influence
      this.log(
        `${blockerPlayer?.username} didn't have ${action.blockCharacter}! Block fails`,
        {
          type: "log",
        message: "log.block_challenge_succeeded",
          sender: challengerPlayer?.username || "",
          receiver: blockerPlayer?.username,
        },
      );

      this.enterDiscardPhase(action.blockedBy, () => {
        // Block fails → action proceeds
        this.applyAndContinue();
      });
    }
  }

  public handleBlock(socket: Socket, character: Character) {
    const action = this.state.pendingAction;
    if (!action) return;
    if (this.state.phase !== "BLOCK_WINDOW") return;

    if (this.state.isPlayerEliminated(socket.id)) return;

    const config = GAME_ACTIONS[action.type];
    if (!config.blockableBy.includes(character)) {
      return GameEmitter.error(
        socket.id,
        "This character cannot block this action",
      );
    }

    // For targeted actions, only target can block
    if (
      config.targetRequired &&
      action.targetId &&
      socket.id !== action.targetId
    ) {
      return GameEmitter.error(
        socket.id,
        "Only the target can block this action",
      );
    }

    // Actor can't block their own action
    if (socket.id === action.actorId) return;

    const player = this.state.players.get(socket.id);

    action.blockedBy = socket.id;
    action.blockCharacter = character;
    action.playersRefusedChallenge = [];

    this.state.phase = "BLOCK_CHALLENGE_WINDOW";

    this.stopTimer();
    this.startTimer();

    this.log(`${player?.username} blocks with ${character}`, {
      type: "log",
      message: "log.player_blocks",
      sender: player?.username || "",
    });

    this.broadcastSync();
  }

  private handlePassOnBlock(socket: Socket) {
    const action = this.state.pendingAction;
    if (!action) return;

    const config = GAME_ACTIONS[action.type];

    // For targeted actions, only target can pass on blocking
    if (
      config.targetRequired &&
      action.targetId &&
      socket.id !== action.targetId
    ) {
      return;
    }

    // Actor can't pass on blocking themselves
    if (socket.id === action.actorId) return;

    action.playersRefusedBlock = action.playersRefusedBlock
      .concat(socket.id)
      .filter(distinct());

    const eligibleCount = this.getEligibleBlockerCount();
    if (action.playersRefusedBlock.length >= eligibleCount) {
      // Everyone passed on blocking → apply action
      this.stopTimer();
      this.applyAndContinue();
      return;
    }

    this.broadcastSync();
  }

  public handleChatMessage(
    socket: Socket,
    message: string,
    targetUsername?: string,
  ) {
    const sender = this.state.players.get(socket.id);
    if (!sender) return;

    if (targetUsername) {
      const targetSocketId =
        this.state.findSocketIdByUsername(targetUsername);
      if (!targetSocketId)
        return GameEmitter.error(socket.id, "Player not found");

      const logEntry: LogData = {
        type: "chat",
        message,
        sender: sender.username,
        receiver: targetUsername,
      };

      // Private: send only to sender and receiver
      GameEmitter.chatPrivate(socket.id, targetSocketId, logEntry);
    } else {
      const logEntry: LogData = {
        type: "chat",
        message,
        sender: sender.username,
      };

      // Public: store and emit via room:log (same pipeline as game logs)
      this.state.log(logEntry);
      GameEmitter.logRoom(this.id, logEntry);
    }
  }

  public handleDiscard(socket: Socket, cardIndex: number) {
    if (this.state.phase !== "DISCARD_INFLUENCE") return;
    if (this.state.victimId !== socket.id) {
      return GameEmitter.error(socket.id, "It's not your turn to discard");
    }

    const player = this.state.players.get(socket.id);
    if (!player) return;

    // Validate the card is unrevealed
    const card = player.cards[cardIndex];
    if (!card || card.revealed) {
      return GameEmitter.error(socket.id, "Invalid card selection");
    }

    this.state.revealCard(socket.id, cardIndex);

    this.log(`${player.username} lost an influence`, {
      type: "log",
      message: "log.player_lost_influence",
      sender: player.username,
    });

    // Check game over
    if (this.state.getAlivePlayerCount() <= 1) {
      this.state.nextTurn(); // Sets GAME_OVER
      this.broadcastSync();
      return;
    }

    const callback = this.afterDiscardCallback;
    this.afterDiscardCallback = undefined;
    this.state.victimId = undefined;

    if (callback) callback();
    else {
      this.broadcastSync();
    }
  }
}
