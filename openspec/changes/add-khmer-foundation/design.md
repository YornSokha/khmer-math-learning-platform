# Design

## Context

See `proposal.md` for motivation and `specs/khmer-localization/spec.md` for behavioral requirements. The repository currently contains the runnable Next.js 16 (App Router) + React 19 + TypeScript 6 (`strict: true`, `noUncheckedIndexedAccess: true`) + Tailwind CSS v4 shell established in `setup-project`, with `<html lang="km">` in `src/app/layout.tsx`, Vitest + Testing Library (`npm test`), and Playwright Chromium at `360×800` (`npm run test:e2e`).

## Goals / Non-Goals

**Goals:**
- Configure self-hosted `Kantumruy Pro` (primary) and `Noto Sans Khmer` (fallback) via `next/font/google` and connect them cleanly to Tailwind CSS v4 `@theme inline`.
- Provide a reusable, Khmer-safe design token layer (typography scale, `1.7–1.8` line-height, `>= 48px` touch targets, non-clipping control styles, calm palette, reduced-motion defaults) in `src/app/globals.css`.
- Provide pure, zero-dependency Khmer numeral formatting and digit/ZWSP normalization utilities (`src/lib/khmer/numerals.ts`) and a minimal typed UI dictionary (`src/lib/i18n/messages.ts`).
- Provide a client-side `NumeralPreferenceProvider`, `useNumeralPreference()`, `<FormattedNumber />`, and accessible `<NumeralToggle />` (`១២៣ / 123`) wired into the root layout and demonstrated on `/`.
- Verify Khmer typography, non-clipping coeng/vowels, and numeral toggling automatically in Vitest and Playwright (`360×800` viewport with screenshot artifact).

**Non-Goals:**
- Build-time ZWSP word-boundary insertion for lesson YAML files (deferred to `add-lesson-content-schema`).
- On-screen numeric keypad component and SVG math manipulatives (deferred to `add-activity-engine-core`).
- Display font (`Moul`) loading—deferred until a real decorative heading requires it, keeping initial font bytes minimal on low-end Android devices.
- Database-backed child profile numeral settings (deferred to Milestone 2; the context provider API is designed to accept a server/profile initial value cleanly when Milestone 2 lands).

## Decisions

### 1. Self-Hosted Fonts via `next/font/google` in `src/app/fonts.ts`
- **Decision**: Define `kantumruyPro` (`Kantumruy_Pro`) and `notoSansKhmer` (`Noto_Sans_Khmer`) as variable fonts in a dedicated `src/app/fonts.ts` using `subsets: ["khmer", "latin"]`, `display: "swap"`, and CSS variables `--font-kantumruy-pro` and `--font-noto-sans-khmer`. Attach both `.variable` class names to `<html>` in `src/app/layout.tsx`, and map `--font-sans` in `src/app/globals.css` inside `@theme inline`:
  ```css
  @theme inline {
    --font-sans: var(--font-kantumruy-pro), var(--font-noto-sans-khmer), sans-serif;
  }
  ```
- **Rationale**: Both `Kantumruy_Pro` and `Noto_Sans_Khmer` are variable fonts supported directly by Next.js 16's `next/font/google` with `khmer` + `latin` subsetting. Next.js downloads and self-hosts the `.woff2` assets in `.next/static/media/` at build time, so browsers make zero runtime requests to Google Fonts and never need desktop Khmer OS fonts. Isolating font loaders in `src/app/fonts.ts` (imported only by `src/app/layout.tsx`) also keeps page, lib, and component modules testable in Vitest without mocking `next/font`.
- **Alternatives considered**:
  - `next/font/local` with committed `.woff2` files: avoids network fetch during `next build`, but commits binary font files to git and requires manual subsetting. Can be adopted later without changing CSS variables or components if air-gapped builds are ever required.
  - Loading Google Fonts via `<link>` tags: rejected because it breaks offline PWA precaching, sends user requests to Google, and violates self-hosting rules.

### 2. Khmer-Safe Design Tokens in Tailwind CSS v4 (`src/app/globals.css`)
- **Decision**: Define semantic design tokens in `src/app/globals.css` using Tailwind CSS v4 `@theme inline` and base styles:
  - **Type scale & vertical metrics**:
    - `--text-khmer-body: 1.125rem` (`18px`), `--text-khmer-body--line-height: 1.75`
    - `--text-khmer-instruction: 1.5rem` (`24px`), `--text-khmer-instruction--line-height: 1.75`
    - `--text-khmer-heading: 1.875rem` (`30px`), `--text-khmer-heading--line-height: 1.7`
    - `--text-khmer-display: 2.25rem` (`36px`), `--text-khmer-display--line-height: 1.7`
    - Set `body` default `font-family: var(--font-sans)`, `font-size: var(--text-khmer-body)`, and `line-height: 1.75`.
  - **Calm, accessible color palette**:
    - Warm paper background (`--color-surface: #fdfcf8`), clean card surface (`--color-surface-card: #ffffff`), subtle border (`--color-border: #e2e8f0`), deep legible slate text (`--color-ink: #1e293b`), secondary slate (`--color-ink-muted: #475569`), calm teal primary accent (`--color-accent: #0f766e`), accent hover (`--color-accent-strong: #115e59`), soft accent tint (`--color-accent-soft: #f0fdfa`). All foreground/background pairings maintain WCAG AA contrast (`>= 4.5:1`).
  - **Touch targets & non-clipping controls**:
    - Minimum touch target token `--spacing-touch: 3rem` (`48px`).
    - Buttons and interactive Khmer labels use `min-h-12 min-w-12` plus vertical padding (`py-2.5 px-4`) and `leading-[1.75]`, never fixed `h-*` combined with `overflow-hidden`.
  - **Reduced motion**:
    - Add a `@media (prefers-reduced-motion: reduce)` rule in `globals.css` clamping non-essential CSS transitions and animations to minimal duration (`0.01ms`) and disabling smooth scroll.
