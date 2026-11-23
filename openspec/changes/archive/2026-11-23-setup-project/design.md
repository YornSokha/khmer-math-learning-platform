# Design

## Context

See `proposal.md` for motivation and scope. The repository currently contains only `docs/`, `openspec/`, and `AGENTS.md`. Development runs locally on Windows (Node `v26.x`, npm `12.x`) while CI and Vercel deployments run on Linux with LTS Node.

## Goals / Non-Goals

**Goals:**
- Establish a clean, minimal Next.js (App Router) + TypeScript + Tailwind CSS project structure that keeps `src/` focused on app code and leaves clean roots for `e2e/` and future `content/`.
- Wire all Milestone 1 npm scripts listed in `AGENTS.md` (`dev`, `build`, `lint`, `test`, `test:e2e`) using cross-platform commands (Windows + Linux).
- Make Vitest + Testing Library and Playwright (`360×800` mobile Chromium) work out of the box with fast smoke tests.
- Run automated quality gates in GitHub Actions CI.

**Non-Goals:**
- Configuring Khmer web fonts, design tokens, or numeral utilities (deferred to `add-khmer-foundation`).
- Adding Zod, YAML parsing, or `content:validate` (deferred to `add-lesson-content-schema`).
- Adding Serwist service worker / PWA manifest (deferred to `add-local-progress-offline`).
- Adding Prisma, database configuration, or auth (deferred to Milestone 2).

## Decisions

### 1. Source Layout (`src/` + root `e2e/`)
- **Decision**: Place Next.js App Router files under `src/app/`, future reusable UI under `src/components/`, and domain logic under `src/lib/`. Place Playwright E2E specs under root `e2e/`. Configure `@/*` path alias to `./src/*`.
- **Rationale**: Separates source code cleanly from root-level planning/content directories (`docs/`, `openspec/`, `e2e/`, future `content/`) and makes Vitest vs Playwright file discovery unambiguous.
- **Alternatives considered**: Root-level `app/` directory without `src/` (clutters the repository root and requires more ignore patterns).

### 2. TypeScript Strictness & Styling Setup
- **Decision**: Enable TypeScript `strict: true` and `noUncheckedIndexedAccess: true` in `tsconfig.json`. Use Tailwind CSS v4 with `@tailwindcss/postcss` and a minimal `src/app/globals.css`.
- **Rationale**: Strict index checks catch off-by-one and missing-step errors early in math evaluators and lesson steps; Tailwind v4 requires minimal config and gives `add-khmer-foundation` a clean `@theme` block for tokens and fonts.
- **Alternatives considered**: Tailwind v3 with `tailwind.config.ts` (unnecessary legacy config on a greenfield Next.js project).

### 3. Unified Linting & Formatting (`ESLint` + `Prettier`)
- **Decision**: Use ESLint flat config (`eslint.config.mjs`) extending Next.js Core Web Vitals and TypeScript rules plus `eslint-config-prettier` to prevent rule conflicts. Configure Prettier (`.prettierrc`, `.prettierignore`). Wire `npm run lint` to run both `eslint .` and `prettier --check .`, and add `npm run format` for local auto-fixing.
- **Rationale**: Keeps `AGENTS.md`'s single `npm run lint` command authoritative for both static checks and formatting in local dev and CI.
- **Alternatives considered**: Biome (fast, but Next.js official lint rules and plugin ecosystem are best supported by ESLint).

### 4. Unit & Component Testing (`Vitest` + `Testing Library`)
- **Decision**: Configure Vitest (`vitest.config.ts`) with `@vitejs/plugin-react`, `jsdom` environment, `@testing-library/react`, `@testing-library/jest-dom`, and `@testing-library/user-event`, using `src/test/setup.ts`. Map `npm test` to `vitest run` (single-run, CI-safe) and `npm run test:watch` to `vitest`. Exclude `e2e/**` and `.next/**`.
- **Rationale**: Single-run `npm test` never hangs in CI or agent tool calls, while `jsdom` + Testing Library prepares directly for SVG activity component tests in `add-activity-engine-core`.
- **Alternatives considered**: Jest (heavier ESM/TypeScript setup with Next.js App Router).

### 5. Mobile-First E2E Testing (`Playwright`)
- **Decision**: Configure `playwright.config.ts` targeting `e2e/` with a default `mobile-android` project using Chromium at viewport `360×800`, `isMobile: true`, `hasTouch: true`, and `deviceScaleFactor: 2`. Configure `webServer` to start the Next.js server automatically (using `npm run start` when `CI` is set, or reusing/starting `npm run dev` locally).
- **Rationale**: Directly validates the `360×800` mid/low-end Android Chrome baseline from `docs/discovery.md` and `openspec/config.yaml` and makes the visual check in `add-khmer-foundation` plug right in.
- **Alternatives considered**: Cypress (weaker multi-context/offline emulation than Playwright).

### 6. GitHub Actions CI Workflow
- **Decision**: Add `.github/workflows/ci.yml` running on `ubuntu-latest` with Node `22` (LTS) and npm caching. Execute `npm ci`, `npm run lint`, `npm test`, `npm run build`, and install Playwright Chromium (`npx playwright install --with-deps chromium`) to run `npm run test:e2e`.
- **Rationale**: Ensures every PR verifies lint, unit/component tests, production build, and the `360×800` E2E smoke test before merge.
- **Alternatives considered**: Skipping E2E in CI until later milestones (risks Playwright config drifting silently on Linux CI).

## Risks / Trade-offs

- **[Node version mismatch between Windows local v26 and CI/Vercel LTS]** → Specify `"engines": { "node": ">=20.9.0" }` in `package.json`, run CI on Node 22 LTS, and avoid experimental Node-only APIs.
- **[Cross-platform line endings and scripts on Windows vs Linux]** → Configure Prettier `endOfLine: "lf"`, `.gitignore` properly, and avoid bash-only syntax (`VAR=1 cmd`) in `package.json` scripts.
- **[Future Serwist + Turbopack build conflict]** → Keep `next.config.ts` minimal now; `npm run build` uses Next.js default and can switch to `next build --webpack` in `add-local-progress-offline` without changing other scripts or CI.
