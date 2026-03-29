import { Button } from "@/components/Button";
import { useGame } from "@/features/classic-coup";
import {
  Character,
  PlayerActionEventPayload,
  PlayerActionType,
} from "@coup/shared/types";
import { useLocalState } from "@daviapps/react-utils";
import { EyeIcon, PlayIcon, RotateCcwIcon } from "lucide-react";
import { Fragment, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import * as S from "./styles";
import { GAME_ACTIONS } from "@coup/shared/rules";
import { Countdown } from "../Countdown";

function useIsEliminated() {
  const { state, socketId } = useGame();
  return useMemo(() => {
    const me = state.players.find((p) => p.id === socketId);
    if (!me || me.cards.length === 0) return false;
    return me.cards.every((c) => c.revealed);
  }, [state.players, socketId]);
}

export function GameBoard() {
  const { join, start, restart, state, myTurn, socketId } = useGame();
  const navigate = useNavigate();
  const eliminated = useIsEliminated();
  const { t } = useTranslation();

  const [username] = useLocalState<string | undefined>({
    key: "username",
  });

  useEffect(() => {
    join();
  }, [join, navigate]);

  const phaseKey = `${state.phase}-${state.currentTurn}-${state.pendingAction?.blockedBy ?? ""}-${state.victimId ?? ""}`;

  const currentTurnPlayer = state.players.find(
    (p) => p.id === state.currentTurn,
  );

  return (
    <S.Wrapper>
      {state.phase === "LOBBY" && (
        <S.Container key={phaseKey}>
          {state.owner === username ? (
            <Button onClick={() => start()}>
              <PlayIcon /> {t("game.start")}
            </Button>
          ) : (
            <S.WaitingLabel>{t("game.waiting_owner")}</S.WaitingLabel>
          )}
        </S.Container>
      )}

      {state.phase === "ACTION_SELECTION" && (
        <S.Container key={phaseKey}>
          {eliminated && <SpectatorBadge />}
          {myTurn && !eliminated ? (
            <ActionSelection />
          ) : (
            <S.WaitingLabel>
              {t("game.waiting_action", {
                player: currentTurnPlayer?.username,
              })}
            </S.WaitingLabel>
          )}
          <Countdown key="action-selection" duration={20} />
        </S.Container>
      )}

      {state.phase === "CHALLENGE_WINDOW" && (
        <S.Container key={phaseKey}>
          {eliminated && <SpectatorBadge />}
          <ActionInfo />
          <S.PhaseLabel>
            {t("game.challenge_window")} (
            {state.pendingAction?.playersRefusedChallenge.length}/
            {state.players.filter(
              (p) =>
                p.id !== state.pendingAction?.actorId &&
                !p.cards.every((c) => c.revealed),
            ).length}
            )
          </S.PhaseLabel>
          {!eliminated && socketId !== state.pendingAction?.actorId && (
            <ChallengeWindow />
          )}
          <Countdown key="challenge" />
        </S.Container>
      )}

      {state.phase === "BLOCK_WINDOW" && (
        <S.Container key={phaseKey}>
          {eliminated && <SpectatorBadge />}
          <ActionInfo />
          <S.PhaseLabel>{t("game.block_window")}</S.PhaseLabel>
          {!eliminated ? (
            <BlockWindow />
          ) : (
            <S.WaitingLabel>{t("game.waiting_block")}</S.WaitingLabel>
          )}
          <Countdown key="block" />
        </S.Container>
      )}

      {state.phase === "BLOCK_CHALLENGE_WINDOW" && (
        <S.Container key={phaseKey}>
          {eliminated && <SpectatorBadge />}
          <ActionInfo />
          <S.ActionInfoText>
            {t("game.blocks_with", {
              player: state.players.find(
                (p) => p.id === state.pendingAction?.blockedBy,
              )?.username,
              character: t(
                `game.character.${state.pendingAction?.blockCharacter}`,
              ),
            })}
          </S.ActionInfoText>
          {!eliminated && socketId !== state.pendingAction?.blockedBy && (
            <ChallengeWindow />
          )}
          <Countdown key="block-challenge" />
        </S.Container>
      )}

      {state.phase === "DISCARD_INFLUENCE" && (
        <S.Container key={phaseKey}>
          {eliminated && <SpectatorBadge />}
          <DiscardInfluence />
        </S.Container>
      )}

      {state.phase === "EXCHANGE_SELECTION" && (
        <S.Container key={phaseKey}>
          {eliminated && <SpectatorBadge />}
          <ExchangeSelection />
          <Countdown key="exchange" duration={20} />
        </S.Container>
      )}

      {state.phase === "GAME_OVER" && (
        <S.Container key={phaseKey}>
          <S.GameOverTitle>{t("game.game_over")}</S.GameOverTitle>
          <S.GameOverWinner>
            {t("game.wins", { player: state.winner })}
          </S.GameOverWinner>
          {state.owner === username && (
            <Button onClick={() => restart()}>
              <RotateCcwIcon /> {t("game.play_again")}
            </Button>
          )}
        </S.Container>
      )}
    </S.Wrapper>
  );
}

function SpectatorBadge() {
  const { t } = useTranslation();
  return (
    <S.SpectatorBanner>
      <EyeIcon /> {t("game.spectating")}
    </S.SpectatorBanner>
  );
}

function ActionInfo() {
  const { state } = useGame();
  const { t } = useTranslation();
  const action = state.pendingAction;
  if (!action) return null;

  const actor = state.players.find((p) => p.id === action.actorId);
  const target = action.targetId
    ? state.players.find((p) => p.id === action.targetId)
    : null;

  return (
    <S.ActionInfoText>
      {actor?.username} → {t(`game.action.${action.type}`)}
      {target ? ` → ${target.username}` : ""}
    </S.ActionInfoText>
  );
}

function ActionSelection() {
  const { action, state, socketId } = useGame();
  const { t } = useTranslation();
  const [payload, setPayload] = useState<Partial<PlayerActionEventPayload>>({});

  const currentPlayer = state.players.find((p) => p.id === socketId);
  const mustCoup = (currentPlayer?.coins ?? 0) >= 10;

  const isSelectTarget =
    payload?.type && GAME_ACTIONS[payload.type].targetRequired;

  useEffect(() => {
    if (!payload?.type || (isSelectTarget && !payload.targetId)) return;

    action(payload as PlayerActionEventPayload);
  }, [isSelectTarget, payload, action]);

  if (isSelectTarget)
    return (
      <Fragment>
        <S.PhaseLabel>{t("game.select_target")}</S.PhaseLabel>
        {state.players
          .filter(
            (it) =>
              it.id !== socketId && !it.cards.every((c) => c.revealed),
          )
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
          {t("game.back")}
        </Button>
      </Fragment>
    );

  return (
    <Fragment>
      {Object.entries(GAME_ACTIONS)
        .filter(([key]) => {
          if (mustCoup) return key === "COUP";
          const config = GAME_ACTIONS[key as PlayerActionType];
          if (config.cost > 0 && (currentPlayer?.coins ?? 0) < config.cost)
            return false;
          return true;
        })
        .map(([key, it]) => (
          <Button
            key={key}
            onClick={() =>
              setPayload((p) => ({ ...p, type: key as PlayerActionType }))
            }
          >
            {t(`game.action.${key}`)}
            {it.cost > 0 ? ` ${t("game.cost", { count: it.cost })}` : ""}
          </Button>
        ))}
    </Fragment>
  );
}

function ChallengeWindow() {
  const { challenge, state, socketId } = useGame();
  const { t } = useTranslation();

  const alreadyPassed =
    state.pendingAction?.playersRefusedChallenge.includes(socketId);
  const isEliminated =
    state.players
      .find((p) => p.id === socketId)
      ?.cards.every((c) => c.revealed) ?? false;

  if (isEliminated) return null;
  if (alreadyPassed) return <S.PassedLabel>{t("game.passed")}</S.PassedLabel>;

  return (
    <Fragment>
      <Button onClick={() => challenge({ challenge: true })}>
        {t("game.challenge")}
      </Button>
      <Button onClick={() => challenge({ challenge: false })}>
        {t("game.pass")}
      </Button>
    </Fragment>
  );
}

function BlockWindow() {
  const { block, challenge, state, socketId } = useGame();
  const { t } = useTranslation();
  const action = state.pendingAction;
  if (!action) return null;

  const config = GAME_ACTIONS[action.type];
  const isEliminated =
    state.players
      .find((p) => p.id === socketId)
      ?.cards.every((c) => c.revealed) ?? false;

  if (socketId === action.actorId || isEliminated) {
    return <S.WaitingLabel>{t("game.waiting_block")}</S.WaitingLabel>;
  }

  if (config.targetRequired && action.targetId && socketId !== action.targetId) {
    return <S.WaitingLabel>{t("game.waiting_block")}</S.WaitingLabel>;
  }

  const alreadyPassed = action.playersRefusedBlock?.includes(socketId);
  if (alreadyPassed)
    return <S.PassedLabel>{t("game.passed_block")}</S.PassedLabel>;

  return (
    <Fragment>
      {config.blockableBy.map((char) => (
        <Button
          key={char}
          onClick={() => block({ character: char as Character })}
        >
          {t("game.block", { character: t(`game.character.${char}`) })}
        </Button>
      ))}
      <Button onClick={() => challenge({ challenge: false })}>
        {t("game.pass")}
      </Button>
    </Fragment>
  );
}

function DiscardInfluence() {
  const { discard, state, socketId } = useGame();
  const { t } = useTranslation();

  const isVictim = state.victimId === socketId;
  const currentPlayer = state.players.find((p) => p.id === socketId);

  if (!isVictim) {
    const victim = state.players.find((p) => p.id === state.victimId);
    return (
      <S.WaitingLabel>
        {t("game.waiting_discard", { player: victim?.username })}
      </S.WaitingLabel>
    );
  }

  return (
    <Fragment>
      <S.DiscardPrompt>{t("game.choose_card")}</S.DiscardPrompt>
      {currentPlayer?.cards.map((card, index) =>
        card.revealed ? null : (
          <Button key={index} onClick={() => discard({ cardIndex: index })}>
            {card.type ? t(`game.character.${card.type}`) : "???"}
          </Button>
        ),
      )}
    </Fragment>
  );
}

function ExchangeSelection() {
  const { exchange, state, socketId } = useGame();
  const { t } = useTranslation();
  const [selected, setSelected] = useState<number[]>([]);

  const isActor = state.pendingAction?.actorId === socketId;
  const currentPlayer = state.players.find((p) => p.id === socketId);

  if (!isActor) {
    const actor = state.players.find(
      (p) => p.id === state.pendingAction?.actorId,
    );
    return (
      <S.WaitingLabel>
        {t("game.waiting_exchange", { player: actor?.username })}
      </S.WaitingLabel>
    );
  }

  const unrevealedCards =
    currentPlayer?.cards
      .map((card, index) => ({ card, index }))
      .filter((e) => !e.card.revealed) ?? [];

  const toggleCard = (index: number) => {
    setSelected((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : prev.length < 2
          ? [...prev, index]
          : prev,
    );
  };

  const handleConfirm = () => {
    if (selected.length === 2) {
      exchange({ returnIndices: selected });
    }
  };

  return (
    <Fragment>
      <S.PhaseLabel>{t("game.exchange_prompt")}</S.PhaseLabel>
      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {unrevealedCards.map(({ card, index }) => (
          <Button
            key={index}
            onClick={() => toggleCard(index)}
            variant={selected.includes(index) ? "default" : "link"}
          >
            {card.type ? t(`game.character.${card.type}`) : "???"}
          </Button>
        ))}
      </div>
      <S.PhaseLabel>
        {t("game.exchange_selected", { count: selected.length })}
      </S.PhaseLabel>
      <Button onClick={handleConfirm} disabled={selected.length !== 2}>
        {t("game.exchange_confirm")}
      </Button>
    </Fragment>
  );
}
