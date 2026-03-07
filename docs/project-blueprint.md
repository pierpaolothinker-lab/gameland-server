# Project Blueprint - Gameland

## 1) Visione prodotto (breve)
Gameland e' una piattaforma multiplayer per giochi di carte italiani, con esperienza realtime cross-device. Il primo vertical slice e' Tressette 4 giocatori, da portare rapidamente da prototipo locale a beta interna stabile, misurabile e pronta ad aprire a utenti esterni limitati.

## 2) Ambito MVP (solo Tressette)
In scope MVP:
- Creazione tavolo Tressette a 4 posti (SUD/NORD/EST/OVEST).
- Join/leave tavolo con regole di occupazione posto.
- Avvio partita da owner su tavolo completo.
- Flusso realtime minimo: aggiornamento stato tavolo e partite.
- Snapshot tavolo via HTTP + delta/eventi via Socket.IO.
- UI tavolo con stato giocatori, mano corrente, stato partita.

Out of scope MVP:
- Matchmaking pubblico avanzato.
- Ranking/ELO.
- Chat avanzata/moderazione.
- Multi-gioco oltre Tressette.
- Hardening enterprise (SSO, anti-cheat avanzato, multi-region).

## 3) Stato reale attuale (analisi repository)
### Backend (`C:\Users\ingpi\Documents\code\gameland-server`)
- Stack: Node.js + TypeScript + Express + Socket.IO + Jest.
- API HTTP reale presente: solo `GET /health`.
- Socket reale presente: eventi generici `message` e `activity`.
- Dominio Tressette (`src/domain/games/3s7/3s74i`) gia' modellato con logica gioco e test unitari.
- Test backend: 5 suite / 61 test passati localmente.
- MongoDB: connessione opzionale in bootstrap, nessuna persistenza dominio Tressette esposta via repository/model API.

### Frontend (`C:\Users\ingpi\Documents\code\gameland-app`)
- Stack: Ionic + Angular 18.
- Rotta Tressette disponibile (`/tressette`) con pagina `table3s74i` e service dedicato.
- Integrazione backend parziale:
  - HTTP via `BackendClientService`.
  - Socket tramite WebSocket nativo (non client Socket.IO).
  - Fallback mock table su errore (`useMockTableOnError: true` in dev).
- Test frontend non eseguiti in ambiente corrente: errore sandbox `spawn EPERM` su ChromeHeadless.

### Contratto integrazione
- File: `C:\Users\ingpi\Documents\code\gameland-server\docs\api-contract.md`.
- Stato: health e socket generici attivi; contratto Tressette marcato come `PLANNED`.

