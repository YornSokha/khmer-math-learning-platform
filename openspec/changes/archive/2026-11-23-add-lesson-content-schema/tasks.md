# Tasks

## 1. Dependencies & Safe Expression Engine

- [x] 1.1 Install `zod`, `yaml`, and devDependency `tsx`, and add `"content:validate": "tsx scripts/validate-content.ts"` to `package.json`
- [x] 1.2 Create `src/lib/content/expression.ts` with a pure recursive-descent arithmetic parser (`extractVariables`, `evaluateExpression`, `validateExpressionDomain`) and unit tests in `src/lib/content/expression.test.ts` covering valid math, unknown variables, division by zero, non-integer results, and negative Grade 1 bounds

## 2. Lesson Zod Schema & Build-Time ZWSP Segmentation

- [x] 2.1 Create `src/lib/content/schema.ts` defining the Zod lesson schema, cross-field mathematical/step-reference validation, `parseLessonYaml()`, `validateLesson()`, and `isLessonPublishable()`, plus unit tests in `src/lib/content/schema.test.ts` covering valid YAML, duplicate step IDs, invalid review references, non-integer expressions, negative Grade 1 answers, and publish gate enforcement
- [x] 2.2 Create `src/lib/content/zwsp.ts` implementing build-time Khmer word-boundary `U+200B` insertion (`insertKhmerZwsp`, `applyZwspToLesson`) via `Intl.Segmenter("km", { granularity: "word" })` while preserving `{placeholder}` tokens and punctuation, with unit tests in `src/lib/content/zwsp.test.ts`

## 3. Sample Lesson, Loader & CLI Validation

- [x] 3.1 Author `content/lessons/g1-make-ten.yaml` (Grade 1 Lesson 5, `G1-U7`, 8-step CPA flow covering `ten-frame`, `number-line`, and `equation-fill`) and create `src/lib/content/loader.ts` (`getAllLessons`, `getPublishedLessons`, `getLessonById`, `loadLessonFromFile`)
- [x] 3.2 Create `scripts/validate-content.ts` (accepting an optional directory argument for testing invalid fixtures), add CLI tests in `src/lib/content/loader.test.ts`, wire `npm run content:validate` into `.github/workflows/ci.yml`, and verify `npm run content:validate` passes

## 4. Lesson Preview Route & Full Verification

- [x] 4.1 Create `src/app/preview/[lessonId]/page.tsx` displaying validated, ZWSP-segmented Khmer lesson copy, `reviewStatus` badges, `<NumeralToggle />`, formatted parameter ranges, feedback/misconceptions, and progressive hints; add a link to `/preview/g1-make-ten` from `src/app/page.tsx` and update UI dictionary strings in `src/lib/i18n/messages.ts`
- [x] 4.2 Add `e2e/lesson-preview.spec.ts` verifying `/preview/g1-make-ten` on `360×800` (HTTP 200, Khmer heading, review badges, all 8 steps, numeral toggle, zero horizontal overflow) and run the full verification suite (`npm run content:validate`, `npm run lint`, `npm test`, `npm run build`, `npm run test:e2e`)
