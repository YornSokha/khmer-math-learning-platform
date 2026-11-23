# progress-mastery Delta Specification

## ADDED Requirements

### Requirement: Child-facing Today's Review queue and interactive spaced-review runner
The application SHALL build a due review queue from skills whose `nextReviewAt` has passed (computed locally from IndexedDB attempts or from synced `SkillState`s), surface a "Today's Review" card on `/learn` whenever due skills exist, and provide an interactive `/review` runner that plays review-eligible activity steps with instant feedback and hints and records attempts to advance the 1/3/7/21-day review schedule.

#### Scenario: Mastered skill with elapsed nextReviewAt appears in Today's Review and advances when answered
- **WHEN** a learner has a mastered skill whose `nextReviewAt` is in the past and opens `/learn`
- **THEN** `/learn` displays the Today's Review card with a link to `/review`, `/review` presents an interactive review-eligible activity step from that skill's lesson, and submitting a correct independent answer records the attempt in IndexedDB and removes the completed item from today's due queue

#### Scenario: Empty review queue shows calm encouragement without error
- **WHEN** a learner opens `/review` with zero skills currently due for review
- **THEN** `/review` shows a calm Khmer message explaining there are no due reviews right now and provides a link back to `/learn`
