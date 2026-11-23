# project-foundation Delta Specification

## ADDED Requirements

### Requirement: Baseline mobile accessibility, keyboard focus, and deployment documentation
All primary application routes SHALL provide `<html lang="km">`, a skip-to-main-content link targeting `#main-content`, a `<main id="main-content">` landmark, visible `:focus-visible` indicators, zero horizontal overflow at `360×800`, and `README.md` SHALL document install, run, test, and deployment procedures.

#### Scenario: Core routes pass mobile 360x800 accessibility and zero-error audit
- **WHEN** automated Playwright tests visit `/`, `/learn`, `/lessons/g1-make-ten`, `/review`, `/daily-challenge`, `/placement`, and `/parent` at `360×800`
- **THEN** every route has `<html lang="km">`, a skip link targeting `#main-content`, a `<main id="main-content">` landmark, a visible `<h1>`, zero horizontal overflow, and zero uncaught page or console errors
