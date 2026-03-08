# Task Prompt Template (FE/BE Agents)

Use this template for every implementation task to keep branch governance consistent.

## Mandatory branch evaluation block
- Repo target: `server | app | root`
- Base branch: normally `dev`
- Task branch required?: `yes/no`
- Proposed task branch name: `codex/dev-<task-slug>` (or `dev-<task-slug>` where applicable)
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
- No direct changes to main
- PR target: dev
- Keep api-contract/docs aligned when integration changes
```

## Rule
Before sending a task prompt, explicitly decide and write whether a dedicated task branch is required.
Default: create a dedicated task branch from `dev`.
