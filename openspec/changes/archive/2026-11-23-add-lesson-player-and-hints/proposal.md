# Proposal

## Why

The platform now has a validated lesson content schema (`g1-make-ten.yaml`) and reusable SVG math activities (`ten-frame`, `number-line`, `equation-fill`), but a child cannot yet play through an 8-step lesson from start to finish on a mobile phone. Building the interactive lesson player, instant feedback and misconception banner, progressive 3-level hint system, and mid-lesson resume persistence delivers the complete playable Grade 1 Lesson 5 (*បង្កើតដប់ / Make 5, Make 10*) walking skeleton.

## What Changes

- Add pure lesson session state management and local resume persistence (`src/lib/player/session.ts`) tracking current step index, deterministic per-step variation seeds, revealed hint count, wrong attempt count, completed steps, and mistake-recovery count keyed by `lessonId` and `version`.
- Add the `LessonPlayer` client component (`src/components/player/LessonPlayer.tsx`) orchestrating all four CPA step types (`intro`, `explore`, `activity`, `explain`):
  - Clear step progress bar and Khmer numeral step counter (`ជំហាន X / Y`), numeral toggle, and penalty-free Exit link.
  - Synchronous client-side answer evaluation (`<= 100 ms`) displaying warm Khmer feedback and misconception-specific guidance.
  - Progressive 3-level hints unlocking in order on request or after wrong attempts, with the final hint activating the visual model cue (`highlight-empty-cells`, `show-jump-arcs`, `highlight-ten-frame-model`) rather than merely giving away the answer.
  - Pre-recorded audio playback button hook (playing static MP3 assets when present and degrading gracefully without runtime TTS).
  - Calm natural stop screen ("ធ្វើបានល្អណាស់! ជួបគ្នាថ្ងៃស្អែក។") summarizing steps completed and mistakes fixed, with zero autoplay and zero loss-framed streak messaging.
  - Clean `onAttemptRecorded` / `onLessonCompleted` callbacks so offline IndexedDB storage plugs in seamlessly in the next change.
- Add the statically generated lesson route `/lessons/[lessonId]` (`src/app/lessons/[lessonId]/page.tsx`) and wire the primary start-learning button on `/` to `/lessons/g1-make-ten`.
- Add Vitest unit tests (`src/lib/player/session.test.ts`), Testing Library player interaction tests (`src/components/player/LessonPlayer.test.tsx`), and a Playwright `360×800` E2E test (`e2e/lesson-player.spec.ts`) playing Lesson 5 start to finish including mid-lesson reload resume.

## Capabilities

### New Capabilities
- `lesson-player`: Ordered multi-step CPA lesson orchestration (`intro`, `explore`, `activity`, `explain`), step progress display, penalty-free exit, mid-lesson resume persistence, and calm natural session stop screen.
- `feedback-hints`: Synchronous instant feedback (`<= 100 ms`), misconception-specific Khmer messages, and ordered 3-level progressive hints whose final level reveals the visual model cue.

### Modified Capabilities
*(None — existing `project-foundation`, `khmer-localization`, `lesson-content`, and `activity-engine` requirements remain unchanged.)*

## Impact

- **New modules**: `src/lib/player/session.ts`, `src/components/player/LessonPlayer.tsx`, `src/app/lessons/[lessonId]/page.tsx`.
- **Modified files**: `src/lib/i18n/messages.ts`, `src/app/page.tsx`, `src/app/page.test.tsx`.
- **Tests**: `src/lib/player/session.test.ts`, `src/components/player/LessonPlayer.test.tsx`, `e2e/lesson-player.spec.ts`.
