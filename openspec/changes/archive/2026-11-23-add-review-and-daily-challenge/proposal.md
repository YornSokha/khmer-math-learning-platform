# Proposal: Add Spaced-Review Runner and Skippable 1-Item Daily Challenge

## Why

The mastery scheduler (`src/lib/mastery/scheduler.ts`) already computes 2-session skill mastery and 1/3/7/21-day spaced review dates, and every Grade 1 lesson declares `review.items`. To begin Milestone 3, children need a real interactive **Today's Review** experience (`/review`) surfaced on `/learn` whenever mastered skills are due, plus an optional, always-skippable **Daily Challenge** (`/daily-challenge`) that takes ~3 minutes and ends at a calm stop point with zero loss-framed pressure. Both flows must work offline and sync attempts cleanly when online.

## What Changes

- Create a pure, unit-tested review queue and daily challenge selector (`src/lib/review/queue.ts`):
  - `computeLocalSkillStates(attempts, lessons)`: replays local IndexedDB `StoredAttempt[]` through `applyAttemptToSkillState` so due review items work identically offline (and without requiring a parent account) as well as online.
  - `buildDueReviewQueue(lessons, skillStates, now, maxItems = 5)`: selects review-eligible activity steps (`lesson.review.items`) for skills returned by `getDueReviewSkills(skillStates, now)` with deterministic date-seeded parameter variations.
  - `selectDailyChallenge(lessons, dateKey, completedLessonIds)`: deterministically picks 1 Grade 1 review-eligible activity step for the given date (`YYYY-MM-DD`) and generates a date-seeded variation.
  - Lightweight `localStorage` persistence for daily challenge status (`"completed"` | `"skipped"`) keyed by `YYYY-MM-DD` (never stores loss-framed streak penalties).
- Add child-facing interactive routes:
  - `/review` (`src/app/review/page.tsx` + `src/components/review/SpacedReviewPlayer.tsx`): plays due review cards one by one using `ActivityRenderer`, `evaluateActivityAnswer`, progressive hints, and misconception feedback; records attempts in IndexedDB (syncing silently for active children) to advance the `1 → 3 → 7 → 21`-day schedule; ends at a calm natural stop screen.
  - `/daily-challenge` (`src/app/daily-challenge/page.tsx` + `src/components/review/DailyChallengePlayer.tsx`): plays today's single 1-item challenge with an always-available "Skip today" button (no penalty), instant feedback, hints, IndexedDB attempt recording, and a calm completion screen.
- Extend `/learn` (`src/components/path/LearningPathView.tsx`) with:
  - **Today's Review** card shown when due review skills exist (showing count and direct button to `/review`).
  - **Daily Challenge** card showing today's optional 1-item challenge with both "Start" and "Skip today" actions, plus calm completed/skipped states.
- Precache `/review` and `/daily-challenge` in `next.config.ts` so both routes work offline.

## Capabilities

### Modified Capabilities
- `progress-mastery`: Add child-facing Today's Review queue construction (both offline from local attempts and online) and interactive `/review` runner that records review attempts to advance the 1/3/7/21-day schedule.
- `learning-path`: Add the Today's Review card and optional, always-skippable 1-item Daily Challenge card on `/learn` and `/daily-challenge`.

## Impact

- New files: `src/lib/review/queue.ts`, `src/lib/review/queue.test.ts`, `src/components/review/SpacedReviewPlayer.tsx`, `src/components/review/DailyChallengePlayer.tsx`, `src/components/review/ReviewAndChallenge.test.tsx`, `src/app/review/page.tsx`, `src/app/daily-challenge/page.tsx`, `e2e/review-daily-challenge.spec.ts`.
- Modified files: `src/app/learn/page.tsx`, `src/components/path/LearningPathView.tsx`, `src/components/path/LearningPathView.test.tsx`, `src/lib/i18n/messages.ts`, `next.config.ts`.
