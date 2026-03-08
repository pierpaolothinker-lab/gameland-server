# Roadmap Status

## Phase 1 - Contract first + table baseline
- Status: In progress
- Done:
  - Branch governance and workflows established
  - Tressette table HTTP endpoints implemented
  - Frontend baseline integration validated
- Remaining:
  - Lobby endpoint `GET /api/tressette/tables`
  - Frontend lobby page for table list/create/join

## Phase 2 - Realtime MVP coherence
- Status: In progress
- Done:
  - Socket table lifecycle events implemented
- Remaining:
  - Observer mode
  - Gameplay events (`trick-ended`, `game-ended`) and play-card implementation

## Phase 3 - Beta hardening
- Status: Not started
- Planned:
  - Persistence strategy
  - Observability baseline
  - CI expansion + release hardening

## Update Notes
- [2026-03-08 01:03] Governance ops improved: manual memory update command introduced.
