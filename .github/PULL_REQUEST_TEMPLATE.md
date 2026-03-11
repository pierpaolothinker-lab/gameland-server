## Summary
- [ ] Scope is clear and limited to one task.
- [ ] Branch name follows `codex/dev-<task-slug>`.
- [ ] Target branch is `dev` (not `main`).
- [ ] No unrelated changes are included.

## Validation Evidence
- [ ] Build passes (`npm run build`).
- [ ] Relevant tests pass (list exact commands + outcome in PR body).
- [ ] Manual verification completed when API/socket behavior changed.
- [ ] Working tree was clean before handoff.

## Contract & Docs
- [ ] `docs/api-contract.md` checked/updated if API/socket behavior changed.
- [ ] Relevant docs/runbook updated.
- [ ] Risks/residual blockers are documented.

## Governance & Risk Check
- [ ] Branch was pushed before PR handoff.
- [ ] No direct push to `dev` or `main` was performed.
- [ ] Required GitHub checks are green.
- [ ] Rollback strategy is clear.
- [ ] Post-merge cleanup planned (delete feature branch local + remote).
