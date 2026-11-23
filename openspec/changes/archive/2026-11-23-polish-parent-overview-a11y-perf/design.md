# Design: Parent Gate, Richer Parent Overview, Accessibility & Performance Pass

## 1. Adult Parent Gate (`src/components/parent/ParentGateModal.tsx`)

- Pure challenge helper (`PARENT_GATE_CHALLENGE = { a: 7, b: 6, answer: 42 }`) with `isValidParentGateAnswer(raw: string): boolean` using `parseNumericAnswer` so both `"42"` and `"៤២"` succeed.
- Accessible dialog (`role="dialog"`, `aria-modal="true"`, `aria-labelledby`), supports `Escape` key to close, shows a large readable math prompt (`៧ × ៦ = ?`), input with `inputMode="numeric"`, submit button, cancel button, and gentle retry text on wrong answers.
- Rendered from a subtle footer button on `/learn` (`LearningPathView.tsx`) that routes to `/parent` on unlock.

## 2. Richer Parent Overview (`src/components/parent/ParentPortal.tsx`)

- Updates `ChildProgressResponse` typing to include `achievements: { achievementId: string; awardedAt: string }[]` and `rewards?: { totalXp: number; daysLearnedThisWeek: number }`.
- Renders inside each child's `child-progress-${child.id}` panel:
  - Existing 2×2 summary metrics (mastered count, practice count, minutes today, minutes 7 days) + due review pill when `summary.dueReviewCount > 0`.
  - Compact lists of mastered skill lesson titles (`summary.masteredSkills`) and skills needing practice (`summary.practiceSkills`).
  - Earned achievement chips mapped via `getAchievementDefinition(award.achievementId)`.

## 3. Accessibility & Performance Pass

- `src/app/layout.tsx`: adds `<a href="#main-content" data-testid="skip-to-content" className="sr-only focus:not-sr-only ...">{t("a11ySkipToContent")}</a>` before `<OfflineStatusBanner />`.
- `src/app/globals.css`: adds consistent `:focus-visible` outline styling on interactive elements (`a, button, input, select, textarea, [tabindex]`).
- Adds `id="main-content"` to `<main>` in `page.tsx`, `offline/page.tsx`, `preview/[lessonId]/page.tsx`, `LearningPathView.tsx`, `PlacementCheck.tsx`, `LessonPlayer.tsx`, `ParentPortal.tsx` (`SpacedReviewPlayer` and `DailyChallengePlayer` already have `id="main-content"`).
- `e2e/a11y-perf.spec.ts`: audits all 7 core routes at `360×800` for `lang="km"`, skip link, `<main id="main-content">`, `<h1>`, zero horizontal overflow, zero console/page errors, `>=48px` primary CTA touch targets, Parent Gate unlock from `/learn` to `/parent`, and verifies total JS transfer size on `/lessons/g1-make-ten` stays lightweight.
- `README.md`: adds concise Deployment (Vercel + Singapore PostgreSQL + Prisma migrations + PWA offline check) section.
