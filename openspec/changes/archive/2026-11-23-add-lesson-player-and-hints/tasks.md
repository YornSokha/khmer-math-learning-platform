# Tasks

## 1. Pure Lesson Session State & Resume Persistence

- [x] 1.1 Create `src/lib/player/session.ts` managing lesson resume state (`loadLessonSession`, `saveLessonSession`, `clearLessonSession`, `getStepSeed`) keyed by `lessonId` and `lessonVersion` with guarded `localStorage` access, plus unit tests in `src/lib/player/session.test.ts`

## 2. Lesson Player, Instant Feedback & 3-Level Progressive Hints

- [x] 2.1 Add lesson player, hint, feedback, and natural stop screen Khmer/English UI chrome strings to `src/lib/i18n/messages.ts`
- [x] 2.2 Create `src/components/player/LessonPlayer.tsx` supporting all 4 CPA step types (`intro`, `explore`, `activity`, `explain`), step progress indicator, numeral toggle, penalty-free Exit, synchronous `evaluateActivityAnswer()` feedback with misconception messages, 3-level progressive hints revealing visual cues, static audio replay hook, resume restoration, calm natural stop screen, and attempt/completion callbacks
- [x] 2.3 Add Testing Library tests in `src/components/player/LessonPlayer.test.tsx` covering misconception feedback, ordered progressive hints 1→2→3 revealing the visual model cue, mistake recovery, step progression, resume across remount, and calm completion screen

## 3. Playable Lesson Route & Mobile E2E Verification

- [x] 3.1 Create `src/app/lessons/[lessonId]/page.tsx` with `generateStaticParams` rendering `<LessonPlayer lesson={lesson} />`, update `src/app/page.tsx` and `src/app/page.test.tsx` to link directly to `/lessons/g1-make-ten`
- [x] 3.2 Add `e2e/lesson-player.spec.ts` playing `/lessons/g1-make-ten` start to finish on `360×800` (including misconception check, progressive hints, mid-lesson reload resume, calm stop screen, and zero horizontal overflow) and run the full verification suite (`npm run content:validate`, `npm run lint`, `npm test`, `npm run build`, `npm run test:e2e`)
