# Spec Delta

## Purpose

Defines multi-step CPA lesson playback, step progress display, penalty-free exit, mid-lesson session resume, and the calm natural session completion screen.

## ADDED Requirements

### Requirement: Ordered CPA lesson playback and step progress
The lesson player SHALL present a lesson's steps in sequence across `intro`, `explore`, `activity`, and `explain` types, display step progress formatted in the active numeral system, and advance past `activity` steps only after a correct answer is submitted.

#### Scenario: Learner completes all 8 steps of Make Ten lesson
- **WHEN** a learner opens `/lessons/g1-make-ten` and completes each step in order
- **THEN** the player displays step progress from step 1 through step 8, gates activity progression on a correct answer, and transitions to the completion screen after step 8

### Requirement: Penalty-free exit and mid-lesson resume
The lesson player SHALL allow a learner to exit at any step without penalty and SHALL automatically persist the active step index and variation seed so reopening the lesson resumes at the exact same step.

#### Scenario: Reloading mid-lesson resumes at the same step
- **WHEN** a learner advances to step 3 of `/lessons/g1-make-ten`, exits or reloads the page, and reopens `/lessons/g1-make-ten`
- **THEN** the lesson resumes directly on step 3 with the same parameterized problem

### Requirement: Calm natural stop screen on completion
The lesson player SHALL end every completed lesson with a calm Khmer stop screen celebrating completion and fixed mistakes, with no autoplay and no loss-framed streak warnings.

#### Scenario: Natural stop screen appears after final step
- **WHEN** a learner completes the final step of a lesson
- **THEN** the player displays a calm completion summary with options to return home or replay, without auto-advancing to another lesson
