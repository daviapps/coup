import { Button } from "@/components/Button";
import { useGame } from "@/features/classic-coup";
// import { actionRequiresTarget } from "@coup/shared/rules";
import { PlayerActionEventPayload, PlayerActionType } from "@coup/shared/types";
import { useLocalState } from "@daviapps/react-utils";
import { PlayIcon } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as S from "./styles";
import { GAME_ACTIONS } from "@coup/shared/rules";
import { Countdown } from "../Countdown";

export function GameBoard() {
  const { join, start, state, myTurn } = useGame();
  const navigate = useNavigate();

  const [username] = useLocalState<string | undefined>({
    key: "username",
  });

  useEffect(() => {
    join();
  }, [join, navigate]);

  return (
    <S.Wrapper>
      {state.phase === "LOBBY" && (
        <S.Container>
          {state.owner === username ? (
            <Button onClick={() => start()}>
              <PlayIcon /> Start
            </Button>
          ) : (
            <span>Waiting owner start the game</span>
          )}
        </S.Container>
      )}

      {state.phase === "ACTION_SELECTION" && (
        <S.Container>
          {myTurn ? <ActionSelection /> : <span>Waiting player action</span>}
        </S.Container>
      )}

      {state.phase === "CHALLENGE_WINDOW" && (
        <S.Container>
          <span>
            Waiting challenge (
            {state.pendingAction?.playersRefusedChallenge.length}/
            {state.players.length - 1})
          </span>
          {!myTurn && <ChallengeWindow />}
          <Countdown />
        </S.Container>
      )}
    </S.Wrapper>
  );
}

function ActionSelection() {
  const { action, state, socketId } = useGame();
  const [payload, setPayload] = useState<Partial<PlayerActionEventPayload>>({});

  const isSelectTarget =
    payload?.type && GAME_ACTIONS[payload.type].targetRequired;

  useEffect(() => {
    if (!payload?.type || (isSelectTarget && !payload.targetId)) return;

    action(payload as PlayerActionEventPayload);
  }, [isSelectTarget, payload, action]);

  if (isSelectTarget)
    return (
      <Fragment>
        {state.players
          .filter((it) => it.id !== socketId)
          .map((it) => (
            <Button
              key={it.username}
              onClick={() => setPayload((p) => ({ ...p, targetId: it.id }))}
            >
              {it.username}
            </Button>
          ))}
        <Button
          variant="link"
          onClick={() => setPayload((p) => ({ ...p, type: undefined }))}
        >
          Back
        </Button>
      </Fragment>
    );

  return (
    <Fragment>
      {Object.entries(GAME_ACTIONS).map(([key, it]) => (
        <Button
          key={key}
          onClick={() =>
            setPayload((p) => ({ ...p, type: key as PlayerActionType }))
          }
        >
          {it.label}
        </Button>
      ))}
    </Fragment>
  );
}

function ChallengeWindow() {
  const { challenge, state } = useGame();
  const disabled = !!state.pendingAction?.isChallenged;
  return (
    <Fragment>
      <Button
        onClick={() => challenge({ challenge: true })}
        disabled={disabled}
      >
        Challenge
      </Button>
      <Button
        onClick={() => challenge({ challenge: false })}
        disabled={disabled}
      >
        Pass
      </Button>
    </Fragment>
  );
}
