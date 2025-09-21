# Polybright Inventory Management System (IMS)

Polybright IMS is an offline-capable inventory platform that unifies product, warehouse, purchasing, sales, and transfer workflows across web, API, and mobile clients.

## Repo Tree (top-level)

```
.
├── Dockerfile
├── Makefile
├── README.md
├── docker-compose.yml
├── package.json
├── tsconfig.json
├── apps
│   ├── api
│   ├── mobile
│   └── web
├── adr
├── docs
├── tests
└── playwright.config.ts
```

## Quick Start (local, no Docker)

1. `git init`
2. `git add .`
3. `git commit -m "Initial commit"`
4. `npm install`
5. `cp .env.example .env`
6. Update `.env` with PostgreSQL credentials and JWT secret.
7. `npm run generate --workspace apps/api`
8. `npm run migrate --workspace apps/api`
9. `npm run db:seed`
10. `npm run dev`
11. Open http://localhost:3000 and sign in with `admin@polybright.test / Admin123!`

### Smoke Test Checklist

- Homepage renders dashboard.
- Login succeeds and shows seeded data.
- Create product, PO receive, SO fulfill, transfer stock via API (use sample curl below).
- Health endpoints return `200` (`/api/healthz`, `/api/readyz`).
- Logs contain `request_id` values.
- Offline queue persists mutations and flushes once reconnected.
- `npm test`, `npm run test:api`, and `npm run test:e2e` complete.

### Example API Calls

```bash
# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@polybright.test","password":"Admin123!"}'

# Lookup barcode
curl -H 'Authorization: Bearer <TOKEN>' \
  http://localhost:4000/api/products/by-barcode/PB0001
```

## Environment Variables

All configuration lives in `.env` (12-factor). Copy `.env.example` and supply values:

- `DATABASE_URL` — PostgreSQL connection string.
- `JWT_SECRET` — 32+ char secret for signing tokens.
- `NEXT_PUBLIC_API_BASE` — Base URL for web client.
- `EXPO_PUBLIC_API_BASE` — Base URL for Expo client (use emulator loopback such as `http://10.0.2.2:4000/api`).
- `ORIGIN`, `SESSION_COOKIE_NAME`, `TIMEZONE`, `CURRENCY` — defaults included for Manila operations.

## Development Scripts

- `npm run dev` — concurrently run API and Next.js.
- `npm run dev:mobile` — launch Expo dev server.
- `npm run fmt` / `npm run lint` / `npm run typecheck` — formatting, linting, strict TypeScript.
- `npm test` — unit tests (Vitest).
- `npm run test:api` — Supertest API smoke.
- `npm run test:e2e` — Playwright happy path (launches local dev server).
- `npm run migrate` / `npm run db:seed` — Prisma migrations and demo data.

## Docker

- One command up: `docker compose up --build` (serves web on 3000, API on 4000, Postgres on 5432).
- Containers expose health checks (`/api/healthz`, `/api/readyz`, web `/api/health`).
- Logs remain JSON-formatted and annotated with `request_id` for traceability.

## Deployment Notes

- **Web (Vercel)**: Connect repo, set `NEXT_PUBLIC_API_BASE`, build command `npm run build:web`, output `.next` (standalone).
- **API (Render/Railway)**: Deploy Dockerfile with target `api`, provide `DATABASE_URL`, `JWT_SECRET`, and other env vars. Run `npm run migrate` before `npm run start --workspace apps/api` or use Docker image.
- **Database**: Managed PostgreSQL (supabase/Neon/Render). Apply Prisma migrations via `npm run migrate`.
- **Expo Mobile**: `npm run dev:mobile`, scan QR with Expo Go. Configure `EXPO_PUBLIC_API_BASE` pointing to tunneled API (e.g. `https://<ngrok-id>.ngrok.app/api`).
- **Replit**: Import repo, set env vars, run `npm run dev` (web + API) for quick demos.

## Security Considerations (OWASP L1)

Implemented:
- Input validation via Zod on every API boundary.
- JWT auth with httpOnly cookie support and org-bound checks.
- Argon2 password hashes; demo seed uses a unique admin account.
- Helmet, CORS allowlist, and secure default headers.
- Prisma ORM with parameterised SQL, avoiding injection.
- JSON logging with `request_id` for incident response.
- Least-privileged Postgres connection string expected via env vars.

Next steps:
1. Add global rate limiting and IP throttling (e.g., Redis-based) on auth routes.
2. Introduce dependency and container scanning in CI (npm audit, Trivy).
3. Enforce Content-Security-Policy + HSTS in production proxies.
4. Implement automated backups and restore drills for Postgres.
5. Extend audit log redaction for PII and rotate JWT secrets regularly.

## Testing Matrix

| Layer | Tool | Command |
| ----- | ---- | ------- |
| Unit | Vitest | `npm test` |
| API | Supertest | `npm run test:api` |
| E2E | Playwright | `npm run test:e2e` |

## Troubleshooting

- **Missing env vars**: Copy from `.env.example` and restart dev server.
- **Port conflict**: Change `PORT` or stop other services bound to 3000/4000.
- **Prisma migrate fails**: Verify Postgres is reachable and rerun `npm run migrate --workspace apps/api`.
- **Playwright browser deps**: `npx playwright install --with-deps`.
- **Expo cannot reach API**: Use LAN tunnel or emulator loopback (`10.0.2.2`, `127.0.0.1`).

## Observability

- `GET /api/healthz` checks process; `GET /api/readyz` confirms DB connectivity; `GET /api/metrics` exposes basic counters.
- Logs follow JSON shape `{timestamp, level, request_id, userId?, orgId?, msg}` via Pino.

## Micro-Glossary

- **MVC** — Routes/controllers delegate to services and Prisma repositories.
- **Offline-first** — Clients queue mutations locally and reconcile once back online.
- **N+1** — Multiple tiny SQL calls; Prisma includes prevent this.
- **OWASP L1** — Baseline security hygiene for web apps.
- **12-factor** — Config lives in environment variables, not code.
