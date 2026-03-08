# Operations - Project Memory

## Goal
Keep project memory current, queryable, and safely backed up.

## Manual update cadence
- At least once per completed task.
- Mandatory on:
  - contract changes
  - strategic decisions
  - branch/process updates

## One-command update (recommended)
Use this command to update diary/docs quickly and optionally run snapshot/backup.

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/project-memory/update-memory.ps1 \
  -Summary "Task outcome summary" \
  -Repo "server|app|root" \
  -Task "task-name" \
  -Validation "build/test/manual-check" \
  -RunSnapshot -RunBackup
```

## Automated routines
- Update helper: `scripts/project-memory/update-memory.ps1`
- Snapshot script: `scripts/project-memory/capture-project-snapshot.ps1`
- Backup script: `scripts/project-memory/backup-project-memory.ps1`
- Scheduler registration: `scripts/project-memory/register-backup-task.ps1`

## Recommended cadence
- Manual update command after each completed task.
- Snapshot + backup every 6 hours (or daily if preferred).

## Backup policy
- Backup destination: `backups/project-memory/<timestamp>`
- Keep at least last 30 backups.
- Backup contains docs + git status/log snapshots.
