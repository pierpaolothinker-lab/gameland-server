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



## 2026-03-09 20:50 - post-merge-consolidation-and-ci-stepA
- Repo: root
- Branch: dev
- Summary: Post-merge consolidation completed: pregame countdown feature merged (BE+FE), CI Step A merged on server, both repos cleaned to dev/main only, and branch/docs hygiene policy reinforced.
- Validation: Server CI Step A merged; FE/BE flows GUI-validated; repos aligned on dev
- Risks/Notes: No blocking risk; remaining work is card sprite alignment fix on FE branch.




## 2026-03-09 22:32 - e2e-checklist-closure-2026-03-09
- Repo: root
- Branch: dev
- Summary: E2E GUI checklist completed with 8/8 OK after pre-game countdown and card-alignment merges; baseline confirmed stable on dev for server and app.
- Validation: Interactive GUI checklist 8/8 passed (lobby/start/countdown/turn/follow-suit/trick reveal/next turn/hand scoring/cards render).- Risks/Notes: No blocking risk identified in current baseline.


## 2026-03-10 00:04 - checkpoint-new-task-bots-seats-autoplay
- Repo: root
- Branch: codex/dev-bot-seats-and-autoplay-be
- Summary: Planner checkpoint new-task: avviati stream P1 su bots seats+auto-play (BE) e bot UI distinction (FE) con target PR su dev
- Validation: branch evaluation captured for server/app and payload prepared for title-based upsert with In Progress status- Risks/Notes: Need clear contract alignment on bot markers/ownership and autoplay behavior to prevent FE/BE mismatch.


## 2026-03-10 00:42 - bot-seat-ui-lobby-gameplay-refine
- Repo: app
- Branch: codex/dev-bot-seats-and-autoplay-be
- Summary: FE lobby bot UX refined: lightweight empty-seat affordance, owner-context add-bot click, Bot label normalization in lobby/gameplay
- Validation: npm build dev OK; npm test ChromeHeadlessNoSandbox OK (59/59)

## 2026-03-10 01:09 - bot-seat-ux-v2-contextual-empty-seat
- Repo: app
- Branch: codex/dev-bot-seats-and-autoplay-be
- Summary: Refined lobby empty-seat UX: single contextual click action (join or add-bot), compact seat control, bot labels badge-only
- Validation: npm.cmd run build -- --configuration development; npm.cmd run test -- --watch=false --browsers=ChromeHeadlessNoSandbox

## 2026-03-10 01:27 - bot-lobby-ux-final-refinement
- Repo: app
- Branch: codex/dev-bot-seats-and-autoplay-be
- Summary: Lobby bot UX final refinement: compact single-table cards, no seat position labels, create-table visibility guard when user already seated
- Validation: npm.cmd run build -- --configuration development; npm.cmd run test -- --watch=false --browsers=ChromeHeadlessNoSandbox

## 2026-03-10 02:13 - gameplay-ui-polish-hand-centering-avatars
- Repo: app
- Branch: codex/dev-bot-seats-and-autoplay-be
- Summary: Gameplay UI polish: removed off-turn card opacity, centered hand layout, added human/bot seat avatars with dedicated bot SVG
- Validation: npm.cmd run build -- --configuration development; npm.cmd run test -- --watch=false --browsers=ChromeHeadlessNoSandbox

## 2026-03-10 09:31 - daily-memory-run-2026-03-10
- Repo: root
- Branch: codex/dev-bot-seats-and-autoplay-be
- Summary: Daily memory run: raccolto stato app/server su stream bot-seats-autoplay, rilevati worktree non puliti (app UI files, server project-memory docs), snapshot+backup eseguiti.
- Validation: git status/log raccolti su gameland-app e gameland-server; snapshot.json e backup project-memory aggiornati- Risks/Notes: Branch bot seats/autoplay ancora in corso con modifiche non committate; serve consolidamento e chiusura PR verso dev prima del prossimo merge cycle.


## 2026-03-10 09:31 - checkpoint-pre-merge-bots-stream
- Repo: root
- Branch: codex/dev-bot-seats-and-autoplay-be
- Summary: Planner checkpoint pre-merge: streams P1 bots seats+autoplay (BE) e bot UI distinction (FE) restano In Progress con branch evaluation aggiornato
- Validation: Git snapshot FE/BE collected; payload.current.json regenerated with allowed statuses; board sync executed- Risks/Notes: Working trees FE/BE not clean; API/UI contract on bot identity + autoplay determinism still needs final alignment before PR.


## 2026-03-10 09:31 - daily-memory-2026-03-10
- Repo: root
- Branch: codex/dev-bot-seats-and-autoplay-be
- Summary: Daily memory automation: collected server/app repo state, reviewed commits since last run, and generated daily report with risks/next steps using git/docs as sources (chat unavailable in automation context).
- Validation: State/report update only; no FE/BE validation suite executed in this automation run- Risks/Notes: Working trees are not clean (server project-memory docs modified, app UI files modified); no new automated FE/BE test execution in this run.


## 2026-03-10 09:32 - planner-checkpoint
- Repo: root
- Branch: codex/dev-bot-seats-and-autoplay-be
- Summary: Planner checkpoint run 2026-03-10 automation sync attempt with FE/BE status capture
- Validation: status capture + sync attempt