- **Rationale**: Tailwind v4 `@theme inline` emits zero-runtime CSS variables and native utility classes (`text-khmer-body`, `text-khmer-instruction`, `text-khmer-heading`, `bg-surface`, `text-ink`, `bg-accent`, etc.) that every upcoming activity and lesson screen can consume consistently.
- **Alternatives considered**: Separate JS token files or CSS Modules (more boilerplate and harder to keep in sync with Tailwind utilities).

### 3. Minimal Typed UI Dictionary (`src/lib/i18n/messages.ts`)
- **Decision**: Create a small, strongly typed dictionary in `src/lib/i18n/messages.ts` supporting `Locale = "km" | "en"` with `"km"` as the default and `"en"` as the developer/QA fallback. Expose `getMessages(locale?: Locale)` and `t(key, locale?)`. Keep the dictionary strictly scoped to UI chrome (app title, tagline, numeral toggle labels/ARIA labels, and specimen headings)—never lesson content.
- **Rationale**: Zero external dependencies, zero extra client JS, full TypeScript exhaustiveness checking across `km` and `en`, and aligned with `docs/discovery.md` ("Use `next-intl` or a simple typed dictionary").
- **Alternatives considered**: `next-intl` (unnecessary routing/middleware and bundle overhead for a Khmer-only launch UI).

### 4. Pure Khmer Numeral Formatting & Normalization (`src/lib/khmer/numerals.ts`)
- **Decision**: Implement pure, side-effect-free functions in `src/lib/khmer/numerals.ts`:
  - `export type NumeralSystem = "khmer" | "arabic";`
  - `export const DEFAULT_NUMERAL_SYSTEM: NumeralSystem = "khmer";`
  - `formatNumber(value: number, options?: FormatNumberOptions): string`:
    - Uses `Intl.NumberFormat("km-KH", { numberingSystem: "khmr", ... })` for `"khmer"` (default) and `Intl.NumberFormat("km-KH", { numberingSystem: "latn", ... })` for `"arabic"`.
    - Caches default formatter instances for fast rendering; builds parameterized formatters when custom `Intl.NumberFormatOptions` (such as `useGrouping: false` or `maximumFractionDigits`) are provided.
    - Rejects non-finite values (`NaN`, `Infinity`, `-Infinity`) by throwing a `RangeError` so math bugs fail loudly rather than rendering `"NaN"` to children.
  - `stripZeroWidthSpaces(input: string): string`: Removes all `U+200B` characters.
  - `normalizeDigits(input: string): string`: Strips `U+200B` and converts Khmer digits `០–៩` (`U+17E0`–`U+17E9`) to ASCII `0–9`.
  - `toKhmerDigits(input: string | number): string`: Converts ASCII `0–9` to Khmer `០–៩` (`U+17E0`–`U+17E9`).
  - `parseNumericAnswer(input: string): number | null`:
    - Strips `U+200B` and trims surrounding whitespace.
    - Normalizes Khmer digits `០–៩` to `0–9`.
    - Accepts standard numeric strings with an optional leading `-` and optional single decimal separator (`.` or `,`, matching both Arabic decimal `12.5` and Khmer textbook decimal `១២,៥`), normalized to `.` before `Number(...)` parsing.
    - Rejects empty strings, whitespace-only strings, trailing/embedded letters, multiple separators, or non-finite values by returning `null`.
- **Rationale**: Verified on Node in this workspace: `Intl.NumberFormat('km-KH', { numberingSystem: 'khmr' })` produces `"០"`, `"៧"`, `"១០"`, `"១០០"`, `"១.០០០"`, `"១២,៥"`, `"-៥"`, matching Cambodian textbook conventions, while `latn` produces `"0"`, `"7"`, `"10"`, `"100"`, `"1,000"`, `"12.5"`, `"-5"`. Pure functions are trivial to unit-test and directly reusable in the upcoming content validator and activity evaluators.
- **Alternatives considered**: Custom regex/string formatting for Khmer digits (misses locale grouping/decimal rules and deviates from `openspec/config.yaml`).

