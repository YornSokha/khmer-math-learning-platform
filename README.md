# Khmer Math Learning Platform

Khmer-first, mobile-first interactive mathematics learning platform for Cambodian children.

## Prerequisites

- Node.js `>=20.9.0` (Node 22 LTS recommended)
- npm (bundled with Node.js)
- Docker (optional — for local PostgreSQL via `docker compose up -d`; when `DATABASE_URL` is omitted, the app falls back to an in-memory store for local previews and tests)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Optional: Local PostgreSQL + Prisma 7

```bash
cp .env.example .env
docker compose up -d
npx prisma migrate dev --name init
npx prisma generate
```

## Available Scripts

| Command                    | Description                                               |
| -------------------------- | --------------------------------------------------------- |
| `npm run dev`              | Start the local Next.js development server                |
| `npm run build`            | Create an optimized production build                      |
| `npm run start`            | Serve the production build locally                        |
| `npm run lint`             | Run ESLint and Prettier formatting checks                 |
| `npm run format`           | Auto-format repository files with Prettier                |
| `npm test`                 | Run Vitest unit and React Testing Library component tests |
| `npm run test:watch`       | Run Vitest in watch mode                                  |
| `npm run test:e2e`         | Run Playwright E2E tests in a `360×800` mobile viewport   |
| `npm run content:validate` | Validate all YAML lesson files against the Zod schema     |
| `npm run db:validate`      | Validate `prisma/schema.prisma`                           |
| `npm run db:generate`      | Regenerate the Prisma 7 client                            |

### First-Time Playwright Setup

Install Chromium once before running `npm run test:e2e`:

```bash
npx playwright install chromium
```

## Deployment (Vercel + Managed PostgreSQL in Singapore)

1. Provision a PostgreSQL database in the **Singapore (`sin1` / `ap-southeast-1`)** region (e.g., Neon, Supabase, or DigitalOcean Managed PostgreSQL).
2. Configure environment variables in Vercel (or your Docker host):
   - `DATABASE_URL` — PostgreSQL connection string (with SSL enabled in production).
3. Run production database migrations before or during release:

```bash
npx prisma migrate deploy
```

4. Build and start with the webpack flag required by Serwist offline precaching:

```bash
npm run content:validate
npm run build
npm run start
```

5. Post-deploy verification checklist:
   - Confirm `/sw.js` serves with `Cache-Control: no-cache, no-store, must-revalidate` and registers cleanly over HTTPS.
   - Verify `<html lang="km">`, Khmer numerals (`១២៣` / `123` toggle), offline lesson playback, and parent signup + under-16 consent flow.

## Documentation

- [docs/product.md](docs/product.md) — Core user journeys and UI/UX direction
- [docs/discovery.md](docs/discovery.md) — Phase 1 research, curriculum map, and milestone plan
- [AGENTS.md](AGENTS.md) — Working rules and OpenSpec workflow
