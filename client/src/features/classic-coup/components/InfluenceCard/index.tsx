import type { Character } from "@coup/shared/types";
import * as S from "./styles";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  AnchorIcon,
  CrossIcon,
  ShieldIcon,
  SkullIcon,
  StarIcon,
} from "lucide-react";

const characterIcon: { [key in Character]: ReactNode } = {
  DUKE: <StarIcon />,
  CAPTAIN: <AnchorIcon />,
  AMBASSADOR: <CrossIcon />,
  ASSASSIN: <SkullIcon />,
  CONTESSA: <ShieldIcon />,
};

export interface InfluenceCardProps {
  character?: Character;
  revealed: boolean;
}

export function InfluenceCard({ character, revealed }: InfluenceCardProps) {
  const { t } = useTranslation();

  return (
    <S.Wrapper
      data-character={character || "UNKNOWN"}
      data-revealed={revealed ? "true" : "false"}
    >
      {character ? characterIcon[character] : "?"}
      <span>{character ? t(`game.character.${character}`) : ""}</span>
    </S.Wrapper>
  );
}
