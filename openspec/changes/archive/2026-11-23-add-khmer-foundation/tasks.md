# Tasks

## 1. Self-Hosted Khmer Fonts & Design Tokens

- [x] 1.1 Create `src/app/fonts.ts` loading variable `Kantumruy_Pro` and `Noto_Sans_Khmer` via `next/font/google` (`subsets: ["khmer", "latin"]`, `display: "swap"`, CSS variables `--font-kantumruy-pro` and `--font-noto-sans-khmer`), attach both `.variable` classes to `<html lang="km">` in `src/app/layout.tsx`, and verify no desktop Khmer OS font names exist anywhere in `src/`
- [x] 1.2 Define Khmer-safe Tailwind CSS v4 `@theme inline` tokens and base rules in `src/app/globals.css` (self-hosted `--font-sans` stack, `--text-khmer-body` ≥18px with `1.75` line-height, `--text-khmer-instruction` ≥24px with `1.75` line-height, heading/display tokens, `--spacing-touch: 3rem`, calm accessible palette, non-clipping control styles, and `@media (prefers-reduced-motion: reduce)`) and verify `npm run build` compiles cleanly

## 2. Typed UI String Dictionary

- [x] 2.1 Create `src/lib/i18n/messages.ts` exporting `Locale` (`"km" | "en"`), typed UI chrome strings (Khmer default, English developer/QA fallback, excluding lesson content), `getMessages()`, and `t()`; add `src/lib/i18n/messages.test.ts` verifying default Khmer resolution and full English fallback parity and confirm `npm test` passes

## 3. Khmer Numeral Formatting & Digit/ZWSP Normalization

- [x] 3.1 Create `src/lib/khmer/numerals.ts` exporting `NumeralSystem`, `DEFAULT_NUMERAL_SYSTEM`, `formatNumber()` (using `Intl.NumberFormat("km-KH", { numberingSystem: "khmr" | "latn" })` and rejecting non-finite numbers), `stripZeroWidthSpaces()`, `normalizeDigits()`, `toKhmerDigits()`, and `parseNumericAnswer()` (accepting Khmer `០–៩`, Arabic `0–9`, mixed digits, ZWSP, and Khmer/Arabic decimals while returning `null` for malformed input)
- [x] 3.2 Add `src/lib/khmer/numerals.test.ts` covering complete `០១២៣៤៥៦៧៨៩` ↔ `0123456789` mapping, default Grade 1 formatting (`0`, `7`, `10`), negative/grouped/decimal formatting under both systems, ZWSP stripping (`" ១\u200B០ "`), and malformed input rejection (`""`, `"៧ក"`, `"12.3.4"`), and confirm `npm test` passes

## 4. Numeral Preference Context, Toggle & Home Route Preview

- [x] 4.1 Create `src/components/khmer/NumeralPreferenceProvider.tsx` (`"use client"`, defaulting to `"khmer"` with guarded `localStorage` persistence), `src/components/khmer/FormattedNumber.tsx`, and `src/components/khmer/NumeralToggle.tsx` (accessible `១២៣ / 123` toggle group with `>= 48×48px` non-clipping buttons and `aria-pressed`), wrap `{children}` in `src/app/layout.tsx`, add Testing Library tests (`src/components/khmer/NumeralToggle.test.tsx`) covering toggling, persistence, and accessibility, and confirm `npm test` passes
- [x] 4.2 Update `src/app/page.tsx` to use the Khmer design tokens and UI dictionary while preserving the existing `<h1>` (`គណិតវិទ្យាខ្មែរ`) and tagline (`រៀនគណិតវិទ្យាតាមការអនុវត្តផ្ទាល់។`), rendering `<NumeralToggle />`, stacked-glyph Khmer instruction/body specimens, `<FormattedNumber />` Grade 1 samples, and non-clipping Khmer-labeled controls; update `src/app/page.test.tsx` and confirm `npm test` passes

## 5. Mobile `360×800` Visual Verification & Full Quality Gate

- [x] 5.1 Add `e2e/khmer-foundation.spec.ts` verifying on the `mobile-android` (`360×800`) viewport: self-hosted font loading with zero requests to external font hosts (`fonts.googleapis.com` / `fonts.gstatic.com`), computed `fontSize >= 18px` (body) and `>= 24px` (instruction), computed `lineHeight / fontSize >= 1.7`, touch targets `>= 48×48px` with no `overflow: hidden` or vertical clipping, zero horizontal overflow, `១២៣` ↔ `123` switching with persistence across reload, and capturing `test-results/khmer-foundation-360x800.png` (attached to the test report); run `npm run test:e2e` and inspect the screenshot to verify no clipped coeng or vowels
- [x] 5.2 Run the full verification suite (`npm run lint`, `npm test`, `npm run build`, `npm run test:e2e`) and confirm all commands exit with code `0` and `git status` contains only intended files
