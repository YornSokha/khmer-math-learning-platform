# learning-path Delta Specification

## ADDED Requirements

### Requirement: Optional, always-skippable 1-item Daily Challenge
The child dashboard (`/learn`) SHALL display an optional Daily Challenge card linking to `/daily-challenge` containing exactly one date-seeded interactive problem (~3 minutes) that MAY be skipped at any time with zero penalty, zero loss-framed messaging, and a calm natural stop screen upon completion or skip.

#### Scenario: Child completes the 1-item Daily Challenge and sees calm natural stop
- **WHEN** a learner opens `/daily-challenge` and answers the single interactive problem correctly
- **THEN** the attempt is recorded locally, the screen displays a calm natural stop message with a link back to `/learn` and no autoplay, and `/learn` marks today's challenge as completed

#### Scenario: Child skips the Daily Challenge without penalty
- **WHEN** a learner activates the skip button on the Daily Challenge card or `/daily-challenge`
- **THEN** today's challenge is marked skipped for the current day with zero warning, zero streak-loss language, and no lockouts on `/learn`
