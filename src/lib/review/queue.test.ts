import { beforeEach, describe, expect, it } from "vitest";
import { getAllLessons } from "@/lib/content/loader";
import {
  buildDueReviewQueue,
  clearDailyChallengeStatus,
  computeLocalSkillStates,
  loadDailyChallengeStatus,
  saveDailyChallengeStatus,
  selectDailyChallenge,
} from "./queue";

describe("review queue & daily challenge selector", () => {
  const lessons = getAllLessons();

  beforeEach(() => {
    window.localStorage.clear();
    clearDailyChallengeStatus();
  });

  it("computes 2-session local skill mastery and surfaces due review cards once nextReviewAt passes", () => {
    const attempts = [
      {
        lessonId: "g1-make-ten",
        stepId: "mastery-check-bond-10",
        correct: true,
        hintsUsed: 0,
        timestamp: "2026-11-18T08:00:00.000Z",
      },
      {
        lessonId: "g1-make-ten",
        stepId: "mastery-check-bond-10",
        correct: true,
        hintsUsed: 0,
        timestamp: "2026-11-19T08:00:00.000Z",
      },
    ];

    const states = computeLocalSkillStates(attempts, lessons);
    expect(states).toHaveLength(1);
    expect(states[0]?.skillId).toBe("bond-10");
    expect(states[0]?.masteredAt).not.toBeNull();

    // Before +1 day: not due yet
    const beforeDue = buildDueReviewQueue(lessons, states, new Date("2026-11-19T12:00:00.000Z"));
    expect(beforeDue).toHaveLength(0);

    // After +1 day: due in Today's Review with a review-eligible activity step
    const whenDue = buildDueReviewQueue(lessons, states, new Date("2026-11-20T09:00:00.000Z"));
    expect(whenDue).toHaveLength(1);
    expect(whenDue[0]?.lessonId).toBe("g1-make-ten");
    expect(whenDue[0]?.skillId).toBe("bond-10");
    expect(whenDue[0]?.step.type).toBe("activity");

    // Completing the due review independently advances nextReviewAt to +3 days (no longer due today)
    const afterReviewStates = computeLocalSkillStates(
      [
        ...attempts,
        {
          lessonId: "g1-make-ten",
          stepId: whenDue[0]!.step.id,
          correct: true,
          hintsUsed: 0,
          timestamp: "2026-11-20T09:05:00.000Z",
        },
      ],
      lessons,
    );
    const remainingToday = buildDueReviewQueue(
      lessons,
      afterReviewStates,
      new Date("2026-11-20T09:10:00.000Z"),
    );
    expect(remainingToday).toHaveLength(0);
    expect(afterReviewStates[0]?.reviewStage).toBe(1);
  });

  it("deterministically selects 1 Daily Challenge per date and varies across dates", () => {
    const dayA1 = selectDailyChallenge(lessons, "2026-11-23");
    const dayA2 = selectDailyChallenge(lessons, "2026-11-23");
    const dayB = selectDailyChallenge(lessons, "2026-11-24");

    expect(dayA1).not.toBeNull();
    expect(dayA1).toEqual(dayA2);
    expect(dayB).not.toBeNull();
    expect(dayA1?.seed).not.toBe(dayB?.seed);
  });

  it("persists daily challenge completed and skipped states per date without carrying over", () => {
    expect(loadDailyChallengeStatus("2026-11-23")).toBeNull();

    saveDailyChallengeStatus("skipped", "2026-11-23");
    expect(loadDailyChallengeStatus("2026-11-23")).toBe("skipped");
    expect(loadDailyChallengeStatus("2026-11-24")).toBeNull();

    saveDailyChallengeStatus("completed", "2026-11-23");
    expect(loadDailyChallengeStatus("2026-11-23")).toBe("completed");
  });
});
