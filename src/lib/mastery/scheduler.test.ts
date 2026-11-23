import { describe, expect, it } from "vitest";
import type { AttemptRecord, SkillStateRecord } from "@/lib/server/store";
import {
  addDays,
  applyAttemptToSkillState,
  computeParentProgressSummary,
  getDueReviewSkills,
} from "./scheduler";

describe("Mastery and spaced-review scheduler", () => {
  const childProfileId = "chd_test";
  const skillId = "bond-10";

  it("requires 2 independent correct challenges in separate calendar sessions to reach mastery", () => {
    const day1Morning = new Date("2026-11-20T02:00:00.000Z");
    const day1Evening = new Date("2026-11-20T12:00:00.000Z");
    const day2 = new Date("2026-11-21T03:00:00.000Z");

    // Attempt with hint does NOT count as independent
    const hinted = applyAttemptToSkillState(null, {
      childProfileId,
      skillId,
      attempt: { correct: true, hintsUsed: 1, attemptedAt: day1Morning },
      isReviewEligible: true,
    });
    expect(hinted.independentSessions).toBe(0);
    expect(hinted.masteredAt).toBeNull();

    // First independent correct attempt on Day 1
    const afterDay1First = applyAttemptToSkillState(hinted, {
      childProfileId,
      skillId,
      attempt: { correct: true, hintsUsed: 0, attemptedAt: day1Morning },
      isReviewEligible: true,
    });
    expect(afterDay1First.independentSessions).toBe(1);
    expect(afterDay1First.masteredAt).toBeNull();

    // Second independent correct attempt on the SAME day does not trigger mastery early
    const afterDay1Second = applyAttemptToSkillState(afterDay1First, {
      childProfileId,
      skillId,
      attempt: { correct: true, hintsUsed: 0, attemptedAt: day1Evening },
      isReviewEligible: true,
    });
    expect(afterDay1Second.independentSessions).toBe(1);
    expect(afterDay1Second.masteredAt).toBeNull();

    // Independent correct attempt on Day 2 achieves mastery and schedules +1 day review
    const afterDay2 = applyAttemptToSkillState(afterDay1Second, {
      childProfileId,
      skillId,
      attempt: { correct: true, hintsUsed: 0, attemptedAt: day2 },
      isReviewEligible: true,
    });
    expect(afterDay2.independentSessions).toBe(2);
    expect(afterDay2.masteredAt).toEqual(day2);
    expect(afterDay2.reviewStage).toBe(0);
    expect(afterDay2.nextReviewAt).toEqual(addDays(day2, 1));
  });

  it("advances spaced review across 1 -> 3 -> 7 -> 21 day intervals and surfaces due reviews", () => {
    const masteryDate = new Date("2026-11-01T04:00:00.000Z");
    let state = applyAttemptToSkillState(
      {
        independentSessions: 1,
        lastMasteredDate: "2026-10-31",
        masteredAt: null,
        reviewStage: 0,
        nextReviewAt: null,
      },
      {
        childProfileId,
        skillId,
        attempt: { correct: true, hintsUsed: 0, attemptedAt: masteryDate },
        isReviewEligible: true,
      },
    );

    // Not due immediately, due after 1 day
    expect(getDueReviewSkills([state], masteryDate)).toHaveLength(0);
    const review1Date = addDays(masteryDate, 1);
    expect(getDueReviewSkills([state], review1Date)).toHaveLength(1);

    // Review 1 (+3 days)
    state = applyAttemptToSkillState(state, {
      childProfileId,
      skillId,
      attempt: { correct: true, hintsUsed: 0, attemptedAt: review1Date },
      isReviewEligible: true,
    });
    expect(state.reviewStage).toBe(1);
    expect(state.nextReviewAt).toEqual(addDays(review1Date, 3));

    // Review 2 (+7 days)
    const review2Date = addDays(review1Date, 3);
    state = applyAttemptToSkillState(state, {
      childProfileId,
      skillId,
      attempt: { correct: true, hintsUsed: 0, attemptedAt: review2Date },
      isReviewEligible: true,
    });
    expect(state.reviewStage).toBe(2);
    expect(state.nextReviewAt).toEqual(addDays(review2Date, 7));

    // Review 3 (+21 days)
    const review3Date = addDays(review2Date, 7);
    state = applyAttemptToSkillState(state, {
      childProfileId,
      skillId,
      attempt: { correct: true, hintsUsed: 0, attemptedAt: review3Date },
      isReviewEligible: true,
    });
    expect(state.reviewStage).toBe(3);
    expect(state.nextReviewAt).toEqual(addDays(review3Date, 21));

    // Missed review gently schedules +1 day without losing mastery
    const missedDate = addDays(review3Date, 21);
    const afterMiss = applyAttemptToSkillState(state, {
      childProfileId,
      skillId,
      attempt: { correct: false, hintsUsed: 0, attemptedAt: missedDate },
      isReviewEligible: true,
    });
    expect(afterMiss.masteredAt).toEqual(masteryDate);
    expect(afterMiss.reviewStage).toBe(0);
    expect(afterMiss.nextReviewAt).toEqual(addDays(missedDate, 1));
  });

  it("computes calm parent summary metrics including mastered skills, practice skills, and minutes", () => {
    const now = new Date("2026-11-23T10:00:00.000Z");
    const attempts: AttemptRecord[] = [
      {
        id: "a1",
        clientEventId: "evt-1",
        childProfileId,
        lessonId: "g1-make-ten",
        lessonVersion: 1,
        stepId: "challenge",
        correct: true,
        hintsUsed: 0,
        misconceptionId: null,
        durationMs: 120_000, // 2 min today
        attemptedAt: new Date("2026-11-23T08:00:00.000Z"),
        createdAt: now,
      },
      {
        id: "a2",
        clientEventId: "evt-2",
        childProfileId,
        lessonId: "g1-06-addition-10",
        lessonVersion: 1,
        stepId: "s1",
        correct: false,
        hintsUsed: 1,
        misconceptionId: null,
        durationMs: 180_000, // 3 min 2 days ago
        attemptedAt: new Date("2026-11-21T08:00:00.000Z"),
        createdAt: now,
      },
    ];
    const skillStates: SkillStateRecord[] = [
      {
        id: "s1",
        childProfileId,
        skillId: "bond-10",
        independentSessions: 2,
        lastMasteredDate: "2026-11-23",
        masteredAt: new Date("2026-11-21T08:00:00.000Z"),
        reviewStage: 0,
        nextReviewAt: new Date("2026-11-22T08:00:00.000Z"), // due now
        updatedAt: now,
      },
    ];
    const lessons = [
      { id: "g1-make-ten", title: { km: "បង្កើតដប់" }, skills: ["bond-10"] },
      { id: "g1-06-addition-10", title: { km: "ការបូកក្នុងរង្វង់ ១០" }, skills: ["add-10"] },
    ];

    const summary = computeParentProgressSummary(attempts, skillStates, lessons, now);
    expect(summary.masteredSkills).toHaveLength(1);
    expect(summary.masteredSkills[0]?.skillId).toBe("bond-10");
    expect(summary.practiceSkills).toHaveLength(1);
    expect(summary.practiceSkills[0]?.skillId).toBe("add-10");
    expect(summary.dueReviewCount).toBe(1);
    expect(summary.minutesToday).toBe(2);
    expect(summary.minutesLast7Days).toBe(5);
    expect(summary.totalAttempts).toBe(2);
    expect(summary.completedLessonIds).toEqual(["g1-make-ten"]);
  });
});
