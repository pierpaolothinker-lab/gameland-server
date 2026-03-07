# Gameland API Contract

Last updated: 2026-03-07
Source of truth: backend (`gameland-server`)

## Purpose
This document defines the integration contract between:
- Backend: `gameland-server`
- Frontend: `gameland-app`

Use this file as the single reference when backend/frontend are developed in separate threads.

## Environments
- Backend local base URL: `http://localhost:3500`
- Frontend local URL: `http://localhost:4200`


## Runtime Baseline (Task 1)
This baseline is effective for all implementation threads until explicitly changed.

- API base URL (backend): `http://localhost:3500`
- Socket.IO server URL: `http://localhost:3500` (default path `/socket.io`)
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

## Tressette MVP Contract (planned)
Status: `PLANNED` (not fully implemented as API yet)

### Table model (logical)
- `tableId: string`
- `owner: string`
- `players: Array<{ username: string, position: "SUD" | "NORD" | "EST" | "OVEST" }>`
- `isComplete: boolean`
- `points: { teamSN: number, teamEO: number }`
- `status: "waiting" | "in_game" | "ended"`

### Planned HTTP endpoints
- `POST /api/tressette/tables`
  - Create a table
- `POST /api/tressette/tables/:tableId/join`
  - Join a position
- `POST /api/tressette/tables/:tableId/leave`
  - Leave table
- `POST /api/tressette/tables/:tableId/start`
  - Start game (owner only)
- `GET /api/tressette/tables/:tableId`
  - Get table snapshot

### Planned socket events
- Client -> server
  - `tressette:join-table`
  - `tressette:leave-table`
  - `tressette:start-game`
  - `tressette:play-card`
- Server -> client
  - `tressette:table-updated`
  - `tressette:hand-started`
  - `tressette:trick-ended`
  - `tressette:game-ended`
  - `tressette:error`

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

## Change policy
When backend changes any endpoint/payload/event:
1. Update this file in the same PR/commit.
2. Add a short "Contract changes" section in commit/PR notes.
3. Notify frontend thread with exact changed paths and examples.

