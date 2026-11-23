# Proposal: Add Idempotent Attempt Sync, Skill Mastery & Spaced-Review Scheduler, and Parent Progress Overview

## Why

Children complete lessons offline or online on a parent's phone and queue attempts locally in IndexedDB. To complete Milestone 2, those attempts need to sync idempotently to the parent-owned backend without duplicates, update per-skill mastery using the evidence-based 2-session mastery and 1/3/7/21-day spaced review schedule, and surface a calm per-child progress summary (skills mastered, skills needing practice, and minutes learned) to parents without showing time-spent metrics as gamification to children.

## What Changes

- Implement a pure, unit-tested mastery and spaced-review scheduler (`src/lib/mastery/scheduler.ts`):
  - Mastery requires **2 independent correct challenges** (`hintsUsed === 0` on review-eligible steps) across **separate calendar sessions** (`YYYY-MM-DD`).
  - Spaced review intervals follow `1 → 3 → 7 → 21` days (`REVIEW_INTERVAL_DAYS = [1, 3, 7, 21]`), with `getDueReviewSkills(states, now)` identifying skills due today.
  - Parent summary helper (`computeParentProgressSummary`) aggregates mastered skills, skills needing practice, due reviews, and learning minutes (today and last 7 days) strictly for parents.
- Add authenticated, parent-scoped backend API routes:
  - `POST /api/sync/attempts`: validates batches of local attempts with Zod, deduplicates idempotently by `clientEventId`, updates `SkillState` records via the scheduler, and returns `{ acceptedCount, duplicateCount, skillStates }`.
  - `GET /api/children/[childId]/progress`: returns the child's calm progress summary and skill states for the owning parent.
- Implement the browser sync client (`src/lib/storage/sync-client.ts`) connecting `syncPendingAttempts()` in `src/lib/storage/progress-db.ts` to `POST /api/sync/attempts`, wired into `PersistentLessonPlayer` (on attempt/completion when online with an active child) and `OfflineStatusBanner` (automatically on `online` reconnect).
- Extend `/parent` (`ParentPortal.tsx`) with a calm per-child progress overview card (mastered skills, skills to practice, minutes learned today & last 7 days, plus a manual sync button for any pending offline attempts).

## Capabilities

### New Capabilities
- `progress-mastery`: Idempotent local-to-server attempt synchronization, 2-session independent mastery evaluation, 1/3/7/21-day spaced-review scheduling, and parent-facing progress summaries (including learning minutes shown only to parents).

### Modified Capabilities
- None.

## Impact

- New files: `src/lib/mastery/scheduler.ts`, `src/lib/mastery/scheduler.test.ts`, `src/app/api/sync/attempts/route.ts`, `src/app/api/children/[childId]/progress/route.ts`, `src/lib/server/sync.test.ts`, `src/lib/storage/sync-client.ts`, `e2e/sync-mastery.spec.ts`.
- Modified files: `src/lib/i18n/messages.ts`, `src/components/player/PersistentLessonPlayer.tsx`, `src/components/offline/OfflineStatusBanner.tsx`, `src/components/parent/ParentPortal.tsx`.