## 4) Gap principali rispetto al target MVP
- Mancano endpoint Tressette implementati nel backend.
- Mancano eventi Socket.IO Tressette implementati lato server.
- Frontend usa WebSocket nativo ma backend usa Socket.IO (incompatibilita' protocollo).
- Disallineamento config ambienti:
  - Contratto: backend locale `http://localhost:3500`.
  - Frontend env: `http://localhost:3000` e path singolare `/api/tressette/table`.
- Mancano policy minime su error handling, autenticazione sessione giocatore e osservabilita' operativa.

## 5) Requisiti funzionali principali (MVP Tressette)
- RF1: creare tavolo (`owner`, `tableId`, stato `waiting`).
- RF2: join a posto specifico (solo posti liberi).
- RF3: leave tavolo e riallineamento stato completezza.
- RF4: start game consentito solo a owner con 4 giocatori.
- RF5: ottenere snapshot tavolo coerente via HTTP.
- RF6: ricevere aggiornamenti realtime tavolo/partita.
- RF7: gestione errori dominio con payload standardizzato `{ error: { code, message } }`.
- RF8: UI mostra stati loading/error/realtime senza bloccare UX.

## 6) Requisiti non funzionali minimi
### Affidabilita'
- Health endpoint affidabile e pronto per probe.
- Idempotenza minima su join/leave dove applicabile.
- Validazione payload in ingresso su endpoint critici.

### Sicurezza base
- CORS esplicito per origini consentite (dev + prod).
- Input validation server-side per path/body/socket payload.
- Errori senza leakage di stack interno.

### Osservabilita'
- Logging strutturato minimo (request id, tableId, event type).
- Metriche base: request count/latency/error rate, socket connected clients.
- Tracciamento eventi chiave: create/join/leave/start/play-card.

## 7) Architettura target (pragmatica)
### Frontend
- Angular/Ionic come client presentazionale + orchestrazione stato tavolo.
- Service unico Tressette con:
  - chiamate HTTP snapshot/comandi,
  - client Socket.IO per stream eventi.
- Contract adapters: mapping payload API -> view models stabili UI.

### Backend
- Layering consigliato:
  - `routes/controllers` (transport)
  - `application services` (use case create/join/leave/start/play)
  - `domain` (gia' presente, riuso Table3s74i)
  - `infrastructure` (repository in-memory iniziale, poi Mongo).
- Error catalog condiviso (codici stabili per frontend).

### Realtime/Socket
- Socket.IO namespace/eventi Tressette allineati al contratto.
- Broadcast scoped per `tableId` (room per tavolo).
- Pattern: comando -> validazione -> mutazione stato -> evento `table-updated`.

### Persistenza
- Fase MVP: repository in-memory process-level (velocita' di delivery).
- Beta: persistenza Mongo per stato tavolo/sessione minima, con TTL per cleanup tavoli inattivi.

## 8) Contratti principali app-server (allineati con `api-contract.md`)
### HTTP (MVP)
- `POST /api/tressette/tables`
- `POST /api/tressette/tables/:tableId/join`
- `POST /api/tressette/tables/:tableId/leave`
- `POST /api/tressette/tables/:tableId/start`
- `GET /api/tressette/tables/:tableId`

### Socket events (MVP)
Client -> server:
- `tressette:join-table`
- `tressette:leave-table`
- `tressette:start-game`
- `tressette:play-card`

Server -> client:
- `tressette:table-updated`
- `tressette:hand-started`
- `tressette:trick-ended`
- `tressette:game-ended`
- `tressette:error`

### Convenzioni
- Posizioni API: `SUD`, `NORD`, `EST`, `OVEST`.
- Error shape obbligatorio:

```json
{
  "error": {
    "code": "STRING_CODE",
    "message": "Human readable message"
  }
}
```

Nota di allineamento operativo: il frontend deve migrare da WebSocket nativo a Socket.IO client per compatibilita' col server corrente.

## 9) Roadmap fasi (deliverable verificabili)
### Fase 1 - Contract First + Tavolo base (1 sprint)
Deliverable:
- Endpoint Tressette CRUD tavolo minimo implementati (no play-card completo).
- `api-contract.md` aggiornato con esempi request/response reali.
- Frontend allineato a base URL/endpoint corretti e no mismatch porte.
Verifica:
- Test integrazione HTTP verdi su create/join/leave/start/get.
- Flusso manuale end-to-end: 4 join + start da owner.

### Fase 2 - Realtime MVP + coerenza stato (1 sprint)
Deliverable:
- Eventi Socket.IO Tressette implementati con room per `tableId`.
- Frontend usa socket.io-client e aggiorna stato tavolo realtime.
- Error handling coerente con codici contratto.
Verifica:
- Due client aperti vedono aggiornamenti consistenti entro <500ms in locale.
- Test di contratto su eventi chiave (`table-updated`, `error`).

### Fase 3 - Hardening beta interno (1 sprint)
Deliverable:
- Persistenza minima tavoli (Mongo) + recovery basilare.
- Logging strutturato + metriche base + runbook essenziale.
- Suite test minima: unit + integrazione API/socket + smoke FE.
Verifica:
- Test pipeline verdi.
- Sessione test interna con scenari nominali e 5 error-path principali.

## 10) Rischi tecnici e mitigazioni
- R1: disallineamento contratto FE/BE.
  - Mitigazione: contract tests automatici + policy update contestuale `api-contract.md`.
- R2: incompatibilita' protocollo realtime (WebSocket vs Socket.IO).
  - Mitigazione: standardizzare su Socket.IO end-to-end in Fase 2.
- R3: dominio ricco ma non orchestrato in application layer.
  - Mitigazione: introdurre use-case services sottili senza riscrivere il dominio.
- R4: assenza persistenza iniziale -> perdita stato su restart.
  - Mitigazione: dichiarare limite MVP e introdurre Mongo in Fase 3.
- R5: bassa osservabilita' in debugging multi-client.
  - Mitigazione: logging strutturato con `tableId` e `socketId`.

## 11) Criteri di done: da prototipo a beta
- API Tressette MVP implementate e documentate nel contratto condiviso.
- Flussi create/join/leave/start/play-card testati E2E su 2+ client.
- Realtime stabile con riconnessione base e errori gestiti.
- Nessun fallback mock attivo in produzione.
- Copertura test minima concordata:
  - backend: unit + integrazione endpoint/socket critici,
  - frontend: smoke test route Tressette + service contract mocks.
- Logging e metriche minime disponibili per troubleshooting.
- Documento operativo rapido (come avviare, verificare health, scenari test).

## 12) Assunzioni e gap informativi
Assunzioni:
- Questo file usa i percorsi realmente trovati: `C:\Users\ingpi\Documents\code\gameland-server` e `...\gameland-app`.
- Il contratto `api-contract.md` resta source of truth condiviso.
- Tressette resta unico vertical slice per MVP.

Gap informativi da chiudere presto:
- Strategia autenticazione utente (anonimo nickname vs account registrato).
- Regole definitive su reconnect/disconnect durante una mano.
- Target deployment (solo locale/dev o ambiente staging gia' previsto).
- SLA beta interno atteso (concorrenza target, uptime minimo).

## 13) Primi 10 task prioritizzati
1. **Definire baseline config ambienti allineata al contratto**
   - Repo target: `root`
   - Outcome atteso: porte/base URL/socket path unificati e documentati (3500 backend locale).
   - Dipendenze: nessuna.
   - Stima: piccola.

2. **Implementare endpoint `POST /api/tressette/tables`**
   - Repo target: `server`
   - Outcome atteso: creazione tavolo con owner e stato `waiting`.
   - Dipendenze: task 1.
   - Stima: media.

3. **Implementare endpoint join/leave/start/get tavolo**
   - Repo target: `server`
   - Outcome atteso: API MVP complete allineate a contratto.
   - Dipendenze: task 2.
   - Stima: grande.

4. **Aggiungere layer application service + repository in-memory tavoli**
   - Repo target: `server`
   - Outcome atteso: orchestrazione pulita dominio, testabile, senza coupling al transport.
   - Dipendenze: task 2-3.
   - Stima: media.

5. **Standardizzare error codes/payload e validazione input**
   - Repo target: `server`
   - Outcome atteso: errori consistenti con `{error:{code,message}}` su HTTP/socket.
   - Dipendenze: task 3.
   - Stima: media.

6. **Implementare eventi Socket.IO Tressette con room `tableId`**
   - Repo target: `server`
   - Outcome atteso: emissione `tressette:table-updated` e `tressette:error` sui comandi tavolo.
   - Dipendenze: task 3-5.
   - Stima: grande.

7. **Migrare frontend da WebSocket nativo a `socket.io-client`**
   - Repo target: `app`
   - Outcome atteso: connessione realtime compatibile con backend Socket.IO.
   - Dipendenze: task 6.
   - Stima: media.

8. **Allineare `TressetteTableService` ai nuovi endpoint/DTO**
   - Repo target: `app`
   - Outcome atteso: niente fallback mock in path nominale, mapping contract-driven stabile.
   - Dipendenze: task 1, 3, 7.
   - Stima: media.

9. **Aggiungere contract tests BE + smoke FE sul flusso tavolo**
   - Repo target: `root`
   - Outcome atteso: verifica automatica minima su create/join/start + aggiornamento realtime.
   - Dipendenze: task 3, 6, 8.
   - Stima: grande.

10. **Aggiornare documentazione operativa (runbook + contract examples)**
   - Repo target: `root`
   - Outcome atteso: onboarding rapido nuovi thread, meno regressioni di integrazione.
   - Dipendenze: task 1-9.
   - Stima: piccola.
