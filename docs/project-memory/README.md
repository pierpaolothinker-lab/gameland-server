# Project Memory Hub

This folder is the strategic project memory for Gameland.
It stores architecture notes, implementation diary, decisions, fixes, and roadmap evolution.

## Files
- `00-index.json`: machine-readable index and metadata.
- `journal.md`: chronological diary (high-level events and context).
- `implementation-log.md`: concrete implementation/fix log.
- `decisions.md`: architecture and strategy decisions (ADR-style).
- `roadmap-status.md`: current roadmap status by phase.
- `open-questions.md`: unresolved items and assumptions.
- `HIGH_LEVEL_PLAYBOOK.md`: high-level strategy and governance focus.
- `TECHNICAL_MANUAL.md`: how to retrieve/update/backup information.
- `OPERATIONS.md`: how to keep this memory updated.

## Update Rule
After every relevant change (task completed, contract changed, release decision):
1. Update `implementation-log.md`.
2. If strategic impact exists, append in `decisions.md`.
3. Update roadmap/open questions if needed.

## Source references
- API contract: `../api-contract.md`
- Blueprint: `../project-blueprint.md`
- Execution checklist: `../execution-checklist.md`
