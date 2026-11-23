# Tasks

## 1. Adult Parent Gate & Enriched Parent Overview

- [x] 1.1 Create `src/components/parent/ParentGateModal.tsx` with unit/component tests in `src/components/parent/ParentGateModal.test.tsx`, add Khmer/English labels to `src/lib/i18n/messages.ts`, and wire the Parent Gate trigger into `src/components/path/LearningPathView.tsx`
- [x] 1.2 Enrich `src/components/parent/ParentPortal.tsx` to display named mastered skills, named skills needing practice, due review count, and earned achievement badges per child

## 2. Accessibility, Performance Pass & Deployment Docs

- [x] 2.1 Add skip-to-main-content link in `src/app/layout.tsx`, global `:focus-visible` styling in `src/app/globals.css`, and `#main-content` landmarks across all pages
- [x] 2.2 Add mobile `360×800` accessibility, Parent Gate, and performance E2E audit (`e2e/a11y-perf.spec.ts`) and document deployment in `README.md`, then run full validation (`npm run db:validate`, `npm run content:validate`, `npm run lint`, `npm test`, `npm run build`, and full `npm run test:e2e`)
