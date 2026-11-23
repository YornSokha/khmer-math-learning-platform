import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NumeralPreferenceProvider } from "@/components/khmer/NumeralPreferenceProvider";
import { evaluateRewards } from "@/lib/rewards/engine";
import { CalmRewardsSummary } from "./CalmRewardsSummary";

describe("CalmRewardsSummary", () => {
  it("renders learning XP, days learned this week, and unlocked achievements without any time-spent or lost-streak messaging", () => {
    const summary = evaluateRewards({
      attempts: [
        {
          lessonId: "g1-make-ten",
          stepId: "s1",
          correct: false,
          hintsUsed: 0,
          timestamp: "2026-11-21T08:00:00.000Z",
        },
        {
          lessonId: "g1-make-ten",
          stepId: "s1",
          correct: true,
          hintsUsed: 1,
          timestamp: "2026-11-21T08:01:00.000Z",
        },
      ],
      now: new Date("2026-11-23T12:00:00.000Z"),
    });

    render(
      <NumeralPreferenceProvider>
        <CalmRewardsSummary rewards={summary} />
      </NumeralPreferenceProvider>,
    );

    const container = screen.getByTestId("calm-rewards-summary");
    expect(container).toHaveAttribute("data-total-xp", String(summary.totalXp));
    expect(container).toHaveAttribute("data-days-this-week", "1");
    expect(screen.getByTestId("achievement-badge-first-lesson")).toHaveAttribute(
      "data-earned",
      "true",
    );
    expect(screen.getByTestId("achievement-badge-master-bonds-10")).toHaveAttribute(
      "data-earned",
      "true",
    );
    expect(screen.getByTestId("achievement-badge-mistake-fixer")).toHaveAttribute(
      "data-earned",
      "false",
    );

    // Ensure no time-spent or loss-framed streak wording appears in child UI
    expect(container.textContent).not.toMatch(/នាទី|minutes|streak|lose/i);
  });
});
