# Implementation Log

## 2026-03-08 - Governance and delivery model
- Added `dev` branch in both repos and pushed it to origin.
- Added workflow policy docs: `CONTRIBUTING.md`, `RELEASE_PROCESS.md`, `.github/PULL_REQUEST_TEMPLATE.md`.
- Added CI workflows:
  - server: build + targeted Tressette HTTP tests
  - app: build
- Fixed server startup entrypoint in nodemon (`src/server.ts` instead of `src/index.ts`).

## 2026-03-08 - Backend Tressette API/Socket baseline
- HTTP endpoints implemented:
  - `POST /api/tressette/tables`
  - `GET /api/tressette/tables/:tableId`
  - `POST /api/tressette/tables/:tableId/join`
  - `POST /api/tressette/tables/:tableId/leave`
  - `POST /api/tressette/tables/:tableId/start`
- Socket events implemented for table lifecycle:
  - `tressette:join-table`
  - `tressette:leave-table`
  - `tressette:start-game`
  - `tressette:play-card` (currently `NOT_IMPLEMENTED`)

## 2026-03-08 - Frontend visual and integration baseline
- Restored visible Tressette route and page rendering.
- Added backend and socket integration service layer.
- Added manual controls to drive create/join/start flows from UI.

## Log format for next entries
- Date/Time
- Repo
- Branch
- Task id/name
- Files changed
- Validation performed
- Risks/notes

## 2026-03-08 - Lobby Tavoli Tressette (thread outputs synced)
- FE output: lobby page added with list/create/join and visual marker for full tables (4/4).
- BE output: GET /api/tressette/tables endpoint added with ordering and contract updates.
- Validation reported:
  - FE: build + headless tests green in thread output.
  - BE: targeted HTTP suite 10 passed, build OK.
- Note: state was consolidated in project memory; branch cleanliness/PR flow remains mandatory before merge.

