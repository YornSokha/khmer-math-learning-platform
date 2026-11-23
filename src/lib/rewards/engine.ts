import { addDays, toUtcDateKey } from "@/lib/mastery/scheduler";
import type { DailyChallengeStatus } from "@/lib/review/queue";

export const XP_PER_CORRECT_ATTEMPT = 10;
export const XP_PER_FIXED_MISTAKE = 5;
export const XP_PER_COMPLETED_LESSON = 15;
export const XP_PER_DAILY_CHALLENGE = 15;

export type AchievementId =
  "first-lesson" | "mistake-fixer" | "master-bonds-10" | "review-champion" | "calm-three-days";

export interface AchievementDefinition {
  id: AchievementId;
  icon: string;
  titleKm: string;
  descriptionKm: string;
  titleEn: string;
  descriptionEn: string;
}

export const ACHIEVEMENT_CATALOG: readonly AchievementDefinition[] = [
  {
    id: "first-lesson",
    icon: "🌱",
    titleKm: "ជំហានដំបូង",
    descriptionKm: "បានបញ្ចប់មេរៀនដំបូង",
    titleEn: "First Step",
    descriptionEn: "Completed your first lesson",
  },
  {
    id: "mistake-fixer",
    icon: "🔧",
    titleKm: "អ្នកកែកំហុសពូកែ",
    descriptionKm: "បានកែកំហុសចំនួន ៣ ដង",
    titleEn: "Mistake Fixer",
    descriptionEn: "Fixed 3 mistakes through practice",
  },
  {
    id: "master-bonds-10",
    icon: "⭐",
    titleKm: "ជំនាញលេខដល់ ១០",
    descriptionKm: "បានចេះជំនាញ ឬបញ្ចប់មេរៀនបង្កើតដប់",
    titleEn: "Numbers to 10 Master",
    descriptionEn: "Mastered a skill or completed Make 10",
  },
  {
    id: "review-champion",
    icon: "🔁",
    titleKm: "អ្នករំលឹកស្មោះត្រង់",
    descriptionKm: "បានរំលឹកជំនាញដែលបានចេះ",
    titleEn: "Spaced Reviewer",
    descriptionEn: "Completed a spaced review item",
  },
  {
    id: "calm-three-days",
    icon: "☀️",
    titleKm: "រៀនស្ងប់ស្ងាត់ ៣ ថ្ងៃ",
    descriptionKm: "បានរៀនចំនួន ៣ ថ្ងៃក្នុងសប្តាហ៍នេះ",
    titleEn: "3 Calm Learning Days",
    descriptionEn: "Learned on 3 different days this week",
  },
] as const;

export interface RewardAttemptInput {
  lessonId: string;
  stepId: string;
  correct: boolean;
  hintsUsed: number;
  timestamp: string | Date;
}

export interface RewardCompletionInput {
  lessonId: string;
  fixedMistakes?: number;
  completedAt: string | Date;
}

export interface RewardSkillStateInput {
  skillId: string;
  masteredAt: Date | string | null;
  reviewStage: number;
}

export interface EvaluateRewardsInput {
  attempts: readonly RewardAttemptInput[];
  completions?: readonly RewardCompletionInput[];
  skillStates?: readonly RewardSkillStateInput[];
  dailyChallengeHistory?: Record<string, DailyChallengeStatus>;
  now?: Date;
}

export interface EvaluatedAchievement extends AchievementDefinition {
  earned: boolean;
}

export interface RewardSummary {
  totalXp: number;
  daysLearnedThisWeek: number;
  activeWeekDateKeys: string[];
  fixedMistakes: number;
  completedLessonsCount: number;
  earnedAchievementIds: AchievementId[];
  achievements: EvaluatedAchievement[];
}

