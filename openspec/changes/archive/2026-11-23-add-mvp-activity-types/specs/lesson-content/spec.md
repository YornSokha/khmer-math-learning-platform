# Spec Delta

## ADDED Requirements

### Requirement: Extended Grade 1 activity step configurations and choice answers
The lesson content schema SHALL validate all 12 Grade 1 activity types (`ten-frame`, `number-line`, `equation-fill`, `count-tap`, `choice-pictorial`, `compare-groups`, `drag-to-group`, `number-bond`, `place-value-blocks`, `pattern-sequence`, `partition`, `money-pay`), discrete choice answer specs (`{ kind: "choice", value }`), pictorial choice options, repeating pattern definitions, and optional curriculum `order` numbers.

#### Scenario: Choice-based comparison and pattern steps pass schema validation
- **WHEN** a lesson YAML defines a `compare-groups` or `pattern-sequence` activity with `answer: { kind: "choice", value: ">" }` and `options`
- **THEN** schema validation succeeds and preserves the choice options, answer value, and misconceptions

#### Scenario: Choice answer referencing an unknown option ID fails validation
- **WHEN** an activity step defines `options` and an `answer: { kind: "choice", value }` whose value does not exist in `options`
- **THEN** validation fails with a clear error citing the lesson ID and step ID
