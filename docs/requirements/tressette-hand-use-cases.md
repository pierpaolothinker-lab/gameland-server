# Use Cases - Tressette 4 Incrociato (Gestione Mano)

## UC-01 - Owner avvia partita
Attore: Owner tavolo
Precondizioni:
- Tavolo stato `waiting`
- 4 giocatori seduti
Flusso principale:
1. Owner invia comando start.
2. Server valida owner + completezza tavolo.
3. Server inizializza engine/sessione mano.
4. Server distribuisce 10 carte per giocatore.
5. Server estrae opener e pubblica `hand-started` + `turn-started`.
Postcondizioni:
- Tavolo in stato `in_game`
- Mano pronta al primo trick
Errori:
- `FORBIDDEN_START`, `TABLE_NOT_COMPLETE`, `TABLE_ALREADY_STARTED`

## UC-02 - Giocatore gioca carta nel proprio turno
Attore: Giocatore di turno
Precondizioni:
- Tavolo `in_game`
- Turno attivo assegnato al giocatore
Flusso principale:
1. Client invia `play-card`.
2. Server verifica turno e validita' carta.
3. Engine applica la giocata.
4. Server emette `card-played` e aggiorna snapshot.
5. Se trick completo, emette `trick-ended` e prossimo `turn-started`.
Postcondizioni:
- Carta rimossa dalla mano giocatore
- Stato trick/turno coerente per tutti i client
Errori:
- `NOT_PLAYER_TURN`, `INVALID_CARD`, `CARD_NOT_OWNED`, `TABLE_NOT_IN_GAME`

## UC-03 - Auto-play su timeout turno
Attore: Sistema server
Precondizioni:
- Turno attivo con deadline
- Nessuna giocata valida entro timeout
Flusso principale:
1. Scade timer turno.
2. Server seleziona carta valida automatica.
3. Engine applica la giocata con source `timeout_auto`.
4. Server emette `card-played`.
5. Prosegue flusso normale (trick-end o prossimo turno).
Postcondizioni:
- Partita non bloccata
- Turno avanzato
Errori:
- `ENGINE_NOT_INITIALIZED` (caso anomalo)

## UC-04 - Fine trick e calcolo vincitore trick
Attore: Sistema server
Precondizioni:
- 4 carte giocate nel trick corrente
Flusso principale:
1. Engine valuta seme di uscita e sovranita'.
2. Determina vincitore trick.
3. Calcola punti trick.
4. Aggiorna score squadra.
5. Emissione `trick-ended` e `turn-started` successivo.
Postcondizioni:
- Trick chiuso
- Nuovo turno aperto con vincitore trick come opener

## UC-05 - Fine mano e pubblicazione punteggi
Attore: Sistema server
Precondizioni:
- Completati 10 trick della mano
Flusso principale:
1. Engine calcola punti mano SN/EO.
2. Server emette `hand-ended`.
3. Server prepara stato mano successiva (se partita non finita).
Postcondizioni:
- Score mano disponibile a tutti i client
- Stato pronto a mano successiva o fine partita

## UC-06 - Client riceve stato realtime
Attore: Client FE
Precondizioni:
- Socket connesso in room tavolo
Flusso principale:
1. Client riceve eventi (`turn-started`, `card-played`, `trick-ended`, `hand-ended`).
2. Aggiorna UI in modo idempotente.
3. In caso mismatch, client richiede snapshot tavolo.
Postcondizioni:
- UI coerente con server authoritative state
