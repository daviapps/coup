import { Separator } from "@/components/Separator";
import { Fragment } from "react";
import { useGame } from "../../hooks/use-game";
import { InfluenceCard } from "../InfluenceCard";
import * as S from "./styles";
import { CoinsIcon } from "lucide-react";

export function PlayerCards() {
  const { state, socketId } = useGame();

  return (
    <S.Wrapper>
      {/* <S.Title>Players</S.Title> */}
      {state.players.map((it, i, arr) => (
        <Fragment key={it.id}>
          <S.Player
            data-current={String(state.currentTurn === it.id)}
            data-myself={String(state.currentTurn === socketId)}
          >
            <S.PlayerName $active={it.active}>
              {it.username} <span>{it.active ? "" : "(offline)"}</span>
            </S.PlayerName>

            <S.CardDeck>
              {Array.from({ length: 2 }, (_, i) => (
                <S.CardSlot key={i}>
                  {it.cards[i] && (
                    <InfluenceCard
                      character={it.cards[i].type}
                      revealed={it.cards[i].revealed}
                    />
                  )}
                </S.CardSlot>
              ))}
            </S.CardDeck>
            {it.coins > 0 && (
              <S.PlayerCoins>
                <CoinsIcon />
                {it.coins} coin{it.coins > 1 && "s"}
              </S.PlayerCoins>
            )}
          </S.Player>

          {i < arr.length - 1 && <Separator />}
        </Fragment>
      ))}
    </S.Wrapper>
  );
}
