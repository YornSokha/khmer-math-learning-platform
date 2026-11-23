# Proposal

## Why

The Milestone 1 walking skeleton proved the data-driven activity engine with `ten-frame`, `number-line`, and `equation-fill`, but the full Grade 1 learning path (*លេខដំបូងរបស់ខ្មែរ*, Lessons 1–12) requires 9 additional culturally grounded Cambodian math manipulatives (subitizing fruit trays, pictorial multiple choice, group comparisons, basket joining/removing, number bonds, tens-and-ones stick bundles, krama repeating patterns, equal-halves partitioning, and riel banknote payment). Adding these reusable SVG activity types and choice-answer evaluation now allows Lessons 1–12 to be authored purely as validated YAML data with zero lesson-specific code.

## What Changes

- Extend `src/lib/content/schema.ts` to support:
  - All 12 Grade 1 activity types: `ten-frame`, `number-line`, `equation-fill`, `count-tap`, `choice-pictorial`, `compare-groups`, `drag-to-group`, `number-bond`, `place-value-blocks`, `pattern-sequence`, `partition`, and `money-pay`.
  - Discriminated `answer` specs supporting both numeric expressions (`{ kind: "equals", expr }`) and discrete choices (`{ kind: "choice", value }`) plus choice-based misconceptions (`when: { equals }` or `when: { choice }`), optional `options[]` (pictorial/text/symbol choices), optional `pattern[]` / `palette[]`, and optional `order` field on lessons for curriculum sequencing.
- Extend `src/lib/engine/evaluate.ts` so `evaluateActivityAnswer()` cleanly evaluates both numeric expression answers and discrete choice answers (`<`, `>`, `=`, pattern tokens, option IDs) with misconception detection and localized Khmer feedback.
- Build the 9 reusable, touch- and keyboard-accessible SVG activity components under `src/components/activities/` (all `>= 48×48px` targets, active Khmer/Arabic numeral aware, `prefers-reduced-motion` friendly):
  - `CountTapActivity` (tap Cambodian fruit objects + optional subitizing flash mode)
  - `ChoicePictorialActivity` (pictorial/visual card multiple choice)
  - `CompareGroupsActivity` (side-by-side fruit bags + `<`, `>`, `=` picker)
  - `DragToGroupActivity` (join/add into basket and remove/`drag-out` from basket via tap or pointer drag + keyboard)
  - `NumberBondActivity` (CPA whole–part–part SVG diagram + `NumericKeypad`)
  - `PlaceValueBlocksActivity` (bundles of 10 sticks + single ones up to 99)
  - `PatternSequenceActivity` (krama check / flower garland repeating patterns `AB` / `AAB`)
  - `PartitionActivity` (fair halves / equal-parts SVG food/shape partitioner)
  - `MoneyPayActivity` (Cambodian R50 and R100 banknotes tapped into a payment tray)
- Register all 12 activity types in `ActivityRenderer.tsx` and update `LessonPlayer.tsx` to handle choice-based answers smoothly alongside numeric answers.
- Add Vitest unit tests covering pure evaluation for all new answer/misconception types and Testing Library interaction tests for all 9 new SVG activities.

## Capabilities

### New Capabilities
*(None — extends existing `activity-engine` and `lesson-content` capabilities.)*

### Modified Capabilities
- `activity-engine`: Adds pure choice evaluation and 9 reusable Grade 1 SVG manipulatives (`count-tap`, `choice-pictorial`, `compare-groups`, `drag-to-group`, `number-bond`, `place-value-blocks`, `pattern-sequence`, `partition`, `money-pay`).
- `lesson-content`: Extends lesson step schema to validate the 9 new activity types, choice answer specs, pictorial choice options, pattern definitions, and lesson sequence `order`.

## Impact

- **Modified files**: `src/lib/content/schema.ts`, `src/lib/engine/evaluate.ts`, `src/components/activities/ActivityRenderer.tsx`, `src/components/player/LessonPlayer.tsx`, `src/lib/i18n/messages.ts`.
- **New modules**: 9 SVG activity components under `src/components/activities/` plus colocated Testing Library tests and extended evaluator/schema tests.
