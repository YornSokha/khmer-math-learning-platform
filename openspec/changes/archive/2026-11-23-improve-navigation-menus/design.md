# Design: Shared Mobile-First Khmer Navigation Menus

## Context

See `proposal.md` for motivation. Currently `src/app/layout.tsx` renders only the skip link, `<OfflineStatusBanner />`, and `{children}`, leaving every page to draw its own back button and `NumeralToggle`. Existing automated checks in `src/app/page.test.tsx`, `e2e/khmer-foundation.spec.ts`, and `e2e/parent-profiles.spec.ts` expect `/` to expose `khmer-instruction`, `khmer-body`, `sample-number-*`, `khmer-control-start`, `home-parent-portal-link`, `>=5` buttons inside `<main>`, and a single `ប្រើលេខអារ៉ាប់ (123)` toggle button (Playwright strict mode).

## Goals / Non-Goals

**Goals:**
- Provide a calm, consistent, thumb-friendly navigation shell across `/`, `/learn`, `/review`, `/daily-challenge`, and `/parent` with zero horizontal overflow at `360×800` and `>=48×48px` touch targets.
- Automatically suppress global navigation chrome during active learning/assessment (`/lessons/*`, `/placement`, `/preview/*`, `/offline`) to protect focus and vertical space on small phones.
- Protect parent settings from accidental child taps via `ParentGateModal` whenever `activeChild !== null` and the user is not already on `/parent`.
- Clean up `/` into a clear Khmer landing menu while keeping existing typography, numeral-toggle, and parent-portal tests green.

**Non-Goals:**
- Adding a multi-level hamburger drawer, search bar, or notifications bell (keeps navigation simple for 6–8-year-olds and honors anti-addiction rules).
- Changing lesson content, activity components, or backend API routes.

## Decisions

1. **Dedicated `AppNavigationShell` client wrapper in `src/app/layout.tsx` (instead of duplicating nav inside each page)**
   - Uses `usePathname()` and `useRouter()` to determine focus-mode routes (`isFocusRoute(pathname)`) and active tab state (`aria-current="page"`).
   - Alternative considered: Next.js route groups `(shell)/` vs `(focus)/`. Route groups would move existing route files and add structural churn; a thin `AppNavigationShell` in `layout.tsx` keeps URLs, SSG, and Serwist precaching untouched.

2. **Responsive layout: sticky top header + mobile-only bottom tab bar (`sm:hidden`)**
   - Top header (`sticky top-0 z-40`): Brand link (`/`), inline desktop nav (`hidden sm:flex`), active-child chip (`<ChildAvatar size={28} />` + nickname when `activeChild` is set), and `<NumeralToggle />` (hidden on `/` because `/` keeps its own toggle inside `<main>` for standalone `HomePage` unit tests and `khmer-foundation.spec.ts`, guaranteeing exactly 1 toggle on every route).
   - Mobile bottom tab bar (`fixed inset-x-0 bottom-0 z-40 sm:hidden`): 4 equal-width items (**រៀន**, **រំលឹក**, **ប្រចាំថ្ងៃ**, **មាតាបិតា**) with `min-h-touch`, `overflow-visible`, `leading-[1.75]`, and safe-area bottom padding. Non-focus shell wraps `{children}` with `pb-24 sm:pb-6` so the bottom bar never overlaps page buttons.
   - Due-review count badge: `AppNavigationShell` optionally reads local IndexedDB attempts (or listens to a lightweight custom window event / pathname change) to show a calm numeric dot on the **រំលឹក** tab when reviews are due — zero extra network calls.

3. **Context-aware Parent Gate in global navigation**
   - Clicking **មាតាបិតា** in the top header or bottom bar:
     - If `activeChild !== null && pathname !== "/parent"`: opens `ParentGateModal`; on unlock, routes to `/parent`.
     - Otherwise (no child handed off, or already on `/parent`): navigates directly to `/parent`.
   - `/learn`'s existing footer `learn-parent-gate-button` can remain or delegate to the same gate so existing E2E tests (`e2e/a11y-perf.spec.ts`) keep passing cleanly.

4. **Home page (`/`) cleanup with subordinate secondary showcase footer**
   - Primary section at the top of `/`: Hero + clear, icon-assisted primary menu cards for **Learning Path (`/learn`)**, **Placement Check (`/placement`)**, **Parent Account (`/parent`)**, and quick lesson entry (`/lessons/g1-make-ten` with completion badge).
   - Secondary footer section at the bottom of `/`: muted container (`bg-surface border-t`) grouping the teacher lesson preview link (`/preview/g1-make-ten`), numeral toggle, and Khmer specimen/sample controls so `/` reads cleanly as a product home page while keeping every `khmer-foundation.spec.ts` and `page.test.tsx` assertion passing.

## Risks / Trade-offs

- **Risk:** Fixed mobile bottom tab bar overlapping bottom buttons on `360×800` pages (`ParentPortal` submit button, `LearningPathView` footer). → **Mitigation:** Apply `pb-24 sm:pb-8` on the non-focus shell wrapper and verify clickable visibility in `e2e/navigation.spec.ts` at `360×800`.
- **Risk:** Duplicate `<NumeralToggle />` breaking Playwright strict role selectors on `/`. → **Mitigation:** Render `<NumeralToggle />` in the top header on non-`/` shell routes only, keeping exactly one toggle on every page.
- **Risk:** Khmer stacked vowels/coeng clipping inside compact mobile bottom tabs. → **Mitigation:** Use short 1–2 word Khmer labels (`រៀន`, `រំលឹក`, `ប្រចាំថ្ងៃ`, `មាតាបិតា`), `leading-[1.75]`, `overflow-visible`, and assert unclipped height & `>=48px` touch targets in Playwright.
