# Proposal

## Why

All 12 Grade 1 MoEYS lessons (*លេខដំបូងរបស់ខ្មែរ*) are now authored, validated, and offline-precached, but learners have no curriculum map or skill-based entry point to navigate them. Adding the pure progression engine, the 5-item skippable visual placement check (`/placement`), and the Grade 1 learning path dashboard (`/learn`) lets children start at the right lesson for their skill level, clearly see mastered/available/locked lessons, and freely revisit any earlier lesson.

## What Changes

- Add pure learning-path and placement progression logic (`src/lib/path/progression.ts`):
  - `PLACEMENT_ITEMS` (5 visual Grade 1 skill items: subitize 1–5, compare to 10, bonds to 10, addition within 10, and tens & ones).
  - `computePlacementRecommendation(results)` mapping demonstrated mastery to the recommended starting lesson order (e.g., mastering bonds-to-10 recommends starting at Lesson 6 `g1-06-addition-10`).
  - `computeLearningPath(lessons, completedLessonIds, placementStartOrder)` assigning `"mastered"`, `"available"`, or `"locked"` to every lesson while always allowing access to earlier lessons and identifying the primary `nextLesson`.
  - Guarded `localStorage` persistence helpers for placement results (`loadPlacementResult`, `savePlacementResult`, `clearPlacementResult`) plus `getAllLessonCompletions()` in `src/lib/storage/progress-db.ts`.
- Add the skippable 5-item visual placement route `/placement` (`src/app/placement/page.tsx` + `src/components/path/PlacementCheck.tsx`) with large touch targets, active Khmer/Arabic numerals, and an immediate Skip button back to `/learn`.
- Add the Grade 1 learning path & child dashboard route `/learn` (`src/app/learn/page.tsx` + `src/components/path/LearningPathView.tsx`) displaying the primary "Next Lesson" card, placement banner/retake link, and all 12 Grade 1 lessons with clear Khmer status badges (`mastered`, `available`, `locked`).
- Precache `/learn` and `/placement` in `next.config.ts` and add clear links to `/learn` and `/placement` on `/` (and on the lesson completion screen).
- Add Vitest unit tests (`src/lib/path/progression.test.ts`), Testing Library tests (`src/components/path/LearningPathView.test.tsx`), and Playwright `360×800` E2E tests (`e2e/learning-path.spec.ts`) verifying placement → Lesson 6 recommendation → revisiting an earlier lesson.

## Capabilities

### New Capabilities
- `learning-path`: Grade 1 learning path dashboard displaying mastered, available, and locked lesson states; skippable 5-item visual placement check recommending a starting lesson; unrestricted revisiting of earlier lessons.

### Modified Capabilities
*(None — existing capabilities remain unchanged.)*

## Impact

- **New modules**: `src/lib/path/progression.ts`, `src/components/path/PlacementCheck.tsx`, `src/components/path/LearningPathView.tsx`, `src/app/learn/page.tsx`, `src/app/placement/page.tsx`.
- **Modified files**: `src/lib/storage/progress-db.ts`, `src/lib/i18n/messages.ts`, `src/app/page.tsx`, `src/components/player/LessonPlayer.tsx`, `next.config.ts`.
- **Tests**: `src/lib/path/progression.test.ts`, `src/components/path/LearningPathView.test.tsx`, `e2e/learning-path.spec.ts`.
