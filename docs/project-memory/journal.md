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

## 2026-03-08
- [2026-03-08 01:03] Added one-command memory update workflow and prompt template with mandatory branch evaluation
- Repo: root
- Branch: dev-mock-auth-session-backend

## 2026-03-08
- [2026-03-08 01:55] Merged mock-auth session into dev; closed obsolete lobby PR; synchronized local dev branches
- Repo: root
- Branch: dev

## 2026-03-08
- [2026-03-08 04:38] Documented Render deployment baseline and clarified roadmap while FE/BE Task 8 is in progress
- Repo: root
- Branch: dev-task8-engine-integration

## 2026-03-08
- [2026-03-08 04:43] Task 8 FE/BE outputs received: engine-driven start/play-card baseline implemented on dedicated branches and validated
- Repo: root
- Branch: dev-task8-engine-integration

## 2026-03-08
- [2026-03-08 23:55] Enforced strict branch lifecycle policy: each task uses a fresh branch from dev, merges only via PR to dev, and branch is deleted immediately after merge.
- Repo: root
- Branch: dev

## 2026-03-08
- [2026-03-08 21:05] Enforced strict branch lifecycle: fresh branch from dev per task, PR to dev, delete branch after merge
- Repo: root
- Branch: dev

## 2026-03-08
- [2026-03-08 21:09] Applied strict branch lifecycle policy and completed full app branch cleanup: only main/dev remain local and remote
- Repo: root
- Branch: dev

## 2026-03-08
- [2026-03-08 21:50] Strengthened governance to PR-only updates on dev with required GitHub checks; direct implementation push to dev/main forbidden.
- Repo: root
- Branch: dev


## 2026-03-09
- [2026-03-09 02:26] Task authoritative hand/trick chiuso: fix reveal 2s winner message, sync FE/BE, cleanup branch policy e branch residue completati
- Repo: root
- Branch: dev

## 2026-03-09
- [2026-03-09 02:34] Chiuso task gameplay authoritative hand/trick: reveal trick 2s, winner banner, sync stato privato per player, timeout dev 5s. Branch server ripuliti e dev allineato.
- Repo: root
- Branch: dev


## 2026-03-09
- [2026-03-09 10:32] Planner checkpoint new-task: avvio parallelo P1 BE follow-suit validation e P1 FE playable-cards guard (UI + backend error handling)
- Repo: root
- Branch: codex/dev-follow-suit-validation-be
- Risks/Notes: Parallel FE/BE delivery requires strict contract sync on follow-suit errors and playable-card rules to avoid UX/backend drift.


## 2026-03-09
- [2026-03-09 10:36] Enforced follow-suit validation for manual play with INVALID_SUIT_RESPONSE (409), added integration tests and updated API contract.
- Repo: server
- Branch: codex/dev-follow-suit-validation-be

## 2026-03-09
- [2026-03-09 11:05] Task follow-suit closed: FE playable-cards guard + BE server-authoritative follow-suit validation merged to dev (app PR #4, server PR #6), GUI validated, post-merge branch cleanup completed
- Repo: root
- Branch: dev
- Risks/Notes: No blocking risk on closed task; residual product decisions remain on observer mode and reconnect policy.


## 2026-03-09
- [2026-03-09 11:34] FE gameplay: scoreboard prominente SN/EO + transizione multi-mano con hand-start/hand-end e update realtime punti; fix mapping INVALID_SUIT_RESPONSE e copertura test component su scoreboard/multihand/follow-suit
- Repo: app
- Branch: codex/dev-multi-hand-runtime-be

## 2026-03-09
- [2026-03-09 19:09] Planner checkpoint new-task: opened parallel P1 tasks for pre-game countdown 5s (BE server-authoritative + FE overlay/input lock) and prepared board upsert
- Repo: root
- Branch: codex/dev-pregame-countdown-be- Risks/Notes: Requires strict FE/BE contract alignment for countdown events and play-card lock errors to prevent race conditions at game start.


