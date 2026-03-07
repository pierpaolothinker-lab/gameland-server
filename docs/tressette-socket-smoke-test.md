# Tressette Socket Smoke Test (5 min)

Objective: quickly verify realtime table updates over Socket.IO after Task 6.

## Prerequisites
- Backend running on `http://localhost:3500`
- PowerShell terminal available
- Browser with DevTools console

## 1) Start backend
From `C:\Users\ingpi\Documents\code\gameland-server`:

```powershell
npm.cmd start
```

Expected:
- `Server listening on port 3500...`

## 2) Create baseline table and preload 2 players (HTTP)
In another PowerShell terminal:

```powershell
$create = Invoke-RestMethod -Method POST -Uri "http://localhost:3500/api/tressette/tables" -ContentType "application/json" -Body '{"owner":"Pierpaolo"}'
$tableId = $create.tableId

Invoke-RestMethod -Method POST -Uri "http://localhost:3500/api/tressette/tables/$tableId/join" -ContentType "application/json" -Body '{"username":"Vito","position":"NORD"}' | Out-Null
Invoke-RestMethod -Method POST -Uri "http://localhost:3500/api/tressette/tables/$tableId/join" -ContentType "application/json" -Body '{"username":"Tonino","position":"EST"}' | Out-Null

$tableId
```

Expected:
- You get a non-empty `tableId`.
- Table now has owner + NORD + EST.

## 3) Open 2 browser clients
Open two tabs on any page (for example `about:blank`) and open DevTools Console in each.

### Client A console (Paolo joins OVEST)
Replace `__TABLE_ID__` with the value from step 2.

```javascript
(() => {
  const script = document.createElement('script');
  script.src = 'http://localhost:3500/socket.io/socket.io.js';
  script.onload = () => {
    const socket = io('http://localhost:3500');

    socket.on('connect', () => console.log('A connected', socket.id));
    socket.on('tressette:table-updated', (data) => console.log('A table-updated', data));
    socket.on('tressette:hand-started', (data) => console.log('A hand-started', data));
    socket.on('tressette:error', (err) => console.log('A error', err));

    socket.emit('tressette:join-table', {
      tableId: '__TABLE_ID__',
      username: 'Paolo',
      position: 'OVEST'
    });

    window.socketA = socket;
  };
  document.head.appendChild(script);
})();
```

Expected:
- `A connected ...`
- `A table-updated ...` with `isComplete: true` and 4 players.

### Client B console (Owner starts game)
Replace `__TABLE_ID__` with same ID.

```javascript
(() => {
  const script = document.createElement('script');
  script.src = 'http://localhost:3500/socket.io/socket.io.js';
  script.onload = () => {
    const socket = io('http://localhost:3500');

    socket.on('connect', () => {
      console.log('B connected', socket.id);
      socket.emit('tressette:start-game', {
        tableId: '__TABLE_ID__',
        username: 'Pierpaolo'
      });
    });

    socket.on('tressette:table-updated', (data) => console.log('B table-updated', data));
    socket.on('tressette:hand-started', (data) => console.log('B hand-started', data));
    socket.on('tressette:error', (err) => console.log('B error', err));

    window.socketB = socket;
  };
  document.head.appendChild(script);
})();
```

Expected:
- On both clients, `table-updated` with `status: "in_game"`.
- On both clients, `hand-started` event received.

## 4) Negative checks (quick)
From Client A console:

```javascript
socketA.emit('tressette:join-table', { tableId: '__TABLE_ID__', username: 'X', position: 'OVEST' });
```

Expected:
- `tressette:error` with code `TABLE_NOT_JOINABLE` (game already started) or `POSITION_NOT_AVAILABLE` (if attempted before start).

From Client B console:

```javascript
socketB.emit('tressette:play-card', { tableId: '__TABLE_ID__' });
```

Expected:
- `tressette:error` with code `NOT_IMPLEMENTED`.

## Pass criteria
- Realtime `tressette:table-updated` received by both clients.
- `tressette:hand-started` received after owner start.
- Error events follow contract shape `{ error: { code, message } }`.

## Cleanup
Optional (PowerShell):

```powershell
Invoke-RestMethod -Method GET -Uri "http://localhost:3500/api/tressette/tables/$tableId"
```

Use this to confirm final table state.
