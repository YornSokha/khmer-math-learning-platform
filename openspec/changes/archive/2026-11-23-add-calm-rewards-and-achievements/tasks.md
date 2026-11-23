# Tasks

## 1. Pure Anti-Addictive Rewards Engine

- [x] 1.1 Create `src/lib/rewards/engine.ts` implementing learning-action-only XP, calm "days learned this week" counting (no loss-framed streaks), and 5 mastery/effort achievements with unit tests in `src/lib/rewards/engine.test.ts`

## 2. Backend Achievement Persistence & Child Rewards UI

- [x] 2.1 Persist earned achievements idempotently in `POST /api/sync/attempts` and return persisted achievements in `GET /api/children/[childId]/progress`, updating `src/lib/server/sync.test.ts`
- [x] 2.2 Add Khmer/English reward and achievement labels to `src/lib/i18n/messages.ts`, create `src/components/rewards/CalmRewardsSummary.tsx` + `src/components/rewards/CalmRewardsSummary.test.tsx`, and integrate into `src/components/path/LearningPathView.tsx`

## 3. End-to-End Verification

- [x] 3.1 Add mobile `360×800` Playwright E2E test (`e2e/rewards.spec.ts`) verifying learning-action XP, calm weekly rhythm with no missed-day warnings, achievement unlocking on `/learn`, and zero time-spent metrics on child screens, and verify `npm run lint`, `npm test`, `npm run build`, and `npm run test:e2e`
