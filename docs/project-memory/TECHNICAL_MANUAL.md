# Technical Manual - Project Memory

## Purpose
Describe how to retrieve, update, and back up strategic project knowledge.

## Where knowledge lives
- Hub: `docs/project-memory/`
- Scripts: `scripts/project-memory/`

## Retrieval quick guide
### Read latest context
1. `docs/project-memory/journal.md`
2. `docs/project-memory/implementation-log.md`
3. `docs/project-memory/decisions.md`
4. `docs/project-memory/roadmap-status.md`

### Generate machine-readable snapshot
```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/project-memory/capture-project-snapshot.ps1
```
Output: `docs/project-memory/snapshot.json`

### Run backup now
```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/project-memory/backup-project-memory.ps1
```
Output folder: `backups/project-memory/<timestamp>`

### Register scheduled backup (Windows)
```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/project-memory/register-backup-task.ps1
```

## Update protocol
After each relevant implementation:
1. Update `implementation-log.md`.
2. If strategic, update `decisions.md`.
3. Update `roadmap-status.md` and `open-questions.md` when scope shifts.

## Backup strategy options
### Option A (local laptop)
- Windows Task Scheduler via `register-backup-task.ps1`.
- Works only while machine is on.

### Option B (recommended for continuity)
- GitHub Actions scheduled workflow (`cron`) for repository snapshots.
- Works even when laptop is off.
- Best for always-on traceability.

## Security note
Do not store secrets, credentials, tokens, or personal sensitive data in project-memory files.
