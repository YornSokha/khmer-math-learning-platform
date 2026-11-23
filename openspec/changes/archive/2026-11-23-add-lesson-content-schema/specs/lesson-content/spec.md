# Spec Delta

## Purpose

Defines the versioned YAML lesson content contract, mathematical expression and parameter validation, build-time Khmer zero-width space (ZWSP) word segmentation, math/Khmer approval publish gating, CLI validation command, and developer/teacher lesson preview route.

## ADDED Requirements

### Requirement: Versioned YAML lesson schema validation
The system SHALL parse and validate lesson YAML files against a strict schema covering lesson metadata, 8-step CPA step types, parameterized variations, answer specifications, misconception rules, up to 3 progressive hints, review step pointers, and review status fields.

#### Scenario: Valid Grade 1 lesson YAML passes validation
- **WHEN** a well-formed Grade 1 lesson YAML file (`g1-make-ten.yaml`) is parsed and validated
- **THEN** validation succeeds and returns a strongly typed lesson object preserving numeric values, step order, and metadata

#### Scenario: Missing required fields or duplicate step IDs fail validation
- **WHEN** a lesson YAML omits required fields or defines duplicate step IDs or unknown `review.items` references
- **THEN** validation fails with clear error messages identifying the lesson ID and offending step or field

### Requirement: Mathematical expression and parameter domain validation
The system SHALL safely evaluate parameterized answer and misconception expressions across parameter bounds at validation time and SHALL reject unknown variables, division by zero, non-integer results for integer parameters, and negative Grade 1 answers.

#### Scenario: Non-integer expression result fails validation
- **WHEN** a lesson step declares integer parameters and an `answer.expr` that yields a non-integer result for a valid parameter value
- **THEN** validation fails with an error citing the lesson ID, step ID, and failing parameter assignment

#### Scenario: Negative Grade 1 answer fails validation
- **WHEN** a Grade 1 lesson step defines an `answer.expr` that produces a negative number within the parameter range
- **THEN** validation fails and reports the out-of-range result with the lesson and step ID

### Requirement: Build-time Khmer ZWSP word-boundary insertion
The system SHALL insert zero-width spaces (`U+200B`) at Khmer word boundaries during content loading and build steps without corrupting `{placeholder}` template tokens, punctuation, or numeric values, and SHALL not perform Khmer word segmentation in browser client code.

#### Scenario: Multi-word Khmer lesson text receives ZWSP word boundaries
- **WHEN** unsegmented Khmer lesson copy containing template placeholders (such as `"ម៉ាក់ត្រូវការចាន {total}។"`) is processed by the content loader
- **THEN** zero-width spaces are inserted between Khmer words while preserving `"{total}"` and punctuation intact without duplicate ZWSP characters

### Requirement: Dual math and Khmer review publish gate
The system SHALL allow only lessons whose `reviewStatus.math` is `"approved"` and `reviewStatus.khmer` is `"approved"` to be published to learners, while allowing draft lessons to be validated and inspected in preview.

#### Scenario: Unapproved lesson is excluded from published lessons
- **WHEN** published lessons are queried and a lesson has `reviewStatus.khmer` set to `"draft"` or `reviewStatus.math` set to `"draft"`
- **THEN** the lesson is excluded from published lessons and `isLessonPublishable()` returns `false`

#### Scenario: Fully approved lesson passes publish gate
- **WHEN** a lesson has both `reviewStatus.math: "approved"` and `reviewStatus.khmer: "approved"`
- **THEN** `isLessonPublishable()` returns `true` and the lesson is included in published lessons

### Requirement: Content validation CLI command
The repository SHALL provide an `npm run content:validate` command that validates all lesson YAML files in `content/lessons/` and exits with a non-zero code on any schema or mathematical validation error.

#### Scenario: CLI succeeds on valid lesson content
- **WHEN** `npm run content:validate` runs against valid lesson YAML files
- **THEN** it prints a validation summary and exits with code `0`

#### Scenario: CLI fails on invalid lesson YAML
- **WHEN** `npm run content:validate` runs against a directory containing an invalid lesson YAML file
- **THEN** it reports the file path, lesson/step error details, and exits with a non-zero exit code

### Requirement: Lesson preview route for review
The application SHALL provide a `/preview/[lessonId]` route that renders a validated, ZWSP-segmented lesson's metadata, review status badges, steps, feedback rules, and progressive hints using the Khmer typography and numeral foundation.

#### Scenario: Preview route renders Grade 1 Make Ten lesson on mobile
- **WHEN** a reviewer opens `/preview/g1-make-ten` in a `360×800` viewport
- **THEN** the page returns HTTP `200`, displays the Khmer title, review status badges, all lesson steps, and numeral toggle with zero horizontal overflow
