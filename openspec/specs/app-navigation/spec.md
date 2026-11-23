# app-navigation Specification

## Purpose

Provides a unified, mobile-first Khmer navigation shell with a sticky top header, a 4-tab mobile bottom bar, focus-mode chrome hiding during active lessons and placement, Parent Gate protection when a child profile is active, and a clear home landing menu.

## Requirements

### Requirement: Unified sticky header and mobile bottom tab navigation
On primary browsing routes (`/`, `/learn`, `/review`, `/daily-challenge`, `/parent`), the application SHALL render a sticky top header and a mobile bottom tab bar (`360×800` viewport) providing thumb-friendly (`>=48×48px`) navigation to Learn (`/learn`), Review (`/review`), Daily Challenge (`/daily-challenge`), and Parents (`/parent`) with active route indication (`aria-current="page"`) and non-clipped Khmer labels.

#### Scenario: Child navigates between Learn, Review, and Daily Challenge from the mobile bottom bar
- **WHEN** a learner on `/learn` at `360×800` taps the Review tab and then the Daily Challenge tab in the bottom navigation bar
- **THEN** the application navigates to `/review` and `/daily-challenge` respectively, marks the active tab with `aria-current="page"`, and maintains zero horizontal overflow and unclipped Khmer tab labels

#### Scenario: Active child badge and numeral toggle appear in the top header
- **WHEN** a child profile is active and the user visits `/learn`
- **THEN** the sticky top header displays the active child's avatar and nickname alongside a single `១២៣ / 123` numeral toggle

### Requirement: Focus mode hides global navigation during active learning sessions
The global top header and mobile bottom tab bar SHALL be hidden on distraction-sensitive learning and utility routes (`/lessons/*`, `/placement`, `/preview/*`, `/offline`) so children retain full vertical viewport space and exit through each session's own calm exit control.

#### Scenario: Active lesson route hides global header and bottom tab bar
- **WHEN** a learner opens `/lessons/g1-make-ten` or `/placement`
- **THEN** neither the global sticky header nor the mobile bottom tab bar is rendered, and the session's own exit link remains visible

### Requirement: Navigation Parent Gate when a child profile is active
Activating the Parents destination in the global navigation menu SHALL open the adult Parent Gate dialog whenever a child profile is currently active (not yet on `/parent`), and SHALL navigate directly to `/parent` when no child profile is active.

#### Scenario: Tapping Parents while a child is active triggers the Parent Gate
- **WHEN** a child profile is active on `/learn` and the user activates the Parents menu item
- **THEN** the adult Parent Gate dialog opens instead of navigating immediately, and submitting the correct adult answer in Khmer or Arabic digits unlocks navigation to `/parent`

#### Scenario: Tapping Parents with no active child navigates directly
- **WHEN** no child profile is active on `/` and the user activates the Parents menu item
- **THEN** the application navigates directly to `/parent`

### Requirement: Clean Khmer home landing menu with subordinate showcase footer
The home route (`/`) SHALL prioritize clear primary Khmer menu actions (Learning Path, Quick Placement Check, Parent Portal, and resume/start lesson) above the fold while placing the teacher lesson preview link and Khmer typography/numeral showcase in a visually subordinate footer section that preserves all Khmer typography and numeral-toggle controls.

#### Scenario: Home route presents clean primary menu above the fold without duplicate numeral toggles
- **WHEN** a user opens `/` at `360×800`
- **THEN** the hero and primary menu cards appear first, the teacher preview and Khmer typography/numeral showcase render cleanly in a secondary footer section, and exactly one `១២៣ / 123` numeral toggle is present on the page
