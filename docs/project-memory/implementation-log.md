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

## 2026-03-08 01:03 - project-memory-command-and-prompt-policy
- Repo: root
- Branch: dev-mock-auth-session-backend
- Summary: Added one-command memory update workflow and prompt template with mandatory branch evaluation
- Validation: manual verification of scripts/docs

## 2026-03-08 01:55 - post-merge-cleanup
- Repo: root
- Branch: dev
- Summary: Merged mock-auth session into dev; closed obsolete lobby PR; synchronized local dev branches
- Validation: dev branches aligned with origin

## 2026-03-08 04:38 - render-plan-doc-update
- Repo: root
- Branch: dev-task8-engine-integration
- Summary: Documented Render deployment baseline and clarified roadmap while FE/BE Task 8 is in progress
- Validation: documentation update only

## 2026-03-08 04:43 - task8-agent-output-sync
- Repo: root
- Branch: dev-task8-engine-integration
- Summary: Task 8 FE/BE outputs received: engine-driven start/play-card baseline implemented on dedicated branches and validated
- Validation: FE build+30 tests OK; BE build + targeted HTTP + engine integration tests OK

## 2026-03-08 21:05 - governance-branch-lifecycle-hard-rule
- Repo: root
- Branch: dev
- Summary: Enforced strict branch lifecycle: fresh branch from dev per task, PR to dev, delete branch after merge
- Validation: Docs updated in governance/prompt/contract + decisions/journal
