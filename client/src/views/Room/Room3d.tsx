import { Canvas, useFrame, ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Text, RoundedBox, Billboard } from "@react-three/drei";
import { useGame } from "@/features/classic-coup";
import { useTranslation } from "react-i18next";
import type {
  Character,
  InfluenceCard,
  Player,
  PlayerActionType,
} from "@coup/shared/types";
import { GAME_ACTIONS } from "@coup/shared/rules";
import { useRef, useMemo, useState, useCallback } from "react";
import * as THREE from "three";

const CHARACTER_COLORS: Record<Character, string> = {
  DUKE: "#951442",
  CAPTAIN: "#5d95af",
  ASSASSIN: "#575151",
  CONTESSA: "#7f1515",
  AMBASSADOR: "#a5a90a",
};

const CARD_BACK_COLOR = "#06b891";

function getPlayerPositions(count: number, radius: number) {
  const positions: { x: number; z: number; angle: number }[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
    positions.push({
      x: Math.cos(angle) * radius,
      z: Math.sin(angle) * radius,
      angle: angle + Math.PI,
    });
  }
  return positions;
}

// Clickable 3D button on the table
function TableButton({
  label,
  position,
  onClick,
  color = "#8be9fd",
  textColor = "#282a36",
  width = 0.9,
}: {
  label: string;
  position: [number, number, number];
  onClick: () => void;
  color?: string;
  textColor?: string;
  width?: number;
}) {
  const [hovered, setHovered] = useState(false);
  const ref = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!ref.current) return;
    const scale = hovered ? 1.08 : 1;
    ref.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.15);
  });

  return (
    <group position={position}>
      <mesh
        ref={ref}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[width, 0.06, 0.25]} />
        <meshStandardMaterial
          color={hovered ? "#f8f8f2" : color}
          roughness={0.4}
          metalness={0.2}
        />
      </mesh>
      <Text
        position={[0, 0.04, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.08}
        color={textColor}
        anchorX="center"
        anchorY="middle"
        font={undefined}
      >
        {label}
      </Text>
    </group>
  );
}

// Horizontal group that rotates only on Y axis to face camera
function TableMat({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);

  useFrame(({ camera }) => {
    if (!ref.current) return;
    // Only rotate Y to face camera, keep flat on table
    const dir = new THREE.Vector3();
    dir.subVectors(camera.position, ref.current.position);
    const angle = Math.atan2(dir.x, dir.z);
    ref.current.rotation.y = angle;
  });

  return <group ref={ref}>{children}</group>;
}

// Floating text label above the table center
function CenterLabel({
  text,
  color = "#f8f8f2",
  y = 2,
}: {
  text: string;
  color?: string;
  y?: number;
}) {
  return (
    <Billboard follow position={[0, y, 0]}>
      <Text
        fontSize={0.2}
        color={color}
        anchorX="center"
        anchorY="middle"
        font={undefined}
      >
        {text}
      </Text>
    </Billboard>
  );
}

// Action selection: buttons arranged in a circle on the table
function ActionButtons3D() {
  const { action, state, socketId, myTurn } = useGame();
  const { t } = useTranslation();
  const [selectedAction, setSelectedAction] = useState<
    PlayerActionType | undefined
  >();

  const currentPlayer = state.players.find((p) => p.id === socketId);
  const mustCoup = (currentPlayer?.coins ?? 0) >= 10;
  const eliminated =
    currentPlayer?.cards.every((c) => c.revealed) ?? false;

  const handleAction = useCallback(
    (type: PlayerActionType, targetId?: string) => {
      action({ type, targetId });
      setSelectedAction(undefined);
    },
    [action],
  );

  if (state.phase !== "ACTION_SELECTION") return null;
  if (!myTurn || eliminated) return null;

  // Target selection mode
  if (selectedAction && GAME_ACTIONS[selectedAction].targetRequired) {
    const targets = state.players.filter(
      (p) => p.id !== socketId && !p.cards.every((c) => c.revealed),
    );

    return (
      <TableMat>
        <CenterLabel text={t("game.select_target")} color="#f1fa8c" />
        {targets.map((p, i) => (
          <TableButton
            key={p.username}
            label={p.username}
            position={[
              (i - (targets.length - 1) / 2) * 1.1,
              0.5,
              -0.8,
            ]}
            color="#ffb86c"
            onClick={() => handleAction(selectedAction, p.id)}
          />
        ))}
        <TableButton
          label={t("game.back")}
          position={[0, 0.5, 0.5]}
          color="#6272a4"
          textColor="#f8f8f2"
          onClick={() => setSelectedAction(undefined)}
        />
      </TableMat>
    );
  }

  // Action buttons on the table
  const actions = Object.entries(GAME_ACTIONS).filter(([key]) => {
    if (mustCoup) return key === "COUP";
    const config = GAME_ACTIONS[key as PlayerActionType];
    if (config.cost > 0 && (currentPlayer?.coins ?? 0) < config.cost)
      return false;
    return true;
  });

  const cols = 3;
  const spacingX = 1.05;
  const spacingZ = 0.35;

  return (
    <TableMat>
      <CenterLabel text={t("game.phase.ACTION_SELECTION")} color="#bd93f9" />
      {actions.map(([key, config], i) => {
        const row = Math.floor(i / cols);
        const col = i % cols;
        const itemsInRow = Math.min(cols, actions.length - row * cols);
        const offsetX = (col - (itemsInRow - 1) / 2) * spacingX;

        return (
          <TableButton
            key={key}
            label={
              t(`game.action.${key}`) +
              (config.cost > 0 ? ` (${config.cost})` : "")
            }
            position={[offsetX, 0.5, -0.7 + row * spacingZ]}
            width={0.95}
            onClick={() => {
              if (config.targetRequired) {
                setSelectedAction(key as PlayerActionType);
              } else {
                handleAction(key as PlayerActionType);
              }
            }}
          />
        );
      })}
    </TableMat>
  );
}

