# Proposal

## Why

The platform now has a validated YAML lesson schema and Khmer typography/numeral foundation, but lessons cannot yet be interacted with or evaluated. Building the pure activity engine contract and the three core Milestone 1 SVG activities (`ten-frame`, `number-line`, `equation-fill` with an on-screen numeric keypad) establishes reusable, touch- and keyboard-accessible math manipulatives whose answer evaluation is completely declarative and unit-testable without the UI.

## What Changes

- Define the pure activity engine core (`src/lib/engine/evaluate.ts`):
  - Deterministic parameter resolution (`resolveStepParams`) for fixed values and `randInt` ranges so lessons generate repeatable variations and tests remain deterministic.
  - Pure declarative answer evaluation (`evaluateActivityAnswer`) computing the expected answer via the safe expression engine, normalizing learner input (Khmer/Arabic digits + ZWSP stripping), detecting defined misconceptions (`misconceptionId`), and returning localized, interpolated Khmer feedback.
- Build a reusable, large on-screen numeric keypad (`src/components/activities/NumericKeypad.tsx`) rendering digits in the active Khmer (`០–៩`) or Arabic (`0–9`) numeral system with `>= 48×48px` buttons and zero reliance on device Khmer keyboards.
- Build the three core SVG, touch- and keyboard-accessible math activity components under `src/components/activities/`:
  - `TenFrameActivity` (`fill`, `complete`, `read` modes + `highlight-empty-cells` hint cue).
  - `NumberLineActivity` (`jump` / `place` modes with SVG hop arcs, tuk-tuk start marker, target stop, and `show-jump-arcs` hint cue).
  - `EquationFillActivity` (`solve` mode with numeral-aware equation display, `NumericKeypad`, keyboard digit support, and optional ten-frame scaffold for `partial` supports or `highlight-ten-frame-model` hint cue).
- Build `ActivityRenderer` (`src/components/activities/ActivityRenderer.tsx`) dispatching any `ActivityStep` or `ExploreStep` to the registered SVG activity component.
- Add comprehensive Vitest pure evaluation tests (correct, incorrect, misconception, Khmer/Arabic digit equivalence) and Testing Library interaction tests for every activity type.

## Capabilities

### New Capabilities
- `activity-engine`: Pure declarative parameter resolution and answer/misconception evaluation contract, on-screen Khmer/Arabic numeric keypad, and reusable touch/keyboard-accessible SVG math activities (`ten-frame`, `number-line`, `equation-fill`).

### Modified Capabilities
*(None — existing `project-foundation`, `khmer-localization`, and `lesson-content` requirements remain unchanged.)*

## Impact

- **New modules**: `src/lib/engine/evaluate.ts`, `src/components/activities/NumericKeypad.tsx`, `src/components/activities/TenFrameActivity.tsx`, `src/components/activities/NumberLineActivity.tsx`, `src/components/activities/EquationFillActivity.tsx`, and `src/components/activities/ActivityRenderer.tsx`.
- **UI messages**: Adds Khmer/English chrome labels for keypad controls and activity ARIA labels in `src/lib/i18n/messages.ts`.
- **Tests**: Adds colocated Vitest pure evaluator tests (`src/lib/engine/evaluate.test.ts`) and Testing Library component interaction tests for `TenFrameActivity`, `NumberLineActivity`, `EquationFillActivity`, and `NumericKeypad`.
