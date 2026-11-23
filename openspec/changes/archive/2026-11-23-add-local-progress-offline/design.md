# Design

## Context

With `project-foundation`, `khmer-localization`, `lesson-content`, `activity-engine`, `lesson-player`, and `feedback-hints` implemented and verified, the final Milestone 1 change adds true offline PWA capability (`offline-pwa`) so Lesson 5 (`g1-make-ten`) works completely offline on Android Chrome and stores attempts reliably in IndexedDB.

## Goals / Non-Goals

**Goals:**
- Configure `@serwist/next` + `serwist` with `next build --webpack` to precache all static chunks, CSS, self-hosted `.woff2` fonts, `/`, `/lessons/g1-make-ten`, and `/offline`.
- Provide a Khmer Web App Manifest (`src/app/manifest.ts`) and `/offline` fallback route (`src/app/offline/page.tsx`).
- Implement a lightweight native IndexedDB progress store (`src/lib/storage/progress-db.ts`) with `clientEventId` idempotency keys and `syncPendingAttempts()` ready for Milestone 2's API endpoint.
- Wire `LessonPlayer` into IndexedDB via `PersistentLessonPlayer` and display a calm Khmer offline connectivity banner in `RootLayout`.
- Verify full offline lesson completion, reload persistence, and `/offline` fallback in Playwright (`e2e/offline.spec.ts`).

**Non-Goals:**
- Server-side PostgreSQL sync endpoint and parent authentication (Milestone 2).
- Push notifications to children (explicitly forbidden by `openspec/config.yaml`).

## Decisions

### 1. Serwist (`@serwist/next`) + `next build --webpack`
- **Decision**: Use `@serwist/next` with `swSrc: "src/app/sw.ts"`, `swDest: "public/sw.js"`, `additionalPrecacheEntries` for `/`, `/lessons/g1-make-ten`, and `/offline`, and `fallbacks: { entries: [{ url: "/offline", matcher: ({ request }) => request.destination === "document" }] }`. Set `"build": "next build --webpack"` in `package.json` per `AGENTS.md` and `openspec/config.yaml`.
- **Rationale**: `@serwist/next` automatically injects the full build-time precache manifest (including hashed Next.js JS chunks and self-hosted `Kantumruy Pro` / `Noto Sans Khmer` `.woff2` files!) into `public/sw.js` and keeps runtime offline navigation rock-solid.

### 2. Production Server in Playwright When Built
- **Decision**: Update `playwright.config.ts` so `webServer.command` runs `npx next start -p ${port}` whenever `.next/BUILD_ID` exists (or `isCI`), falling back to `npx next dev -p ${port}` only if no production build exists.
- **Rationale**: Serwist is disabled in `next dev` (to avoid stale dev caches) and Next.js docs explicitly note dev mode is not reliable for offline testing. Using `next start` when `.next/BUILD_ID` is present lets `npm run build && npm run test:e2e` verify real production service worker precaching both locally and in CI.

### 3. Native IndexedDB Store with `clientEventId` Idempotency (`src/lib/storage/progress-db.ts`)
- **Decision**: Implement a small, typed Promise wrapper over `window.indexedDB` (`khmer-math-progress`, v1) with `attempts` (`keyPath: "clientEventId"`) and `completions` (`keyPath: "lessonId"`). Using `store.put(...)` keyed by `clientEventId` guarantees idempotent writes, and `syncPendingAttempts(transport)` filters `syncStatus === "pending"`, invokes `transport(pending)`, and marks synced IDs `"synced"` so repeated sync calls send zero duplicates.
- **Rationale**: Zero runtime dependency overhead for low-end Android devices and directly ready for Milestone 2 server sync.