// Challenge/Pass buttons for challenge and block-challenge windows
function ChallengeButtons3D() {
  const { challenge, state, socketId } = useGame();
  const { t } = useTranslation();

  const isChallengeable =
    state.phase === "CHALLENGE_WINDOW" ||
    state.phase === "BLOCK_CHALLENGE_WINDOW";
  if (!isChallengeable) return null;

  const isActor =
    state.phase === "CHALLENGE_WINDOW" &&
    socketId === state.pendingAction?.actorId;
  const isBlocker =
    state.phase === "BLOCK_CHALLENGE_WINDOW" &&
    socketId === state.pendingAction?.blockedBy;
  const isEliminated =
    state.players
      .find((p) => p.id === socketId)
      ?.cards.every((c) => c.revealed) ?? false;
  const alreadyPassed =
    state.pendingAction?.playersRefusedChallenge.includes(socketId);

  if (isActor || isBlocker || isEliminated || alreadyPassed) {
    return (
      <CenterLabel
        text={
          alreadyPassed
            ? t("game.passed")
            : t("game.phase." + state.phase)
        }
        color="#6272a4"
      />
    );
  }

  return (
    <TableMat>
      <CenterLabel text={t("game.phase." + state.phase)} color="#ffb86c" />
      <TableButton
        label={t("game.challenge")}
        position={[-0.6, 0.5, -0.4]}
        color="#ff5555"
        textColor="#f8f8f2"
        onClick={() => challenge({ challenge: true })}
      />
      <TableButton
        label={t("game.pass")}
        position={[0.6, 0.5, -0.4]}
        color="#6272a4"
        textColor="#f8f8f2"
        onClick={() => challenge({ challenge: false })}
      />
    </TableMat>
  );
}

// Block buttons
function BlockButtons3D() {
  const { block, challenge, state, socketId } = useGame();
  const { t } = useTranslation();

  if (state.phase !== "BLOCK_WINDOW") return null;

  const action = state.pendingAction;
  if (!action) return null;

  const config = GAME_ACTIONS[action.type];
  const isEliminated =
    state.players
      .find((p) => p.id === socketId)
      ?.cards.every((c) => c.revealed) ?? false;

  if (socketId === action.actorId || isEliminated) {
    return <CenterLabel text={t("game.waiting_block")} color="#6272a4" />;
  }

  if (config.targetRequired && action.targetId && socketId !== action.targetId) {
    return <CenterLabel text={t("game.waiting_block")} color="#6272a4" />;
  }

  const alreadyPassed = action.playersRefusedBlock?.includes(socketId);
  if (alreadyPassed) {
    return <CenterLabel text={t("game.passed_block")} color="#6272a4" />;
  }

  return (
    <TableMat>
      <CenterLabel text={t("game.block_window")} color="#ff79c6" />
      {config.blockableBy.map((char, i) => (
        <TableButton
          key={char}
          label={t("game.block", { character: t(`game.character.${char}`) })}
          position={[
            (i - (config.blockableBy.length - 1) / 2) * 1.2,
            0.5,
            -0.6,
          ]}
          color="#ff79c6"
          textColor="#f8f8f2"
          width={1.1}
          onClick={() => block({ character: char as Character })}
        />
      ))}
      <TableButton
        label={t("game.pass")}
        position={[0, 0.5, -0.1]}
        color="#6272a4"
        textColor="#f8f8f2"
        onClick={() => challenge({ challenge: false })}
      />
    </TableMat>
  );
}

