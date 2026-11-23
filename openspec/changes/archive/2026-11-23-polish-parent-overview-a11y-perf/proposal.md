# Proposal: Polish Parent Overview with Adult Gate, Accessibility, Performance & Deployment Docs

## Why

To complete Milestone 3 and ship an MVP-ready Khmer learning experience for low-end Android phones, we need to:
1. Protect parent controls from accidental child taps via a simple adult **Parent Gate** when switching from child mode (`/learn`) to `/parent`.
2. Enrich the calm **Parent Overview** (`/parent`) with named mastered skills, named skills needing practice, due review count, and earned achievement badges (in addition to learning minutes shown exclusively to parents).
3. Complete an **Accessibility & Performance Pass** across all core routes (skip-to-main-content link, `#main-content` landmarks, global `focus-visible` outlines, ≥48px touch targets, zero horizontal overflow at `360×800`, zero console errors, and `prefers-reduced-motion` support) and document deployment in `README.md`.

## What Changes

- Add a reusable adult **Parent Gate** (`src/components/parent/ParentGateModal.tsx`):
  - Presents a calm adult multiplication check (`៧ × ៦ = ?`) accepting Khmer (`៤២`) or Arabic (`42`) digits via `parseNumericAnswer()`.
  - Triggered from a subtle parent entry button on `/learn` before navigating to `/parent` (and enforced on `/parent?gate=1`), preventing accidental child taps while keeping direct parent onboarding simple.
- Enrich `/parent` (`src/components/parent/ParentPortal.tsx`):
  - Display named mastered skills (`summary.masteredSkills`), named skills needing practice (`summary.practiceSkills`), due review count (`summary.dueReviewCount`), and earned achievements (`achievements`) cleanly inside each child's overview card.
- Accessibility & Performance pass:
  - Add a Khmer skip-to-main-content link (`#main-content`) in `src/app/layout.tsx` and ensure `<main id="main-content">` is present on all pages (`/`, `/learn`, `/lessons/[lessonId]`, `/placement`, `/parent`, `/offline`, `/review`, `/daily-challenge`, `/preview/[lessonId]`).
  - Add a consistent global `:focus-visible` outline rule in `src/app/globals.css`.
  - Add an automated mobile `360×800` accessibility & performance E2E audit (`e2e/a11y-perf.spec.ts`) checking landmarks, skip link, single `<h1>`, `lang="km"`, zero horizontal overflow, zero console/page errors, parent gate flow, and lightweight client JS transfer on `/lessons/g1-make-ten`.
- Document production deployment (Vercel + Singapore PostgreSQL + Prisma migrations + PWA offline checklist) in `README.md`.

## Capabilities

### Modified Capabilities
- `profiles-consent`: Add adult Parent Gate preventing accidental child entry from child learning screens into parent settings.
- `progress-mastery`: Enrich Parent Overview with named mastered/practice skills, due review count, and earned achievements while preserving strict separation of time-spent metrics from child views.
- `project-foundation`: Add global skip-to-main-content link, consistent keyboard focus indicators, verified mobile accessibility/performance pass across core routes, and deployment documentation.

## Impact

- New files: `src/components/parent/ParentGateModal.tsx`, `src/components/parent/ParentGateModal.test.tsx`, `e2e/a11y-perf.spec.ts`.
- Modified files: `src/app/layout.tsx`, `src/app/globals.css`, `src/app/page.tsx`, `src/app/offline/page.tsx`, `src/app/preview/[lessonId]/page.tsx`, `src/components/path/LearningPathView.tsx`, `src/components/path/PlacementCheck.tsx`, `src/components/player/LessonPlayer.tsx`, `src/components/parent/ParentPortal.tsx`, `src/lib/i18n/messages.ts`, `README.md`.