## 2026-03-10 09:37 - gameplay-lobby-visual-polish-reveal-overlap-avatar-variants
- Repo: app
- Branch: codex/dev-bot-seats-and-autoplay-be
- Summary: Gameplay/lobby visual polish: hide turn visuals during trick reveal, adjust seat/trick overlap, add avatars in lobby, deterministic bot avatar color variants in lobby+gameplay
- Validation: npm.cmd run build -- --configuration development; npm.cmd run test -- --watch=false --browsers=ChromeHeadlessNoSandbox

## 2026-03-10 10:34 - gameplay-lobby-visual-polish
- Repo: app
- Branch: codex/dev-bot-seats-and-autoplay-be
- Summary: Gameplay/lobby polish: turn state hidden during trick reveal, trick/seat overlap reduced, lobby occupied-seat avatars aligned with gameplay, deterministic bot avatar color variants shared between lobby/gameplay.
- Validation: build ok; tests ok (ChromeHeadlessNoSandbox)

## 2026-03-10 11:21 - task-closure-fe-visual-polish-bot-ui
- Repo: app
- Branch: codex/dev-bot-seats-and-autoplay-be
- Summary: Task FE visual polish closed: bot UI lobby/gameplay merged to dev with build/tests green and GUI acceptance 4/4 confirmed
- Validation: Branch merged codex/dev-bot-ui-lobby-gameplay-fe -> dev; build dev config OK; tests OK (62 success); GUI acceptance checklist confirmed- Risks/Notes: No immediate blocker; monitor post-merge visual consistency in future UI refactors.


## 2026-03-10 11:25 - board-closeout-be-bots-seats-autoplay
- Repo: server
- Branch: codex/dev-bot-seats-and-autoplay-be
- Summary: Governance close-out: BE bot seats/autoplay stream marked complete and aligned with FE board closure
- Validation: Board target item identified by title+itemId; payload regenerated for status Done update via single sync run- Risks/Notes: No blocker for this close-out step; monitor bot behavior regressions in future gameplay refinements.


## 2026-03-10 12:52 - player-avatars-pack-fe
- Repo: app
- Branch: codex/dev-bot-seats-and-autoplay-be
- Summary: Added deterministic default human avatar pack (20 SVG + manifest) and integrated fallback in lobby/gameplay with unit tests and README.
- Validation: npm.cmd run build -- --configuration development; npm.cmd run test -- --watch=false --browsers=ChromeHeadlessNoSandbox

## 2026-03-10 13:42 - login-game-select-flow-fe
- Repo: app
- Branch: codex/dev-login-mock-compat-be
- Summary: Implemented FE mock auth flow LOGIN -> GAME SELECT -> TRESSETTE LOBBY with route guard, session persistence, login form validation, and updated unit tests/README.
- Validation: build ok; tests ok (ChromeHeadlessNoSandbox)

## 2026-03-10 14:02 - harden-mock-auth-login-logout
- Repo: app
- Branch: codex/dev-login-mock-compat-be
- Summary: Hardened mock auth flow with explicit login(username,password?) and deterministic logout cleanup across current+legacy keys; guard now uses isAuthenticated() and related FE tests/docs updated.
- Validation: build ok; tests ok (ChromeHeadlessNoSandbox)

## 2026-03-10 14:22 - login-ui-redesign
- Repo: app
- Branch: codex/dev-login-mock-compat-be
- Summary: Redesigned login page UI/UX with modern split layout, refined card/input/button hierarchy, coherent social controls, responsive behavior, and visual accessibility improvements without changing login flow logic.
- Validation: npm.cmd run build -- --configuration development; npm.cmd run test -- --watch=false --browsers=ChromeHeadlessNoSandbox

## 2026-03-10 14:45 - player-avatars-pack-40
- Repo: app
- Branch: codex/dev-login-mock-compat-be
- Summary: Extended default player avatar catalog to 40 entries (20 human + 20 animal), updated unified manifest/type metadata, deterministic hash mapping on full set, and adjusted rendering/util tests.
- Validation: npm.cmd run build -- --configuration development; npm.cmd run test -- --watch=false --browsers=ChromeHeadlessNoSandbox

## 2026-03-10 14:51 - animal-avatar-species-fix
- Repo: app
- Branch: codex/dev-login-mock-compat-be
- Summary: Replaced animal avatar pack with 20 distinct species (dog, cat, lion, tiger, panda, koala, fox, wolf, bear, deer, horse, rabbit, elephant, giraffe, monkey, owl, eagle, penguin, dolphin, turtle) while keeping mapping and file paths stable.
- Validation: npm.cmd run build -- --configuration development; npm.cmd run test -- --watch=false --browsers=ChromeHeadlessNoSandbox

## 2026-03-10 15:01 - debug-avatar-catalog
- Repo: app
- Branch: codex/dev-login-mock-compat-be
- Summary: Added FE debug page /debug-avatars to inspect avatar manifest with human/animal grouping, section counts, warnings, responsive grid, and login footer quick link.
- Validation: build ok; tests ok (ChromeHeadlessNoSandbox)
