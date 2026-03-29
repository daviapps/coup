import type { Character, PlayerActionType } from "./types";

export interface ActionConfig {
  challengeable: boolean;
  blockableBy: string[]; // Personagens que podem bloquear
  characterRequired?: Character; // Personagem que o autor alega ter
  targetRequired: boolean;
  cost: number;
  label: string;
}

export const GAME_ACTIONS: Record<PlayerActionType, ActionConfig> = {
  INCOME: {
    label: "Renda",
    challengeable: false,
    targetRequired: false,
    blockableBy: [],
    cost: 0,
  },
  FOREIGN_AID: {
    label: "Ajuda Externa",
    challengeable: false,
    targetRequired: false,
    blockableBy: ["DUKE"], // Qualquer um com Duque pode bloquear
    cost: 0,
  },
  TAX: {
    label: "Taxa",
    characterRequired: "DUKE",
    targetRequired: false,
    challengeable: true,
    blockableBy: [],
    cost: 0,
  },
  STEAL: {
    label: "Roubar",
    characterRequired: "CAPTAIN",
    challengeable: true,
    targetRequired: true,
    blockableBy: ["CAPTAIN", "AMBASSADOR"],
    cost: 0,
  },
  ASSASSINATE: {
    label: "Assassinar",
    characterRequired: "ASSASSIN",
    challengeable: true,
    targetRequired: true,
    blockableBy: ["CONTESSA"],
    cost: 3,
  },
  EXCHANGE: {
    label: "Trocar Cartas",
    characterRequired: "AMBASSADOR",
    challengeable: true,
    targetRequired: false,
    blockableBy: [],
    cost: 0,
  },
  COUP: {
    label: "Golpe de Estado (Coup)",
    challengeable: false,
    targetRequired: true,
    blockableBy: [],
    cost: 7,
  },
};

export function getCardCountPerCharacter(playerCount: number) {
  if (playerCount >= 3 && playerCount <= 6) return 3;
  else if (playerCount >= 7 && playerCount <= 8) return 4;
  else if (playerCount >= 9 && playerCount <= 10) return 5;
  return 2;
}

// export function getCharactersOfAction(action: PlayerActionType): Character[] {
//   if (action === "TAX") return ["DUKE"];
//   else if (action === "ASSASSINATE") return ["ASSASSIN"];
//   else if (action === "EXCHANGE") return ["AMBASSADOR"];
//   else if (action === "STEAL") return ["CAPTAIN"];
//   return [];
// }

// export function getCharacterOfCounteraction(
//   counteraction: PlayerCounteractionType,
// ): Character[] {
//   if (counteraction === "BLOCK_FOREIGN_AID") return ["DUKE"];
//   else if (counteraction === "BLOCK_STEALING") return ["AMBASSADOR", "CAPTAIN"];
//   else if (counteraction === "BLOCK_ASSASSINATION") return ["CONTESSA"];
//   return [];
// }

// export function actionRequiresTarget(action: PlayerActionType) {
//   return ["ASSASSINATE", "STEAL", "COUP"].includes(action);
// }
