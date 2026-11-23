# Tasks

## 1. Serwist PWA Precaching, Manifest & Offline Fallback

- [x] 1.1 Install `@serwist/next`, `serwist`, and devDependency `fake-indexeddb`; configure `next.config.ts` with `withSerwistInit` (precaching `/`, `/lessons/g1-make-ten`, `/offline`), update `package.json` `"build"` to `"next build --webpack"`, ignore generated `public/sw.js*` in `.gitignore`, `.prettierignore`, and `eslint.config.mjs`, and add `src/app/sw.ts`
- [x] 1.2 Add `src/app/manifest.ts`, `public/icon-192.svg`, `public/icon-512.svg`, Khmer offline UI chrome strings in `src/lib/i18n/messages.ts`, `src/app/offline/page.tsx`, and `src/components/offline/OfflineStatusBanner.tsx` mounted in `src/app/layout.tsx`

## 2. IndexedDB Progress Store & Persistent Lesson Player

- [x] 2.1 Create `src/lib/storage/progress-db.ts` implementing IndexedDB `attempts` and `completions` stores with `clientEventId` idempotency and `syncPendingAttempts()`, plus Vitest tests in `src/lib/storage/progress-db.test.ts` using `fake-indexeddb`
- [x] 2.2 Create `src/components/player/PersistentLessonPlayer.tsx` wiring `LessonPlayer` into IndexedDB (`recordAttempt`, `recordLessonCompletion`), update `src/app/lessons/[lessonId]/page.tsx` to use it, and display local completion status on `src/app/page.tsx`

## 3. Offline Playwright E2E & Full Verification

- [x] 3.1 Update `playwright.config.ts` to serve the production build (`next start`) when `.next/BUILD_ID` exists, add `e2e/offline.spec.ts` verifying service worker activation, offline reload of `/lessons/g1-make-ten`, completing all 8 steps offline, IndexedDB persistence across offline reload, and `/offline` fallback rendering
- [x] 3.2 Run the full verification suite (`npm run content:validate`, `npm run lint`, `npm test`, `npm run build`, `npm run test:e2e`) and confirm all checks exit with code `0`
