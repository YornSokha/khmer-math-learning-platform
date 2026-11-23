# Design

## Context

`lesson-content` now validates versioned YAML lessons (including `g1-make-ten.yaml`) covering `ten-frame`, `number-line`, and `equation-fill` steps. This change builds the reusable activity engine contract and the three core SVG interactive components so the next change (`add-lesson-player-and-hints`) can orchestrate any valid lesson cleanly without activity-specific logic.

## Goals / Non-Goals

**Goals:**
- Pure, side-effect-free parameter resolution and answer/misconception evaluation in `src/lib/engine/evaluate.ts`.
- Accessible on-screen `NumericKeypad` (`០–៩` / `0–9`) with `>= 48×48px` non-clipping controls.
- Three reusable SVG math manipulatives (`TenFrameActivity`, `NumberLineActivity`, `EquationFillActivity`) plus `ActivityRenderer` dispatcher.
- High-signal Vitest unit tests (pure evaluator) and Testing Library interaction tests for all three activities and keypad.

**Non-Goals:**
- Multi-step lesson progression, hint unlocking state machine, audio playback, and resume persistence (deferred to `add-lesson-player-and-hints`).
- Remaining MVP activity types (`count-tap`, `drag-to-group`, `compare-groups`, `money-pay`, etc. — deferred to Milestone 2).

## Decisions

### 1. Pure Evaluation Contract (`src/lib/engine/evaluate.ts`)
- **Decision**: Export:
  - `resolveStepParams(params: ParamMap, seed?: number): Record<string, number>` using a lightweight deterministic Mulberry32/LCG PRNG when `seed` is passed.
  - `formatTemplateText(template: string, resolvedParams: Record<string, number>, numeralSystem: NumeralSystem, extra?: Record<string, number>): string` formatting numeric placeholders via `formatNumber(..., { numeralSystem })` so `{given}` renders `"៧"` in Khmer mode and `"7"` in Arabic mode!
  - `evaluateActivityAnswer(step: ActivityStep, resolvedParams: Record<string, number>, rawAnswer: number | string | null, numeralSystem?: NumeralSystem): EvaluationResult` returning `{ correct, expected, submitted, misconceptionId, feedbackKm }`.
- **Rationale**: Keeps math correctness 100% pure and testable without React/DOM, reuses `evaluateExpression` and `parseNumericAnswer`, and automatically localizes interpolated numbers inside Khmer feedback messages.

### 2. SVG + Native Interactive Controls for Accessibility & Low-End Android Performance
- **Decision**: Render visual models (ten-frame grid & mango counters, number-line track & curved hop arcs) as clean, lightweight SVG paired with accessible `<button>` controls (`min-h-touch min-w-touch`, `aria-label`, `aria-pressed`) or keyboard-focusable interactive SVG/grid buttons.
- **Rationale**: Native `<button>` tiles inside the ten-frame grid and number-line controls guarantee reliable `>= 48×48px` touch targets, screen-reader semantics, keyboard Tab/Enter/Space support, and crisp rendering on low-end Android Chrome with minimal JS overhead.