// Discard influence: clickable cards
function DiscardButtons3D() {
  const { discard, state, socketId } = useGame();
  const { t } = useTranslation();

  if (state.phase !== "DISCARD_INFLUENCE") return null;

  const isVictim = state.victimId === socketId;
  if (!isVictim) {
    const victim = state.players.find((p) => p.id === state.victimId);
    return (
      <CenterLabel
        text={t("game.waiting_discard", { player: victim?.username })}
        color="#ff5555"
      />
    );
  }

  const player = state.players.find((p) => p.id === socketId);
  const unrevealed =
    player?.cards
      .map((c, i) => ({ card: c, index: i }))
      .filter((e) => !e.card.revealed) ?? [];

  return (
    <TableMat>
      <CenterLabel text={t("game.choose_card")} color="#ff5555" />
      {unrevealed.map(({ card, index }, i) => (
        <TableButton
          key={index}
          label={card.type ? t(`game.character.${card.type}`) : "???"}
          position={[(i - (unrevealed.length - 1) / 2) * 1.1, 0.5, -0.4]}
          color={card.type ? CHARACTER_COLORS[card.type] : "#555"}
          textColor="#f8f8f2"
          onClick={() => discard({ cardIndex: index })}
        />
      ))}
    </TableMat>
  );
}

// Exchange selection
function ExchangeButtons3D() {
  const { exchange, state, socketId } = useGame();
  const { t } = useTranslation();
  const [selected, setSelected] = useState<number[]>([]);

  if (state.phase !== "EXCHANGE_SELECTION") return null;

  const isActor = state.pendingAction?.actorId === socketId;
  if (!isActor) {
    const actor = state.players.find(
      (p) => p.id === state.pendingAction?.actorId,
    );
    return (
      <CenterLabel
        text={t("game.waiting_exchange", { player: actor?.username })}
        color="#50fa7b"
      />
    );
  }

  const player = state.players.find((p) => p.id === socketId);
  const unrevealed =
    player?.cards
      .map((c, i) => ({ card: c, index: i }))
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

  return (
    <TableMat>
      <CenterLabel
        text={`${t("game.exchange_prompt")} (${selected.length}/2)`}
        color="#50fa7b"
      />
      {unrevealed.map(({ card, index }, i) => {
        const isSelected = selected.includes(index);
        return (
          <TableButton
            key={index}
            label={card.type ? t(`game.character.${card.type}`) : "???"}
            position={[
              (i - (unrevealed.length - 1) / 2) * 0.8,
              0.5,
              -0.6,
            ]}
            color={isSelected ? "#ff5555" : card.type ? CHARACTER_COLORS[card.type] : "#555"}
            textColor="#f8f8f2"
            width={0.7}
            onClick={() => toggleCard(index)}
          />
        );
      })}
      {selected.length === 2 && (
        <TableButton
          label={t("game.exchange_confirm")}
          position={[0, 0.5, 0]}
          color="#50fa7b"
          width={1.2}
          onClick={() => {
            exchange({ returnIndices: selected });
            setSelected([]);
          }}
        />
      )}
    </TableMat>
  );
}

// Lobby: Start button
function LobbyButtons3D() {
  const { start, state, socketId } = useGame();
  const { t } = useTranslation();

  if (state.phase !== "LOBBY") return null;

  const me = state.players.find((p) => p.id === socketId);
  const isOwner = me?.username === state.owner;

  return (
    <TableMat>
      <CenterLabel text={t("game.phase.LOBBY")} color="#6272a4" y={2.2} />
      <CenterLabel
        text={`${state.players.length} ${t("views.find.table_players").toLowerCase()}`}
        color="#f8f8f2"
        y={1.8}
      />
      {isOwner && (
        <TableButton
          label={t("game.start")}
          position={[0, 0.5, 0]}
          color="#50fa7b"
          width={1.2}
          onClick={() => start()}
        />
      )}
    </TableMat>
  );
}

