# Tasks

## 1. Pure Learning Path & Placement Engine

- [x] 1.1 Add `getAllLessonCompletions()` to `src/lib/storage/progress-db.ts` and create `src/lib/path/progression.ts` (`PLACEMENT_ITEMS`, `computePlacementRecommendation`, `computeLearningPath`, `loadPlacementResult`, `savePlacementResult`, `clearPlacementResult`) with unit tests in `src/lib/path/progression.test.ts`

## 2. Placement Check & Learning Path UI

- [x] 2.1 Add learning path and placement Khmer/English UI chrome strings to `src/lib/i18n/messages.ts`
- [x] 2.2 Create `src/components/path/PlacementCheck.tsx`, `src/app/placement/page.tsx`, `src/components/path/LearningPathView.tsx`, and `src/app/learn/page.tsx` with Testing Library tests in `src/components/path/LearningPathView.test.tsx`
- [x] 2.3 Update `src/app/page.tsx`, `src/components/player/LessonPlayer.tsx`, and `next.config.ts` to link to `/learn` & `/placement` and precache both routes offline

## 3. Mobile E2E & Full Verification

- [x] 3.1 Add `e2e/learning-path.spec.ts` verifying the placement flow (answering items 1–3 correctly → Lesson 6 recommended → revisiting Lesson 1 from `/learn`) and skip flow on `360×800`
- [x] 3.2 Run `npm run content:validate`, `npm run lint`, `npm test`, `npm run build`, and `npm run test:e2e` and confirm all checks exit with code `0`
