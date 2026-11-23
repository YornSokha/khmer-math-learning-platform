# progress-mastery Specification

## Purpose

Defines idempotent synchronization of learner attempts from IndexedDB to the backend, per-skill mastery progression (2 independent correct challenges across separate sessions), spaced-review scheduling at 1/3/7/21 days, and calm parent-facing progress summaries.

## Requirements

### Requirement: Idempotent attempt synchronization by clientEventId
The backend SHALL accept batches of locally recorded learner attempts at `POST /api/sync/attempts` for a child profile owned by the authenticated parent and SHALL deduplicate attempts by `clientEventId` so retries and repeated sync runs never store duplicate attempts.

#### Scenario: Re-sending the same attempt batch creates zero duplicates
- **WHEN** an authenticated parent submits `POST /api/sync/attempts` twice with the same `clientEventId` values for their child
- **THEN** the first call inserts all attempts (`acceptedCount > 0`, `duplicateCount === 0`), the second call inserts zero new attempts (`acceptedCount === 0`, `duplicateCount === batch.length`), and the child's stored attempt count remains unchanged

#### Scenario: Sync rejects attempts targeting another parent's child
- **WHEN** an authenticated parent calls `POST /api/sync/attempts` with a `childProfileId` owned by a different parent
- **THEN** the API returns HTTP `404` and stores no attempts

### Requirement: Two-session independent skill mastery and 1/3/7/21-day spaced review
A skill SHALL be marked mastered only after 2 independent correct challenge attempts (`hintsUsed === 0` on review-eligible steps) completed in 2 separate calendar sessions, and mastered skills SHALL be scheduled for spaced review at intervals of 1, 3, 7, and 21 days.

#### Scenario: Skill reaches mastery on the second separate session and schedules 1-day review
- **WHEN** a child completes an independent correct challenge for skill `bond-10` on day 1 and another independent correct challenge on day 2
- **THEN** `bond-10` is not yet mastered after day 1 (`independentSessions === 1`, `masteredAt === null`), and becomes mastered after day 2 (`independentSessions === 2`, `masteredAt !== null`, `nextReviewAt` set to 1 day later)

#### Scenario: Mastered skill advances through 1, 3, 7, and 21 day intervals and surfaces when due
- **WHEN** a mastered skill's `nextReviewAt` has passed
- **THEN** `getDueReviewSkills()` includes that skill for today's review, and each subsequent independent correct review advances `nextReviewAt` through 3, 7, and 21 days

### Requirement: Calm parent progress summary with time spent shown only to parents
The backend SHALL expose `GET /api/children/[childId]/progress` for the owning parent returning mastered skills, skills needing practice, due reviews, and learning minutes (today and last 7 days), and `/parent` SHALL display this summary per child while child learning views never display time spent as a gamified metric.

#### Scenario: Parent views synced child mastery and learning time on /parent
- **WHEN** a child's synced attempts include completed steps and duration milliseconds and the parent opens `/parent`
- **THEN** the parent sees the child's mastered skills count, skills needing practice, and learning minutes for today and the past 7 days

### Requirement: Child-facing Today's Review queue and interactive spaced-review runner
The application SHALL build a due review queue from skills whose `nextReviewAt` has passed (computed locally from IndexedDB attempts or from synced `SkillState`s), surface a "Today's Review" card on `/learn` whenever due skills exist, and provide an interactive `/review` runner that plays review-eligible activity steps with instant feedback and hints and records attempts to advance the 1/3/7/21-day review schedule.

#### Scenario: Mastered skill with elapsed nextReviewAt appears in Today's Review and advances when answered
- **WHEN** a learner has a mastered skill whose `nextReviewAt` is in the past and opens `/learn`
- **THEN** `/learn` displays the Today's Review card with a link to `/review`, `/review` presents an interactive review-eligible activity step from that skill's lesson, and submitting a correct independent answer records the attempt in IndexedDB and removes the completed item from today's due queue

#### Scenario: Empty review queue shows calm encouragement without error
- **WHEN** a learner opens `/review` with zero skills currently due for review
- **THEN** `/review` shows a calm Khmer message explaining there are no due reviews right now and provides a link back to `/learn`

### Requirement: Detailed calm Parent Overview with named skills, due reviews, and achievements
The `/parent` overview card for each child SHALL display named mastered skills, named skills needing practice, due review count, earned achievement badges, and learning minutes (today and last 7 days) in a calm, non-comparative layout.

#### Scenario: Parent views named practice/mastered skills and earned achievements for a child
- **WHEN** a child has synced attempts producing mastered or practice skills and unlocked achievements and the parent opens `/parent`
- **THEN** the child's overview card renders the skill/lesson names, due review count, earned achievement titles, and learning minutes