// Game over
function GameOverPanel3D() {
  const { restart, state, socketId } = useGame();
  const { t } = useTranslation();

  if (state.phase !== "GAME_OVER") return null;

  const me = state.players.find((p) => p.id === socketId);
  const isOwner = me?.username === state.owner;

  return (
    <TableMat>
      <CenterLabel text={t("game.game_over")} color="#f1fa8c" y={2.4} />
      <CenterLabel
        text={t("game.wins", { player: state.winner })}
        color="#50fa7b"
        y={2}
      />
      {isOwner && (
        <TableButton
          label={t("game.play_again")}
          position={[0, 0.5, 0]}
          color="#8be9fd"
          width={1.2}
          onClick={() => restart()}
        />
      )}
    </TableMat>
  );
}

// Waiting label for non-active players
function WaitingLabel3D() {
  const { state, socketId, myTurn } = useGame();
  const { t } = useTranslation();

  const eliminated =
    state.players
      .find((p) => p.id === socketId)
      ?.cards.every((c) => c.revealed) ?? false;

  if (state.phase === "ACTION_SELECTION" && (!myTurn || eliminated)) {
    const current = state.players.find((p) => p.id === state.currentTurn);
    return (
      <CenterLabel
        text={t("game.waiting_action", { player: current?.username })}
        color="#6272a4"
      />
    );
  }

  return null;
}

// Action info label
function ActionInfoLabel3D() {
  const { state } = useGame();
  const { t } = useTranslation();

  const action = state.pendingAction;
  if (!action) return null;
  if (
    state.phase !== "CHALLENGE_WINDOW" &&
    state.phase !== "BLOCK_WINDOW" &&
    state.phase !== "BLOCK_CHALLENGE_WINDOW"
  )
    return null;

  const actor = state.players.find((p) => p.id === action.actorId);
  const target = action.targetId
    ? state.players.find((p) => p.id === action.targetId)
    : null;

  const text =
    `${actor?.username} → ${t(`game.action.${action.type}`)}` +
    (target ? ` → ${target.username}` : "");

  return <CenterLabel text={text} color="#f1fa8c" y={2.4} />;
}

// 3D Card
function Card3D({
  card,
  isMine,
  position,
  rotation,
}: {
  card: InfluenceCard;
  isMine: boolean;
  position: [number, number, number];
  rotation: [number, number, number];
}) {
  const ref = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const { t } = useTranslation();

  const canSee = isMine || card.revealed;
  const faceColor =
    canSee && card.type ? CHARACTER_COLORS[card.type] : CARD_BACK_COLOR;

  useFrame(() => {
    if (!ref.current) return;
    const targetY = position[1] + (hovered && isMine ? 0.15 : 0);
    ref.current.position.y += (targetY - ref.current.position.y) * 0.1;
  });

  return (
    <group
      ref={ref}
      position={position}
      rotation={rotation}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <RoundedBox args={[0.55, 0.8, 0.03]} radius={0.04} smoothness={4}>
        <meshStandardMaterial
          color={faceColor}
          roughness={0.3}
          metalness={0.1}
          transparent={card.revealed}
          opacity={card.revealed ? 0.5 : 1}
        />
      </RoundedBox>
      <Text
        position={[0, 0, 0.02]}
        fontSize={0.1}
        color="white"
        anchorX="center"
        anchorY="middle"
        font={undefined}
      >
        {canSee && card.type ? t(`game.character.${card.type}`) : "?"}
      </Text>
      {card.revealed && (
        <RoundedBox args={[0.58, 0.83, 0.02]} radius={0.04} smoothness={4}>
          <meshStandardMaterial
            color="#ff5555"
            transparent
            opacity={0.3}
            roughness={1}
          />
        </RoundedBox>
      )}
    </group>
  );
}

// Player seat
function PlayerSeat({
  player,
  isSelf,
  isCurrentTurn,
  seatPosition,
}: {
  player: Player;
  isSelf: boolean;
  isCurrentTurn: boolean;
  seatPosition: { x: number; z: number };
}) {
  const { t } = useTranslation();
  const isEliminated =
    player.cards.length > 0 && player.cards.every((c) => c.revealed);

  const cardSpread = 0.65;
  const cardHeight = 0.85;

  return (
    <group position={[seatPosition.x, 0.5, seatPosition.z]}>
      <Billboard follow lockX={false} lockY={false} lockZ={false}>
        {/* Name plate */}
        <group position={[0, 0.55, 0]}>
          <RoundedBox args={[1.5, 0.25, 0.05]} radius={0.03} smoothness={4}>
            <meshStandardMaterial
              color={
                isCurrentTurn
                  ? "#8be9fd"
                  : isEliminated
                    ? "#44475a"
                    : "#282a36"
              }
              roughness={0.5}
            />
          </RoundedBox>
          <Text
            position={[0, 0.02, 0.03]}
            fontSize={0.1}
            color={
              !player.active
                ? "#ff5555"
                : isEliminated
                  ? "#6272a4"
                  : "#f8f8f2"
            }
            anchorX="center"
            anchorY="middle"
            font={undefined}
          >
            {player.username}
            {!player.active ? ` (${t("game.offline")})` : ""}
            {player.coins > 0 ? `  💰${player.coins}` : ""}
          </Text>
        </group>

        {/* Cards */}
        {player.cards.map((card, i) => {
          const totalCards = player.cards.length;
          const offsetX = (i - (totalCards - 1) / 2) * cardSpread;
          return (
            <Card3D
              key={i}
              card={card}
              isMine={isSelf}
              position={[offsetX, cardHeight, 0]}
              rotation={[0, 0, 0]}
            />
          );
        })}
      </Billboard>

      {isCurrentTurn && (
        <pointLight
          position={[0, 1.5, 0]}
          color="#8be9fd"
          intensity={2}
          distance={3}
        />
      )}
    </group>
  );
}

