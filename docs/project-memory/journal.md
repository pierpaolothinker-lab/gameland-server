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
- Branch: codex/dev-pregame-countdown-be
- Risks/Notes: Requires strict FE/BE contract alignment for countdown events and play-card lock errors to prevent race conditions at game start.



## 2026-03-09
- [2026-03-09 20:50] Post-merge consolidation completed: pregame countdown feature merged (BE+FE), CI Step A merged on server, both repos cleaned to dev/main only, and branch/docs hygiene policy reinforced.
- Repo: root
- Branch: dev
- Risks/Notes: No blocking risk; remaining work is card sprite alignment fix on FE branch.




## 2026-03-09
- [2026-03-09 22:32] E2E GUI checklist completed with 8/8 OK after pre-game countdown and card-alignment merges; baseline confirmed stable on dev for server and app.
- Repo: root
- Branch: dev- Risks/Notes: No blocking risk identified in current baseline.


## 2026-03-10
- [2026-03-10 00:04] Planner checkpoint new-task: avviati stream P1 su bots seats+auto-play (BE) e bot UI distinction (FE) con target PR su dev
- Repo: root
- Branch: codex/dev-bot-seats-and-autoplay-be- Risks/Notes: Need clear contract alignment on bot markers/ownership and autoplay behavior to prevent FE/BE mismatch.


## 2026-03-10
- [2026-03-10 00:42] FE lobby bot UX refined: lightweight empty-seat affordance, owner-context add-bot click, Bot label normalization in lobby/gameplay
- Repo: app
- Branch: codex/dev-bot-seats-and-autoplay-be

## 2026-03-10
- [2026-03-10 01:09] Refined lobby empty-seat UX: single contextual click action (join or add-bot), compact seat control, bot labels badge-only
- Repo: app
- Branch: codex/dev-bot-seats-and-autoplay-be

## 2026-03-10
- [2026-03-10 01:27] Lobby bot UX final refinement: compact single-table cards, no seat position labels, create-table visibility guard when user already seated
- Repo: app
- Branch: codex/dev-bot-seats-and-autoplay-be

## 2026-03-10
- [2026-03-10 02:13] Gameplay UI polish: removed off-turn card opacity, centered hand layout, added human/bot seat avatars with dedicated bot SVG
- Repo: app
- Branch: codex/dev-bot-seats-and-autoplay-be

## 2026-03-10
- [2026-03-10 09:31] Daily memory run: raccolto stato app/server su stream bot-seats-autoplay, rilevati worktree non puliti (app UI files, server project-memory docs), snapshot+backup eseguiti.
- Repo: root
- Branch: codex/dev-bot-seats-and-autoplay-be- Risks/Notes: Branch bot seats/autoplay ancora in corso con modifiche non committate; serve consolidamento e chiusura PR verso dev prima del prossimo merge cycle.


## 2026-03-10
- [2026-03-10 09:31] Planner checkpoint pre-merge: streams P1 bots seats+autoplay (BE) e bot UI distinction (FE) restano In Progress con branch evaluation aggiornato
- Repo: root
- Branch: codex/dev-bot-seats-and-autoplay-be- Risks/Notes: Working trees FE/BE not clean; API/UI contract on bot identity + autoplay determinism still needs final alignment before PR.


## 2026-03-10
- [2026-03-10 09:31] Daily memory automation: collected server/app repo state, reviewed commits since last run, and generated daily report with risks/next steps using git/docs as sources (chat unavailable in automation context).
- Repo: root
- Branch: codex/dev-bot-seats-and-autoplay-be- Risks/Notes: Working trees are not clean (server project-memory docs modified, app UI files modified); no new automated FE/BE test execution in this run.


## 2026-03-10
- [2026-03-10 09:32] Planner checkpoint run 2026-03-10 automation sync attempt with FE/BE status capture
- Repo: root
- Branch: codex/dev-bot-seats-and-autoplay-be

## 2026-03-10
- [2026-03-10 09:37] Gameplay/lobby visual polish: hide turn visuals during trick reveal, adjust seat/trick overlap, add avatars in lobby, deterministic bot avatar color variants in lobby+gameplay
- Repo: app
- Branch: codex/dev-bot-seats-and-autoplay-be

