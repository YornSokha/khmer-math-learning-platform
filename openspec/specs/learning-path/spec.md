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
