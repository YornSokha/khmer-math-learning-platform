# Proposal

## Why

Cambodian learners frequently study at home on mid- or low-end Android phones with intermittent or absent rural internet coverage. Completing the Milestone 1 walking skeleton requires precaching the app shell, Grade 1 lesson route, and self-hosted Khmer fonts via Serwist, storing learner attempts and lesson completions locally in IndexedDB with idempotent sync semantics, providing a calm Khmer offline fallback page, and verifying full offline lesson completion and reload persistence in Playwright.

## What Changes

- Configure PWA metadata and Serwist (`@serwist/next` + `serwist`) service worker precaching:
  - Add `src/app/manifest.ts` and SVG PWA icons under `public/`.
  - Add `src/app/sw.ts` precaching the Next.js build manifest (JS, CSS, self-hosted Khmer `.woff2` fonts) plus `/`, `/lessons/g1-make-ten`, and `/offline`, with network-first/cache-fallback navigation and `/offline` document fallback for uncached routes.
  - Wrap `next.config.ts` with `withSerwistInit` (updating `npm run build` to `next build --webpack` for Serwist compatibility and configuring `sw.js` headers) and ignore generated `public/sw.js*` artifacts in `.gitignore` and ESLint/Prettier.
- Add a Khmer offline fallback route (`src/app/offline/page.tsx`) and a calm connectivity status banner (`src/components/offline/OfflineStatusBanner.tsx`) rendered in `src/app/layout.tsx`.
- Add an IndexedDB local progress & idempotent attempt queue (`src/lib/storage/progress-db.ts`):
  - Stores every step attempt keyed by a unique `clientEventId` with `syncStatus: "pending" | "synced"`, and stores lesson completions keyed by `lessonId`.
  - Exposes `recordAttempt()`, `getAllAttempts()`, `getPendingAttempts()`, `recordLessonCompletion()`, `getLessonCompletion()`, and `syncPendingAttempts()` (idempotent sync with automatic online retry hook).
- Add `PersistentLessonPlayer` (`src/components/player/PersistentLessonPlayer.tsx`) wiring `LessonPlayer` `onAttempt` and `onComplete` callbacks into IndexedDB and triggering idempotent sync callbacks when online; use it in `src/app/lessons/[lessonId]/page.tsx` and show saved completion state on `/`.
- Add Vitest tests (`src/lib/storage/progress-db.test.ts` using `fake-indexeddb`) covering offline queuing, reload persistence, and idempotent duplicate-free sync, plus a Playwright `360×800` offline E2E test (`e2e/offline.spec.ts`) completing `g1-make-ten` while completely offline and confirming progress persists across offline reload.

## Capabilities

### New Capabilities
- `offline-pwa`: Serwist service worker precaching of app shell, lessons, and self-hosted fonts; Khmer PWA manifest and `/offline` fallback route; offline connectivity indicator; IndexedDB local attempt queue and completion store with idempotent sync.

### Modified Capabilities
*(None — existing capabilities remain unchanged.)*

## Impact

- **Dependencies**: Adds `@serwist/next` and `serwist`; adds devDependency `fake-indexeddb`.
- **Build config**: Updates `next.config.ts`, `package.json` (`next build --webpack`), `.gitignore`, `.prettierignore`, `eslint.config.mjs`, and `playwright.config.ts` (uses production `next start` when `.next/BUILD_ID` exists so service worker offline tests verify real production builds).
- **New modules**: `src/app/manifest.ts`, `src/app/sw.ts`, `src/app/offline/page.tsx`, `src/lib/storage/progress-db.ts`, `src/components/offline/OfflineStatusBanner.tsx`, `src/components/player/PersistentLessonPlayer.tsx`, `public/icon-192.svg`, `public/icon-512.svg`.
- **Tests**: `src/lib/storage/progress-db.test.ts`, `e2e/offline.spec.ts`.
