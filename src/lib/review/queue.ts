import type { ActivityStep, Lesson } from "@/lib/content/schema";
import {
  applyAttemptToSkillState,
  getDueReviewSkills,
  toUtcDateKey,
} from "@/lib/mastery/scheduler";
import type { StoredAttempt } from "@/lib/storage/progress-db";

export interface LocalSkillState {
  skillId: string;
  independentSessions: number;
  lastMasteredDate: string | null;
  masteredAt: Date | null;
  reviewStage: number;
  nextReviewAt: Date | null;
}

export interface ReviewLessonMeta {
  id: string;
  skills: string[];
  review?: { items: string[] };
  reviewItemIds?: string[];
}

export interface DueReviewCard {
  id: string;
  skillId: string;
  lessonId: string;
  lessonVersion: number;
  lessonTitleKm: string;
  step: ActivityStep;
  seed: number;
  reviewStage: number;
}

export interface DailyChallengeItem {
  dateKey: string;
  lessonId: string;
  lessonVersion: number;
  lessonTitleKm: string;
  step: ActivityStep;
  seed: number;
}

export type DailyChallengeStatus = "completed" | "skipped";

export const DAILY_CHALLENGE_STORAGE_KEY = "khmer-math:daily-challenge:v1";
const MAX_DAILY_HISTORY_ENTRIES = 30;

export function hashString(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0 || 1;
}

export function computeLocalSkillStates(
  attempts: readonly Pick<
    StoredAttempt,
    "lessonId" | "stepId" | "correct" | "hintsUsed" | "timestamp"
  >[],
  lessons: readonly ReviewLessonMeta[],
): LocalSkillState[] {
  const lessonById = new Map(lessons.map((lesson) => [lesson.id, lesson]));
  const stateBySkillId = new Map<string, LocalSkillState>();

  const ordered = [...attempts]
    .map((attempt) => ({
      attempt,
      atMs: Date.parse(attempt.timestamp),
    }))
    .filter((entry) => Number.isFinite(entry.atMs))
    .sort((a, b) => a.atMs - b.atMs);

  for (const { attempt, atMs } of ordered) {
    const lesson = lessonById.get(attempt.lessonId);
    if (!lesson) continue;

    const reviewItems = lesson.review?.items ?? lesson.reviewItemIds ?? [];
    const isReviewEligible = reviewItems.length === 0 || reviewItems.includes(attempt.stepId);
    const attemptedAt = new Date(atMs);

    for (const skillId of lesson.skills) {
      const current = stateBySkillId.get(skillId) ?? null;
      const next = applyAttemptToSkillState(current, {
        childProfileId: "local",
        skillId,
        attempt: {
          correct: attempt.correct,
          hintsUsed: attempt.hintsUsed,
          attemptedAt,
        },
        isReviewEligible,
      });

      stateBySkillId.set(skillId, {
        skillId,
        independentSessions: next.independentSessions,
        lastMasteredDate: next.lastMasteredDate,
        masteredAt: next.masteredAt,
        reviewStage: next.reviewStage,
        nextReviewAt: next.nextReviewAt,
      });
    }
  }

  return [...stateBySkillId.values()];
}

function getReviewActivitySteps(lesson: Lesson): ActivityStep[] {
  const reviewSet = new Set(lesson.review.items);
  const activitySteps = lesson.steps.filter(
    (step): step is ActivityStep => step.type === "activity",
  );
  const preferred = activitySteps.filter((step) => reviewSet.has(step.id));
  return preferred.length > 0 ? preferred : activitySteps;
}

