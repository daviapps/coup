# Chat System

## Overview

The chat system allows players to communicate during the game. Messages can be sent to all players (public) or to a specific player (whisper/private).

## Data Model

Chat messages and game logs share the same `LogData` type, distinguished by the `type` field:

```typescript
type LogData = {
  type: "log" | "chat";
  message: string;
  sender: string;
  receiver?: string; // Set for whispers
};
```

- `type: "log"` — Game event (translated via i18n key in `message`)
- `type: "chat"` — Player message (raw text in `message`)

## Public Messages

1. Client emits `chat:message` with `{ message }` (no `targetUsername`).
2. Server stores the entry in `GameState.logs` (persists across syncs/reconnections).
3. Server broadcasts `chat:message` event to the entire room.

## Private Messages (Whisper)

1. Client emits `chat:message` with `{ message, targetUsername }`.
2. Server sends `chat:message` event **only** to sender and receiver sockets.
3. Message is **not** stored in `GameState.logs` (privacy: snapshots go to all players).
4. Whispers are ephemeral — lost on reconnection.

## Client Rendering

Messages are rendered differently based on type:

| Type                   | Style                                      |
|------------------------|--------------------------------------------|
| Game log (`type: "log"`) | Gray italic, translated via `t(message)`  |
| Public chat            | Green bold sender name + message           |
| Whisper (sent)         | Pink tag `[to receiver]` + purple message  |
| Whisper (received)     | Pink tag `[from sender]` + purple message  |

## UI

### Desktop (>= 768px)
- Chat panel on the right side of the game board (grid area `chat`).
- Input area at the bottom: target selector dropdown + text input + send button.

### Mobile (< 768px)
- Chat hidden by default.
- Floating button (bottom-right) toggles chat overlay.
- Red badge appears when there are unread messages.
- Overlay slides up from bottom with messages + input area.

## Validation

- Messages are trimmed and must be non-empty.
- Maximum 200 characters per message.
- Player must be in a room to send messages.

## i18n Keys

| Key                    | EN                  | PT                  |
|------------------------|---------------------|---------------------|
| chat.target_everyone   | Everyone            | Todos               |
| chat.target_whisper    | @ {{player}}        | @ {{player}}        |
| chat.whisper_from      | [from {{sender}}]   | [de {{sender}}]     |
| chat.whisper_to        | [to {{receiver}}]   | [para {{receiver}}] |
