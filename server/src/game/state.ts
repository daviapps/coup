import { GAME_ACTIONS, getCardCountPerCharacter } from "@coup/shared/rules";
import {
  Character,
  GamePhase,
  GameSnapshot,
  InfluenceCard,
  LogData,
  PendingAction,
  Player,
} from "@coup/shared/types";
import { randomizeList } from "@coup/shared/utils";

export type ActionEffectResult = "done" | "discard_target" | "exchange";

export class GameState {
  public players: Map<string, Player> = new Map();
  public phase: GamePhase = "LOBBY";
  public owner: string;
  public pendingAction?: PendingAction;
  public victimId?: string;
  public winner?: string;
  public currentTurn?: string;

  private logs: LogData[] = [];
  private deck: Character[] = [];
  private bank = 0;

  constructor(owner: string) {
    this.owner = owner;
  }

  public log(data: LogData) {
    this.logs.push(data);
  }

  // Player management

  public findPlayerByUsername(username: string) {
    return Array.from(this.players.values()).find(
      (it) => it.username === username,
    );
  }

  public findSocketIdByUsername(username: string): string | undefined {
    for (const [id, player] of this.players) {
      if (player.username === username) return id;
    }
    return;
  }

  public addPlayer(socketId: string, username: string) {
    if (this.phase !== "LOBBY")
      throw new Error("Essa partida já está em andamento");

    const player: Player = {
      id: socketId,
      username,
      cards: [],
      coins: 0,
      active: true,
    };

    this.players.set(socketId, player);
    return player;
  }

  public updatePlayerId(id: string, username: string) {
    const player = this.findPlayerByUsername(username);
    if (!player) return;

    if (this.currentTurn === player.id) {
      this.currentTurn = id;
    }

    // Update victimId if this player is the current victim
    if (this.victimId === player.id) {
      this.victimId = id;
    }

    // Update pendingAction references
    if (this.pendingAction) {
      const oldId = player.id;
      if (this.pendingAction.actorId === oldId)
        this.pendingAction.actorId = id;
      if (this.pendingAction.targetId === oldId)
        this.pendingAction.targetId = id;
      if (this.pendingAction.blockedBy === oldId)
        this.pendingAction.blockedBy = id;
      if (this.pendingAction.challengerId === oldId)
        this.pendingAction.challengerId = id;
      this.pendingAction.playersRefusedChallenge =
        this.pendingAction.playersRefusedChallenge.map((pid) =>
          pid === oldId ? id : pid,
        );
      this.pendingAction.playersRefusedBlock =
        this.pendingAction.playersRefusedBlock.map((pid) =>
          pid === oldId ? id : pid,
        );
    }

    this.players.delete(player.id);
    player.id = id;
    this.players.set(player.id, player);

    return player;
  }

  public getPublicSnapshot(username: string): GameSnapshot {
    return {
      owner: this.owner,
      phase: this.phase,
      pendingAction: this.pendingAction,
      victimId: this.victimId,
      winner: this.winner,
      currentTurn: this.currentTurn || "",
      logs: this.logs,
      deckCount: this.deck.length,
      players: Array.from(this.players.values())
        .map((player) => {
          const isSelf = player.username === username;

          return {
            id: player.id,
            active: player.active,
            username: player.username,
            coins: player.coins,
            cards: player.cards.map((card) => {
              if (isSelf || card.revealed) {
                return { type: card.type, revealed: card.revealed };
              }
              return { revealed: false };
            }),
          } satisfies Player;
        })
        .sort((a) => (a.username === username ? -1 : 0)),
    };
  }

  // Match functions

  private takeCardsFromStack(count = 1): InfluenceCard[] {
    return this.deck.splice(0, count).map((it) => ({
      type: it,
      revealed: false,
    }));
  }

  private transferCoins(amount: number, targetId: string, originId?: string) {
    const target = this.players.get(targetId);
    if (!target) return;

    if (originId) {
      const origin = this.players.get(originId);
      if (!origin) return;

      const actual = Math.min(amount, origin.coins);
      origin.coins -= actual;
      target.coins += actual;
    } else {
      this.bank -= amount;
      target.coins += amount;
    }
  }

  public payCost(playerId: string, amount: number): boolean {
    const player = this.players.get(playerId);
    if (!player || player.coins < amount) return false;
    player.coins -= amount;
    this.bank += amount;
    return true;
  }

