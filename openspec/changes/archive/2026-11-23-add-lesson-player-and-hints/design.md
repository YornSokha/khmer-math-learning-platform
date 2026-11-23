# Design

## Context

`lesson-content` provides validated, ZWSP-segmented YAML lessons (`g1-make-ten.yaml`), and `activity-engine` provides pure `evaluateActivityAnswer`, `resolveStepParams`, and `ActivityRenderer`. This change adds the 8-step `LessonPlayer`, instant feedback/misconception UI, ordered 3-level hints, mid-lesson resume persistence, and `/lessons/[lessonId]`.

## Goals / Non-Goals

**Goals:**
- Pure session state helpers + guarded `localStorage` resume persistence (`src/lib/player/session.ts`).
- Mobile-first `LessonPlayer` (`src/components/player/LessonPlayer.tsx`) with `<= 100 ms` synchronous feedback, misconception alerts, 3-level hints activating visual model cues, replayable audio hook (static MP3 only, no runtime TTS), penalty-free exit, and calm completion screen.
- Statically generated `/lessons/[lessonId]` route ready for offline precaching in the next change.
- End-to-end Playwright test playing Lesson 5 start to finish on `360×800` including mid-lesson reload resume.

**Non-Goals:**
- IndexedDB attempt queue and Serwist offline service worker precaching (deferred to `add-local-progress-offline`; `LessonPlayer` exposes clean `onAttempt` / `onComplete` callbacks for it).
- Server database persistence and parent/child accounts (Milestone 2).

## Decisions

### 1. Deterministic Resume Persistence (`src/lib/player/session.ts`)
- **Decision**: Persist `{ lessonId, lessonVersion, stepIndex, sessionSeed, completedStepIds, fixedMistakes, updatedAt }` under `khmer-math:lesson-session:<lessonId>` in `localStorage` (guarded with `try/catch`). If `lessonVersion` changes or `stepIndex` is out of range, start fresh cleanly.
- **Rationale**: Using a stored `sessionSeed` ensures that when a learner reloads mid-lesson on a parameterized `randInt` step, the exact same problem resumes rather than scrambling numbers mid-thought!

### 2. Progressive Hint Escalation
- **Decision**: Maintain `revealedHints` (`0..step.hints.length`) and `wrongAttempts` per step.
  - Learner can request the next hint anytime via a `>= 48×48px` "សុំជំនួយ" (Show Hint) button with zero penalty.
  - Submitting a wrong attempt gently offers the hint button (and after 2 wrong attempts highlights an extra "មើលរូបជំនួយ" visual-model cue callout).
  - Active visual hint cue (`activeHintCue`) is the `show` property of the highest revealed hint that defines one.
- **Rationale**: Matches `docs/discovery.md` ("Hints unlock in order after a wrong attempt or on request (max 3). The final hint shows the model, not just the answer") and keeps the child in control without shaming errors.
