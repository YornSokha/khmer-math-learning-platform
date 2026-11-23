# Khmer Math Learning Platform

Khmer-first, mobile-first interactive mathematics learning platform for Cambodian children.

## Prerequisites

- Node.js `>=20.9.0` (Node 22 LTS recommended)
- npm (bundled with Node.js)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Command              | Description                                               |
| -------------------- | --------------------------------------------------------- |
| `npm run dev`        | Start the local Next.js development server                |
| `npm run build`      | Create an optimized production build                      |
| `npm run start`      | Serve the production build locally                        |
| `npm run lint`       | Run ESLint and Prettier formatting checks                 |
| `npm run format`     | Auto-format repository files with Prettier                |
| `npm test`           | Run Vitest unit and React Testing Library component tests |
| `npm run test:watch` | Run Vitest in watch mode                                  |
| `npm run test:e2e`   | Run Playwright E2E tests in a `360×800` mobile viewport   |

### First-Time Playwright Setup

Install Chromium once before running `npm run test:e2e`:

```bash
npx playwright install chromium
```

## Documentation

- [docs/product.md](docs/product.md) — Core user journeys and UI/UX direction
- [docs/discovery.md](docs/discovery.md) — Phase 1 research, curriculum map, and milestone plan
- [AGENTS.md](AGENTS.md) — Working rules and OpenSpec workflow
