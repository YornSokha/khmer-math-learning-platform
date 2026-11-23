# Proposal: Improve Navigation Menus with Shared Mobile-First App Shell

## Why

Today each route (`/`, `/learn`, `/review`, `/daily-challenge`, `/parent`) renders its own ad-hoc back links and controls, and `/` displays a flat list of five stacked buttons mixed with developer preview links and typography specimens. Adding a cohesive, mobile-first Khmer navigation shell (sticky top header + mobile bottom tab bar, automatically hidden during focused lesson and placement sessions) and streamlining the `/` landing menu makes moving between Learn, Review, Daily Challenge, and Parent Overview effortless on a `360×800` phone while keeping children focused and protected from accidental entry into parent settings.

## What Changes

- Introduce a shared client navigation shell (`src/components/navigation/AppNavigationShell.tsx`) wired into `src/app/layout.tsx`:
  - **Sticky top header** (shown on non-focused routes: `/`, `/learn`, `/review`, `/daily-challenge`, `/parent`): brand home link, active-child avatar/nickname chip (when a child profile is selected), desktop inline nav links (`sm:` and up), and compact `១២៣ / 123` numeral toggle (omitted on `/` where the page's own numeral toggle lives so there is never a duplicate toggle).
  - **Mobile bottom tab bar** (`sm:hidden`, fixed bottom with `>=48×48px` touch targets, `overflow-visible`, and `line-height: 1.75` for Khmer labels) featuring 4 calm destinations:
    1. **រៀន** (Learn — `/learn`)
    2. **រំលឹក** (Review — `/review`, with a subtle due-review dot/count badge when skills are due)
    3. **ប្រចាំថ្ងៃ** (Daily — `/daily-challenge`)
    4. **មាតាបិតា** (Parents — navigates directly to `/parent` when no child is active, or opens the adult `ParentGateModal` first whenever a child profile is active)
  - **Focus mode (distraction-free learning):** Automatically hides both the sticky top header and the mobile bottom tab bar on `/lessons/*`, `/placement`, `/preview/*`, and `/offline` so children keep full screen space and focus during interactive math steps.
- Remove duplicated per-page top back links and redundant `NumeralToggle` rows from `/learn`, `/review`, `/daily-challenge`, and `/parent` (relying on the unified navigation shell instead) while keeping bottom padding (`pb-24 sm:pb-8`) so mobile content is never obscured by the fixed bottom bar.
- Reorganize the home page (`/`, `src/app/page.tsx`) into a clean Khmer landing menu:
  - Prominent hero + clear primary action cards (**Start Learning Path `/learn`**, **Quick Placement Check `/placement`**, **Parent Account & Child Profiles `/parent`**) and quick-resume link to Lesson 5.
  - Visually subordinate, collapsible-friendly secondary footer card at the bottom holding the teacher lesson preview link (`/preview/g1-make-ten`) and the Khmer typography/numeral showcase so developer/QA checks stay intact without cluttering the main menu.

## Capabilities

### New Capabilities
- `app-navigation`: Shared mobile-first Khmer navigation shell (sticky top header, 4-tab mobile bottom bar with due-review indicator, active-child chip, Parent Gate protection when a child is active, focus-mode hiding during active lessons/placement, and clean `/` landing menu hierarchy).

### Modified Capabilities
- None.

## Impact

- New files: `src/components/navigation/AppNavigationShell.tsx`, `src/components/navigation/AppNavigationShell.test.tsx`, `e2e/navigation.spec.ts`.
- Modified files: `src/app/layout.tsx`, `src/app/page.tsx`, `src/components/path/LearningPathView.tsx`, `src/components/review/SpacedReviewPlayer.tsx`, `src/components/review/DailyChallengePlayer.tsx`, `src/components/parent/ParentPortal.tsx`, `src/lib/i18n/messages.ts`.
