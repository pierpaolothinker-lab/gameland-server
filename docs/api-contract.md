# Gameland API Contract

Last updated: 2026-03-08
Source of truth: backend (`gameland-server`)

## Purpose
This document defines the integration contract between:
- Backend: `gameland-server`
- Frontend: `gameland-app`

## Environments
- Backend local base URL: `http://localhost:3500`
- Frontend local URL: `http://localhost:4200` (legacy) and `http://localhost:4400` (current dev host)

## Runtime Baseline
- API base URL (backend): `http://localhost:3500`
- Socket.IO server URL: `http://localhost:3500`
- Tressette HTTP base path: `/api/tressette/tables`

## Mode semantics
- Supported modes: `demo` | `live`
- Resolution precedence:
1. Query param `mode`
2. Header `x-mode` or `x-tressette-mode`
- Default when omitted: `demo`
- Invalid explicit mode: `400 VALIDATION_ERROR`
- Same mode must be used consistently for HTTP and Socket flows.

## HTTP API
### Health
- `GET /health` -> `200 { "status": "ok" }`

### Tressette - Create table
- `POST /api/tressette/tables`
- Body: `{ "owner": "PlayerName" }`
- `201` -> table snapshot

### Tressette - List tables
- `GET /api/tressette/tables`
- `200` -> table snapshots array (mode-aware)

### Tressette - Get table
- `GET /api/tressette/tables/:tableId`
- `200` -> table snapshot
- If table is `in_game`, response may include `currentTurn` bootstrap metadata.

### Tressette - Join table
- `POST /api/tressette/tables/:tableId/join`
- Body: `{ "username": "PlayerName", "position": "NORD" }`

### Tressette - Leave table
- `POST /api/tressette/tables/:tableId/leave`
- Body: `{ "username": "PlayerName" }`

### Tressette - Start game
- `POST /api/tressette/tables/:tableId/start`
- Body: `{ "username": "OwnerName" }`
- `200` -> table snapshot with `status: "in_game"`

## Socket.IO events
Turn order semantics (4 Incrociato, server-authoritative):
- `SUD -> EST -> NORD -> OVEST -> SUD`
- Covered case: `Paolo -> Marta`

Client -> server:
- `tressette:join-table` `{ tableId, username, position }`
- `tressette:leave-table` `{ tableId, username }`
- `tressette:start-game` `{ tableId, username }`
- `tressette:play-card` `{ tableId, username, card? }`
- `tressette:watch-table` `{ tableId, mode }` (watch/bootstrap request)
- `tressette:bootstrap-table` `{ tableId }` (explicit bootstrap request)

Server -> client:
- `tressette:mode-selected`
- `tressette:table-updated`
- `tressette:hand-started`
- `tressette:turn-started` `{ tableId, mode, trickNumber, currentPlayer, turnDeadlineMs, secondsRemaining, timeoutSeconds }`
- `tressette:turn-updated` `{ tableId, mode, trickNumber, currentPlayer, turnDeadlineMs, secondsRemaining, timeoutSeconds }`
- `tressette:turn-bootstrap` `{ tableId, mode, trickNumber, currentPlayer, turnDeadlineMs, secondsRemaining, timeoutSeconds }`
- `tressette:card-played` `{ tableId, mode, trickNumber, username, card, source }`
  - `source`: `manual | timeout_auto`
- `tressette:trick-ended` `{ tableId, mode, trickNumber, winner, trickPoints, scoreSN, scoreEO }`
- `tressette:error`

### Timeout/autoplay
- Turn timeout: `20s` server-authoritative.
- On timeout, server auto-plays a random playable card and emits normal play chain.

### Bootstrap rule (critical)
If table is already `in_game`, client bootstrap/reconnect must receive current turn immediately (via `turn-bootstrap` and/or `currentTurn` HTTP metadata) without waiting for next action.

## Table model
- `tableId: string`
- `owner: string`
- `players: Array<{ username: string, position: "SUD" | "NORD" | "EST" | "OVEST" }>`
- `isComplete: boolean`
- `points: { teamSN: number, teamEO: number }`
- `status: "waiting" | "in_game" | "ended"`

## Error payload
```json
{
  "error": {
    "code": "STRING_CODE",
    "message": "Human readable message"
  }
}
```

## Common HTTP error codes
- `VALIDATION_ERROR` (`400`)
- `TABLE_NOT_FOUND` (`404`)
- `TABLE_FULL` (`409`)
- `POSITION_NOT_AVAILABLE` (`409`)
- `PLAYER_ALREADY_JOINED` (`409`)
- `PLAYER_NOT_FOUND` (`404`)
- `OWNER_CANNOT_LEAVE` (`409`)
- `FORBIDDEN_START` (`403`)
- `TABLE_NOT_COMPLETE` (`409`)
- `TABLE_ALREADY_STARTED` (`409`)
- `TABLE_NOT_JOINABLE` (`409`)
- `TABLE_NOT_LEAVABLE` (`409`)
- `TABLE_NOT_IN_GAME` (`409`)
- `ENGINE_NOT_INITIALIZED` (`409`)
- `NOT_PLAYER_TURN` (`409`)
- `INVALID_CARD` (`400`)
- `CARD_NOT_OWNED` (`409`)
- `HAND_ALREADY_COMPLETED` (`409`)

## Change policy
When backend changes any endpoint/payload/event:
1. Update this file in the same PR/commit.
2. Add a short "Contract changes" section in PR notes.
3. Notify frontend thread with exact payload examples.
