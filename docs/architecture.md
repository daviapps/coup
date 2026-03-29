# Architecture

## Overview

Coup Online is a real-time multiplayer card game built as a monorepo with three workspaces:

```
coup/
├── client/    → React 19 SPA (Vite, Styled Components, Socket.IO Client)
├── server/    → Fastify + Socket.IO server (TypeScript, tsup)
└── shared/    → Shared types, rules, and utilities
```

## Tech Stack

| Layer    | Technology                                              |
|----------|---------------------------------------------------------|
| Client   | React 19, Vite 4, Styled Components 6, React Router 7  |
| Server   | Fastify, Socket.IO, Winston (logging)                   |
| Shared   | Pure TypeScript (types, rules config, utils)             |
| i18n     | i18next + react-i18next (EN/PT)                         |
| State    | useReducer + React Context (client), in-memory (server) |
| Deploy   | Docker Compose (Nginx + Node)                           |
| Package  | Yarn Workspaces                                         |

## Server Architecture

```
server/src/
├── server.ts                  → Entry point (Fastify + Socket.IO init)
├── api/
│   ├── routes/index.ts        → HTTP route definitions
│   └── controllers/
│       ├── room.controller.ts → Room CRUD endpoints
│       └── status.controller.ts → Health check
├── game/
│   ├── room-manager.ts        → Singleton managing all GameRoom instances
│   ├── room.ts                → GameRoom class (game flow orchestration)
│   └── state.ts               → GameState class (pure game state)
├── socket/
│   ├── emitter/index.ts       → Centralized Socket.IO event broadcaster
│   └── handlers/index.ts      → Socket.IO event listeners
└── services/
    └── logger.ts              → Winston logger setup
```

### Key Classes

- **RoomManager** — Singleton. Creates/destroys rooms, finds rooms by player socket or ID.
- **GameRoom** — Orchestrates the game flow: action → challenge → block → discard cycle. Manages timers, broadcasts state, handles all player events.
- **GameState** — Pure game state. Players, cards, deck, bank, phases. Exposes methods like `applyActionEffect()`, `resolveChallenge()`, `nextTurn()`. Returns personalized snapshots per player (hides other players' unrevealed cards).

### Data Flow

```
Client emits event (e.g., player:action)
  → Socket handler validates and routes to GameRoom method
    → GameRoom updates GameState
    → GameRoom calls broadcastSync()
      → GameState.getPublicSnapshot(username) per player
        → GameEmitter.syncGame(socketId, snapshot)
          → Client receives game:sync, dispatches to reducer
```

## Client Architecture

```
client/src/
├── App.tsx / Routes.tsx        → App shell and routing
├── main.tsx / i18n.ts          → Entry point and i18n setup
├── views/                      → Page components (Home, Join, New, Find, Room)
├── features/classic-coup/      → Game feature module
│   ├── providers/game-provider.tsx → Socket.IO connection + context
│   ├── store/game-reducer.ts   → Game state reducer
│   ├── hooks/use-game.ts       → useGame() hook
│   └── components/             → GameBoard, PlayerCards, InfluenceCard, Chat, etc.
├── components/                 → Shared UI (Button, Header, Avatar, etc.)
├── services/                   → socket-io.ts, api.ts
├── styles/                     → Global styles, theme, media queries
├── providers/                  → AppProvider (React Query, styled-components, toasts)
└── lib/                        → Constants, types
```

### State Management

Game state flows through:
1. **SocketProvider** (game-provider.tsx) — Connects to Socket.IO, dispatches events to reducer
2. **gameReducer** — Handles SYNC, PLAYER_JOINED/LEAVED/DISCONNECTED/RECONNECTED, ROOM_LOG, CHAT_MESSAGE
3. **useGame()** hook — Provides state + action emitters to components

### Styling

- Dracula color theme (dark background, cyan primary, yellow secondary)
- Responsive: mobile-first, tablet at 768px, desktop at 1024px
- CSS Grid layout in Room view: `players | board + chat | status`
- Chat hidden on mobile, accessible via floating toggle button

## HTTP API

| Method | Path                        | Description           |
|--------|-----------------------------|-----------------------|
| GET    | /                           | Health check          |
| GET    | /rooms                      | List all rooms        |
| GET    | /rooms/:roomId              | Get room info         |
| POST   | /rooms                      | Create room           |
| POST   | /rooms/:roomId/analyze      | Validate join attempt |

## Socket.IO Events

### Client → Server

| Event            | Payload                          | Description           |
|------------------|----------------------------------|-----------------------|
| player:join      | { roomId, username }             | Join a room           |
| game:start       | —                                | Owner starts game     |
| game:restart     | —                                | Owner restarts game   |
| player:action    | { type, targetId? }              | Perform action        |
| player:challenge | { challenge: boolean }           | Challenge or pass     |
| player:block     | { character }                    | Block with character  |
| player:discard   | { cardIndex }                    | Discard influence     |
| chat:message     | { message, targetUsername? }     | Send chat message     |

### Server → Client

| Event              | Payload                    | Description                |
|--------------------|----------------------------|----------------------------|
| game:sync          | { snapshot }               | Full personalized state    |
| player:joined      | { player }                 | New player notification    |
| player:leaved      | { username }               | Player left notification   |
| player:disconnected| { username }               | Player offline             |
| player:reconnected | { username }               | Player back online         |
| room:log           | { log }                    | Game log entry             |
| chat:message       | { log }                    | Chat message               |
| error              | { message }                | Error message              |
| server:announcement| { message, timestamp }     | Server-wide announcement   |
