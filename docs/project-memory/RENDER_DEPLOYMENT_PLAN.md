# Render Deployment Plan

## Goal
Deploy backend and frontend on Render with minimum risk and reproducible configuration.

## Current status (2026-03-08)
- Backend (`gameland-server`): deployable as Node web service.
- Frontend (`gameland-app`): deployable as static site.
- Task 8 (engine integration FE/BE) is still in progress and must be validated before production release.

## Target topology
1. `gameland-server` Render Web Service (Node)
2. `gameland-app` Render Static Site

## Required settings
### Backend service
- Runtime: `node`
- Build: `npm ci && npm run build`
- Start: `node dis/server.js`
- Health check: `/health`
- Required env:
  - `NODE_ENV=production`
  - `PORT` (managed by Render)
  - `MONGO_URL` (optional until persistence is enabled)

### Frontend static site
- Runtime: `static`
- Build: `npm ci && npm run build`
- Publish path: `www`
- SPA rewrite: `/* -> /index.html`

## Integration constraints
- Frontend prod environment currently points to localhost and must be switched to Render URLs before release.
- CORS/socket origin policy on backend must allow frontend Render domain.
- Mock flags/dev-only scenarios must stay disabled in production.

## Rollout order
1. Deploy backend service and verify `/health`.
2. Configure frontend API/socket URLs to backend Render URL.
3. Deploy frontend static site.
4. Run smoke tests:
   - lobby list/create/join/start
   - socket connection
   - owner-only start gate

## Release gate
- No open PR conflicts on `dev`.
- CI green on FE and BE.
- Contract aligned (`docs/api-contract.md`).
- Manual test evidence captured in project-memory journal.
