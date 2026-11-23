# Proposal: Add Calm Anti-Addictive Rewards, Learning-Only XP, and Mastery Achievements

## Why

The platform's anti-addiction rules (`openspec/config.yaml` and `docs/discovery.md`) require motivation that supports mastery without dark patterns: XP earned solely from learning actions (never time spent), "days learned this week" with automatic rest days instead of loss-framed streaks, and ~5 achievements celebrating mastery and effort. The Prisma `AchievementAward` table and `DataStore.awardAchievement` method already exist; this change implements the pure rewards engine, persists synced achievement awards, and renders a calm reward summary on `/learn` while keeping time-spent metrics strictly off child views.

## What Changes

- Create a pure, unit-tested rewards engine (`src/lib/rewards/engine.ts`):
  - **Learning-action-only XP**: awards XP for correct attempts, fixing mistakes, completing lessons, and completing daily challenges — completely independent of `durationMs` (time spent).
  - **Calm weekly rhythm ("days learned this week")**: counts distinct calendar days with learning activity in the rolling 7-day window (`0–7`), supporting automatic rest days with zero loss-framed streak warnings or penalties when a day is missed.
  - **5 Mastery & Effort Achievements**:
    1. `first-lesson` — Completed first lesson
    2. `mistake-fixer` — Fixed 3 mistakes
    3. `master-bonds-10` — Mastered a skill or completed Make 10
    4. `review-champion` — Completed a spaced review
    5. `calm-three-days` — Learned on 3 days this week
- Wire achievement awarding into backend sync and progress APIs:
  - `POST /api/sync/attempts`: evaluates newly unlocked achievements from synced attempts and skill states and persists them idempotently via `store.awardAchievement()`.
  - `GET /api/children/[childId]/progress`: returns persisted `achievements` alongside the parent progress summary.
- Add calm child-facing rewards UI (`src/components/rewards/CalmRewardsSummary.tsx`) on `/learn`:
  - Displays learning XP, "days learned this week" (`0–7` dots with automatic rest days), and the 5 mastery/effort achievements (never showing time spent, leaderboards, or loss-framed streak warnings).

## Capabilities

### New Capabilities
- `rewards`: Learning-action-only XP, non-punitive "days learned this week" tracking with zero loss-framed streak messages, 5 mastery/effort achievements persisted locally and synced to the backend, and calm child-facing reward presentation.

### Modified Capabilities
- None.

## Impact

- New files: `src/lib/rewards/engine.ts`, `src/lib/rewards/engine.test.ts`, `src/components/rewards/CalmRewardsSummary.tsx`, `src/components/rewards/CalmRewardsSummary.test.tsx`, `e2e/rewards.spec.ts`.
- Modified files: `src/app/api/sync/attempts/route.ts`, `src/app/api/children/[childId]/progress/route.ts`, `src/lib/server/sync.test.ts`, `src/components/path/LearningPathView.tsx`, `src/lib/i18n/messages.ts`.
