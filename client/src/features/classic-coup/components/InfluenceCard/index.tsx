import { Character } from "@coup/shared/types";
import * as S from "./styles";
import { ReactNode } from "react";
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
  return (
    <S.Wrapper
      data-character={character || "UNKNOWN"}
      data-revealed={revealed ? "true" : "false"}
    >
      {character ? characterIcon[character] : "?"}
      <span>{character}</span>

      {/* {character ? (
        <span>
          {character.split("").map((it, i) => (
            <span key={i}>{it}</span>
          ))}
        </span>
      ) : (
        "?"
      )} */}
    </S.Wrapper>
  );
}
