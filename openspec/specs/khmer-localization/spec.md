# khmer-localization Specification

## Purpose

Defines the Khmer-first typography, design tokens, UI localization fallback, locale-aware numeral formatting, numeral system toggle, and digit/ZWSP normalization foundation shared across the entire learning platform.

## Requirements

### Requirement: Self-hosted Khmer web typography
The application SHALL render Khmer and Latin interface text using self-hosted `Kantumruy Pro` as the primary typeface with `Noto Sans Khmer` as its fallback, without making browser requests to external font hosts or referencing desktop Khmer OS fonts.

#### Scenario: Self-hosted fonts load with zero external font requests
- **WHEN** a browser loads the application at `/`
- **THEN** the primary computed font family includes self-hosted `Kantumruy Pro` (with `Noto Sans Khmer` fallback) and zero network requests are made to external font CDNs such as Google Fonts

#### Scenario: Desktop Khmer OS fonts are excluded from font declarations
- **WHEN** the application stylesheets and font configuration are inspected
- **THEN** no font-family stack references desktop Khmer OS font names

### Requirement: Khmer-safe vertical metrics and type scale
The application SHALL render Khmer body text at a minimum computed font size of `18px`, instruction text at a minimum computed font size of `24px`, and Khmer reading text at a computed line-height ratio of at least `1.7` so stacked subscript consonants (coeng) and vowels remain clear and unclipped.

#### Scenario: Body and instruction text meet Khmer legibility minimums on mobile
- **WHEN** the application renders Khmer body and instruction text in a `360×800` viewport
- **THEN** body text computes to at least `18px`, instruction text computes to at least `24px`, and their computed line-height ratio is at least `1.7`

#### Scenario: Stacked Khmer glyphs render without clipping or horizontal overflow
- **WHEN** Khmer words containing stacked subscript consonants (coeng) and superscript/subscript vowels are displayed at `360×800`
- **THEN** the text containers do not clip vertical glyph bounds and the page exhibits zero horizontal overflow

### Requirement: Non-clipping touch-friendly Khmer controls
Interactive controls containing Khmer text SHALL maintain a minimum touch target of `48×48px` and SHALL size dynamically without clipping glyphs via fixed heights or `overflow: hidden`.

#### Scenario: Khmer-labeled buttons meet touch target size without clipping
- **WHEN** an interactive button or toggle with stacked Khmer characters is rendered in a `360×800` viewport
- **THEN** its rendered height and width are at least `48px`, its text is not clipped vertically, and its styling does not apply `overflow: hidden` to truncate Khmer text

### Requirement: Reduced-motion preference support
The application SHALL respect the user's `prefers-reduced-motion` preference by minimizing or disabling non-essential motion transitions when reduced motion is enabled.

#### Scenario: Motion transitions reduce under prefers-reduced-motion
- **WHEN** a browser renders the application with `prefers-reduced-motion: reduce` enabled
- **THEN** non-essential CSS animations and transitions are minimized or disabled

### Requirement: Khmer-first UI locale with developer fallback
The application SHALL render interface chrome in Khmer (`km`) by default on a document tagged with `<html lang="km">`, and SHALL provide an English (`en`) UI string fallback strictly for developer and QA use while keeping lesson content out of the UI string dictionary.

#### Scenario: Default UI strings resolve in Khmer
- **WHEN** UI strings are requested without specifying an override locale
- **THEN** the system returns natural Khmer (`km`) UI strings and the HTML root element has `lang="km"`

#### Scenario: English fallback resolves for developer and QA lookup
- **WHEN** UI strings are explicitly requested for the `en` fallback locale
- **THEN** the system returns matching English UI strings for every defined UI key

### Requirement: Locale-aware numeral formatting
The system SHALL represent quantities as numeric values and format them for display in Khmer numerals (`០–៩`) by default for Grade 1, or in Arabic numerals (`0–9`) when Arabic numeral display is selected.

#### Scenario: Grade 1 numbers format in Khmer numerals by default
- **WHEN** the numeric values `0`, `7`, and `10` are formatted using the default Grade 1 numeral setting
- **THEN** they format as `"០"`, `"៧"`, and `"១០"` respectively

#### Scenario: Numbers format in Arabic numerals when Arabic display is selected
- **WHEN** the numeric values `0`, `7`, and `10` are formatted with the Arabic numeral setting selected
- **THEN** they format as `"0"`, `"7"`, and `"10"` respectively

#### Scenario: Negative, grouped, and decimal numbers format under both numeral systems
- **WHEN** negative, multi-digit, or decimal numbers (such as `-5`, `1000`, and `12.5`) are formatted under Khmer or Arabic numeral settings
- **THEN** digits match the selected numeral system and locale formatting rules consistently without mutating the underlying numeric value

### Requirement: Interactive numeral system toggle
The interface SHALL provide an accessible `១២៣ / 123` toggle that switches displayed numbers between Khmer and Arabic numerals and preserves the chosen preference across reloads within the browser session.

#### Scenario: Learner switches displayed numbers between Khmer and Arabic
- **WHEN** a learner activates the `123` option on the numeral toggle
- **THEN** formatted numbers on the page immediately switch from Khmer numerals (e.g., `"៧"`) to Arabic numerals (e.g., `"7"`), and activating `១២៣` switches them back

#### Scenario: Numeral preference persists across page reload
- **WHEN** a learner selects Arabic numerals (`123`) and reloads the page
- **THEN** displayed numbers remain in Arabic numerals after reload

### Requirement: Bidirectional digit normalization and ZWSP stripping
The system SHALL normalize numeric input written in Khmer digits (`០–៩`), Arabic digits (`0–9`), or mixed digits to a canonical form, SHALL strip zero-width spaces (`U+200B`) and surrounding whitespace before evaluation, and SHALL reject malformed non-numeric input.

#### Scenario: Khmer and Arabic digits parse to the same numeric value
- **WHEN** a learner submits `"៧"` or `"7"` for a numeric answer
- **THEN** both inputs normalize to `"7"` and parse to the numeric value `7`

#### Scenario: All ten digits map accurately between Khmer and Arabic
- **WHEN** the full digit sequence `"០១២៣៤៥៦៧៨៩"` is normalized and `"0123456789"` is converted to Khmer digits
- **THEN** `"០១២៣៤៥៦៧៨៩"` normalizes to `"0123456789"` and `"0123456789"` converts to `"០១២៣៤៥៦៧៨៩"`

#### Scenario: Zero-width spaces and whitespace are stripped before answer parsing
- **WHEN** a numeric answer contains zero-width spaces or outer whitespace such as `" ១\u200B០ "`
- **THEN** zero-width spaces and surrounding whitespace are removed and the answer parses to `10`

#### Scenario: Malformed numeric input is rejected
- **WHEN** empty text (`""`), whitespace-only text, or mixed non-numeric text (such as `"៧ក"` or `"12.3.4"`) is parsed as a numeric answer
- **THEN** the parser rejects the input and returns `null`