export function buildDueReviewQueue(
  lessons: readonly Lesson[],
  skillStates: readonly LocalSkillState[],
  now: Date = new Date(),
  maxItems = 5,
): DueReviewCard[] {
  const dueSkills = getDueReviewSkills(skillStates, now).slice(0, Math.max(0, maxItems));
  if (dueSkills.length === 0) {
    return [];
  }

  const dateKey = toUtcDateKey(now);
  const cards: DueReviewCard[] = [];

  for (const state of dueSkills) {
    const lesson = lessons.find((item) => item.skills.includes(state.skillId));
    if (!lesson) continue;

    const candidates = getReviewActivitySteps(lesson);
    if (candidates.length === 0) continue;

    const pickIdx =
      hashString(`${dateKey}:${state.skillId}:${state.reviewStage}`) % candidates.length;
    const step = candidates[pickIdx]!;
    const seed = hashString(`review:${dateKey}:${state.skillId}:${step.id}:${state.reviewStage}`);

    cards.push({
      id: `${state.skillId}:${step.id}`,
      skillId: state.skillId,
      lessonId: lesson.id,
      lessonVersion: lesson.version,
      lessonTitleKm: lesson.title.km,
      step,
      seed,
      reviewStage: state.reviewStage,
    });
  }

  return cards;
}

export function selectDailyChallenge(
  lessons: readonly Lesson[],
  dateKey: string = toUtcDateKey(new Date()),
  completedLessonIds: ReadonlySet<string> = new Set(),
): DailyChallengeItem | null {
  if (lessons.length === 0) {
    return null;
  }

  const sorted = [...lessons].sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

  let eligibleLessons: Lesson[];
  if (completedLessonIds.size > 0) {
    let highestCompletedOrder = 0;
    for (const lesson of sorted) {
      if (completedLessonIds.has(lesson.id)) {
        highestCompletedOrder = Math.max(highestCompletedOrder, lesson.order ?? 0);
      }
    }
    eligibleLessons = sorted.filter(
      (lesson) =>
        completedLessonIds.has(lesson.id) || (lesson.order ?? 99) <= highestCompletedOrder + 2,
    );
  } else {
    eligibleLessons = sorted.filter((lesson) => (lesson.order ?? 99) <= 6);
  }

  if (eligibleLessons.length === 0) {
    eligibleLessons = sorted;
  }

  const candidates: Array<{ lesson: Lesson; step: ActivityStep }> = [];
  for (const lesson of eligibleLessons) {
    for (const step of getReviewActivitySteps(lesson)) {
      candidates.push({ lesson, step });
    }
  }

  if (candidates.length === 0) {
    return null;
  }

  const pickIdx = hashString(`daily-item:${dateKey}`) % candidates.length;
  const picked = candidates[pickIdx]!;
  const seed = hashString(`daily-seed:${dateKey}:${picked.lesson.id}:${picked.step.id}`);

  return {
    dateKey,
    lessonId: picked.lesson.id,
    lessonVersion: picked.lesson.version,
    lessonTitleKm: picked.lesson.title.km,
    step: picked.step,
    seed,
  };
}

export function loadDailyChallengeHistory(): Record<string, DailyChallengeStatus> {
  if (typeof window === "undefined") {
    return {};
  }
  try {
    const raw = window.localStorage.getItem(DAILY_CHALLENGE_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    const result: Record<string, DailyChallengeStatus> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(key) && (value === "completed" || value === "skipped")) {
        result[key] = value;
      }
    }
    return result;
  } catch {
    return {};
  }
}

export function loadDailyChallengeStatus(
  dateKey: string = toUtcDateKey(new Date()),
): DailyChallengeStatus | null {
  const history = loadDailyChallengeHistory();
  return history[dateKey] ?? null;
}

export function saveDailyChallengeStatus(
  status: DailyChallengeStatus,
  dateKey: string = toUtcDateKey(new Date()),
): void {
  if (typeof window === "undefined") return;
  try {
    const history = loadDailyChallengeHistory();
    history[dateKey] = status;
    const keys = Object.keys(history).sort().slice(-MAX_DAILY_HISTORY_ENTRIES);
    const pruned: Record<string, DailyChallengeStatus> = {};
    for (const key of keys) {
      pruned[key] = history[key]!;
    }
    window.localStorage.setItem(DAILY_CHALLENGE_STORAGE_KEY, JSON.stringify(pruned));
  } catch {
    // Ignore storage errors in restricted environments.
  }
}

export function clearDailyChallengeStatus(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(DAILY_CHALLENGE_STORAGE_KEY);
  } catch {
    // Ignore storage errors.
  }
}
