export type GamePhase =
  | "LOBBY"
  | "ACTION_SELECTION"
  | "CHALLENGE_WINDOW"
  | "BLOCK_WINDOW"
  | "BLOCK_CHALLENGE_WINDOW"
  | "DISCARD_INFLUENCE"
  | "EXCHANGE_SELECTION"
  | "GAME_OVER";

export type PendingAction = {
  type: PlayerActionType; // Ex: "STEAL"
  actorId: string; // Quem iniciou o roubo
  targetId?: string; // Quem está sendo roubado

  // Dados da Contra-ação (Preenchidos apenas se alguém bloquear)
  blockedBy?: string; // ID do jogador que disse "Eu sou o Capitão"
  blockCharacter?: Character; // Qual carta ele alegou ter (ex: "CAPTAIN")

  // Controle de Desafio
  playersRefusedChallenge: string[];
  playersRefusedBlock: string[];
  isChallenged: boolean;
  challengerId?: string;
};

export type Character =
  | "DUKE"
  | "CAPTAIN"
  | "ASSASSIN"
  | "CONTESSA"
  | "AMBASSADOR";

export type PlayerActionType =
  | "INCOME"
  | "FOREIGN_AID"
  | "COUP"
  | "TAX"
  | "ASSASSINATE"
  | "EXCHANGE"
  | "STEAL";

export type InfluenceCard = {
  type?: Character;
  revealed: boolean;
};

export type Player = {
  id: string;
  username: string;
  cards: InfluenceCard[];
  coins: number;
  active: boolean;
};

export type LogData = {
  type: "log" | "chat";
  message: string;
  sender: string;
  receiver?: string;
};

export type GameSnapshot = {
  owner: string;
  phase: GamePhase;
  players: Player[];
  pendingAction?: PendingAction;
  victimId?: string;
  winner?: string;
  logs: LogData[];
  deckCount: number;
  currentTurn: string;
};

export type RoomInfo = {
  id: string;
  owner: string;
  playerCount: number;
  phase: GamePhase;
  hasPassword: boolean;
};