function Table() {
  return (
    <group>
      <mesh position={[0, 0.4, 0]} receiveShadow>
        <cylinderGeometry args={[2.5, 2.5, 0.12, 64]} />
        <meshStandardMaterial color="#1a5c3a" roughness={0.8} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.4, 0.6, 0.35, 32]} />
        <meshStandardMaterial
          color="#3d1f0a"
          roughness={0.4}
          metalness={0.2}
        />
      </mesh>
      <mesh
        position={[0, -0.15, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#1a1a2e" roughness={1} />
      </mesh>
    </group>
  );
}

function Deck({ count, position = [0, 0, 0] }: { count: number; position?: [number, number, number] }) {
  const stackHeight = Math.min(count, 15);
  return (
    <group position={[position[0], position[1] + 0.5, position[2]]}>
      {Array.from({ length: stackHeight }).map((_, i) => (
        <RoundedBox
          key={i}
          args={[0.55, 0.8, 0.02]}
          radius={0.04}
          smoothness={4}
          position={[0, i * 0.015, 0]}
          rotation={[-Math.PI / 2, 0, i * 0.02]}
        >
          <meshStandardMaterial
            color={CARD_BACK_COLOR}
            roughness={0.3}
            metalness={0.1}
          />
        </RoundedBox>
      ))}
      <Text
        position={[0, stackHeight * 0.015 + 0.05, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.15}
        color="white"
        anchorX="center"
        font={undefined}
      >
        {`${count}`}
      </Text>
    </group>
  );
}

function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-3, 5, -3]} intensity={0.3} />
      <pointLight position={[0, 4, 0]} intensity={0.5} color="#f1fa8c" />
    </>
  );
}

function GameScene() {
  const { state, socketId } = useGame();

  const myIndex = state.players.findIndex((p) => p.id === socketId);
  const tableRadius = 3;

  const positions = useMemo(() => {
    const pos = getPlayerPositions(state.players.length, tableRadius);
    if (myIndex <= 0) return pos;
    return [
      ...pos.slice(pos.length - myIndex),
      ...pos.slice(0, pos.length - myIndex),
    ];
  }, [state.players.length, myIndex]);

  return (
    <>
      <SceneLighting />
      <Table />
      <Deck count={state.deckCount} position={[1.8, 0, -0.5]} />

      {state.players.map((player, i) => {
        const pos = positions[i];
        if (!pos) return null;
        return (
          <PlayerSeat
            key={player.username}
            player={player}
            isSelf={player.id === socketId}
            isCurrentTurn={state.currentTurn === player.id}
            seatPosition={pos}

          />
        );
      })}

      {/* Interactive 3D buttons for all phases */}
      <LobbyButtons3D />
      <ActionButtons3D />
      <WaitingLabel3D />
      <ActionInfoLabel3D />
      <ChallengeButtons3D />
      <BlockButtons3D />
      <DiscardButtons3D />
      <ExchangeButtons3D />
      <GameOverPanel3D />

      <OrbitControls
        target={[0, 0.8, 0]}
        maxPolarAngle={Math.PI / 2.1}
        minDistance={3}
        maxDistance={12}
        enablePan={false}
      />
    </>
  );
}

export function Room3d() {
  return (
    <div style={{ width: "100%", height: "100%", background: "#0a0a1a" }}>
      <Canvas
        shadows
        camera={{ position: [0, 5, 7], fov: 50, near: 0.1, far: 100 }}
        gl={{ antialias: true }}
      >
        <GameScene />
      </Canvas>
    </div>
  );
}
