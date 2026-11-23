import { describe, expect, it } from "vitest";
import { getLessonById } from "@/lib/content/loader";
import type { ActivityStep } from "@/lib/content/schema";
import { evaluateActivityAnswer, formatTemplateText, resolveStepParams } from "./evaluate";

function getActivityStep(stepId: string): ActivityStep {
  const lesson = getLessonById("g1-make-ten");
  if (!lesson) {
    throw new Error("Expected g1-make-ten lesson");
  }
  const step = lesson.steps.find((item) => item.id === stepId);
  if (!step || step.type !== "activity") {
    throw new Error(`Expected activity step "${stepId}"`);
  }
  return step;
}

describe("Pure activity engine evaluation", () => {
  it("resolves parameterized randInt values deterministically within declared bounds", () => {
    const params = { given: { randInt: [3, 8] as const }, target: 10 };
    const first = resolveStepParams(params, 123);
    const second = resolveStepParams(params, 123);

    expect(first).toEqual(second);
    expect(first.target).toBe(10);
    expect(first.given).toBeGreaterThanOrEqual(3);
    expect(first.given).toBeLessThanOrEqual(8);

    for (let seed = 1; seed <= 30; seed += 1) {
      const sample = resolveStepParams(params, seed);
      expect(sample.given).toBeGreaterThanOrEqual(3);
      expect(sample.given).toBeLessThanOrEqual(8);
    }
  });

  it("evaluates ten-frame complete for correct Khmer/Arabic answers and misconceptions", () => {
    const step = getActivityStep("attempt-ten-frame-complete");
    const resolved = { given: 7, target: 10 };

    const correctNumeric = evaluateActivityAnswer(step, resolved, 3, "khmer");
    expect(correctNumeric.correct).toBe(true);
    expect(correctNumeric.expected).toBe(3);
    expect(correctNumeric.feedbackKm).toContain("៧");
    expect(correctNumeric.feedbackKm).toContain("៣");

    const correctKhmerString = evaluateActivityAnswer(step, resolved, " ៣\u200B ", "khmer");
    expect(correctKhmerString.correct).toBe(true);

    const correctArabicString = evaluateActivityAnswer(step, resolved, "3", "arabic");
    expect(correctArabicString.correct).toBe(true);
    expect(correctArabicString.feedbackKm).toContain("7");
    expect(correctArabicString.feedbackKm).toContain("3");

    const copiedGiven = evaluateActivityAnswer(step, resolved, 7);
    expect(copiedGiven.correct).toBe(false);
    expect(copiedGiven.misconceptionId).toBe("copied-given");

    const offByOne = evaluateActivityAnswer(step, resolved, 4);
    expect(offByOne.correct).toBe(false);
    expect(offByOne.misconceptionId).toBe("off-by-one-high");

    const genericWrong = evaluateActivityAnswer(step, resolved, 1);
    expect(genericWrong.correct).toBe(false);
    expect(genericWrong.misconceptionId).toBeUndefined();
  });

  it("evaluates number-line jump and catches counted-start-point misconception", () => {
    const step = getActivityStep("practice-tuktuk-number-line");
    const resolved = { start: 6, target: 10, max: 10 };

    expect(evaluateActivityAnswer(step, resolved, 4).correct).toBe(true);

    const countedStart = evaluateActivityAnswer(step, resolved, 5);
    expect(countedStart.correct).toBe(false);
    expect(countedStart.misconceptionId).toBe("counted-start-point");
  });

  it("formats template numbers according to active numeral system", () => {
    expect(formatTemplateText("{a} + □ = 10", { a: 6 }, "khmer")).toBe("៦ + □ = 10");
    expect(formatTemplateText("{a} + □ = 10", { a: 6 }, "arabic")).toBe("6 + □ = 10");
  });

  it("evaluates discrete choice answers and choice-based misconceptions", () => {
    const compareStep: ActivityStep = {
      id: "compare-1",
      type: "activity",
      activity: "compare-groups",
      mode: "compare",
      supports: "full",
      prompt: { km: "ជ្រើសរើសសញ្ញាប្រៀបធៀប។" },
      params: { left: 7, right: 4 },
      answer: { kind: "choice", value: ">" },
      feedback: {
        correct: { km: "ត្រឹមត្រូវ! {left} {answer} {right}" },
        misconceptions: [
          {
            id: "reversed-symbol",
            when: { choice: "<" },
            text: { km: "មាត់ធំបែរទៅរកចំនួនធំ។" },
          },
        ],
      },
      hints: [{ km: "រាប់ក្រុមទាំងពីរ។" }],
    };

    const right = evaluateActivityAnswer(compareStep, { left: 7, right: 4 }, ">", "khmer");
    expect(right.correct).toBe(true);
    expect(right.feedbackKm).toContain("៧ > ៤");

    const reversed = evaluateActivityAnswer(compareStep, { left: 7, right: 4 }, "<");
    expect(reversed.correct).toBe(false);
    expect(reversed.misconceptionId).toBe("reversed-symbol");
  });
});
