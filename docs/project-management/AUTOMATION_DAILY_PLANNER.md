# Daily Architect/Planner Automation

## Purpose
Run a daily Architect/Planner cycle that consolidates FE/BE outputs and updates governance artifacts.

## Recommended schedule
- Daily at 09:00 local time

## Automation prompt
Raccogli lo stato dei repo gameland-server e gameland-app, leggi gli ultimi output FE/BE e stato PR, aggiorna la project memory (journal, implementation-log, roadmap/open-questions se necessario), genera payload board per GitHub Projects (Backlog/In Progress/Review/Done) e segnala rischi + next steps.

## Output checklist
- backlog delta (prioritized)
- memory delta summary
- board payload path/content
- suggested FE prompt
- suggested BE prompt
