# Tasks

## 1. Initialize Next.js, TypeScript, and Tailwind CSS

- [x] 1.1 Create `package.json` with Next.js (App Router), React, TypeScript, Tailwind CSS v4 (`@tailwindcss/postcss`), `"engines": { "node": ">=20.9.0" }`, and standard scripts (`dev`, `build`, `start`, `lint`, `format`, `test`, `test:watch`, `test:e2e`), then install dependencies (`npm install`) and generate `package-lock.json`
- [x] 1.2 Add `.gitignore` covering `node_modules/`, `.next/`, `out/`, `coverage/`, `playwright-report/`, `test-results/`, and `.env*.local`
- [x] 1.3 Configure `tsconfig.json` (`strict: true`, `noUncheckedIndexedAccess: true`, `@/*` -> `./src/*`), `next.config.ts`, and `postcss.config.mjs`
- [x] 1.4 Create minimal App Router shell in `src/app/layout.tsx` (`<html lang="km">`), `src/app/globals.css` (Tailwind v4 import), and `src/app/page.tsx` (placeholder home page)

## 2. Configure ESLint and Prettier

- [x] 2.1 Install ESLint, Next.js ESLint config (`eslint-config-next`), Prettier, and `eslint-config-prettier`
- [x] 2.2 Add `eslint.config.mjs`, `.prettierrc` (with `endOfLine: "lf"`), and `.prettierignore` (ignoring `.next`, `node_modules`, `playwright-report`, `test-results`, `coverage`, `package-lock.json`)
- [x] 2.3 Wire `npm run lint` to run both `eslint .` and `prettier --check .` and `npm run format` to run `prettier --write .`

## 3. Configure Vitest and React Testing Library

- [x] 3.1 Install `vitest`, `@vitejs/plugin-react`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, and `@testing-library/user-event`
- [x] 3.2 Create `vitest.config.ts` (`jsdom` environment, `@/` alias, excluding `e2e/**` and `.next/**`) and `src/test/setup.ts` (importing `@testing-library/jest-dom/vitest`)
- [x] 3.3 Add an initial component smoke test (`src/app/page.test.tsx`) verifying the placeholder home page renders cleanly

## 4. Configure Playwright Mobile E2E Harness

- [x] 4.1 Install `@playwright/test` and install Chromium browser binaries (`npx playwright install chromium`)
- [x] 4.2 Create `playwright.config.ts` targeting `e2e/` with a `mobile-android` Chromium project (`360×800`, `isMobile: true`, `hasTouch: true`, `deviceScaleFactor: 2`) and `webServer` configured for local (`npm run dev`) and CI (`npm run start`) execution
- [x] 4.3 Add a mobile smoke E2E test (`e2e/home.spec.ts`) verifying `/` returns HTTP 200, renders `<html lang="km">`, displays main content, and has no horizontal overflow at `360×800`

## 5. CI Workflow and Documentation

- [x] 5.1 Create `.github/workflows/ci.yml` triggered on `push` and `pull_request` using `ubuntu-latest` and Node 22 LTS to run `npm ci`, `npm run lint`, `npm test`, `npm run build`, and Playwright Chromium E2E (`npm run test:e2e`)
- [x] 5.2 Create root `README.md` documenting prerequisites and exact commands to install, run locally, build, lint/format, run unit/component tests, and run mobile E2E tests
- [x] 5.3 Update `AGENTS.md` application commands section only if any script name differs from what was documented

## 6. Final Verification

- [x] 6.1 Run `npm run lint`, `npm test`, `npm run build`, and `npm run test:e2e` locally and confirm all exit with code `0`
- [x] 6.2 Verify `git status` contains only intended project setup files and no untracked build/test artifacts