## 2026-03-10
- [2026-03-10 10:34] Gameplay/lobby polish: turn state hidden during trick reveal, trick/seat overlap reduced, lobby occupied-seat avatars aligned with gameplay, deterministic bot avatar color variants shared between lobby/gameplay.
- Repo: app
- Branch: codex/dev-bot-seats-and-autoplay-be

## 2026-03-10
- [2026-03-10 11:21] Task FE visual polish closed: bot UI lobby/gameplay merged to dev with build/tests green and GUI acceptance 4/4 confirmed
- Repo: app
- Branch: codex/dev-bot-seats-and-autoplay-be- Risks/Notes: No immediate blocker; monitor post-merge visual consistency in future UI refactors.


## 2026-03-10
- [2026-03-10 11:25] Governance close-out: BE bot seats/autoplay stream marked complete and aligned with FE board closure
- Repo: server
- Branch: codex/dev-bot-seats-and-autoplay-be- Risks/Notes: No blocker for this close-out step; monitor bot behavior regressions in future gameplay refinements.


## 2026-03-10
- [2026-03-10 12:52] Added deterministic default human avatar pack (20 SVG + manifest) and integrated fallback in lobby/gameplay with unit tests and README.
- Repo: app
- Branch: codex/dev-bot-seats-and-autoplay-be

## 2026-03-10
- [2026-03-10 13:42] Implemented FE mock auth flow LOGIN -> GAME SELECT -> TRESSETTE LOBBY with route guard, session persistence, login form validation, and updated unit tests/README.
- Repo: app
- Branch: codex/dev-login-mock-compat-be

## 2026-03-10
- [2026-03-10 14:02] Hardened mock auth flow with explicit login(username,password?) and deterministic logout cleanup across current+legacy keys; guard now uses isAuthenticated() and related FE tests/docs updated.
- Repo: app
- Branch: codex/dev-login-mock-compat-be

## 2026-03-10
- [2026-03-10 14:22] Redesigned login page UI/UX with modern split layout, refined card/input/button hierarchy, coherent social controls, responsive behavior, and visual accessibility improvements without changing login flow logic.
- Repo: app
- Branch: codex/dev-login-mock-compat-be

## 2026-03-10
- [2026-03-10 14:45] Extended default player avatar catalog to 40 entries (20 human + 20 animal), updated unified manifest/type metadata, deterministic hash mapping on full set, and adjusted rendering/util tests.
- Repo: app
- Branch: codex/dev-login-mock-compat-be

## 2026-03-10
- [2026-03-10 14:51] Replaced animal avatar pack with 20 distinct species (dog, cat, lion, tiger, panda, koala, fox, wolf, bear, deer, horse, rabbit, elephant, giraffe, monkey, owl, eagle, penguin, dolphin, turtle) while keeping mapping and file paths stable.
- Repo: app
- Branch: codex/dev-login-mock-compat-be

## 2026-03-10
- [2026-03-10 15:01] Added FE debug page /debug-avatars to inspect avatar manifest with human/animal grouping, section counts, warnings, responsive grid, and login footer quick link.
- Repo: app
- Branch: codex/dev-login-mock-compat-be

## 2026-03-10
- [2026-03-10 15:30] Closeout post-merge FE+BE login/game-select/mock-auth registrato: merge su dev completati, cleanup branch locale/remoto completato, baseline app/server su dev-main allineata
- Repo: root
- Branch: dev- Risks/Notes: No blocker on closure; future step is planning migration from mock-auth flow to real auth strategy.


## 2026-03-10
- [2026-03-10 17:21] Closeout governance completato: mobile-first hardening FE e PR template hardening già merge su dev, branch feature remoti eliminati, baseline app/server pulita su dev/main
- Repo: root
- Branch: dev- Risks/Notes: No blocking risk; maintain periodic review of PR template quality gates as process evolves.


## 2026-03-10
- [2026-03-10 20:19] Coordinator checkpoint: task mobile-first design closed, repos cleaned on app, board closeout confirmed, ready for next task.
- Repo: server
- Branch: dev