### 5. Per-Session Numeral Preference Context & Toggle (`src/components/khmer/`)
- **Decision**:
  - `NumeralPreferenceProvider` (`"use client"`): Wraps `{children}` in `src/app/layout.tsx`, accepts an optional `initialNumeralSystem?: NumeralSystem` (defaults to `"khmer"`), and syncs changes to/from `window.localStorage` under key `"khmer-math:numeral-system"` inside a `useEffect` wrapped in `try/catch` (for restricted storage environments).
  - `useNumeralPreference()`: Returns `{ numeralSystem, setNumeralSystem, toggleNumeralSystem }`.
  - `<FormattedNumber value={number} numeralSystem?={NumeralSystem} formatOptions?={...} />`: Formats `value` using the active preference (or explicit override) and renders in a `<span>`.
  - `<NumeralToggle />`: Accessible toggle group (`role="group"` with Khmer `aria-label`) rendering two `>= 48×48px` buttons (`១២៣` and `123`) using `aria-pressed`, clear active styling, visible keyboard focus rings, and no `overflow: hidden`.
- **Rationale**: Initializing state to `"khmer"` during SSR and syncing `localStorage` in `useEffect` guarantees zero React hydration warnings while preserving learner selection across reloads. Accepting `initialNumeralSystem` makes Milestone 2 child-profile integration a drop-in change.
- **Alternatives considered**: Reading `localStorage` synchronously during initial render (causes Next.js SSR hydration mismatches).

### 6. Home Route Preview & Playwright `360×800` Visual Verification
- **Decision**: Update `src/app/page.tsx` to preserve the existing `<h1>` (`គណិតវិទ្យាខ្មែរ`) and tagline (`រៀនគណិតវិទ្យាតាមការអនុវត្តផ្ទាល់។`) verified by `project-foundation`, while applying the new Khmer design tokens and adding a calm, mobile-first preview section containing:
  - The `<NumeralToggle />` (`១២៣ / 123`).
  - A Grade 1 sample instruction (`text-khmer-instruction`, `>= 24px`) and body copy (`text-khmer-body`, `>= 18px`) featuring stacked coeng/vowels (e.g., `បង្កើតដប់`, `គ្រូបង្រៀន`, `ស្ត្រី`, `ប្រាំបួន`, `ប្រៀបធៀប`).
  - Formatted Grade 1 sample numbers (`0`, `5`, `7`, `10`, `100`) rendered via `<FormattedNumber />` and Khmer-labeled sample action buttons (`min-h-12`).
- Add `e2e/khmer-foundation.spec.ts` targeting the `mobile-android` (`360×800`) Playwright project to assert:
  - Self-hosted font loading (`document.fonts.ready`) and zero network requests to `fonts.googleapis.com` or `fonts.gstatic.com`.
  - Computed `fontSize >= 18` (body), `>= 24` (instruction), computed `lineHeight / fontSize >= 1.7`, button bounding boxes `>= 48×48px`, `overflow !== "hidden"` and `scrollHeight <= clientHeight + 1` on Khmer text controls, and zero horizontal overflow (`scrollWidth <= innerWidth`).
  - Interactive `១២៣` ↔ `123` switching and persistence across `page.reload()`.
  - Full-page screenshot written to `test-results/khmer-foundation-360x800.png` (and attached to the Playwright test report) for visual confirmation of stacked coeng/vowels.
- **Rationale**: Keeps `/` clean and purposeful during Milestone 1 while giving CI deterministic assertions and giving human reviewers a repeatable `360×800` screenshot without flaky cross-OS pixel-diff baselines.

## Risks / Trade-offs

- **[`next/font/google` fetches font files during `npm run build`]** → Requires network access during build/CI (GitHub Actions and Vercel have outbound network access; local sandboxed runs can use network when building). Runtime remains 100% self-hosted with zero browser requests to Google, ready for Serwist offline precaching in `add-local-progress-offline`.
- **[Brief numeral flash on reload when Arabic (`123`) is stored in `localStorage`]** → Because SSR defaults to `"khmer"` (the Grade 1 default) and `localStorage` hydrates in `useEffect`, returning users with `"arabic"` selected see a sub-frame update after mount. Acceptable for Milestone 1; Milestone 2 server-backed child profiles will pass `initialNumeralSystem` directly from SSR.
- **[Natural Khmer copy review]** → Specimen Khmer text on `/` uses concise everyday MoEYS-aligned vocabulary (e.g., counting and making 10) and remains flagged for native Khmer primary teacher review at the Milestone 1 human checkpoint (step 7 of `docs/discovery.md`).
- **[Decimal comma vs thousands separator in `parseNumericAnswer`]** → Supporting `,` as a decimal separator (`១២,៥` → `12.5`) means grouped strings like `"1,000"` would parse as `1` if passed directly as raw answer input. Grade 1–2 answers are entered via ungrouped numeric keypad/tiles (never thousands-grouped), and future higher-grade evaluators can specify explicit integer/grouped parsing if needed; document this contract clearly in unit tests.
