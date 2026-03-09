# Task Prompt Template (FE/BE Agents)

Use this template for every implementation task to keep branch governance consistent.

## Mandatory branch evaluation block
- Repo target: `server | app | root`
- Base branch: normally `dev`
- Task branch required?: `yes/no`
- Proposed task branch name: current open task branch, or `codex/dev-<task-slug>` when new branch is approved
- Reason if no new branch is created

## Prompt skeleton
```text
Task: <title>

Context:
- Repo: <absolute path>
- Base branch: <branch>
- Task branch: <branch>

Goal:
- <outcome>

Implementation scope:
1) <item>
2) <item>
3) <item>

Out of scope:
- <item>

Validation:
- <build command>
- <test command>

Acceptance Criteria:
- <criterion>
- <criterion>

Constraints:
- No direct changes/pushes to main
- No direct changes/pushes to dev
- PR target: dev only
- Merge only after required GitHub checks pass
- Keep api-contract/docs aligned when integration changes
```

## Rule
Before sending a task prompt, explicitly decide and write whether a dedicated task branch is required.
Default: continue on the currently open task branch until task closure is validated in GUI and PR lifecycle is completed.

## Strict branch lifecycle (mandatory)
1. Sync dev with origin/dev.
2. If there is an open task branch not yet merged, continue work on that branch.
3. Create a new task branch from dev only when the previous task branch is closed (PR merged + branch cleanup), or if explicitly approved as an exception in governance.
4. Implement and validate in that branch only.
5. Open PR task-branch -> dev (never push directly to dev).
6. Merge PR after checks pass.
7. Delete the task branch (local + remote) immediately after merge.

No direct implementation on dev except integration/cleanup operations explicitly approved in governance thread.

## Documentation hygiene (mandatory)
- If task touched governance/planner memory files (docs/project-memory/*, scripts/project-management/examples/payload.current.json), commit them in the same branch before handoff.
- Do not leave docs/memory updates uncommitted unless user explicitly asks to ignore them.

