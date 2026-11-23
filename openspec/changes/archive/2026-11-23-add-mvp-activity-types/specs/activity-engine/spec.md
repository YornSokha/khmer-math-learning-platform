# Spec Delta

## ADDED Requirements

### Requirement: Pure evaluation for discrete choice and comparison answers
The activity engine SHALL evaluate discrete choice answers (such as comparison symbols `<`, `>`, `=`, pattern tokens, or pictorial option IDs) in addition to numeric expression answers, detecting choice-based misconceptions and returning localized Khmer feedback.

#### Scenario: Compare-groups evaluates comparison symbol and reversed-symbol misconception
- **WHEN** `evaluateActivityAnswer()` evaluates a `compare-groups` step with `answer: { kind: "choice", value: ">" }` and a misconception for `"<"`
- **THEN** submitting `">"` returns `{ correct: true }` and submitting `"<"` returns `{ correct: false }` with the matching `misconceptionId` and Khmer guidance

### Requirement: Interactive counting, pictorial choice, and comparison SVG activities
The activity engine SHALL provide touch- and keyboard-accessible SVG components for `count-tap` (including subitizing flash replay), `choice-pictorial`, and `compare-groups` with `>= 48×48px` targets and active Khmer/Arabic numeral rendering.

#### Scenario: Count-tap counts tapped fruit items and compare-groups selects symbols
- **WHEN** a learner taps 3 mangoes in `CountTapActivity` or selects `">"` in `CompareGroupsActivity`
- **THEN** `CountTapActivity` reports `"3"` and `CompareGroupsActivity` reports `">"` without clipping Khmer labels

### Requirement: Interactive grouping, number-bond, and place-value SVG activities
The activity engine SHALL provide touch- and keyboard-accessible SVG components for `drag-to-group` (joining into or taking away from a basket), `number-bond` (whole–part–part diagram with numeric keypad), and `place-value-blocks` (tens stick bundles and single ones).

#### Scenario: Place-value blocks compose tens and ones and drag-to-group counts items
- **WHEN** a learner adds 2 ten-bundles and 4 single sticks in `PlaceValueBlocksActivity`
- **THEN** the reported numeric value equals `24` and displays formatted in the active numeral system (`២៤` or `24`)

### Requirement: Interactive pattern, partition, and Cambodian riel money SVG activities
The activity engine SHALL provide touch- and keyboard-accessible SVG components for `pattern-sequence` (repeating krama/motif tiles), `partition` (equal-parts shading/selection), and `money-pay` (Cambodian R50 and R100 riel banknotes).

#### Scenario: Money-pay totals R50 and R100 riel banknotes
- **WHEN** a learner taps two R100 notes and two R50 notes in `MoneyPayActivity`
- **THEN** the payment tray displays 4 notes totaling `300` riel formatted in the active numeral system (`៣០០` or `300`)
