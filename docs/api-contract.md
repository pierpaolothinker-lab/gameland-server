# Gameland API Contract

Last updated: 2026-03-08
Source of truth: backend (`gameland-server`)

## Purpose
This document defines the integration contract between:
- Backend: `gameland-server`
- Frontend: `gameland-app`

Use this file as the single reference when backend/frontend are developed in separate threads.

## Environments
- Backend local base URL: `http://localhost:3500`
- Frontend local URL: `http://localhost:4200` (legacy) and `http://localhost:4400` (current mock/dev host)

## Runtime Baseline (Task 1)
This baseline is effective for all implementation threads until explicitly changed.

- API base URL (backend): `http://localhost:3500`
- Socket.IO server URL: `http://localhost:3500` (default path `/socket.io`; no custom namespace required for FE integration)
- Frontend dev URL: `http://localhost:4200`
- Tressette HTTP base path: `/api/tressette/tables` (plural)

### Current known mismatch (to be fixed in frontend implementation thread)
- `gameland-app` environment currently points to port `3000`.
- `gameland-app` currently uses `/api/tressette/table` (singular).
- `gameland-app` uses native `WebSocket`, while backend realtime is `Socket.IO`.

## HTTP API (current)

### Health
- Method: `GET`
- Path: `/health`
- Response `200`:

```json
{ "status": "ok" }
```

### Tressette - Create table
- Method: `POST`
- Path: `/api/tressette/tables`
- Request body:

```json
{ "owner": "PlayerName" }
```

- Validation: `owner` is required, trimmed, non-empty, max 32 chars.
- Response `201`:

```json
{
  "tableId": "uuid",
  "owner": "PlayerName",
  "players": [{ "username": "PlayerName", "position": "SUD" }],
  "isComplete": false,
  "points": { "teamSN": 0, "teamEO": 0 },
  "status": "waiting"
}
```

### Tressette - Join table
- Method: `POST`
- Path: `/api/tressette/tables/:tableId/join`
- Request body:

```json
{ "username": "PlayerName", "position": "NORD" }
```

- Validation: `username` is required, trimmed, non-empty, max 32 chars.
- Response `200`: table snapshot updated.

### Tressette - Leave table
- Method: `POST`
- Path: `/api/tressette/tables/:tableId/leave`
- Request body:

```json
{ "username": "PlayerName" }
```

- Response `200`: table snapshot updated.

### Tressette - Start game
- Method: `POST`
- Path: `/api/tressette/tables/:tableId/start`
- Request body:

```json
{ "username": "OwnerName" }
```

- Response `200`: table snapshot with `status: "in_game"`.

### Tressette - Get table
- Method: `GET`
- Path: `/api/tressette/tables/:tableId`
- Response `200`: table snapshot.

## WebSocket (Socket.IO) (current)
Connection is initialized on backend server startup.

### Server -> client events
- `message`
  - On connect: welcome text
  - On user connect/disconnect: broadcast text
- `activity`
  - Broadcast when another user emits activity

### Client -> server events
- `message`
  - Payload: free text
  - Behavior: server re-broadcasts to all clients
- `activity`
  - Payload: `name` string
  - Behavior: server broadcasts to other clients

## Tressette MVP Contract (partial)
Status: `PARTIALLY_IMPLEMENTED` (HTTP endpoints create/join/leave/start/get are implemented; realtime start/turn/timeout/autoplay chain is implemented server-side for dev flow).

### Table model (logical)
- `tableId: string`
- `owner: string`
- `players: Array<{ username: string, position: "SUD" | "NORD" | "EST" | "OVEST" }>`
- `isComplete: boolean`
- `points: { teamSN: number, teamEO: number }`
- `status: "waiting" | "in_game" | "ended"`

### Tressette Socket.IO events (current)
Client -> server:
- `tressette:join-table` payload `{ tableId, username, position }`
- `tressette:leave-table` payload `{ tableId, username }`
- `tressette:start-game` payload `{ tableId, username }`
- `tressette:play-card` payload `{ tableId, username, card? }`
  - `card` is optional; if omitted server can auto-select a valid card for the player turn.

