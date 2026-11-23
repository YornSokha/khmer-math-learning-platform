import type { Lesson } from "@/lib/content/schema";
import type { AttemptRecord, SkillStateRecord, UpsertSkillStateInput } from "@/lib/server/store";

export const REVIEW_INTERVAL_DAYS = [1, 3, 7, 21] as const;
export const SESSIONS_REQUIRED_FOR_MASTERY = 2;
const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_STEP_DURATION_MS = 10 * 60 * 1000;

export function toUtcDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}

export interface AttemptSkillEvaluationInput {
  childProfileId: string;
  skillId: string;
  attempt: {
    correct: boolean;
    hintsUsed: number;
    attemptedAt: Date;
  };
  isReviewEligible: boolean;
}

export function applyAttemptToSkillState(
  existing: Pick<
    SkillStateRecord,
    "independentSessions" | "lastMasteredDate" | "masteredAt" | "reviewStage" | "nextReviewAt"
  > | null,
  input: AttemptSkillEvaluationInput,
): UpsertSkillStateInput {
  const { childProfileId, skillId, attempt, isReviewEligible } = input;
  const sessionDate = toUtcDateKey(attempt.attemptedAt);
  const independentCorrect = attempt.correct && attempt.hintsUsed === 0 && isReviewEligible;

  const base: UpsertSkillStateInput = {
    childProfileId,
    skillId,
    independentSessions: existing?.independentSessions ?? 0,
    lastMasteredDate: existing?.lastMasteredDate ?? null,
    masteredAt: existing?.masteredAt ?? null,
    reviewStage: existing?.reviewStage ?? 0,
    nextReviewAt: existing?.nextReviewAt ?? null,
  };

  if (base.masteredAt === null) {
    if (!independentCorrect) {
      return base;
    }

    // Two independent correct challenges must occur in separate calendar sessions
    if (base.lastMasteredDate === sessionDate) {
      return base;
    }

    const nextSessions = base.independentSessions + 1;
    if (nextSessions >= SESSIONS_REQUIRED_FOR_MASTERY) {
      return {
        ...base,
        independentSessions: nextSessions,
        lastMasteredDate: sessionDate,
        masteredAt: attempt.attemptedAt,
        reviewStage: 0,
        nextReviewAt: addDays(attempt.attemptedAt, REVIEW_INTERVAL_DAYS[0]),
      };
    }

    return {
      ...base,
      independentSessions: nextSessions,
      lastMasteredDate: sessionDate,
    };
  }

  // Already mastered: advance spaced review schedule when due and answered independently
  if (independentCorrect) {
    const isDue =
      base.nextReviewAt === null || attempt.attemptedAt.getTime() >= base.nextReviewAt.getTime();
    if (!isDue) {
      return base;
    }

    const nextStage = Math.min(base.reviewStage + 1, REVIEW_INTERVAL_DAYS.length - 1);
    const intervalDays = REVIEW_INTERVAL_DAYS[nextStage] ?? REVIEW_INTERVAL_DAYS[0];
    return {
      ...base,
      lastMasteredDate: sessionDate,
      reviewStage: nextStage,
      nextReviewAt: addDays(attempt.attemptedAt, intervalDays),
    };
  }

  // Incorrect attempt on a mastered skill: gently bring back in 1 day without penalty
  if (!attempt.correct) {
    return {
      ...base,
      reviewStage: 0,
      nextReviewAt: addDays(attempt.attemptedAt, REVIEW_INTERVAL_DAYS[0]),
    };
  }

  return base;
}

export function getDueReviewSkills<T extends Pick<SkillStateRecord, "masteredAt" | "nextReviewAt">>(
  states: readonly T[],
  now: Date = new Date(),
): T[] {
  const nowMs = now.getTime();
  return states
    .filter(
      (state) =>
        state.masteredAt !== null &&
        state.nextReviewAt !== null &&
        state.nextReviewAt.getTime() <= nowMs,
    )
    .sort((a, b) => a.nextReviewAt!.getTime() - b.nextReviewAt!.getTime());
}

