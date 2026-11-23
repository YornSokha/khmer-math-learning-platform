import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NumeralPreferenceProvider } from "@/components/khmer/NumeralPreferenceProvider";
import type { Lesson } from "@/lib/content/schema";
import { clearLessonSession } from "@/lib/player/session";
import { LessonPlayer } from "./LessonPlayer";

const TEST_LESSON: Lesson = {
  id: "g1-test-bonds",
  version: 1,
  title: { km: "បង្កើតដប់" },
  grade: 1,
  strand: "number-sense",
  moeysRef: ["G1-U7"],
  skills: ["bond-10"],
  prerequisites: [],
  estimatedMinutes: 5,
  numerals: "khmer",
  steps: [
    {
      id: "intro-1",
      type: "intro",
      text: { km: "សួស្តី! តោះបង្កើត ១០។" },
      image: "dinner-plates-ten",
    },
    {
      id: "ten-frame-1",
      type: "activity",
      activity: "ten-frame",
      mode: "complete",
      supports: "full",
      prompt: { km: "បន្ថែមឱ្យគ្រប់ ១០។" },
      params: { given: 4, target: 10 },
      answer: { kind: "equals", expr: "10 - given", integerOnly: true },
      feedback: {
        correct: { km: "ត្រឹមត្រូវ! {given} និង {answer} ស្មើ ១០។" },
        misconceptions: [
          {
            id: "copied-given",
            when: { equals: "given" },
            text: { km: "រាប់តែប្រអប់ទទេ។" },
          },
        ],
      },
      hints: [
        { km: "ជំនួយទី ១៖ រាប់ប្រអប់ទទេ។" },
        { km: "ជំនួយទី ២៖ រាប់បន្តពី {given}។" },
        { km: "ជំនួយទី ៣៖ មើលប្រអប់ដែលភ្លឺ។", show: "highlight-empty-cells" },
      ],
    },
    {
      id: "equation-1",
      type: "activity",
      activity: "equation-fill",
      mode: "solve",
      supports: "none",
      prompt: { km: "បំពេញលេខដែលបាត់។" },
      params: { a: 7 },
      template: "{a} + □ = 10",
      answer: { kind: "equals", expr: "10 - a", integerOnly: true },
      feedback: {
        correct: { km: "ល្អណាស់! {a} + {answer} = ១០។" },
        misconceptions: [],
      },
      hints: [
        { km: "គិតពី {a} ទៅ ១០។" },
        { km: "រាប់បន្តពី {a}។" },
        { km: "មើលតារាងដប់។", show: "highlight-ten-frame-model" },
      ],
    },
  ],
  review: { items: ["ten-frame-1", "equation-1"] },
  reviewStatus: { math: "approved", khmer: "approved" },
};

describe("LessonPlayer", () => {
  beforeEach(() => {
    window.localStorage.clear();
    clearLessonSession(TEST_LESSON.id);
  });

  it("handles misconception feedback, 3-level progressive hints revealing visual model, resume, and calm stop screen", async () => {
    const user = userEvent.setup();
    const onAttempt = vi.fn();
    const onComplete = vi.fn();

    const { unmount } = render(
      <NumeralPreferenceProvider>
        <LessonPlayer lesson={TEST_LESSON} onAttempt={onAttempt} onComplete={onComplete} />
      </NumeralPreferenceProvider>,
    );

    expect(screen.getByTestId("lesson-step-card")).toHaveAttribute("data-step-id", "intro-1");
    await user.click(screen.getByTestId("step-continue-button"));

    expect(screen.getByTestId("lesson-step-card")).toHaveAttribute("data-step-id", "ten-frame-1");

    // Simulate exiting and reopening mid-lesson
    unmount();
    render(
      <NumeralPreferenceProvider>
        <LessonPlayer lesson={TEST_LESSON} onAttempt={onAttempt} onComplete={onComplete} />
      </NumeralPreferenceProvider>,
    );

    expect(screen.getByTestId("lesson-step-card")).toHaveAttribute("data-step-id", "ten-frame-1");

    // Trigger copied-given misconception by tapping 4 cells when given=4 (answer should be 6)
    for (const idx of [4, 5, 6, 7]) {
      await user.click(screen.getByTestId(`ten-frame-cell-${idx}`));
    }
    await user.click(screen.getByTestId("step-check-button"));

    expect(screen.getByTestId("step-feedback")).toHaveAttribute("data-correct", "false");
    expect(screen.getByTestId("step-feedback")).toHaveAttribute(
      "data-misconception",
      "copied-given",
    );
    expect(screen.getByTestId("revealed-hint-1")).toBeInTheDocument();

    // Unlock hints 2 and 3 (visual cue)
    await user.click(screen.getByTestId("step-hint-button"));
    expect(screen.getByTestId("revealed-hint-2")).toBeInTheDocument();

    await user.click(screen.getByTestId("step-hint-button"));
    expect(screen.getByTestId("revealed-hint-3")).toBeInTheDocument();
    expect(screen.getByTestId("ten-frame-cell-8")).toHaveAttribute("data-hint-highlighted", "true");

    // Complete remaining 2 empty cells (total added = 6) and submit
    await user.click(screen.getByTestId("ten-frame-cell-8"));
    await user.click(screen.getByTestId("ten-frame-cell-9"));
    await user.click(screen.getByTestId("step-check-button"));

    expect(screen.getByTestId("step-feedback")).toHaveAttribute("data-correct", "true");
    await user.click(screen.getByTestId("step-continue-button"));

    // Final abstract equation step: scaffold hidden until hint 3
    expect(screen.getByTestId("lesson-step-card")).toHaveAttribute("data-step-id", "equation-1");
    expect(screen.queryByTestId("equation-visual-scaffold")).not.toBeInTheDocument();

    await user.click(screen.getByTestId("step-hint-button"));
    await user.click(screen.getByTestId("step-hint-button"));
    await user.click(screen.getByTestId("step-hint-button"));
    expect(screen.getByTestId("equation-visual-scaffold")).toBeInTheDocument();

    await user.click(screen.getByTestId("keypad-digit-3"));
    await user.click(screen.getByTestId("step-check-button"));
    expect(screen.getByTestId("step-feedback")).toHaveAttribute("data-correct", "true");

    await user.click(screen.getByTestId("step-continue-button"));

    expect(screen.getByTestId("lesson-complete-screen")).toBeInTheDocument();
    expect(screen.getByText("ធ្វើបានល្អណាស់! ជួបគ្នាថ្ងៃស្អែក។")).toBeInTheDocument();
    expect(onAttempt).toHaveBeenCalledTimes(3);
    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        lessonId: "g1-test-bonds",
        fixedMistakes: 1,
      }),
    );
  });
});
