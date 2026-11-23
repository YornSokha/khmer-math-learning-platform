# Design: Spaced-Review Runner & Skippable Daily Challenge

## 1. Pure Review Queue & Daily Challenge Engine (`src/lib/review/queue.ts`)

- `computeLocalSkillStates(attempts, lessons)`:
  - Sorts `StoredAttempt[]` chronologically by `timestamp` and folds them through `applyAttemptToSkillState` (reusing the exact same 2-session mastery and `1/3/7/21`-day scheduler as the server).
  - Returns `LocalSkillState[]` (`skillId`, `independentSessions`, `lastMasteredDate`, `masteredAt`, `reviewStage`, `nextReviewAt`).
- `buildDueReviewQueue(lessons, skillStates, now = new Date(), maxItems = 5)`:
  - Calls `getDueReviewSkills(skillStates, now)`.
  - For each due skill (up to `maxItems`), locates its owning lesson, resolves review-eligible `ActivityStep`s from `lesson.review.items`, and picks a deterministic step + numeric variation seed derived from `hashString("${dateKey}:${skillId}:${reviewStage}")`.
  - Returns `DueReviewCard[]`: `{ id, skillId, lessonId, lessonVersion, lessonTitleKm, step, seed, reviewStage }`.
- `selectDailyChallenge(lessons, dateKey = toUtcDateKey(new Date()), completedLessonIds = new Set())`:
  - Builds a candidate pool of review-eligible `ActivityStep`s across Grade 1 lessons (prioritizing completed lessons + next 2 lessons if any are completed, otherwise early Grade 1 lessons `order <= 6` so new learners always get an approachable puzzle).
  - Deterministically selects exactly **1** candidate and seed from `hashString("daily:${dateKey}")`.
  - Returns `DailyChallengeItem`: `{ dateKey, lessonId, lessonVersion, lessonTitleKm, step, seed }`.
- `loadDailyChallengeStatus(dateKey)` / `saveDailyChallengeStatus(dateKey, status)`:
  - Stores `{ dateKey, status: "completed" | "skipped", updatedAt }` in `localStorage` under `khmer-math:daily-challenge:v1`.
  - Automatically resets when `dateKey` changes to a new day; never stores or computes loss-framed streaks.

## 2. Interactive Runners

- Both `SpacedReviewPlayer` (`/review`) and `DailyChallengePlayer` (`/daily-challenge`) reuse `ActivityRenderer`, `evaluateActivityAnswer`, `resolveStepParams`, `formatTemplateText`, and `NumeralToggle`.
- On each activity submit:
  - Calls `recordAttempt({ lessonId, lessonVersion, stepId, correct, hintsUsed, misconceptionId, durationMs, timestamp })` in IndexedDB (`src/lib/storage/progress-db.ts`).
  - If `activeChild` is selected, triggers `syncLocalAttemptsForChild(activeChild.id)` silently in the background.
- Because `/review` records attempts with the original `lessonId` and review-eligible `stepId`, both local `computeLocalSkillStates()` and the server's `POST /api/sync/attempts` automatically advance `reviewStage` and push `nextReviewAt` forward (`1 → 3 → 7 → 21` days)!
- `DailyChallengePlayer` always displays a prominent `រំលងថ្ងៃនេះ` ("Skip today") button next to the controls. Skipping marks today as `"skipped"` and presents a calm message with a button back to `/learn` — no guilt, no warnings.

## 3. Child Dashboard Integration (`/learn`) & Offline Precache

- `src/app/learn/page.tsx` passes full lesson metadata (lightweight summary + `skills` + `review.items` ids — or full lessons for `/review` and `/daily-challenge` pages, keeping `/learn` lightweight by passing only `{ id, order, titleKm, moeysRef, estimatedMinutes, skills, reviewItemIds }`!).
- `LearningPathView.tsx` loads local `getAllAttempts()` + `getAllLessonCompletions()` once on mount:
  - Computes `localSkillStates` and `dueCount = getDueReviewSkills(localSkillStates).length`.
  - When `dueCount > 0`, displays the **Today's Review** card above the path list with a primary link to `/review`.
  - Displays the **Daily Challenge** card with "Start" (`/daily-challenge`) and "Skip today" (inline, zero-penalty), or a calm completed/skipped badge for today.
- `next.config.ts` adds `{ url: "/review", revision }` and `{ url: "/daily-challenge", revision }` to `additionalPrecacheEntries`.
