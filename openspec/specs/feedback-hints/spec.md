# feedback-hints Specification

## Purpose

Defines instant synchronous answer evaluation feedback, misconception-specific guidance, and ordered 3-level progressive hints culminating in a visual model cue.

## Requirements

### Requirement: Instant feedback with misconception-specific messages
The lesson player SHALL evaluate submitted activity answers synchronously on the client in `<= 100 ms` and SHALL display warm Khmer feedback, showing the matching misconception-specific message when a known misconception occurs.

#### Scenario: Known misconception triggers specific guidance
- **WHEN** a learner submits the `given` value instead of the empty-cell count on the ten-frame complete step
- **THEN** instant feedback appears immediately showing the `copied-given` misconception message in Khmer without advancing the step

### Requirement: Ordered 3-level progressive hints revealing visual models
The lesson player SHALL unlock up to 3 progressive hints in order on learner request or after wrong attempts, and SHALL activate the visual model hint cue on the final hint rather than only revealing the numeric answer.

#### Scenario: Progressive hints unlock in order and reveal the visual model on hint 3
- **WHEN** a learner requests hints or submits wrong attempts on an activity step with 3 hints
- **THEN** hint 1 unlocks first, hint 2 unlocks second, and hint 3 activates the step's visual model cue (such as `highlight-empty-cells` or `highlight-ten-frame-model`) while keeping the step interactive so the learner can still solve it
