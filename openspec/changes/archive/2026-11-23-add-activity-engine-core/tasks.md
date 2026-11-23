# Tasks

## 1. Pure Activity Engine & Parameter Resolution

- [x] 1.1 Create `src/lib/engine/evaluate.ts` exporting `resolveStepParams()`, `formatTemplateText()`, and `evaluateActivityAnswer()` (normalizing Khmer/Arabic digits + ZWSP, evaluating `answer.expr` and `feedback.misconceptions`, returning structured feedback), and add comprehensive unit tests in `src/lib/engine/evaluate.test.ts`

## 2. On-Screen Khmer/Arabic Numeric Keypad

- [x] 2.1 Add keypad and activity ARIA/label UI chrome strings to `src/lib/i18n/messages.ts`, create `src/components/activities/NumericKeypad.tsx` (`>= 48×48px` buttons adapting to `khmer`/`arabic` preference with backspace and clear), and add Testing Library tests in `src/components/activities/NumericKeypad.test.tsx`

## 3. Core SVG Math Activities & Dispatcher

- [x] 3.1 Create `src/components/activities/TenFrameActivity.tsx` (`fill`, `complete`, `read` modes, SVG mango counters, touch + keyboard, `highlight-empty-cells` hint cue) and Testing Library tests in `src/components/activities/TenFrameActivity.test.tsx`
- [x] 3.2 Create `src/components/activities/NumberLineActivity.tsx` (`jump` / `place` modes, SVG track + curved hop arcs + tuk-tuk marker, touch + keyboard, `show-jump-arcs` hint cue) and Testing Library tests in `src/components/activities/NumberLineActivity.test.tsx`
- [x] 3.3 Create `src/components/activities/EquationFillActivity.tsx` (parameterized numeral-aware equation, `NumericKeypad`, keyboard input, fadeable ten-frame visual scaffold with `highlight-ten-frame-model` hint cue), `src/components/activities/ActivityRenderer.tsx`, and Testing Library tests in `src/components/activities/EquationFillActivity.test.tsx`

## 4. Full Verification

- [x] 4.1 Run `npm run content:validate`, `npm run lint`, `npm test`, `npm run build`, and `npm run test:e2e` and confirm all checks exit with code `0`
