# PDR - Tressette 4 Incrociato: Gestione Mano di Gioco

## 1. Obiettivo
Definire requisiti funzionali e tecnici per simulare e gestire una mano completa di Tressette a 4 giocatori (3s74i) in modo realtime, a partire da tavolo completo e owner che avvia la partita.

## 2. Scope
In scope:
- Avvio partita da owner su tavolo 4/4 in stato `waiting`.
- Distribuzione carte (10 per giocatore).
- Selezione casuale del primo giocatore della mano.
- Gestione 10 trick (una carta per giocatore per trick).
- Calcolo punti mano per squadre `SUD+NORD` vs `EST+OVEST`.
- Gestione timeout turno (esempio 15s) con auto-play.
- Emissione eventi realtime per sincronizzare i client.

Out of scope (questa fase):
- Observer mode completo.
- Persistenza storica completa partita su DB.
- Anti-cheat avanzato.
- Reconnect avanzato multi-step con replay completo.

## 3. Regole di dominio acquisite
1. Tavolo: 4 giocatori con posizioni fisse (`SUD`, `NORD`, `EST`, `OVEST`).
2. Start: solo owner puo' avviare e solo se tavolo completo.
3. Distribuzione: 40 carte totali, 10 a ciascun giocatore.
4. Primo giocatore mano: estrazione casuale.
5. Una mano: 10 trick; ogni trick ha 4 giocate (una per giocatore).
6. Fine mano: calcolo punti squadre SN vs EO.
7. Tempo turno: ogni giocatore ha timeout (target iniziale 15s); allo scadere viene giocata una carta automatica valida.

## 4. Stato partita (model-level)
Stati suggeriti:
- `waiting`: tavolo in attesa avvio.
- `in_game`: mano attiva.
- `ended`: partita conclusa.

Sub-stato runtime mano (engine/sessione):
- `handNumber`
- `trickNumber` (1..10)
- `turnPlayer`
- `turnDeadlineUtc`
- `trickCards` correnti
- `handsByPlayer` (carte residue)
- `scoreSN`, `scoreEO`

## 5. Eventi realtime minimi (contract target)
Client -> Server:
- `tressette:start-game` `{ tableId, username }`
- `tressette:play-card` `{ tableId, username, card }`

Server -> Client:
- `tressette:hand-started` `{ tableId, handNumber, opener, playersHandsCount }`
- `tressette:turn-started` `{ tableId, trickNumber, turnPlayer, turnDeadlineUtc }`
- `tressette:card-played` `{ tableId, trickNumber, username, card, source: 'manual'|'timeout_auto' }`
- `tressette:trick-ended` `{ tableId, trickNumber, winner, trickPoints, scoreSN, scoreEO }`
- `tressette:hand-ended` `{ tableId, handNumber, scoreSN, scoreEO }`
- `tressette:table-updated` snapshot tavolo
- `tressette:error` standard `{ error: { code, message } }`

## 6. Errori dominio minimi
- `FORBIDDEN_START`
- `TABLE_NOT_COMPLETE`
- `TABLE_ALREADY_STARTED`
- `TABLE_NOT_IN_GAME`
- `NOT_PLAYER_TURN`
- `INVALID_CARD`
- `CARD_NOT_OWNED`
- `TURN_TIMEOUT_EXPIRED`
- `ENGINE_NOT_INITIALIZED`

## 7. Requisiti non funzionali
- Coerenza realtime: broadcast room-based per `tableId`.
- Determinismo regole: validazione server-side sempre autoritativa.
- Timeout affidabile: scheduler per turno (node timer) con cancellazione su giocata valida.
- Osservabilita': log minimi su `tableId`, `trick`, `turnPlayer`, `eventType`.

## 8. Assunzioni
- Engine 3s74i e adapter esistenti vengono riusati (no re-write completo).
- Punteggio mano segue implementazione engine attuale (totale atteso mano ~11 punti effettivi dopo normalizzazione).
- Timeout default iniziale = 15s, configurabile via env in fase successiva.

## 9. Gap informativi da confermare
- Regola precisa di auto-play: random valida o policy specifica (es. minima sul seme richiesto).
- Strategia inizio mano successiva: chi apre (vincitore ultimo trick vs rotazione configurata).
- Condizione fine partita finale (target punti 21/31/41) per questa fase.

## 10. Criteri di accettazione funzionale (fase mano)
- Start da owner su tavolo 4/4 produce distribuzione 10 carte per ciascuno.
- Primo turno assegnato e notificato a tutti i client.
- 10 trick completabili con comandi manuali e/o timeout auto-play.
- Fine mano calcola e pubblica score SN/EO.
- UI client resta sincronizzata su turni, carte giocate, score.
