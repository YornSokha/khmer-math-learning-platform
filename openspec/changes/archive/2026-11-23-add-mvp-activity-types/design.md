# Design

## Context

`activity-engine` currently supports `ten-frame`, `number-line`, and `equation-fill` with numeric `answer: { kind: "equals", expr }`. To support all 12 Grade 1 lessons without hardcoding any lesson screens, we extend the schema, pure evaluator, and `ActivityRenderer` with the 9 remaining SVG manipulatives and discrete `choice` answers.

## Goals / Non-Goals

**Goals:**
- Keep 100% of math and choice answer evaluation pure inside `src/lib/engine/evaluate.ts`.
- Ensure every new activity component is pure SVG + native accessible `<button>` / pointer controls (`>= 48×48px`), works via touch and keyboard, respects `prefers-reduced-motion`, adapts to Khmer/Arabic numeral preference, and keeps bundle JS lightweight for low-end Android phones.
- Keep existing `g1-make-ten.yaml` and all 46 existing tests 100% backwards-compatible.

**Non-Goals:**
- Authoring Lessons 1–12 YAML files (next change: `add-grade1-curriculum-lessons`).
- Learning path UI and placement screen (third change: `add-learning-path-and-placement`).

## Decisions

### 1. Unified Answer Spec (`equals` | `choice`)
- **Decision**: Discriminate `answerSpecSchema` on `kind`:
  - `{ kind: "equals", expr: string, integerOnly?: boolean }` (numeric evaluation via `evaluateExpression`)
  - `{ kind: "choice", value: string }` (exact trimmed match after stripping ZWSP; validates `value` is present in `step.options` when `options` is provided)
- Similarly allow `misconceptionRuleSchema.when` to be `{ equals: string }` OR `{ choice: string }`.
- **Rationale**: Covers numeric answers (`count-tap`, `drag-to-group`, `number-bond`, `place-value-blocks`, `partition` count, `money-pay`) AND symbolic/pictorial answers (`choice-pictorial`, `compare-groups` `<`/`>`/`=`, `pattern-sequence` motif ID, `partition` equal-vs-unequal choice) with one clean pure function.

### 2. Touch-First Direct Manipulation with Keyboard Parity
- **Decision**: For `drag-to-group` (`add` / `remove`), allow learners to either tap an item/control OR drag-and-drop items across the basket zone via Pointer Events, with identical keyboard button activation.
- **Rationale**: Young Grade 1 learners (age 6) on low-cost Android touchscreens often find tap-to-move easier than sustained drag; supporting both tap and pointer-up on the basket zone keeps interactions forgiving and accessible.
