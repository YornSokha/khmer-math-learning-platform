# Design: Idempotent Attempt Sync, Mastery & Spaced Review, and Parent Overview

## 1. Pure Mastery & Spaced-Review Scheduler (`src/lib/mastery/scheduler.ts`)

- `REVIEW_INTERVAL_DAYS = [1, 3, 7, 21] as const`.
- Calendar session key: UTC ISO date string (`YYYY-MM-DD`) derived from `attemptedAt`.
- `isIndependentChallengeAttempt(attempt, reviewItemIds)`:
  - `attempt.correct === true`, `attempt.hintsUsed === 0`, and either `reviewItemIds.includes(attempt.stepId)` (when the lesson defines `review.items`) or fallback `true` for standalone mastery checks.
- `applyAttemptToSkillState(existing, { skillId, attempt, isReviewEligible })`:
  - If skill is **not yet mastered** (`masteredAt === null`):
    - Only independent correct review-eligible attempts advance `independentSessions`, and only when `sessionDate !== existing.lastMasteredDate` (preventing two attempts in the same session/day from prematurely marking mastery).
    - When `independentSessions` reaches `2`: sets `masteredAt = attempt.attemptedAt`, `reviewStage = 0`, and `nextReviewAt = addDays(attempt.attemptedAt, REVIEW_INTERVAL_DAYS[0])` (+1 day).
  - If skill **is already mastered** (`masteredAt !== null`):
    - When `attempt.correct && attempt.hintsUsed === 0 && isReviewEligible`: if `nextReviewAt` is null or `attempt.attemptedAt >= nextReviewAt` (due review), increments `reviewStage = Math.min(existing.reviewStage + 1, REVIEW_INTERVAL_DAYS.length - 1)` and schedules `nextReviewAt = addDays(attempt.attemptedAt, REVIEW_INTERVAL_DAYS[nextStage])`.
    - When `!attempt.correct`: gently resets `reviewStage = 0` and `nextReviewAt = addDays(attempt.attemptedAt, REVIEW_INTERVAL_DAYS[0])` (+1 day) for supportive retrieval practice without losing mastery recognition or showing penalties.
- `getDueReviewSkills(states, now)`: returns mastered states with `nextReviewAt !== null && nextReviewAt <= now`, sorted earliest due first.
- `computeParentProgressSummary(attempts, skillStates, lessons, now)`:
  - `masteredSkills`: `{ skillId, lessonTitleKm, masteredAt, nextReviewAt }[]`
  - `practiceSkills`: skills from attempted lessons that are not yet mastered (or have recent incorrect attempts)
  - `dueReviewSkills`: count and skill IDs due now
  - `minutesToday`, `minutesLast7Days`: summed from `attempt.durationMs` (rounded up to whole minutes when `> 0`, clamped per attempt at 10 minutes to guard against backgrounded tabs)
  - `totalAttempts`, `completedLessonIds` (lessons where the child has at least one correct review-eligible or final-step attempt).

## 2. Server Sync & Progress Route Handlers

- `POST /api/sync/attempts`:
  - Authenticates parent via `getAuthenticatedParent(request, store)`.
  - Validates `{ childProfileId, attempts: [...] }` with Zod (max 200 attempts per batch).
  - Verifies `store.findChildByIdForParent(parent.id, childProfileId)` (returns `404` otherwise).
  - Calls `store.insertAttemptsIdempotent(...)`.
  - For newly inserted attempts only (so duplicates never double-advance skill state), looks up the lesson metadata via `getAllLessons()` and updates each skill in `lesson.skills` via `applyAttemptToSkillState` + `store.upsertSkillState`.
  - Returns `{ acceptedCount, duplicateCount, skillStates }`.
- `GET /api/children/[childId]/progress`:
  - Authenticates parent & verifies ownership (`404` if not owned).
  - Loads attempts and skill states from `store` + lessons from `getAllLessons()`, computes `computeParentProgressSummary`, and returns `{ child, summary, skillStates }`.

## 3. Client Offline Sync Integration (`src/lib/storage/sync-client.ts`)

- `syncLocalAttemptsForChild(childProfileId)`:
  - Guards on `typeof navigator !== "undefined" && navigator.onLine` and non-empty `childProfileId`.
  - Calls `syncPendingAttempts()` from `src/lib/storage/progress-db.ts` with a `fetch("/api/sync/attempts", ...)` transport.
  - If the server returns `401` (not signed in) or network fails, throws so `syncPendingAttempts` leaves attempts `"pending"` in IndexedDB; the wrapper catches safely and returns `{ syncedCount: 0, remainingPendingCount, status: "deferred" }`.
- Wired into:
  - `PersistentLessonPlayer`: triggers background sync after recording each attempt and completion whenever `activeChild` is set.
  - `OfflineStatusBanner`: listens to `window` `"online"` event and flushes pending IndexedDB attempts for `activeChild`.
  - `ParentPortal`: loads `GET /api/children/[childId]/progress` for each child card to display mastered skills, skills needing practice, and minutes learned (today & 7 days), plus a calm sync button if local pending attempts exist.
