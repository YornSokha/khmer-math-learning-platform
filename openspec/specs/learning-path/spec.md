# learning-path Specification

## Purpose

Defines the Grade 1 learning path progression states (locked, available, mastered), skippable 5-item visual placement recommendation, and unrestricted revisiting of earlier lessons.

## Requirements

### Requirement: Learning path lesson states and next-lesson recommendation
The learning path SHALL display all ordered curriculum lessons with explicit `"mastered"`, `"available"`, or `"locked"` states derived from local completions and placement results, and SHALL highlight the next available lesson as the primary action.

#### Scenario: New learner sees Lesson 1 available and later lessons locked
- **WHEN** a learner with no completed lessons and no placement result opens `/learn`
- **THEN** Lesson 1 (`g1-01-subitize-1-5`) is `"available"` and highlighted as the next lesson, while Lessons 2 through 12 are marked `"locked"`

#### Scenario: Completing a lesson marks it mastered and unlocks the next lesson
- **WHEN** a learner completes Lesson 1 and views `/learn`
- **THEN** Lesson 1 displays `"mastered"` and Lesson 2 becomes `"available"` as the next lesson

### Requirement: Skippable 5-item visual placement check
The application SHALL provide a skippable 5-item visual placement check at `/placement` that recommends a starting lesson based on demonstrated skill mastery and persists the recommendation for `/learn`.

#### Scenario: Placement showing bonds-to-10 mastered starts the path at Lesson 6
- **WHEN** a learner answers placement items 1 through 3 (through bonds-to-10) correctly and misses item 4
- **THEN** placement recommends starting at Lesson 6 (`g1-06-addition-10`) and `/learn` highlights Lesson 6 as the next available lesson

#### Scenario: Learner skips placement without penalty
- **WHEN** a learner activates the skip button on `/placement`
- **THEN** the learner is taken directly to `/learn` starting at Lesson 1 without penalty

### Requirement: Unrestricted revisiting of earlier lessons
The learning path SHALL allow a learner to open and replay any earlier lesson before their current or placement-recommended lesson without locking out completed or bypassed lessons.

#### Scenario: Learner placed at Lesson 6 can open Lesson 1 or Lesson 5
- **WHEN** placement starts the learner at Lesson 6 (`g1-06-addition-10`)
- **THEN** Lessons 1 through 5 remain `"available"` and clickable on `/learn` so the learner can revisit any earlier topic

### Requirement: Optional, always-skippable 1-item Daily Challenge
The child dashboard (`/learn`) SHALL display an optional Daily Challenge card linking to `/daily-challenge` containing exactly one date-seeded interactive problem (~3 minutes) that MAY be skipped at any time with zero penalty, zero loss-framed messaging, and a calm natural stop screen upon completion or skip.

#### Scenario: Child completes the 1-item Daily Challenge and sees calm natural stop
- **WHEN** a learner opens `/daily-challenge` and answers the single interactive problem correctly
- **THEN** the attempt is recorded locally, the screen displays a calm natural stop message with a link back to `/learn` and no autoplay, and `/learn` marks today's challenge as completed

#### Scenario: Child skips the Daily Challenge without penalty
- **WHEN** a learner activates the skip button on the Daily Challenge card or `/daily-challenge`
- **THEN** today's challenge is marked skipped for the current day with zero warning, zero streak-loss language, and no lockouts on `/learn`
