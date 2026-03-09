# Gameland API Contract

Last updated: 2026-03-08
Source of truth: backend (`gameland-server`)

## Purpose
This document defines the integration contract between backend (`gameland-server`) and frontend (`gameland-app`).

## Environments
- Backend local base URL: `http://localhost:3500`
- Frontend local URL: `http://localhost:4200` (legacy) and `http://localhost:4400` (current dev host)

## Runtime Baseline
- API base URL: `http://localhost:3500`
- Socket.IO server URL: `http://localhost:3500`
- Tressette HTTP base path: `/api/tressette/tables`

## Mode semantics
- Supported modes: `demo` | `live`
- Resolution precedence:
1. Query param `mode`
2. Header `x-mode` or `x-tressette-mode`
- Default when omitted: `demo`
- Invalid explicit mode value: `400 VALIDATION_ERROR`
- Same mode must be used consistently for HTTP and socket flows.

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
- `404` -> `TABLE_NOT_FOUND`

### Tressette - Join table
- `POST /api/tressette/tables/:tableId/join`
- Body: `{ "username": "PlayerName", "position": "NORD" }`
- `200` -> updated table snapshot
- `404` -> `TABLE_NOT_FOUND`

### Tressette - Leave table
- `POST /api/tressette/tables/:tableId/leave`
- Body: `{ "username": "PlayerName" }`
- `200` -> updated table snapshot
- `404` -> `TABLE_NOT_FOUND`

### Tressette - Start game
- `POST /api/tressette/tables/:tableId/start`
- Body: `{ "username": "OwnerName" }`
- Preconditions:
  - only owner can start (`FORBIDDEN_START`, `403`)
  - table must be complete (`4/4`) (`TABLE_NOT_COMPLETE`, `409`)
  - table status must be `waiting` (`TABLE_ALREADY_STARTED`, `409`)
- `200` -> table snapshot with `status: "in_game"`
- `404` -> `TABLE_NOT_FOUND`

## Socket.IO events
Turn order semantics (4 Incrociato, server-authoritative):
- `SUD -> EST -> NORD -> OVEST -> SUD`
- Covered case: `Paolo -> Marta`

Client -> server:
- `tressette:join-table` `{ tableId, username, position }`
- `tressette:leave-table` `{ tableId, username }`
- `tressette:start-game` `{ tableId, username }`
- `tressette:play-card` `{ tableId, username, card? }`
- `tressette:watch-table` `{ tableId, mode }`
- `tressette:bootstrap-table` `{ tableId }`

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
- Turn timeout: `20s` (server-authoritative)
- On timeout, server auto-plays a random playable card and emits normal play chain.

### Bootstrap rule
If table is already `in_game`, bootstrap/reconnect must receive current turn immediately (via `turn-bootstrap` and/or HTTP `currentTurn`) without waiting for next action.

## Table model
- `tableId: string`
- `owner: string`
- `players: `Array<{ username: string, position: "SUD" | "NORD" | "EST" | "OVEST" }>`
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
3. Notify frontend thread with exact changed payload examples.


