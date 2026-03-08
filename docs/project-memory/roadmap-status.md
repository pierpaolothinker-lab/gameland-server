# Roadmap Status

## Phase 1 - Contract first + table baseline
- Status: Completed
- Done:
  - Branch governance and workflows established
  - Tressette table HTTP endpoints implemented
  - Frontend baseline integration validated
  - Lobby endpoint `GET /api/tressette/tables` implemented
  - Frontend lobby page for table list/create/join completed

## Phase 2 - Realtime MVP coherence
- Status: In progress
- Done:
  - Socket table lifecycle events implemented
  - Lobby full-table marker (4/4, complete/open) visible in FE
- Remaining:
  - Observer mode
  - Gameplay events (`trick-ended`, `game-ended`) and `play-card` implementation
  - Reconnect/rejoin behavior definition

## Phase 3 - Beta hardening
- Status: Not started
- Planned:
  - Persistence strategy
  - Observability baseline
  - CI expansion + release hardening
