# profiles-consent Delta Specification

## ADDED Requirements

### Requirement: Simple adult Parent Gate from child learning mode
Child learning views (`/learn`) SHALL protect entry into `/parent` behind a simple adult Parent Gate (such as a single multiplication check accepting both Khmer and Arabic numerals) to prevent accidental child entry into parent settings or profile deletion controls.

#### Scenario: Parent gate blocks wrong answers and navigates to /parent on correct adult answer
- **WHEN** a user clicks the parent portal entry button on `/learn`, enters an incorrect answer, and then enters the correct answer (in Khmer or Arabic digits)
- **THEN** the gate stays open with a gentle Khmer retry message on the wrong answer and navigates to `/parent` once the correct adult answer is submitted
