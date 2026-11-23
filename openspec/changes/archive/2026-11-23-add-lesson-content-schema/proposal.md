# Proposal

## Why

Lessons in this platform must be pure, versioned data files in git rather than hardcoded UI components so educators can author, review, and validate mathematical and Khmer quality independently of the engine. Establishing the Zod lesson schema, safe expression validator, build-time Khmer zero-width space (ZWSP) segmentation, CLI validation gate, and `/preview/[lessonId]` route now creates the data contract that the upcoming activity engine, lesson player, and offline precaching layers depend on.

## What Changes

- Add Zod lesson content schemas (`src/lib/content/schema.ts`) modeling versioned YAML lessons: metadata (`id`, `version`, `title`, `grade`, `strand`, `moeysRef`, `skills`, `prerequisites`, `estimatedMinutes`, `numerals`), 8-step CPA flow (`intro`, `explore`, `activity`, `explain`), parameterized variations (`randInt` ranges or constants), answer expressions, misconception rules, 3-level progressive hints, spaced-review item pointers, and the `reviewStatus` (`math` + `khmer`) publish gate.
- Add a pure, side-effect-free arithmetic expression parser and domain validator (`src/lib/content/expression.ts`) that evaluates lesson answer/misconception expressions across parameter combinations and rejects unknown variables, division by zero, non-integer results for integer parameters, and negative Grade 1 outcomes.
- Add a build-time Khmer word-boundary ZWSP (`U+200B`) segmentation helper (`src/lib/content/zwsp.ts`) using Node's `Intl.Segmenter("km", { granularity: "word" })` while preserving `{placeholder}` tokens and punctuation—never executing segmentation at browser runtime.
- Add a server/build-time YAML lesson loader (`src/lib/content/loader.ts`) reading `content/lessons/*.yaml`, validating schemas and math constraints, applying build-time ZWSP segmentation, and exposing `isLessonPublishable()`, `getAllLessons()`, `getPublishedLessons()`, and `getLessonById()`.
- Add `npm run content:validate` (`scripts/validate-content.ts`) validating all lesson YAML files with actionable lesson/step error diagnostics, and wire it into `.github/workflows/ci.yml`.
- Add the Grade 1 Lesson 5 sample YAML (`content/lessons/g1-make-ten.yaml` — *បង្កើតដប់ / Make 5, Make 10*, `G1-U7`) following the 8-step CPA sequence with culturally familiar Cambodian contexts (family plates, mangoes, tuk-tuk stops) and covering the three Milestone 1 activity types (`ten-frame`, `number-line`, `equation-fill`).
- Add a developer/teacher preview route (`/preview/[lessonId]`) displaying validated, ZWSP-segmented Khmer copy, `reviewStatus` badges, `<NumeralToggle />`, parameters, feedback/misconceptions, and progressive hints, plus a preview link from `/`.
- Add comprehensive Vitest unit tests (valid/invalid YAML, non-integer expressions, negative Grade 1 bounds, missing review step IDs, publish gate enforcement, ZWSP insertion) and a Playwright `360×800` E2E test for `/preview/g1-make-ten`.

## Capabilities

### New Capabilities
- `lesson-content`: Versioned YAML lesson schema with Zod and mathematical expression validation, build-time Khmer ZWSP word-boundary insertion, dual math/Khmer approval publish gating, CLI validation (`npm run content:validate`), and `/preview/[lessonId]` inspection route.

### Modified Capabilities
*(None — existing `project-foundation` and `khmer-localization` requirements remain unchanged.)*

## Impact

- **Dependencies**: Adds `zod`, `yaml`, and devDependency `tsx`.
- **New modules**: `src/lib/content/expression.ts`, `src/lib/content/schema.ts`, `src/lib/content/zwsp.ts`, `src/lib/content/loader.ts`, `scripts/validate-content.ts`, `content/lessons/g1-make-ten.yaml`, and `src/app/preview/[lessonId]/page.tsx`.
- **Tooling & CI**: Adds `content:validate` script to `package.json` and runs it in `.github/workflows/ci.yml`.
- **Tests**: Adds colocated Vitest suites under `src/lib/content/` and Playwright mobile verification in `e2e/lesson-preview.spec.ts`.
