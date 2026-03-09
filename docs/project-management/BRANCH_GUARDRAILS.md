# Branch Guardrails (Hard Rule)

## Scope
Applies to all implementation tasks across FE/BE for Gameland.

## Mandatory flow
1. Sync local `dev` from `origin/dev`.
2. Create a fresh task branch from `dev`: `codex/dev-<topic>`.
3. Implement and validate only in task branch.
4. Open PR: `codex/dev-<topic>` -> `dev`.
5. Merge only after required GitHub checks pass.
6. Delete task branch (local + remote) immediately after merge.

## Forbidden actions
- No direct implementation commits/pushes to `main`.
- No direct implementation commits/pushes to `dev`.
- No branch reuse between tasks.

## GitHub enforcement (required)
- Protect `dev` branch.
- Enable `Require a pull request before merging`.
- Enable `Require status checks to pass before merging`.
- Select required checks:
  - server CI job (example: `build-and-test`)
  - app CI job (example: `build-and-test`)
- Optionally enable `Require branches to be up to date before merging`.
- Disable direct pushes to `dev` for implementation actors.

## Agent handoff evidence (must be present)
- Branch created from current `origin/dev`.
- PR target is `dev`.
- Validation commands and results.
- Checks status `PASS`.
- Branch cleanup completed after merge.
