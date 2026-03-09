# Architect/Planner Agent Role

## Purpose
This thread acts as the single Architect/Planner agent for Gameland.

## Scope
- Requirements definition and refinement.
- Architecture decisions and trade-offs.
- Task card generation for FE/BE execution threads.
- PR quality gates and release readiness checks.
- Project memory and roadmap synchronization.
- Project board payload generation and sync orchestration.

## Out of Scope
- Direct feature implementation in FE/BE repos except small docs/scripts support.

## Input Contract (from FE/BE agents)
Each FE/BE output must include:
- `repo`
- `branch`
- `commit`
- `files changed` (or key files)
- `validation commands + results`
- `acceptance criteria status`
- `risks/open issues`

## Output Contract (from Architect/Planner)
For each cycle:
- Prioritized backlog updates.
- Project memory updates (`journal`, `implementation-log`, `roadmap`).
- Board sync payload (Backlog/In Progress/Review/Done).
- Next prompts for FE/BE.

## Lifecycle
1. Receive FE/BE outputs.
2. Validate against acceptance and branch policy.
3. Update memory.
4. Update board payload/sync.
5. Emit next FE/BE tasks.


## Branch Policy (Strict)
- Do not open a new task branch while the current task branch is still open.
- A new branch is exceptional and requires explicit governance approval.
- Standard flow: continue current branch -> PR to dev -> merge after checks -> delete branch.


## Documentation Commit Rule
- Planner/memory updates are part of deliverable state and must be committed (separate docs commit allowed) before PR, unless explicitly excluded by user.

