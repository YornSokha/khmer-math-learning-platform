# Tasks

## 1. Schema & Pure Evaluator Extensions

- [x] 1.1 Extend `src/lib/content/schema.ts` with all 12 activity types, extended activity modes, `answerSpecSchema` (`equals` | `choice`), `options[]`, `pattern[]`, `visualKind`, and optional `order` on lessons; add validation tests in `src/lib/content/schema.test.ts`
- [x] 1.2 Extend `src/lib/engine/evaluate.ts` to evaluate both `equals` and `choice` answers/misconceptions cleanly and add unit tests in `src/lib/engine/evaluate.test.ts`

## 2. Nine Reusable Grade 1 SVG Activity Components

- [x] 2.1 Add Khmer/English UI chrome labels for the new activities to `src/lib/i18n/messages.ts`
- [x] 2.2 Create `CountTapActivity.tsx`, `ChoicePictorialActivity.tsx`, and `CompareGroupsActivity.tsx` under `src/components/activities/` with Testing Library tests
- [x] 2.3 Create `DragToGroupActivity.tsx`, `NumberBondActivity.tsx`, and `PlaceValueBlocksActivity.tsx` under `src/components/activities/` with Testing Library tests
- [x] 2.4 Create `PatternSequenceActivity.tsx`, `PartitionActivity.tsx`, and `MoneyPayActivity.tsx` under `src/components/activities/` with Testing Library tests

## 3. Dispatcher, Player Integration & Full Verification

- [x] 3.1 Register all 12 activity types in `src/components/activities/ActivityRenderer.tsx` and update `src/components/player/LessonPlayer.tsx` to support choice answers and `explain` visuals cleanly
- [x] 3.2 Run `npm run content:validate`, `npm run lint`, `npm test`, `npm run build`, and `npm run test:e2e` and confirm all checks exit with code `0`
