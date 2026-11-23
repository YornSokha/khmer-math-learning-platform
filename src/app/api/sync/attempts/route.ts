import { NextResponse } from "next/server";
import { z } from "zod";
import { getAllLessons } from "@/lib/content/loader";
import { applyAttemptToSkillState } from "@/lib/mastery/scheduler";
import { evaluateRewards } from "@/lib/rewards/engine";
import { getAuthenticatedParent } from "@/lib/server/auth";
import { getDataStore } from "@/lib/server/db";
import type { CreateAttemptInput } from "@/lib/server/store";

const SyncAttemptItemSchema = z.object({
  clientEventId: z.string().trim().min(1).max(128),
  lessonId: z.string().trim().min(1).max(128),
  lessonVersion: z.number().int().min(1),
  stepId: z.string().trim().min(1).max(128),
  correct: z.boolean(),
  hintsUsed: z.number().int().min(0).max(10).default(0),
  misconceptionId: z.string().max(128).optional().nullable(),
  durationMs: z.number().int().min(0).max(3_600_000).default(0),
  timestamp: z.string().datetime(),
});

const SyncAttemptsBatchSchema = z.object({
  childProfileId: z.string().trim().min(1),
  attempts: z.array(SyncAttemptItemSchema).max(200),
});

export async function POST(request: Request) {
  const store = getDataStore();
  const parent = await getAuthenticatedParent(request, store);
  if (!parent) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const parsed = SyncAttemptsBatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid sync payload",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const { childProfileId, attempts } = parsed.data;
  const child = await store.findChildByIdForParent(parent.id, childProfileId);
  if (!child) {
    return NextResponse.json({ error: "Child profile not found" }, { status: 404 });
  }

  const inputs: CreateAttemptInput[] = attempts.map((item) => ({
    clientEventId: item.clientEventId,
    childProfileId: child.id,
    lessonId: item.lessonId,
    lessonVersion: item.lessonVersion,
    stepId: item.stepId,
    correct: item.correct,
    hintsUsed: item.hintsUsed,
    misconceptionId: item.misconceptionId ?? null,
    durationMs: item.durationMs,
    attemptedAt: new Date(item.timestamp),
  }));

  const { inserted, duplicateCount } = await store.insertAttemptsIdempotent(inputs);

  // Update per-skill mastery only for newly inserted attempts (idempotent)
  const existingStates = await store.listSkillStatesForChild(child.id);
  const stateBySkillId = new Map(existingStates.map((state) => [state.skillId, state]));

  if (inserted.length > 0) {
    const lessonsById = new Map(getAllLessons().map((lesson) => [lesson.id, lesson]));
    const orderedInserted = [...inserted].sort(
      (a, b) => a.attemptedAt.getTime() - b.attemptedAt.getTime(),
    );

    for (const attempt of orderedInserted) {
      const lesson = lessonsById.get(attempt.lessonId);
      if (!lesson) continue;

      const reviewItems = lesson.review?.items ?? [];
      const isReviewEligible = reviewItems.length === 0 || reviewItems.includes(attempt.stepId);

      for (const skillId of lesson.skills) {
        const current = stateBySkillId.get(skillId) ?? null;
        const nextInput = applyAttemptToSkillState(current, {
          childProfileId: child.id,
          skillId,
          attempt: {
            correct: attempt.correct,
            hintsUsed: attempt.hintsUsed,
            attemptedAt: attempt.attemptedAt,
          },
          isReviewEligible,
        });
        const saved = await store.upsertSkillState(nextInput);
        stateBySkillId.set(skillId, saved);
      }
    }
  }

  const updatedStatesList = [...stateBySkillId.values()];
  const allChildAttempts = await store.listAttemptsForChild(child.id);
  const rewardEval = evaluateRewards({
    attempts: allChildAttempts.map((attempt) => ({
      lessonId: attempt.lessonId,
      stepId: attempt.stepId,
      correct: attempt.correct,
      hintsUsed: attempt.hintsUsed,
      timestamp: attempt.attemptedAt,
    })),
    skillStates: updatedStatesList.map((state) => ({
      skillId: state.skillId,
      masteredAt: state.masteredAt,
      reviewStage: state.reviewStage,
    })),
  });

  for (const achievementId of rewardEval.earnedAchievementIds) {
    await store.awardAchievement(child.id, achievementId);
  }
  const persistedAchievements = await store.listAchievementsForChild(child.id);

  const updatedStates = updatedStatesList.map((state) => ({
    skillId: state.skillId,
    independentSessions: state.independentSessions,
    masteredAt: state.masteredAt ? state.masteredAt.toISOString() : null,
    reviewStage: state.reviewStage,
    nextReviewAt: state.nextReviewAt ? state.nextReviewAt.toISOString() : null,
  }));

  return NextResponse.json({
    acceptedCount: inserted.length,
    duplicateCount,
    skillStates: updatedStates,
    achievements: persistedAchievements.map((award) => ({
      achievementId: award.achievementId,
      awardedAt: award.awardedAt.toISOString(),
    })),
  });
}