function toDate(value: string | Date): Date | null {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function countFixedMistakes(
  attempts: readonly RewardAttemptInput[],
  completions: readonly RewardCompletionInput[] = [],
): number {
  const ordered = attempts
    .map((attempt) => ({ attempt, date: toDate(attempt.timestamp) }))
    .filter((entry): entry is { attempt: RewardAttemptInput; date: Date } => entry.date !== null)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const hadWrongByStep = new Set<string>();
  let fixedFromAttempts = 0;

  for (const { attempt } of ordered) {
    const key = `${attempt.lessonId}::${attempt.stepId}`;
    if (!attempt.correct) {
      hadWrongByStep.add(key);
    } else if (hadWrongByStep.has(key)) {
      fixedFromAttempts += 1;
      hadWrongByStep.delete(key);
    }
  }

  const fixedFromCompletions = completions.reduce(
    (sum, item) => sum + Math.max(0, item.fixedMistakes ?? 0),
    0,
  );

  return Math.max(fixedFromAttempts, fixedFromCompletions);
}

export function computeDaysLearnedThisWeek(
  attempts: readonly RewardAttemptInput[],
  completions: readonly RewardCompletionInput[] = [],
  now: Date = new Date(),
): { daysLearnedThisWeek: number; activeWeekDateKeys: string[] } {
  const windowKeys = new Set<string>();
  for (let offset = 0; offset < 7; offset += 1) {
    windowKeys.add(toUtcDateKey(addDays(now, -offset)));
  }

  const activeSet = new Set<string>();
  for (const attempt of attempts) {
    const date = toDate(attempt.timestamp);
    if (!date) continue;
    const key = toUtcDateKey(date);
    if (windowKeys.has(key)) {
      activeSet.add(key);
    }
  }

  for (const completion of completions) {
    const date = toDate(completion.completedAt);
    if (!date) continue;
    const key = toUtcDateKey(date);
    if (windowKeys.has(key)) {
      activeSet.add(key);
    }
  }

  const activeWeekDateKeys = [...activeSet].sort();
  return {
    daysLearnedThisWeek: activeWeekDateKeys.length,
    activeWeekDateKeys,
  };
}

/**
 * Pure anti-addictive rewards evaluator:
 * - XP comes ONLY from learning actions (correct attempts, fixing mistakes, completing lessons, daily challenges).
 * - Time spent (durationMs) is intentionally excluded and has zero effect on XP.
 * - Tracks "days learned this week" (0..7) with automatic rest days and zero loss-framed streak penalties.
 */
export function evaluateRewards(input: EvaluateRewardsInput): RewardSummary {
  const {
    attempts,
    completions = [],
    skillStates = [],
    dailyChallengeHistory = {},
    now = new Date(),
  } = input;

  const correctAttempts = attempts.filter((attempt) => attempt.correct).length;
  const fixedMistakes = countFixedMistakes(attempts, completions);

  const completedLessonSet = new Set<string>();
  for (const completion of completions) {
    completedLessonSet.add(completion.lessonId);
  }
  for (const attempt of attempts) {
    if (attempt.correct) {
      completedLessonSet.add(attempt.lessonId);
    }
  }

  const completedDailyChallenges = Object.values(dailyChallengeHistory).filter(
    (status) => status === "completed",
  ).length;

  const totalXp =
    correctAttempts * XP_PER_CORRECT_ATTEMPT +
    fixedMistakes * XP_PER_FIXED_MISTAKE +
    completedLessonSet.size * XP_PER_COMPLETED_LESSON +
    completedDailyChallenges * XP_PER_DAILY_CHALLENGE;

  const { daysLearnedThisWeek, activeWeekDateKeys } = computeDaysLearnedThisWeek(
    attempts,
    completions,
    now,
  );

  const hasMasteredSkill = skillStates.some((state) => state.masteredAt !== null);
  const hasCompletedReview = skillStates.some((state) => state.reviewStage >= 1);

  const earnedMap: Record<AchievementId, boolean> = {
    "first-lesson": completedLessonSet.size >= 1,
    "mistake-fixer": fixedMistakes >= 3,
    "master-bonds-10": hasMasteredSkill || completedLessonSet.has("g1-make-ten"),
    "review-champion": hasCompletedReview,
    "calm-three-days": daysLearnedThisWeek >= 3,
  };

  const achievements: EvaluatedAchievement[] = ACHIEVEMENT_CATALOG.map((def) => ({
    ...def,
    earned: earnedMap[def.id],
  }));

  const earnedAchievementIds = achievements.filter((item) => item.earned).map((item) => item.id);

  return {
    totalXp,
    daysLearnedThisWeek,
    activeWeekDateKeys,
    fixedMistakes,
    completedLessonsCount: completedLessonSet.size,
    earnedAchievementIds,
    achievements,
  };
}

export function getAchievementDefinition(id: string): AchievementDefinition | undefined {
  return ACHIEVEMENT_CATALOG.find((item) => item.id === id);
}
