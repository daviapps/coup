import { GAME_ACTIONS, getCardCountPerCharacter } from "@coup/shared/rules";
import {
  Character,
  GamePhase,
  GameSnapshot,
  InfluenceCard,
  LogData,
  PendingAction,
  Player,
  PlayerActionType,
} from "@coup/shared/types";
import { randomizeList } from "@coup/shared/utils";

export class GameState {
  public players: Map<string, Player> = new Map();
  public phase: GamePhase = "LOBBY";
  public owner: string;
  public pendingAction?: PendingAction;
  public victimId?: string;
  public winner?: string;

  private logs: LogData[] = [];
  private deck: Character[] = [];
  private bank = 0;
  private currentTurn?: string;

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
    for (let [id, player] of this.players) {
      if (player.username === username) return id;
    }
    return;
  }

  // public removePlayerByUsername(username: string) {
  //   const index = Array.from(this.players.values()).findIndex(
  //     (it) => it.username === username,
  //   );
  //   const key = Array.from(this.players.keys()).at(index);
  //   if (!key) return;
  //   this.players.delete(key);
  // }

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
      currentTurn: this.currentTurn || "",
      logs: this.logs,
      deckCount: this.deck.length, // Quantas cartas restam, mas não quais
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

      origin.coins -= amount;
    } else {
      this.bank -= amount;
    }

    target.coins += amount;
  }

  public startMatch() {
    if (this.phase !== "LOBBY") return "Game already started";

    this.players.forEach((player, key) => {
      if (!player.active) this.players.delete(key);
    });

    if (this.players.size < 3) return "Its required at least 3 players";

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

  public nextTurn(): Player | undefined {
    this.phase = "ACTION_SELECTION";

    const idList = Array.from(this.players.keys());
    const currentIndex = idList.indexOf(this.currentTurn || idList[0]);

    if (currentIndex === -1) return;

    const nextIndex = (currentIndex + 1) % idList.length;
    const nextId = idList[nextIndex];
    const nextPlayer = this.players.get(nextId);

    this.currentTurn = nextId;
    return nextPlayer;
  }

  // public canPerformAction(id: string, actionType: PlayerActionType) {
  //   const player = this.players.get(id);
  //   if (!player) return false;
  //   if (actionType === "COUP" && player.coins < 7) return false;
  //   if (this.phase !== "ACTION_SELECTION") return false;
  //   return true;
  // }

  public applyActionEffect() {
    if (!this.pendingAction) return;
    if (this.pendingAction.type === "INCOME") {
      this.transferCoins(1, this.pendingAction.actorId);
    } else if (this.pendingAction.type === "FOREIGN_AID") {
      this.transferCoins(2, this.pendingAction.actorId);
    } else if (this.pendingAction.type === "TAX") {
      this.transferCoins(3, this.pendingAction.actorId);
    } else if (this.pendingAction.type === "STEAL") {
      this.transferCoins(
        2,
        this.pendingAction.actorId,
        this.pendingAction.targetId,
      );
    }
  }

  public resolveChallenge(
    actorId: string,
    challengerId: string,
    character: Character,
  ) {
    const action = this.pendingAction;
    if (!action) return;

    const actor = this.players.get(actorId);
    const challenger = this.players.get(challengerId);
    if (!actor || !challenger) return;

    const cardIndex = actor.cards.findIndex(
      (c) => c.type === character && !c.revealed,
    );

    // Actor wins
    if (cardIndex !== -1) {
      if (actor.cards[cardIndex].type)
        this.deck.push(actor.cards[cardIndex].type);
      this.shuffleDeck();

      actor.cards[cardIndex].type = this.deck.pop()!;
      return this.nextTurn();
    }
    // Challenger wins
    else {
      this.discardInfluence(challengerId);
    }
  }

  public discardInfluence(victimId: string) {
    const victim = this.players.get(victimId);
    if (!victim) return;

    const notRevealedCards = victim.cards.filter((it) => !it.revealed);

    if (notRevealedCards.length === 2) {
      this.phase = "DISCARD_INFLUENCE";
      this.victimId = victimId;
    } else if (notRevealedCards.length === 1) {
      const leftCard = notRevealedCards[0];
      leftCard.revealed = true;
    }
  }
}
