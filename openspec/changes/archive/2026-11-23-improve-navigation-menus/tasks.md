# Tasks

## 1. Shared Khmer Navigation Shell

- [x] 1.1 Add concise Khmer/English navigation tab labels (`navTabLearn`, `navTabReview`, `navTabDaily`, `navTabParents`, `navPrimaryLabel`, `homeShowcaseHeading`) to `src/lib/i18n/messages.ts`
- [x] 1.2 Create `src/components/navigation/AppNavigationShell.tsx` implementing the sticky top header (brand link, desktop inline links, active-child avatar chip, non-duplicate `NumeralToggle`), 4-tab mobile bottom bar (`រៀន`, `រំលឹក`, `ប្រចាំថ្ងៃ`, `មាតាបិតា` with `>=48×48px` targets and `aria-current="page"`), focus-mode hiding on `/lessons/*`, `/placement`, `/preview/*`, and `/offline`, and Parent Gate guarding when `activeChild` is active, with unit/component tests in `src/components/navigation/AppNavigationShell.test.tsx`
- [x] 1.3 Wrap `{children}` in `src/app/layout.tsx` with `AppNavigationShell` (providing safe bottom padding on non-focus routes so fixed mobile tabs never overlap page actions)

## 2. Page Header Cleanup & Home Menu Redesign

- [x] 2.1 Remove duplicated top-bar back links and redundant `NumeralToggle` rows from `src/components/path/LearningPathView.tsx`, `src/components/review/SpacedReviewPlayer.tsx`, `src/components/review/DailyChallengePlayer.tsx`, and `src/components/parent/ParentPortal.tsx` while preserving existing page-level actions and test hooks
- [x] 2.2 Streamline `src/app/page.tsx` into a clean Khmer landing menu (hero + clear primary Learning Path, Placement, Parent Portal, and quick-lesson cards above the fold) with the teacher preview link and Khmer typography/numeral showcase organized cleanly in a visually subordinate footer section

## 3. Verification

- [x] 3.1 Add mobile `360×800` Playwright E2E test (`e2e/navigation.spec.ts`) verifying bottom-bar navigation (`aria-current="page"`, unclipped Khmer labels, `>=48px` touch targets, zero horizontal overflow), focus-mode chrome hiding on `/lessons/g1-make-ten` and `/placement`, active-child header badge + Parent Gate protection on Parents tab, and clean `/` landing menu without duplicate numeral toggles, then run `npm run lint`, `npm test`, `npm run build`, and `npm run test:e2e`
