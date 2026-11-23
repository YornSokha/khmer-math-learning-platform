# Proposal

## Why

The project currently has a runnable Next.js shell with `<html lang="km">`, but it uses system fallback fonts, uncalibrated Tailwind defaults, and no numeral formatting or digit-normalization utilities. Because Khmer script stacks subscript consonants (coeng) below and vowels above—and Grade 1 learners in Cambodia start with Khmer numerals (`០–៩`) while answers must accept both Khmer and Arabic digits—establishing the Khmer typography, design tokens, numeral preference, and digit-normalization layer now prevents clipped glyphs and inconsistent number handling across every upcoming lesson and activity component.

## What Changes

- Load and self-host `Kantumruy Pro` (primary) and `Noto Sans Khmer` (fallback) via `next/font/google`, subset to `khmer` and `latin`, and expose them through CSS variables in `src/app/layout.tsx` without referencing desktop Khmer OS fonts.
- Define Khmer-safe Tailwind CSS v4 design tokens (`@theme inline` and base styles in `src/app/globals.css`), including:
  - Body text size (`>= 18px`) and instruction text size (`>= 24px`) with Khmer-safe line-height (`1.7–1.8`).
  - Heading and numeric display scale tokens that preserve vertical clearance for stacked coeng and vowels.
  - Non-clipping control rules (minimum `48×48 px` touch targets using `min-height` and vertical padding instead of fixed heights or `overflow: hidden` on Khmer labels/buttons).
  - Calm surface/ink/accent color tokens and `prefers-reduced-motion` support.
- Add a lightweight typed UI string dictionary (`src/lib/i18n/`) with Khmer (`km`) as the launch UI locale and English (`en`) as a developer/QA fallback, keeping lesson content strictly separate from UI strings.
- Add pure Khmer numeral and digit-normalization utilities (`src/lib/khmer/numerals.ts`):
  - `formatNumber()` rendering numeric values using `Intl.NumberFormat('km-KH', { numberingSystem: 'khmr' })` by default for Grade 1, or Arabic digits (`latn`) when configured.
  - `toKhmerDigits()`, `normalizeDigits()` (mapping `០–៩` to `0–9` and stripping zero-width spaces `U+200B`), and `parseNumericAnswer()` accepting both Khmer and Arabic digits while rejecting malformed input.
- Add a client-side numeral system preference provider (`NumeralPreferenceProvider` / `useNumeralPreference`, defaulting to `"khmer"` with `localStorage` persistence until Milestone 2 child profiles connect to the database), a `<FormattedNumber />` display component, and a touch-friendly `១២៣ / 123` `<NumeralToggle />` control.
- Upgrade the home route (`/`) to apply the Khmer typography scale, display real stacked-glyph Khmer specimen text and formatted numbers, and include the interactive `១២៣ / 123` numeral toggle while keeping the existing `project-foundation` heading and tagline intact.
- Add comprehensive Vitest unit tests (for `០–៩ ↔ 0–9`, ZWSP stripping, `formatNumber`, and answer parsing), Testing Library component tests (for the numeral toggle and formatted numbers), and a Playwright `360×800` Android mobile E2E test verifying font metrics, non-clipped coeng/vowels, numeral toggling, and capturing a visual verification screenshot.
- **Out of scope**: Lesson YAML schema, Zod validation, and build-time ZWSP word-boundary insertion (`add-lesson-content-schema`); on-screen numeric keypad and SVG math activities (`add-activity-engine-core`); lesson player and audio playback (`add-lesson-player-and-hints`); offline precaching (`add-local-progress-offline`); persisted parent/child DB profiles (Milestone 2).

## Capabilities

### New Capabilities

- `khmer-localization`: Self-hosted Khmer typography (`Kantumruy Pro` / `Noto Sans Khmer`), Khmer-safe design tokens (type scale, line-height, non-clipping controls, touch targets, reduced motion), Khmer-first UI dictionary with English dev fallback, locale-aware number formatting (`khmr` / `latn`), per-session `១២៣ / 123` numeral toggle, and bidirectional Khmer/Arabic digit normalization with ZWSP stripping.

### Modified Capabilities

*(None — existing `project-foundation` requirements remain unchanged.)*

## Impact

- **Application shell & styling**: Updates `src/app/layout.tsx`, `src/app/globals.css`, and `src/app/page.tsx`.
- **New modules**: Adds `src/lib/khmer/numerals.ts`, `src/lib/i18n/messages.ts`, `src/components/khmer/NumeralPreferenceProvider.tsx`, `src/components/khmer/NumeralToggle.tsx`, and `src/components/khmer/FormattedNumber.tsx` (with colocated unit/component tests).
- **Tests**: Updates `src/app/page.test.tsx` and adds Playwright Khmer typography/numeral E2E verification under `e2e/` (including a `360×800` screenshot capture in test output).
- **Build note**: Using `next/font/google` downloads and self-hosts `Kantumruy Pro` and `Noto Sans Khmer` static font assets at build time (`npm run build`), so the build step fetches Google Fonts once during compilation while serving 100% self-hosted fonts at runtime with zero browser requests to Google.
