import { describe, expect, it } from "vitest";
import { isLessonPublishable, parseLessonYaml, validateLesson } from "./schema";

const VALID_LESSON_YAML = `
id: g1-sample-ten
version: 1
title:
  km: "បង្កើតដប់"
  en: "Make Ten"
grade: 1
strand: number-sense
moeysRef:
  - "G1-U7"
skills:
  - bond-10
prerequisites:
  - count-0-10
estimatedMinutes: 6
numerals: khmer
steps:
  - id: hook
    type: intro
    text:
      km: "ម៉ាក់ត្រូវការចាន ១០។"
  - id: make-ten-1
    type: activity
    activity: ten-frame
    mode: complete
    supports: full
    prompt:
      km: "បន្ថែមចានប៉ុន្មានទៀតដើម្បីបាន ១០?"
    params:
      given:
        randInt: [3, 8]
    answer:
      kind: equals
      expr: "10 - given"
    feedback:
      correct:
        km: "ត្រឹមត្រូវ! {given} និង {answer} ស្មើ ១០។"
      misconceptions:
        - id: copied-given
          when:
            equals: "given"
          text:
            km: "រាប់តែប្រអប់ទទេ។"
    hints:
      - km: "រាប់ប្រអប់ទទេ។"
      - km: "ចាប់ផ្តើមពី {given} រាប់បន្តដល់ ១០។"
      - km: "មើលប្រអប់ទទេដែលបង្ហាញ។"
        show: highlight-empty-cells
review:
  items:
    - make-ten-1
reviewStatus:
  math: approved
  khmer: approved
  reviewer: "Kru Sophea"
`;

describe("Lesson YAML schema validation", () => {
  it("parses and validates a well-formed Grade 1 lesson", () => {
    const result = parseLessonYaml(VALID_LESSON_YAML);
    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.lesson.id).toBe("g1-sample-ten");
    expect(result.lesson.steps).toHaveLength(2);
    expect(isLessonPublishable(result.lesson)).toBe(true);
  });

  it("enforces dual math and Khmer approval publish gate", () => {
    const draftKhmer = parseLessonYaml(
      VALID_LESSON_YAML.replace("khmer: approved", "khmer: draft"),
    );
    expect(draftKhmer.success).toBe(true);
    if (draftKhmer.success) {
      expect(isLessonPublishable(draftKhmer.lesson)).toBe(false);
    }

    const draftMath = parseLessonYaml(VALID_LESSON_YAML.replace("math: approved", "math: draft"));
    expect(draftMath.success).toBe(true);
    if (draftMath.success) {
      expect(isLessonPublishable(draftMath.lesson)).toBe(false);
    }
  });

  it("rejects non-integer expression results for integer params", () => {
    const badExpr = VALID_LESSON_YAML.replace('expr: "10 - given"', 'expr: "given / 2"');
    const result = parseLessonYaml(badExpr);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.join("\n")).toMatch(/g1-sample-ten.*make-ten-1.*non-integer/);
    }
  });

  it("rejects negative Grade 1 answers within parameter bounds", () => {
    const negativeExpr = VALID_LESSON_YAML.replace('expr: "10 - given"', 'expr: "5 - given"');
    const result = parseLessonYaml(negativeExpr);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.join("\n")).toMatch(/< 0/);
    }
  });

  it("rejects duplicate step IDs and unknown review item references", () => {
    const badReview = VALID_LESSON_YAML.replace("- make-ten-1", "- does-not-exist");
    const reviewResult = parseLessonYaml(badReview);
    expect(reviewResult.success).toBe(false);
    if (!reviewResult.success) {
      expect(reviewResult.errors.join("\n")).toMatch(/unknown step "does-not-exist"/);
    }

    const parsed = parseLessonYaml(VALID_LESSON_YAML);
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;

    const duplicated = validateLesson({
      ...parsed.lesson,
      steps: [...parsed.lesson.steps, parsed.lesson.steps[0]],
    });
    expect(duplicated.success).toBe(false);
    if (!duplicated.success) {
      expect(duplicated.errors.join("\n")).toMatch(/duplicate step id "hook"/);
    }
  });

  it("rejects malformed YAML syntax", () => {
    const result = parseLessonYaml("id: [unclosed");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors[0]).toMatch(/YAML syntax error/);
    }
  });

  it("validates choice-based activities and rejects unknown choice option references", () => {
    const validChoiceYaml = `
id: g1-compare-sample
order: 4
version: 1
title: { km: "ប្រៀបធៀប" }
grade: 1
strand: number-sense
moeysRef: ["G1-U6"]
skills: [compare-10]
estimatedMinutes: 5
steps:
  - id: compare-1
    type: activity
    activity: compare-groups
    mode: compare
    prompt: { km: "ជ្រើសរើសសញ្ញាប្រៀបធៀប។" }
    params: { left: 7, right: 4 }
    options:
      - id: ">"
        label: { km: ">" }
      - id: "<"
        label: { km: "<" }
      - id: "="
        label: { km: "=" }
    answer:
      kind: choice
      value: ">"
    feedback:
      correct: { km: "ត្រឹមត្រូវ!" }
      misconceptions:
        - id: reversed-symbol
          when: { choice: "<" }
          text: { km: "មាត់ធំបែរទៅរកចំនួនធំ។" }
    hints:
      - km: "រាប់ក្រុមទាំងពីរ។"
review:
  items: [compare-1]
reviewStatus:
  math: approved
  khmer: approved
`;

    expect(parseLessonYaml(validChoiceYaml).success).toBe(true);

    const invalidChoice = parseLessonYaml(
      validChoiceYaml.replace('value: ">"', 'value: "invalid"'),
    );
    expect(invalidChoice.success).toBe(false);
    if (!invalidChoice.success) {
      expect(invalidChoice.errors.join("\n")).toMatch(/not listed in options/);
    }
  });
});
