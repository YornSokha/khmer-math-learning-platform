# Proposal

## Why

The repository currently contains only Phase 1 discovery and product documentation, with no runnable web application, automated test harness, or CI verification. Setting up the Next.js + TypeScript + Tailwind foundation with linting, unit/component/E2E testing, and CI now ensures every upcoming capability (starting with Khmer typography and the lesson content pipeline) can be built and verified in small, reliable increments.

## What Changes

- Initialize a Next.js (App Router) + React + TypeScript + Tailwind CSS application in the repository root with a clean `src/` layout.
- Add a minimal root layout (`<html lang="km">`) and placeholder home route (`/`) so the app builds and renders end-to-end.
- Configure ESLint and Prettier with a unified `npm run lint` script (plus `npm run format:check` / `npm run format` as helpers).
- Configure Vitest and React Testing Library (`npm test`) with a passing initial smoke test.
- Configure Playwright (`npm run test:e2e`) with a `360×800` mobile viewport profile (matching our low/mid-end Android baseline) and a passing smoke test for `/`.
- Add a GitHub Actions CI workflow (`.github/workflows/ci.yml`) that runs lint, unit/component tests, and production build on push and pull requests.
- Add `README.md` documenting prerequisites, installation, local development, production build, and test commands.
- **Out of scope**: Self-hosted Khmer fonts, design tokens, and numeral formatting (`add-khmer-foundation`); Zod lesson schemas and ZWSP pipeline (`add-lesson-content-schema`); SVG activity engine; Serwist/PWA offline caching (`add-local-progress-offline`); PostgreSQL/Prisma and authentication (Milestone 2).

## Capabilities

### New Capabilities

- `project-foundation`: Runnable Next.js App Router application shell, standardized development/build/lint/test commands, mobile-viewport E2E harness, automated CI checks, and developer setup documentation.

### Modified Capabilities

*(None — no existing specs in `openspec/specs/`.)*

## Impact

- **Repository root**: Adds `package.json`, `package-lock.json`, `tsconfig.json`, `next.config.ts`, Tailwind/PostCSS config, ESLint/Prettier config, `vitest.config.ts`, `playwright.config.ts`, `.gitignore`, and `README.md`.
- **Application code**: Adds minimal `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, plus initial unit/component test and Playwright E2E smoke test.
- **CI/CD**: Adds `.github/workflows/ci.yml` for GitHub Actions.
- **Systems unaffected**: No database, auth, external services, or existing production code are modified.
