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

## 2026-03-08 21:09 - governance-policy-and-app-cleanup
- Repo: root
- Branch: dev
- Summary: Applied strict branch lifecycle policy and completed full app branch cleanup: only main/dev remain local and remote
- Validation: server dev pushed with policy docs; app origin cleaned to main/dev; local app branches pruned

## 2026-03-08 21:50 - governance-pr-only-dev-hardening
- Repo: root
- Branch: dev
- Summary: Updated agent contract and prompt templates to enforce PR-only merges into dev after required checks pass; added branch guardrails policy.
- Validation: docs updated and cross-referenced (contract/template/checklist/ADR).


## 2026-03-09 02:26 - tressette-authoritative-hand-trick-closure
- Repo: root
- Branch: dev
- Summary: Task authoritative hand/trick chiuso: fix reveal 2s winner message, sync FE/BE, cleanup branch policy e branch residue completati
- Validation: GUI interactive pass + FE/BE build/test pass + repo cleanup pass

## 2026-03-09 02:34 - tressette-authoritative-hand-trick-final-close
- Repo: root
- Branch: dev
- Summary: Completati fix FE/BE su stato autoritativo mano/trick, reveal 2s a fine trick, messaggio vincitore, hardening player-state privato, timeout default dev=5s/prod=20s.
- Validation: GUI interattiva confermata; FE test/build verdi; BE test/build verdi; cleanup branch server completato.


## 2026-03-09 10:32 - checkpoint-new-task-follow-suit-playable-guard
- Repo: root
- Branch: codex/dev-follow-suit-validation-be
- Summary: Planner checkpoint new-task: avvio parallelo P1 BE follow-suit validation e P1 FE playable-cards guard (UI + backend error handling)
- Validation: branch kickoff captured for server/app; board payload regenerated for 2-item upsert with In Progress target
- Risks/Notes: Parallel FE/BE delivery requires strict contract sync on follow-suit errors and playable-card rules to avoid UX/backend drift.


## 2026-03-09 10:36 - follow-suit-validation-be
- Repo: server
- Branch: codex/dev-follow-suit-validation-be
- Summary: Enforced follow-suit validation for manual play with INVALID_SUIT_RESPONSE (409), added integration tests and updated API contract.
- Validation: npm.cmd run build; npm.cmd test -- tests/unit-tests/tressette --runInBand; npm.cmd test -- tests/unit-tests/http/tressette.create-table.test.ts --runInBand

## 2026-03-09 11:05 - checkpoint-task-closure-follow-suit-fe-be
- Repo: root
- Branch: dev
- Summary: Task follow-suit closed: FE playable-cards guard + BE server-authoritative follow-suit validation merged to dev (app PR #4, server PR #6), GUI validated, post-merge branch cleanup completed
- Validation: PR #4 app merged to dev; PR #6 server merged to dev; GUI validation passed; local/remote feature branches removed; both repos now main+dev only and dev aligned
- Risks/Notes: No blocking risk on closed task; residual product decisions remain on observer mode and reconnect policy.


## 2026-03-09 11:34 - scoreboard-multihand-ui-fe
- Repo: app
- Branch: codex/dev-multi-hand-runtime-be
- Summary: FE gameplay: scoreboard prominente SN/EO + transizione multi-mano con hand-start/hand-end e update realtime punti; fix mapping INVALID_SUIT_RESPONSE e copertura test component su scoreboard/multihand/follow-suit
- Validation: npm run build -- --configuration development; npm run test -- --watch=false --browsers=ChromeHeadlessNoSandbox (42 success)

## 2026-03-09 19:09 - checkpoint-new-task-pregame-countdown-5s
- Repo: root
- Branch: codex/dev-pregame-countdown-be
- Summary: Planner checkpoint new-task: opened parallel P1 tasks for pre-game countdown 5s (BE server-authoritative + FE overlay/input lock) and prepared board upsert
- Validation: branch evaluation captured for BE/FE; payload regenerated with allowed status set and title-based upsert intent
- Risks/Notes: Requires strict FE/BE contract alignment for countdown events and play-card lock errors to prevent race conditions at game start.


