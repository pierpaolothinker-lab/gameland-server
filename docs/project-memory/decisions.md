# Decisions (ADR-style)

## DEC-001 - Branching model
- Date: 2026-03-08
- Decision: Use `dev` as integration branch and keep `main` for production only.
- Rationale: reduce risk and keep release control explicit.
- Impact: every task goes through PR into `dev`; release PR from `dev` to `main`.

## DEC-002 - Architecture governance thread
- Date: 2026-03-08
- Decision: Keep this thread focused on architecture/governance; execution in dedicated FE/BE threads.
- Rationale: separation of concerns and faster parallel delivery.
- Impact: task cards are authored here and implemented in repo-specific threads.

## DEC-003 - Contract-first integration
- Date: 2026-03-08
- Decision: `docs/api-contract.md` is mandatory source of truth for FE/BE integration.
- Rationale: avoid integration drift.
- Impact: every relevant API/socket change updates contract in same PR.

## DEC-004 - Strict ephemeral task branches
- Date: 2026-03-08
- Decision: Every implementation task must run on a new branch created from dev; after PR merge to dev, that branch must be deleted (local + remote).
- Rationale: prevent branch drift, duplicate work, and stale divergences from dev.
- Impact: no branch reuse and no lingering feature branches between tasks.
