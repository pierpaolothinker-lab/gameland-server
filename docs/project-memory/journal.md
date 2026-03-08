# Journal

## 2026-03-08
- Established governance model: `main` for production, `dev` for continuous integration, task branches `dev-<task-slug>`.
- Added PR template and release process docs in both server/app repositories.
- Implemented backend Tressette MVP HTTP endpoints (`create`, `join`, `leave`, `start`, `get`) and socket table events.
- Implemented frontend integration with backend and socket.io for Tressette validation flow.
- Added CI workflows on `dev` for server and app.
- Ongoing focus shifted to architecture-first coordination with dedicated FE/BE execution threads.

## Journal format
- Date (YYYY-MM-DD)
- Context
- What changed
- Why it matters
- Follow-up actions

## 2026-03-08 (updates from FE/BE execution threads)
- FE thread implemented Tressette lobby flow (list/create/join) with loading/empty/error states.
- BE thread implemented GET /api/tressette/tables with ordering waiting -> in_game -> ended.
- Acceptance criteria for lobby flow reported as satisfied by both FE and BE outputs.
- Added high-level playbook and technical manual for governance continuity.