export interface ParentSkillSummaryItem {
  skillId: string;
  lessonTitleKm: string;
  masteredAt: string | null;
  nextReviewAt: string | null;
  independentSessions: number;
}

export interface ParentProgressSummary {
  masteredSkills: ParentSkillSummaryItem[];
  practiceSkills: ParentSkillSummaryItem[];
  dueReviewCount: number;
  minutesToday: number;
  minutesLast7Days: number;
  totalAttempts: number;
  completedLessonIds: string[];
}

function durationMsToWholeMinutes(totalMs: number): number {
  if (totalMs <= 0) {
    return 0;
  }
  return Math.max(1, Math.round(totalMs / 60_000));
}

export function computeParentProgressSummary(
  attempts: readonly AttemptRecord[],
  skillStates: readonly SkillStateRecord[],
  lessons: readonly Pick<Lesson, "id" | "title" | "skills">[],
  now: Date = new Date(),
): ParentProgressSummary {
  const lessonById = new Map(lessons.map((lesson) => [lesson.id, lesson]));
  const skillTitleById = new Map<string, string>();
  for (const lesson of lessons) {
    for (const skillId of lesson.skills) {
      if (!skillTitleById.has(skillId)) {
        skillTitleById.set(skillId, lesson.title.km);
      }
    }
  }

  const todayKey = toUtcDateKey(now);
  const sevenDaysAgoMs = now.getTime() - 7 * DAY_MS;

  let msToday = 0;
  let msLast7Days = 0;
  const completedLessonSet = new Set<string>();
  const attemptedSkillIds = new Set<string>();

  for (const attempt of attempts) {
    const clampedMs = Math.max(0, Math.min(attempt.durationMs, MAX_STEP_DURATION_MS));
    if (toUtcDateKey(attempt.attemptedAt) === todayKey) {
      msToday += clampedMs;
    }
    if (attempt.attemptedAt.getTime() >= sevenDaysAgoMs) {
      msLast7Days += clampedMs;
    }
    if (attempt.correct) {
      completedLessonSet.add(attempt.lessonId);
    }

    const lesson = lessonById.get(attempt.lessonId);
    if (lesson) {
      for (const skillId of lesson.skills) {
        attemptedSkillIds.add(skillId);
      }
    }
  }

  const stateBySkillId = new Map(skillStates.map((state) => [state.skillId, state]));
  const masteredSkills: ParentSkillSummaryItem[] = [];
  const practiceSkills: ParentSkillSummaryItem[] = [];

  for (const state of skillStates) {
    const item: ParentSkillSummaryItem = {
      skillId: state.skillId,
      lessonTitleKm: skillTitleById.get(state.skillId) ?? state.skillId,
      masteredAt: state.masteredAt ? state.masteredAt.toISOString() : null,
      nextReviewAt: state.nextReviewAt ? state.nextReviewAt.toISOString() : null,
      independentSessions: state.independentSessions,
    };

    if (state.masteredAt) {
      masteredSkills.push(item);
    } else {
      practiceSkills.push(item);
    }
  }

  for (const skillId of attemptedSkillIds) {
    if (!stateBySkillId.has(skillId)) {
      practiceSkills.push({
        skillId,
        lessonTitleKm: skillTitleById.get(skillId) ?? skillId,
        masteredAt: null,
        nextReviewAt: null,
        independentSessions: 0,
      });
    }
  }

  return {
    masteredSkills,
    practiceSkills,
    dueReviewCount: getDueReviewSkills(skillStates, now).length,
    minutesToday: durationMsToWholeMinutes(msToday),
    minutesLast7Days: durationMsToWholeMinutes(msLast7Days),
    totalAttempts: attempts.length,
    completedLessonIds: [...completedLessonSet],
  };
}
