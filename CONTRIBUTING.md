# Contributing - Gameland Server

## Branch strategy
- `main`: production branch. No direct commits.
- `dev`: continuous integration branch.
- Task branches MUST start from `dev` and use format `codex/dev-<task-slug>`.
  - Example: `codex/dev-add-icon-player`

## Daily flow
1. Update local `dev`.
2. Create task branch from `dev`.
3. Implement task + tests.
4. Push the task branch and ensure the working tree is clean.
5. Architect verifies readiness and proposes PR from task branch to `dev`.
6. User merges to `dev` only after checks pass.
7. After merge verification, delete the task branch locally and remotely.
8. Return to clean `dev` baseline before the next task.

## Pull request rules (to `dev`)
- Tests related to the change are green.
- Contract/docs updated when integration changes.
- No direct push to `main`.
- No direct implementation push to `dev` unless explicitly authorized by the user.
- PR checklist must be completed.

## Release flow (`dev` -> `main`)
1. Freeze `dev` for release candidate.
2. Validate smoke/regression suite.
3. Open PR `dev` -> `main`.
4. Merge and create tag `vX.Y.Z`.
5. Update changelog/release notes.
