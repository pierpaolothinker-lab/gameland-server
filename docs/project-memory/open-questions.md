# Open Questions

## Product/Flow
- Is observer mode required in MVP or deferred post-MVP?
- How should table discovery be filtered/sorted in lobby?

## Technical
- Should table state remain in-memory in phase 1 or move earlier to persistence?
- What is the final strategy for reconnect/rejoin in ongoing games?
- Timeout autoplay policy: random playable card is final, or should we enforce a deterministic policy for reproducibility/testing?
- Should gameplay bootstrap rely only on socket (`watch-table`/`turn-bootstrap`) or also include HTTP `currentTurn` fallback?

## Process
- Which CI checks become mandatory for `main` and for `dev`?
- Do we enforce CODEOWNERS for FE/BE review ownership?
- Should planner board sync run at every task state transition (`new-task`, `in-progress`, `ready-for-review`, `merged`) or only on scheduled cycles?


- During pre-game countdown, should all user actions be hard-blocked client-side and server-side, or do we allow limited non-gameplay interactions?

- For bot seats/autoplay, should bot identity be fully explicit in payloads (e.g., isBot + owner metadata) for deterministic FE rendering and replay?

## 2026-03-10 - Planner checkpoint pre-merge (bots stream)
- Do we freeze a deterministic bot autoplay priority (lowest winning card vs first legal card) to make FE replay and tests stable?
- Should API payload expose bot metadata as mandatory (`isBot`, `botSeatId`, `ownerUserId`) before FE PR, or can FE infer from `userId` prefix?
- Is merge sequencing BE->FE mandatory for this stream, or can both PRs open in parallel with contract lock at review time?

- Do we need an explicit visual regression check (screenshot baseline) for bot color variant stability and seat/trick layout on future UI changes?

- Do we need a dedicated regression checklist for bot seats/autoplay behavior before future gameplay releases?

- After mock-auth closeout, what is the migration plan and cutoff criteria for moving to real auth without breaking game-select UX?

- Should PR template hardening include a quarterly governance review to keep acceptance/checklist sections aligned with current delivery gates?

## 2026-03-11 - Planner checkpoint new-task baseline
- Should the next P1 stream prioritize observer mode (product) or reconnect/rejoin policy hardening (technical) now that both repos are clean on dev?
- Do we enforce a mandatory branch-evaluation checklist (dev clean, origin/dev aligned, task branch exists) before every new FE/BE handoff prompt?

