# activity-engine Specification

## Purpose

Defines the pure activity evaluation engine contract, deterministic parameter resolution, on-screen Khmer/Arabic numeric keypad, and core touch- and keyboard-accessible SVG math activities (`ten-frame`, `number-line`, and `equation-fill`).

## Requirements

### Requirement: Pure declarative activity evaluation with misconception detection
The activity engine SHALL evaluate learner answers for any activity step using a pure function that accepts resolved numeric parameters and numeric or digit-string input, normalizes Khmer and Arabic digits with ZWSP stripping, checks configured misconception expressions, and returns structured feedback without UI side effects.

#### Scenario: Ten-frame complete evaluates correct answer and copied-given misconception
- **WHEN** `evaluateActivityAnswer()` evaluates a `ten-frame` complete step with `given = 7` and `answer.expr = "10 - given"`
- **THEN** submitting `3` (or `"៣"` / `"3"`) returns `{ correct: true, expected: 3 }` and submitting `7` returns `{ correct: false, misconceptionId: "copied-given" }` with the misconception message

#### Scenario: Number-line jump detects counted-start-point misconception
- **WHEN** `evaluateActivityAnswer()` evaluates a `number-line` jump step with `start = 6` and `answer.expr = "10 - start"`
- **THEN** submitting `4` returns `{ correct: true }` and submitting `5` returns `{ correct: false, misconceptionId: "counted-start-point" }`

### Requirement: Deterministic parameter resolution for variations
The activity engine SHALL resolve fixed and `randInt` step parameters deterministically from a numeric seed while guaranteeing every resolved value stays within its declared bounds.

#### Scenario: Seeded parameter resolution stays within declared bounds
- **WHEN** `resolveStepParams()` resolves `{ given: { randInt: [3, 8] }, target: 10 }` with any numeric seed
- **THEN** `given` is an integer between `3` and `8` inclusive, `target` is `10`, and identical seeds produce identical parameter values

### Requirement: Accessible on-screen Khmer and Arabic numeric keypad
The application SHALL provide a touch-friendly on-screen numeric keypad displaying digits in the learner's active numeral system (`០–៩` or `0–9`) with `>= 48×48px` buttons, backspace, and clear controls so learners never depend on a device Khmer keyboard.

#### Scenario: Keypad renders active numeral system and enters digits
- **WHEN** a learner taps keypad buttons under the default Khmer numeral setting
- **THEN** the keypad displays `០–៩` buttons, enters the corresponding numeric digits into the answer buffer, and switches labels to `0–9` when Arabic numerals are selected

### Requirement: SVG Ten-Frame interactive manipulative
The activity engine SHALL provide an SVG `ten-frame` component supporting `fill`, `complete`, and `read` modes via both touch/pointer and keyboard interaction, honoring active numeral formatting and visual hint cues.

#### Scenario: Learner adds counters to complete a ten-frame
- **WHEN** `TenFrameActivity` renders in `complete` mode with `given = 7` and the learner activates 3 empty cells via click or keyboard
- **THEN** the reported added count updates to `3`, locked given cells remain unchangeable, and activating the `highlight-empty-cells` hint visually highlights remaining empty slots

### Requirement: SVG Number-Line jump manipulative
The activity engine SHALL provide an SVG `number-line` component displaying numbered stops in the active numeral system, a starting marker, jump controls, curved hop arcs, and optional hint arcs via touch and keyboard.

#### Scenario: Learner hops forward along the number line from start to target
- **WHEN** `NumberLineActivity` renders in `jump` mode with `start = 6` and `target = 10`, and the learner activates the hop-forward control 4 times
- **THEN** the current stop advances to `10`, 4 SVG hop arcs are displayed, and the reported answer equals `4`

### Requirement: Equation-Fill activity with fadeable visual supports
The activity engine SHALL provide an `equation-fill` component rendering parameterized equations in the learner's active numeral system, accepting answers via the on-screen numeric keypad or keyboard, and fading visual ten-frame scaffolds according to `supports` (`full`, `partial`, `none`) unless revealed by a final visual hint.

#### Scenario: Abstract equation hides visual scaffold until final visual hint
- **WHEN** `EquationFillActivity` renders with `supports: "none"` and template `"{a} + □ = 10"` (`a = 6`)
- **THEN** no ten-frame scaffold is initially shown, entering `4` via the keypad sets the answer to `4`, and activating the `highlight-ten-frame-model` hint reveals the visual ten-frame model

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
