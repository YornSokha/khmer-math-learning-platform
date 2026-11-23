# Tasks

## 1. Pure Mastery & Spaced-Review Scheduler

- [x] 1.1 Create `src/lib/mastery/scheduler.ts` implementing 2-session independent mastery, `1/3/7/21`-day spaced review intervals, `getDueReviewSkills`, and `computeParentProgressSummary` with unit tests in `src/lib/mastery/scheduler.test.ts`

## 2. Backend Sync & Parent Progress API

- [x] 2.1 Implement `POST /api/sync/attempts` and `GET /api/children/[childId]/progress` with unit/integration tests in `src/lib/server/sync.test.ts` covering idempotent deduplication, cross-parent authorization, mastery updates, and progress summaries

## 3. Client Sync Wiring, Parent Overview UI & Verification

- [x] 3.1 Create `src/lib/storage/sync-client.ts` and integrate silent background sync into `src/components/player/PersistentLessonPlayer.tsx` and `src/components/offline/OfflineStatusBanner.tsx`
- [x] 3.2 Add Khmer/English parent overview and sync labels to `src/lib/i18n/messages.ts` and display per-child mastery, practice skills, learning minutes, and sync status in `src/components/parent/ParentPortal.tsx`
- [x] 3.3 Add mobile `360×800` Playwright E2E test (`e2e/sync-mastery.spec.ts`) verifying parent signup → child handoff → lesson play → automatic attempt sync → parent overview progress & zero duplicate sync, and verify `npm run db:validate`, `npm run content:validate`, `npm run lint`, `npm test`, `npm run build`, and `npm run test:e2e` all pass
