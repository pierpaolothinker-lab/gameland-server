# Gameland - Execution Checklist (Current Baseline)

Reference blueprint: `C:\Users\ingpi\Documents\gameland\PROJECT_BLUEPRINT.md`
Reference contract: `C:\Users\ingpi\Documents\code\gameland-server\docs\api-contract.md`

## Obiettivo immediato
Consolidare `dev` con test interattivi stabili su lobby/gameplay realtime e chiudere i gap di bootstrap turno.

## Sprint Checklist (Phase 1 -> Phase 3)

## Phase 1 - Contract First + Table baseline
- [x] Blueprint architetturale creato e condiviso.
- [x] Baseline runtime formalizzata nel contratto.
- [x] Frontend allineato a backend `:3500`.
- [x] Endpoint plural allineati (`/api/tressette/tables`).
- [x] Backend create/join/leave/start/get/list implementati.
- [x] `api-contract.md` aggiornato con payload/error codes principali.

### Exit gate Phase 1
- [x] 4 giocatori: create/join/start verificabile.
- [x] Nessun mismatch noto su porte/path.

## Phase 2 - Realtime MVP
- [x] Backend eventi `tressette:*` con room mode-aware.
- [x] Frontend su `socket.io-client`.
- [x] Error catalog FE/BE allineato nel contratto.
- [x] Timeout/autoplay baseline con eventi realtime.
- [ ] Bootstrap turno su join/reconnect gameplay pienamente affidabile.
- [ ] Contract tests realtime end-to-end completi.

### Exit gate Phase 2
- [ ] Due client sincronizzati realtime sullo stesso tavolo (incluso bootstrap turno).
- [ ] Nessun `Turno: --` su ingresso pagina gameplay in `in_game`.

## Phase 3 - Beta hardening
- [ ] Persistenza minima tavoli/sessione (Mongo + cleanup policy).
- [ ] Logging strutturato con `tableId`/`socketId`.
- [ ] Metriche base (health, error rate, active sockets).
- [ ] Runbook operativo minimo.

### Exit gate Phase 3
- [ ] Suite test concordata verde.
- [ ] Sessione beta interna completata con checklist scenari.

## Decision log
- `main` production-only, `dev` integration-only.
- Ogni task su branch nuovo da `dev`, PR verso `dev`, branch eliminato post-merge.
- Nessun push diretto implementativo su `dev`: merge solo con required checks GitHub verdi.
- Realtime standardizzato su Socket.IO end-to-end.
- Persistenza in-memory in MVP, Mongo nella fase beta hardening.

## Open assumptions
- Strategia identita utente (mock session -> auth reale).
- Politica reconnect/disconnect in mano attiva.
- Ambiente target staging e criteri SLA beta.

