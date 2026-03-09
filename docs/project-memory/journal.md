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

