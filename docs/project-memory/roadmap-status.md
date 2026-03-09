# Roadmap Status

## Phase 1 - Contract first + table baseline
- Status: Completed
- Done:
  - Branch governance and workflows established
  - Tressette table HTTP endpoints implemented
  - Frontend baseline integration validated
  - Lobby endpoint `GET /api/tressette/tables` implemented
  - Frontend lobby flow (list/create/join/start) implemented
  - Demo/live mode contract aligned

## Phase 2 - Realtime MVP coherence
- Status: In progress
- Done:
  - Socket table lifecycle events implemented
  - Owner start-game flow implemented
  - Engine integration in API/socket layer completed
  - Play-card baseline connected to engine
  - Turn timeout + autoplay chain implemented
  - Turn order and countdown payloads aligned in contract
- Remaining:
  - Turn bootstrap reliability in gameplay join/reconnect path (completed)
  - Observer mode
  - Reconnect/rejoin policy finalization

## Phase 3 - Beta hardening
- Status: Not started
- Planned:
  - Persistence strategy
  - Observability baseline
  - CI expansion + release hardening
  - Render deployment hardening

## Update Notes
- [2026-03-08 01:03] Governance ops improved: manual memory update command introduced.
- [2026-03-08 03:09] Task 7 outputs received; manual validation before merge started.
- [2026-03-08 03:20] Render deployment plan documented while Task 8 execution is in progress.
- [2026-03-08 04:43] Task 8 implementation completed on feature branches.
- [2026-03-08 21:09] Repositories cleaned: only `main` + `dev` active (server/app).

- [2026-03-09 02:34] Chiuso task authoritative hand/trick: gameplay ora backend-authoritative su mano+trick con reveal UX a fine trick.


- [2026-03-09 10:32] Update note: Kickoff parallel stream: BE server-authoritative follow-suit validation + FE playable-cards guard; both started on dedicated codex branches and tracked as P1 in board.
