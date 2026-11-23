# rewards Specification

## Purpose

Defines calm, anti-addictive rewards: XP earned strictly from learning actions (never time spent), non-punitive "days learned this week" tracking with automatic rest days and zero loss-framed streak messaging, and mastery/effort achievements persisted locally and synced to the backend.

## Requirements

### Requirement: XP earned strictly from learning actions, never time spent
The rewards engine SHALL compute XP solely from learning actions (correct attempts, fixing mistakes, lesson completions, and daily challenge completions) and SHALL produce identical XP regardless of `durationMs` (time spent), while child views SHALL never display time spent as a gamified metric.

#### Scenario: Changing durationMs does not change earned XP
- **WHEN** two identical sets of learning attempts differ only in `durationMs` (e.g., 5 seconds vs 10 minutes per attempt)
- **THEN** `evaluateRewards()` returns the exact same `totalXp` for both sets

#### Scenario: Fixing a mistake earns effort XP
- **WHEN** a learner submits an incorrect attempt on a step and subsequently submits a correct attempt on the same step
- **THEN** `evaluateRewards()` counts the fixed mistake and awards mistake-fixing XP in addition to the correct-attempt XP

### Requirement: Calm weekly rhythm without loss-framed streaks
The application SHALL track "days learned this week" (`0` to `7` distinct calendar days in the rolling 7-day window) with automatic rest days and SHALL NEVER display loss-framed streak warnings, broken-streak alerts, or child notifications when a day is missed.

#### Scenario: Missing a day shows no warning or lost-streak message
- **WHEN** a learner completed activity two days ago and missed yesterday
- **THEN** `evaluateRewards()` reports `daysLearnedThisWeek === 1` without error or penalty, and `/learn` displays the calm weekly count with zero lost-streak warnings

### Requirement: Mastery and effort achievements persisted and synced idempotently
The application SHALL define mastery and effort achievements (including first lesson completed, fixing 3 mistakes, mastering numbers/bonds to 10, completing spaced review, and learning 3 days in a week), display them calmly on `/learn`, and persist unlocked achievements idempotently in `AchievementAward` during `POST /api/sync/attempts`.

#### Scenario: Fixing 3 mistakes unlocks the mistake-fixer achievement locally and on sync
- **WHEN** a child has 3 fixed mistakes across attempts and syncs via `POST /api/sync/attempts`
- **THEN** the `mistake-fixer` achievement is unlocked in `evaluateRewards()`, persisted once in `AchievementAward`, and returned by `GET /api/children/[childId]/progress` without duplicates on repeated syncs
