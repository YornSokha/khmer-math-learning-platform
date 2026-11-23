# Design

## Context

With `project-foundation` and `khmer-localization` in place, the platform needs its data-driven lesson pipeline (`lesson-content`) before implementing interactive activities and the lesson player. Lessons are authored as versioned YAML files in git (`content/lessons/*.yaml`), validated with Zod and safe math checks at build/CI time, segmented with Khmer ZWSP at build/server time, and inspected via `/preview/[lessonId]`.

## Goals / Non-Goals

**Goals:**
- Define a strict, extensible Zod schema for 8-step CPA lessons (`src/lib/content/schema.ts`) supporting Grade 1–2 number sense and Milestone 1 activity types (`ten-frame`, `number-line`, `equation-fill`).
- Implement a pure, dependency-free arithmetic expression parser (`src/lib/content/expression.ts`) that validates expressions across parameter combinations without `eval` or `new Function`.
- Implement build/server-time Khmer word-boundary ZWSP insertion (`src/lib/content/zwsp.ts`) via Node's built-in `Intl.Segmenter("km", { granularity: "word" })`.
- Implement a server/build-time YAML lesson loader (`src/lib/content/loader.ts`) and CLI validator (`scripts/validate-content.ts`) exposed as `npm run content:validate` and wired into CI.
- Author `content/lessons/g1-make-ten.yaml` (Lesson 5: *បង្កើតដប់ / Make 5, Make 10*, `G1-U7`) covering the full 8-step CPA flow and all three core Milestone 1 activity types.
- Build `/preview/[lessonId]` for math/Khmer teacher inspection and verify it in Playwright at `360×800`.

**Non-Goals:**
- Interactive SVG activity rendering and answer evaluation UI (deferred to `add-activity-engine-core`).
- Interactive 8-step lesson player state machine and audio playback (deferred to `add-lesson-player-and-hints`).
- Database storage of lessons (lessons remain static versioned files in git).

## Decisions

### 1. Safe Arithmetic Expression Parser (`src/lib/content/expression.ts`)
- **Decision**: Implement a tiny recursive-descent parser for expressions supporting integer literals, identifiers (`[a-zA-Z_][a-zA-Z0-9_]*`), parentheses, unary `-`, and binary `+`, `-`, `*`, `/`. Export `extractVariables(expr)`, `evaluateExpression(expr, vars)`, and `validateExpressionDomain(expr, params, options)`.
- **Rationale**: Zero `eval` / `Function` security risks, works identically in Vitest, CLI validation, and the future pure activity evaluator, and gives exact error messages when a parameter combination produces division by zero, a non-integer, or a negative Grade 1 result.
- **Parameter enumeration**: For `randInt: [min, max]` ranges (small primary-school bounds), enumerate Cartesian combinations up to a cap (e.g., 512 combinations; sampling corners + interior if larger) to guarantee every Grade 1–2 parameter combination is mathematically valid.

### 2. Lesson YAML Schema (`src/lib/content/schema.ts`)
- **Decision**: Use `zod` v4 (or latest stable `zod`) + `yaml` package to parse YAML strings and validate:
  - Lesson metadata: `id` (kebab-case), `version` (positive int), `title: { km, en? }`, `grade` (1–6), `strand`, `moeysRef` (non-empty string array), `skills`, `prerequisites`, `estimatedMinutes`, `numerals` (`"khmer" | "arabic" | "child-preference"`).
  - Step discriminated union on `type`:
    - `intro`: hook problem with Khmer text, optional scene/image slug, optional audio hint (`"auto"` or path).
    - `explore`: interactive manipulative exploration step (`activity`, `mode`, `params`, `prompt`).
    - `activity`: graded interactive step (`activity: "ten-frame" | "number-line" | "equation-fill"`, `mode`, `supports: "full" | "partial" | "none"`, `params`, `prompt`, optional `template`, `answer: { kind: "equals", expr, integerOnly? }`, `feedback: { correct, misconceptions[] }`, `hints` with 1–3 items where hints can be `{ km }` or `{ km, show }` visual cues).
    - `explain`: visual explanation step with optional visual model reference, Khmer explanation, and `mathTerms[]` (0–2 concise Khmer math terms).
  - `review: { items: string[] }` referencing existing `activity` step IDs.
  - `reviewStatus: { math: "draft" | "approved", khmer: "draft" | "approved", reviewer?: string }`.
- **Rationale**: Aligns directly with `docs/discovery.md`'s draft YAML contract and `openspec/config.yaml`'s 8-step CPA template and publish gate.

### 3. Build-Time Khmer ZWSP Segmentation (`src/lib/content/zwsp.ts`)
- **Decision**: Use `new Intl.Segmenter("km", { granularity: "word" })` on Khmer runs (splitting around `{placeholder}` tokens so placeholders are never segmented or mutated), inserting `\u200B` between adjacent Khmer word-like segments when not already separated by whitespace, punctuation, or ZWSP.
- **Rationale**: Zero external native dependencies, deterministic in Node 22+, keeps browser bundles completely free of word-segmentation code, and preserves `{given}` / `{answer}` template tokens.

### 4. Sample Lesson `g1-make-ten.yaml` & Preview Route (`/preview/[lessonId]`)
- **Decision**: Author `content/lessons/g1-make-ten.yaml` with 8 steps matching the CPA sequence (1. Hook `intro`, 2. `explore` ten-frame, 3. `activity` ten-frame complete, 4. `explain` making 10 visual, 5. `activity` number-line jump to 10, 6. `activity` equation-fill with supports partial, 7. `activity` equation-fill abstract supports none, 8. `activity` mastery check). Mark `reviewStatus: { math: "approved", khmer: "draft", reviewer: "Pending Khmer primary teacher review (Milestone 1 Step 7)" }` so the publish gate is honored honestly while `/preview/g1-make-ten` renders it with clear status badges.
- **Rationale**: Gives Changes 2, 3, and 4 a real, pedagogically complete MoEYS Grade 1 lesson immediately while respecting the native teacher review rule in `AGENTS.md`.