  public restartMatch() {
    this.phase = "LOBBY";
    this.pendingAction = undefined;
    this.victimId = undefined;
    this.winner = undefined;
    this.currentTurn = undefined;
    this.deck = [];
    this.bank = 0;
    this.logs = [];

    this.players.forEach((player) => {
      player.cards = [];
      player.coins = 0;
    });
  }

  public startMatch() {
    if (this.phase !== "LOBBY") return "global.game_already_started";

    this.players.forEach((player, key) => {
      if (!player.active) this.players.delete(key);
    });

    if (this.players.size < 3) return "global.min_players";

    this.bank = 54;

    const cardsPerCharacter = getCardCountPerCharacter(this.players.size);

    const characters: Character[] = [
      "AMBASSADOR",
      "ASSASSIN",
      "CAPTAIN",
      "CONTESSA",
      "DUKE",
    ];

    this.deck = [];

    // Fill card stack
    characters.forEach((it) => {
      const cardList = Array.from({ length: cardsPerCharacter }, (_) => it);
      this.deck.push(...cardList);
    });

    this.shuffleDeck();

    this.players.forEach((it) => {
      it.cards = this.takeCardsFromStack(2);
      it.coins = 2;
    });

    this.nextTurn();
  }

  private shuffleDeck() {
    this.deck = randomizeList(this.deck);
  }

  public abortMatch() {
    this.phase = "LOBBY";
  }

  // Player state helpers

  public isPlayerEliminated(playerId: string): boolean {
    const player = this.players.get(playerId);
    if (!player) return true;
    return player.cards.length > 0 && player.cards.every((c) => c.revealed);
  }

  public getAlivePlayerCount(): number {
    return Array.from(this.players.values()).filter(
      (p) => !this.isPlayerEliminated(p.id),
    ).length;
  }

  public getUnrevealedCardCount(playerId: string): number {
    const player = this.players.get(playerId);
    if (!player) return 0;
    return player.cards.filter((c) => !c.revealed).length;
  }

  public revealCard(playerId: string, cardIndex: number): boolean {
    const player = this.players.get(playerId);
    if (!player) return false;
    const card = player.cards[cardIndex];
    if (!card || card.revealed) return false;
    card.revealed = true;
    return true;
  }

  // Turn management

  public nextTurn(): Player | undefined {
    // Check game over
    if (this.getAlivePlayerCount() <= 1) {
      this.phase = "GAME_OVER";
      const winner = Array.from(this.players.values()).find(
        (p) => !this.isPlayerEliminated(p.id),
      );
      this.winner = winner?.username;
      this.pendingAction = undefined;
      this.victimId = undefined;
      return;
    }

    this.phase = "ACTION_SELECTION";
    this.pendingAction = undefined;
    this.victimId = undefined;

    const idList = Array.from(this.players.keys());
    let currentIndex = idList.indexOf(this.currentTurn || idList[0]);

    // Find next non-eliminated player
    for (let i = 0; i < idList.length; i++) {
      currentIndex = (currentIndex + 1) % idList.length;
      const nextId = idList[currentIndex];
      if (!this.isPlayerEliminated(nextId)) {
        this.currentTurn = nextId;
        return this.players.get(nextId);
      }
    }
  }

  // Action effects

  public applyActionEffect(): ActionEffectResult {
    if (!this.pendingAction) return "done";
    const { type, actorId, targetId } = this.pendingAction;

    switch (type) {
      case "INCOME":
        this.transferCoins(1, actorId);
        return "done";
      case "FOREIGN_AID":
        this.transferCoins(2, actorId);
        return "done";
      case "TAX":
        this.transferCoins(3, actorId);
        return "done";
      case "STEAL":
        if (targetId) this.transferCoins(2, actorId, targetId);
        return "done";
      case "COUP":
      case "ASSASSINATE":
        return "discard_target";
      case "EXCHANGE":
        return "exchange";
    }
  }

  // Challenge resolution - returns true if actor had the card (challenge fails)

  public resolveChallenge(
    actorId: string,
    challengerId: string,
    character: Character,
  ): boolean {
    const actor = this.players.get(actorId);
    if (!actor) return false;

    const cardIndex = actor.cards.findIndex(
      (c) => c.type === character && !c.revealed,
    );

    if (cardIndex !== -1) {
      // Actor had the card - swap it for a new one
      if (actor.cards[cardIndex].type)
        this.deck.push(actor.cards[cardIndex].type!);
      this.shuffleDeck();
      actor.cards[cardIndex] = { type: this.deck.pop()!, revealed: false };
      return true; // Actor wins (challenge fails)
    }

    return false; // Challenger wins (challenge succeeds)
  }
}
