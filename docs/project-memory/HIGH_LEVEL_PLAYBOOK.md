# High Level Playbook (Architecture/Governance)

## Mission
Keep Gameland coherent as a product platform, not only as a set of features.
Prioritize architecture decisions, integration contracts, and delivery governance.

## Role focus
- Product/architecture analysis.
- Decision framing with explicit trade-offs.
- Contract-first coordination between FE and BE.
- Risk management and release gates.

## Strategic principles
1. `main` is production only.
2. `dev` is integration only.
3. Task branches from `dev` with format `dev-<task-slug>`.
4. PR to `dev` requires tests + contract/docs alignment.
5. PR `dev -> main` only for release decisions.

## Decision gate template
- Problem statement
- Options considered
- Chosen option + rationale
- Risks and mitigations
- Reversal plan

## Current strategic focus (active)
- Vertical slice Tressette as MVP.
- Lobby flow: list/create/join first.
- Observer mode as low priority.
- Realtime reliability and FE/BE contract coherence.

## Escalation triggers
- FE/BE contract mismatch.
- Repeated regressions on the same flow.
- Release blocked by missing mandatory checks.
- Unclear ownership between threads.

## Execution invariant
- One task = one fresh branch from dev.
- Task branch is temporary and must be deleted after PR merge to dev.
- Any surviving stale task branch is treated as process violation and must be triaged before new implementation starts.
