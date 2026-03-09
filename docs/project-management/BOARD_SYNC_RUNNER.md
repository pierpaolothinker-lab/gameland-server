# Project Board Sync Runner (GitHub Projects v2)

This runner updates GitHub Project items via GraphQL API.

## Prerequisites
- `GITHUB_TOKEN` set (scope: repo + project)
- `PROJECT_ID` (ProjectV2 id)
- Field and option ids for Status field (Backlog/In Progress/Review/Done)

## Dry run first
```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/project-management/sync-project-board.ps1 -PayloadPath scripts/project-management/examples/payload.sample.json -DryRun
```

## Real run
```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/project-management/sync-project-board.ps1 -PayloadPath scripts/project-management/examples/payload.sample.json
```

## Payload schema
See `scripts/project-management/examples/payload.sample.json`.
