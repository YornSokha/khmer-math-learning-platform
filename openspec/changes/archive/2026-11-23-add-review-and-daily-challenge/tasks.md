# Tasks

## 1. Pure Review Queue & Daily Challenge Selector

- [x] 1.1 Create `src/lib/review/queue.ts` implementing `computeLocalSkillStates`, `buildDueReviewQueue`, `selectDailyChallenge`, and date-keyed daily challenge status helpers with unit tests in `src/lib/review/queue.test.ts`

## 2. Interactive Review & Daily Challenge Routes and Dashboard Cards

- [x] 2.1 Add Khmer/English UI strings for Today's Review and Daily Challenge to `src/lib/i18n/messages.ts`
- [x] 2.2 Implement `src/components/review/SpacedReviewPlayer.tsx`, `src/app/review/page.tsx`, `src/components/review/DailyChallengePlayer.tsx`, and `src/app/daily-challenge/page.tsx` with component tests in `src/components/review/ReviewAndChallenge.test.tsx`
- [x] 2.3 Surface Today's Review and skippable Daily Challenge cards in `src/components/path/LearningPathView.tsx` (updating `src/app/learn/page.tsx` and `src/components/path/LearningPathView.test.tsx`) and precache `/review` and `/daily-challenge` in `next.config.ts`

## 3. End-to-End Verification

- [x] 3.1 Add mobile `360×800` Playwright E2E test (`e2e/review-daily-challenge.spec.ts`) covering Today's Review (seeded due skill → `/learn` card → `/review` completion → queue cleared) and Daily Challenge (skip without penalty & solve with calm completion), and run `npm run lint`, `npm test`, `npm run build`, and `npm run test:e2e`
