# Task Breakdown FE/BE - Gestione Mano Tressette (Pronti per esecuzione)

## BE Tasks

### BE-01 (P1) - Hand bootstrap on start
- Repo: server
- Outcome: `start` inizializza sessione engine, distribuisce 10 carte per giocatore, opener casuale, stato in_game.
- Dipendenze: Task 8 base engine integration.
- Stima: media
- Deliverable: adapter/store + test unit/integration.

### BE-02 (P1) - Turn state e timer timeout
- Repo: server
- Outcome: turno attivo con deadline e auto-play allo scadere.
- Dipendenze: BE-01.
- Stima: grande
- Deliverable: scheduler turno, cancellazione timer su play manuale, eventi `turn-started`/`card-played`.

### BE-03 (P1) - Play-card rules enforcement
- Repo: server
- Outcome: validazione server-side su turno, possesso carta, stato in_game.
- Dipendenze: BE-01.
- Stima: media
- Deliverable: error catalog esteso + test (`NOT_PLAYER_TURN`, `CARD_NOT_OWNED`, ...).

### BE-04 (P2) - Trick lifecycle events
- Repo: server
- Outcome: gestione trick completo (4 carte) con winner/points + evento `trick-ended`.
- Dipendenze: BE-03.
- Stima: media

### BE-05 (P2) - Hand end event
- Repo: server
- Outcome: dopo 10 trick emette `hand-ended` con score SN/EO.
- Dipendenze: BE-04.
- Stima: media

### BE-06 (P2) - Contract update
- Repo: server
- Outcome: `api-contract.md` aggiornato con nuovi eventi/payload/errori.
- Dipendenze: BE-02..BE-05.
- Stima: piccola

## FE Tasks

### FE-01 (P1) - Hand state rendering
- Repo: app
- Outcome: UI mostra `handNumber`, `trickNumber`, `turnPlayer`, countdown turno.
- Dipendenze: contract eventi base (`turn-started`).
- Stima: media

### FE-02 (P1) - Play-card action gating
- Repo: app
- Outcome: utente puo' giocare solo nel proprio turno, CTA disabilitata fuori turno.
- Dipendenze: FE-01 + errori backend.
- Stima: media

### FE-03 (P1) - Auto-play timeout UX
- Repo: app
- Outcome: se timeout, UI mostra giocata automatica e avanzamento turno.
- Dipendenze: evento `card-played` con source.
- Stima: piccola

### FE-04 (P2) - Trick ended panel
- Repo: app
- Outcome: pannello ultimo trick (winner + punti + score cumulato).
- Dipendenze: evento `trick-ended`.
- Stima: piccola

### FE-05 (P2) - Hand ended summary
- Repo: app
- Outcome: riepilogo fine mano e preparazione mano successiva.
- Dipendenze: evento `hand-ended`.
- Stima: piccola

### FE-06 (P2) - Resync strategy
- Repo: app
- Outcome: in errore/mismatch richiede snapshot tavolo e riallinea UI.
- Dipendenze: endpoint snapshot stabile.
- Stima: media

## Sequenza consigliata (delivery)
1. BE-01
2. BE-03
3. BE-02
4. FE-01
5. FE-02
6. BE-04
7. FE-04
8. BE-05
9. FE-05
10. FE-06 + BE-06

## Definition of Done (batch mano)
- Build/test verdi FE e BE.
- Eventi contract aggiornati e verificati manualmente su 2 client.
- Timeout auto-play dimostrato in demo.
- Documentazione memory aggiornata con outcome e gap residui.
