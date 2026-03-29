# Game Flow

## Phases

The game progresses through these phases:

```
LOBBY → ACTION_SELECTION → [CHALLENGE_WINDOW] → [BLOCK_WINDOW]
  → [BLOCK_CHALLENGE_WINDOW] → [DISCARD_INFLUENCE] → ACTION_SELECTION
  → ... → GAME_OVER
```

| Phase                  | Description                                        |
|------------------------|----------------------------------------------------|
| LOBBY                  | Players join, owner starts game                    |
| ACTION_SELECTION       | Current player chooses an action                   |
| CHALLENGE_WINDOW       | Other players can challenge the action (5s timer)  |
| BLOCK_WINDOW           | Eligible players can block the action (5s timer)   |
| BLOCK_CHALLENGE_WINDOW | Players can challenge the block (5s timer)         |
| DISCARD_INFLUENCE      | A player must choose which card to reveal          |
| GAME_OVER              | One player remains with influence                  |

## Actions

| Action       | Cost | Character  | Challengeable | Blockable By          | Target |
|-------------|------|------------|---------------|-----------------------|--------|
| INCOME      | 0    | —          | No            | —                     | No     |
| FOREIGN_AID | 0    | —          | No            | DUKE                  | No     |
| TAX         | 0    | DUKE       | Yes           | —                     | No     |
| STEAL       | 0    | CAPTAIN    | Yes           | CAPTAIN, AMBASSADOR   | Yes    |
| ASSASSINATE | 3    | ASSASSIN   | Yes           | CONTESSA              | Yes    |
| EXCHANGE    | 0    | AMBASSADOR | Yes           | —                     | No     |
| COUP        | 7    | —          | No            | —                     | Yes    |

> **Note:** EXCHANGE is not yet fully implemented (TODO: card selection UI).

## Action Resolution Flow

### 1. Player declares action

- Costs are paid immediately (ASSASSINATE: 3, COUP: 7). Coins are lost even if challenged/blocked.
- If player has >= 10 coins, COUP is mandatory.

### 2. Challenge Window (if action is challengeable)

The action's `characterRequired` is the card the actor claims to have.

- **Someone challenges:**
  - Actor has the card → Challenger loses influence. Actor swaps card for a new one. Action continues.
  - Actor doesn't have the card → Actor loses influence. Action is cancelled.
- **Nobody challenges** (all pass or 5s timer expires) → Continue to block window or apply effect.

### 3. Block Window (if action is blockable)

- For targeted actions (STEAL, ASSASSINATE): only the target can block.
- For non-targeted (FOREIGN_AID): any player can block.
- Blocker claims to have one of the `blockableBy` characters.

- **Someone blocks** → Enter Block Challenge Window.
- **Nobody blocks** (all pass or timer) → Apply action effect.

### 4. Block Challenge Window

- **Someone challenges the block:**
  - Blocker has the card → Challenger loses influence. Block succeeds, action cancelled.
  - Blocker doesn't have the card → Blocker loses influence. Block fails, action proceeds.
- **Nobody challenges** → Block succeeds, action cancelled.

### 5. Apply Action Effect

| Action       | Effect                                          |
|-------------|-------------------------------------------------|
| INCOME      | Actor +1 coin from bank                         |
| FOREIGN_AID | Actor +2 coins from bank                        |
| TAX         | Actor +3 coins from bank                        |
| STEAL       | Transfer up to 2 coins from target to actor     |
| ASSASSINATE | Target must discard an influence                |
| COUP        | Target must discard an influence                |
| EXCHANGE    | (TODO) Draw 2 cards, return 2                   |

### 6. Discard Influence

When a player must lose an influence:
- If they have 2 unrevealed cards → Enter DISCARD_INFLUENCE phase, player chooses which to reveal.
- If they have 1 unrevealed card → Auto-revealed immediately.
- If all cards revealed → Player is eliminated.

### 7. Elimination & Game Over

- Eliminated players are skipped in turn order.
- Eliminated players continue as spectators (see all game events, no actions).
- When only 1 player has unrevealed cards → GAME_OVER, that player wins.
- Owner can restart the game from GAME_OVER phase (returns to LOBBY).

## Challenge Resolution (resolveChallenge)

When a challenge occurs:
1. Check if the challenged player has the claimed card (unrevealed).
2. **If they do:** Return the card to the deck, shuffle, draw a new card. Return `true`.
3. **If they don't:** Return `false`.
4. The caller (GameRoom) then enters DISCARD_INFLUENCE for the loser and sets the continuation callback.

## Reconnection

- When a player disconnects, they are marked `active: false` but stay in the game.
- On reconnect, `updatePlayerId()` maps their new socket ID, preserving all state references (currentTurn, pendingAction fields, victimId).
- Other players see "disconnected"/"reconnected" notifications.

## Card Distribution

| Players | Cards per Character | Total Cards |
|---------|-------------------|-------------|
| 3–6     | 3                 | 15          |
| 7–8     | 4                 | 20          |
| 9–10    | 5                 | 25          |

Each player receives 2 cards and 2 coins at game start.
