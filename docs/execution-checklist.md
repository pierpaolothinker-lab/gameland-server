# Gameland - Execution Checklist (Next Step)

Reference blueprint: `C:\Users\ingpi\Documents\gameland\PROJECT_BLUEPRINT.md`
Reference contract: `C:\Users\ingpi\Documents\code\gameland-server\docs\api-contract.md`

## Obiettivo immediato
Chiudere **Task 1**: baseline config/contratto allineata e accettata da backend + frontend prima di implementare nuove feature.

## Sprint Checklist (Fase 1 -> Fase 3)

## Fase 1 - Contract First + Tavolo base
- [x] Blueprint architetturale creato e condiviso.
- [x] Baseline runtime formalizzata nel contratto (`localhost:3500`, Socket.IO, path `/api/tressette/tables`).
- [ ] Thread frontend: adeguare env locali da `3000` a `3500`.
- [ ] Thread frontend: adeguare endpoint da `/api/tressette/table` a contratto plural `/api/tressette/tables`.
- [ ] Thread backend: implementare `POST /api/tressette/tables`.
- [ ] Thread backend: implementare join/leave/start/get table.
- [ ] Aggiornare `api-contract.md` con esempi request/response reali (non planned-only).

### Gate di uscita Fase 1
- [ ] 4 giocatori riescono a creare/join/start da API (test + verifica manuale).
- [ ] Nessun mismatch noto su porte/path tra app e server.

## Fase 2 - Realtime MVP
- [ ] Thread backend: eventi `tressette:*` su Socket.IO con room `tableId`.
- [ ] Thread frontend: migrazione da WebSocket nativo a `socket.io-client`.
- [ ] Error catalog condiviso e mapping FE/BE coerente.
- [ ] Contract tests su eventi realtime principali.

### Gate di uscita Fase 2
- [ ] Due client sincronizzati realtime sullo stesso tavolo.
- [ ] Error path principali gestiti senza inconsistenze UI.

## Fase 3 - Hardening beta interno
- [ ] Persistenza minima tavoli (Mongo + cleanup policy).
- [ ] Logging strutturato con `tableId`/`socketId`.
- [ ] Metriche base (health, error rate, active sockets).
- [ ] Runbook operativo minimo.

### Gate di uscita Fase 3
- [ ] Suite test concordata verde.
- [ ] Sessione beta interna completata con checklist scenari.

## Decision log (2026-03-07)
- Decisione: mantenere due repo separati (`gameland-server`, `gameland-app`) + contratto condiviso come source of truth.
- Decisione: priorita' a vertical slice Tressette, niente espansione multi-game in MVP.
- Decisione: realtime standardizzato su Socket.IO end-to-end.
- Decisione: persistenza in-memory in MVP, Mongo nella fase hardening beta.

## Assunzioni aperte da chiudere
- Strategia identita' utente (anonimo nickname vs account).
- Politica reconnect/disconnect in mano attiva.
- Ambiente target di staging e criteri minimi SLA beta.
