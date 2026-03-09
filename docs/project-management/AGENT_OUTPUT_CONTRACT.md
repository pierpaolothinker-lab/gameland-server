# FE/BE Operational Contract

## Mandatory response format (FE and BE)
Use this structure in every handoff:

1. Branch and commit
- branch name
- commit SHA

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
- API/socket behavior changes must update `docs/api-contract.md`.
- Working tree must be clean at handoff.

## Planner consumption
Architect/Planner will reject handoffs missing required sections and request normalization.

## Branch lifecycle evidence (mandatory)
Every handoff must include:
- base branch used for creation (dev)
- confirmation branch was created from current origin/dev
- PR target (dev)
- confirmation no direct push to dev was performed
- required checks status (`PASS`) before merge
- cleanup status after merge (remote/local branch deleted)

