# User Stories - Tressette 4 Incrociato (Mano)

## Epic A - Avvio mano
### US-A1
Come owner del tavolo
voglio avviare la partita quando siamo in 4
cosi' da iniziare la mano in modo ufficiale.

Acceptance Criteria:
- Pulsante start visibile solo owner.
- Start consentito solo con tavolo 4/4 e stato waiting.
- Dopo start vedo stato `in_game` e opener mano.

### US-A2
Come giocatore
voglio ricevere le mie 10 carte a inizio mano
cosi' da poter giocare.

Acceptance Criteria:
- Ogni giocatore riceve 10 carte server-authoritative.
- Nessun giocatore vede carte degli altri (solo count avversari).

## Epic B - Gioco trick/turni
### US-B1
Come giocatore di turno
voglio giocare una carta valida
cosi' da contribuire al trick.

Acceptance Criteria:
- Server rifiuta carta non valida/non posseduta.
- A giocata accettata, UI di tutti si aggiorna realtime.

### US-B2
Come giocatore non di turno
voglio essere bloccato dal giocare
cosi' da rispettare le regole.

Acceptance Criteria:
- Tentativo non di turno produce errore `NOT_PLAYER_TURN`.

### US-B3
Come sistema
voglio auto-giocare una carta al timeout
cosi' da evitare blocchi della partita.

Acceptance Criteria:
- Timeout default 15s.
- Auto-play emesso con `source=timeout_auto`.

## Epic C - Punteggio mano
### US-C1
Come giocatore
voglio vedere chi vince ogni trick
cosi' da seguire la dinamica della mano.

Acceptance Criteria:
- Evento `trick-ended` con winner e punti trick.

### US-C2
Come giocatore
voglio vedere il punteggio SN/EO a fine mano
cosi' da capire l'andamento partita.

Acceptance Criteria:
- Evento `hand-ended` con scoreSN/scoreEO.
- Score coerente con 10 trick completati.

## Epic D - Robustezza client
### US-D1
Come client FE
voglio riallinearmi con snapshot se perdo eventi
cosi' da mantenere UI consistente.

Acceptance Criteria:
- In caso errore/mismatch, FE richiede snapshot tavolo.
- Stato UI torna coerente con server.
