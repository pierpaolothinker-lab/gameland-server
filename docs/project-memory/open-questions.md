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

- For playable-cards guard, should non-playable cards be hard-disabled in UI or clickable with explicit backend-driven error feedback?