Server -> client:
- `tressette:table-updated` emitted to room `tressette:table:{tableId}` on join/leave/start/play-card.
- `tressette:hand-started` emitted on successful start-game (triggered by socket start event or HTTP `/tables/:tableId/start` when realtime server is active).
- `tressette:turn-started` emitted immediately after hand-started and then at each turn start with payload `{ tableId, trickNumber, currentPlayer, turnDeadlineMs, secondsRemaining, timeoutSeconds }`.
- `tressette:turn-updated` emitted every second during active turn countdown with payload `{ tableId, trickNumber, currentPlayer, turnDeadlineMs, secondsRemaining, timeoutSeconds }`.
- `tressette:card-played` emitted on each accepted play with payload `{ tableId, trickNumber, username, card, source }` (includes `source: "timeout_auto"` when autoplay is triggered by timer expiry).
  - `source` is `"manual"` or `"timeout_auto"`.
- `tressette:trick-ended` emitted after 4 cards of a trick with payload `{ tableId, trickNumber, winner, trickPoints, scoreSN, scoreEO }`.
- `tressette:error` emitted with contract error payload on validation/domain failures.

## Data conventions
- Content type: `application/json`
- IDs: strings
- Position values on API should use uppercase Italian labels:
  - `SUD`, `NORD`, `EST`, `OVEST`
- Error payload shape:

```json
{
  "error": {
    "code": "STRING_CODE",
    "message": "Human readable message"
  }
}
```

### Current HTTP error codes used by Tressette endpoints
- `VALIDATION_ERROR` -> invalid/missing request fields (`400`)
- `TABLE_NOT_FOUND` -> table does not exist (`404`)
- `TABLE_FULL` -> all positions already occupied (`409`)
- `POSITION_NOT_AVAILABLE` -> requested seat already occupied (`409`)
- `PLAYER_ALREADY_JOINED` -> username already in table (`409`)
- `PLAYER_NOT_FOUND` -> leave request for non-existent player (`404`)
- `OWNER_CANNOT_LEAVE` -> owner cannot leave table (`409`)
- `FORBIDDEN_START` -> non-owner trying to start (`403`)
- `TABLE_NOT_COMPLETE` -> start with < 4 players (`409`)
- `TABLE_ALREADY_STARTED` -> start requested after game start (`409`)
- `TABLE_NOT_JOINABLE` -> join after game start (`409`)
- `TABLE_NOT_LEAVABLE` -> leave after game start (`409`)
- `TABLE_NOT_IN_GAME` -> play-card attempted when table is not in_game (`409`)
- `ENGINE_NOT_INITIALIZED` -> missing runtime engine session for table (`409`)
- `NOT_PLAYER_TURN` -> play-card by player not in turn (`409`)
- `INVALID_CARD` -> invalid card payload format/value (`400`)
- `CARD_NOT_OWNED` -> selected card is not owned by player (`409`)
- `HAND_ALREADY_COMPLETED` -> play-card attempted after hand completed (`409`)

## Mock Auth Session (dev only)
This project does not implement real authentication in this scope (no JWT/session provider).

Current temporary behavior for frontend mock logged-user UX:
- FE may keep sending `owner`/`username` in HTTP payloads.
- Backend validates usernames with minimal robust rules:
  - required
  - trim applied
  - non-empty after trim
  - max length 32
- Optional header `x-mock-username` is supported only in non-production runtime (`NODE_ENV !== "production"`).
  - If present and valid, it overrides body `owner`/`username` for create/join.
  - If invalid, backend returns `400` with contract error payload (`VALIDATION_ERROR`).
- In production, `x-mock-username` is ignored and body fields are used.

Out of scope for this task:
- Real auth, JWT, refresh tokens, identity provider integration.

## Change policy
When backend changes any endpoint/payload/event:
1. Update this file in the same PR/commit.
2. Add a short "Contract changes" section in commit/PR notes.
3. Notify frontend thread with exact changed paths and examples.



