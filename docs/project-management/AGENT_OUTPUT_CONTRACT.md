# FE/BE Operational Contract

## Mandatory response format (FE and BE)
Use this structure in every handoff:

1. Branch and commit
- branch name
- commit SHA
- branch pushed to remote (`yes/no`)
- PR url/status if already opened

2. Scope delivered
- bullet list of implemented items

3. Validation evidence
- exact commands
- pass/fail outputs summary

4. Acceptance criteria check
- criterion by criterion status (`OK`/`NOK`)

5. Risks / TODO / known gaps
- concise bullet list

## Delivery constraints
- Feature branches must target `dev`.
- No direct commits/pushes to `main`.
- No direct commits/pushes to `dev` for implementation work.
- `dev` updates are allowed only via PR merge after required GitHub checks are green.
- If work originated on a task/sub-branch created from `dev`, it must reach `origin/dev` only through PR merge, not through direct push realignment.
- API/socket behavior changes must update `docs/api-contract.md`.
- Working tree must be clean at handoff.
- Branch must be pushed before closure recommendation.

## Planner consumption
Architect/Planner will reject handoffs missing required sections and request normalization.

## Branch lifecycle evidence (mandatory)
Every handoff must include:
- base branch used for creation (dev)
- confirmation branch was created from current origin/dev
- confirmation branch has been pushed
- PR target (dev)
- PR url/status if present
- confirmation no direct push to dev was performed
- confirmation no task-branch work was realigned to `origin/dev` via direct push
- required checks status (`PASS`) before merge
- cleanup status after merge (remote/local branch deleted)

## Closeout expectation
- Architect verifies commit/push state before proposing the PR.
- User performs the merge to `dev`.
- Architect verifies merge on `dev`, performs cleanup, confirms clean baseline, then prepares Planner update output.

