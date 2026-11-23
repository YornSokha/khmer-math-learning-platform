import { describe, expect, it } from "vitest";
import {
  evaluateRewards,
  XP_PER_COMPLETED_LESSON,
  XP_PER_CORRECT_ATTEMPT,
  XP_PER_DAILY_CHALLENGE,
  XP_PER_FIXED_MISTAKE,
} from "./engine";

describe("anti-addictive rewards engine", () => {
  const now = new Date("2026-11-23T12:00:00.000Z");

  it("awards XP strictly from learning actions and is completely independent of time spent", () => {
    const fastAttempts = [
      {
        lessonId: "g1-make-ten",
        stepId: "s1",
        correct: false,
        hintsUsed: 0,
        durationMs: 3_000,
        timestamp: "2026-11-23T09:00:00.000Z",
      },
      {
        lessonId: "g1-make-ten",
        stepId: "s1",
        correct: true,
        hintsUsed: 1,
        durationMs: 4_000,
        timestamp: "2026-11-23T09:00:10.000Z",
      },
    ];

    const slowAttempts = fastAttempts.map((item) => ({
      ...item,
      durationMs: 600_000,
    }));

    const fastResult = evaluateRewards({
      attempts: fastAttempts,
      dailyChallengeHistory: { "2026-11-23": "completed" },
      now,
    });
    const slowResult = evaluateRewards({
      attempts: slowAttempts,
      dailyChallengeHistory: { "2026-11-23": "completed" },
      now,
    });

    expect(fastResult.totalXp).toBe(slowResult.totalXp);
    expect(fastResult.totalXp).toBe(
      XP_PER_CORRECT_ATTEMPT +
        XP_PER_FIXED_MISTAKE +
        XP_PER_COMPLETED_LESSON +
        XP_PER_DAILY_CHALLENGE,
    );
    expect(fastResult.fixedMistakes).toBe(1);
  });

  it("tracks days learned this week with automatic rest days and no streak penalty when missing a day", () => {
    // Learned 2 days ago, rested yesterday (Nov 22), no activity yet today -> calmly shows 1 day this week
    const result = evaluateRewards({
      attempts: [
        {
          lessonId: "g1-01-subitize-1-5",
          stepId: "s1",
          correct: true,
          hintsUsed: 0,
          timestamp: "2026-11-21T08:00:00.000Z",
        },
        // Outside 7-day rolling window
        {
          lessonId: "g1-01-subitize-1-5",
          stepId: "s2",
          correct: true,
          hintsUsed: 0,
          timestamp: "2026-11-10T08:00:00.000Z",
        },
      ],
      now,
    });

    expect(result.daysLearnedThisWeek).toBe(1);
    expect(result.activeWeekDateKeys).toEqual(["2026-11-21"]);
    expect(result.earnedAchievementIds).toContain("first-lesson");
    expect(result.earnedAchievementIds).not.toContain("calm-three-days");
  });

  it("unlocks mistake-fixer, master-bonds-10, review-champion, and calm-three-days for mastery and effort", () => {
    const result = evaluateRewards({
      attempts: [
        {
          lessonId: "g1-make-ten",
          stepId: "s1",
          correct: false,
          hintsUsed: 0,
          timestamp: "2026-11-20T08:00:00.000Z",
        },
        {
          lessonId: "g1-make-ten",
          stepId: "s1",
          correct: true,
          hintsUsed: 1,
          timestamp: "2026-11-20T08:01:00.000Z",
        },
        {
          lessonId: "g1-make-ten",
          stepId: "s2",
          correct: false,
          hintsUsed: 0,
          timestamp: "2026-11-21T08:00:00.000Z",
        },
        {
          lessonId: "g1-make-ten",
          stepId: "s2",
          correct: true,
          hintsUsed: 1,
          timestamp: "2026-11-21T08:01:00.000Z",
        },
        {
          lessonId: "g1-make-ten",
          stepId: "s3",
          correct: false,
          hintsUsed: 0,
          timestamp: "2026-11-23T08:00:00.000Z",
        },
        {
          lessonId: "g1-make-ten",
          stepId: "s3",
          correct: true,
          hintsUsed: 0,
          timestamp: "2026-11-23T08:01:00.000Z",
        },
      ],
      skillStates: [
        {
          skillId: "bond-10",
          masteredAt: new Date("2026-11-21T08:01:00.000Z"),
          reviewStage: 1,
        },
      ],
      now,
    });

    expect(result.fixedMistakes).toBe(3);
    expect(result.daysLearnedThisWeek).toBe(3);
    expect(result.earnedAchievementIds).toEqual([
      "first-lesson",
      "mistake-fixer",
      "master-bonds-10",
      "review-champion",
      "calm-three-days",
    ]);
  });
});
