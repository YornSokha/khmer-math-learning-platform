import { NextResponse } from "next/server";
import { getAllLessons } from "@/lib/content/loader";
import { computeParentProgressSummary } from "@/lib/mastery/scheduler";
import { evaluateRewards } from "@/lib/rewards/engine";
import { getAuthenticatedParent } from "@/lib/server/auth";
import { getDataStore } from "@/lib/server/db";
import { toPublicChildProfile } from "@/lib/server/store";

interface ProgressRouteContext {
  params: Promise<{ childId: string }>;
}

export async function GET(request: Request, context: ProgressRouteContext) {
  const store = getDataStore();
  const parent = await getAuthenticatedParent(request, store);
  if (!parent) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { childId } = await context.params;
  const child = await store.findChildByIdForParent(parent.id, childId);
  if (!child) {
    return NextResponse.json({ error: "Child profile not found" }, { status: 404 });
  }

  const [attempts, skillStates, achievements] = await Promise.all([
    store.listAttemptsForChild(child.id),
    store.listSkillStatesForChild(child.id),
    store.listAchievementsForChild(child.id),
  ]);

  const lessons = getAllLessons();
  const summary = computeParentProgressSummary(attempts, skillStates, lessons);
  const rewardEval = evaluateRewards({
    attempts: attempts.map((attempt) => ({
      lessonId: attempt.lessonId,
      stepId: attempt.stepId,
      correct: attempt.correct,
      hintsUsed: attempt.hintsUsed,
      timestamp: attempt.attemptedAt,
    })),
    skillStates: skillStates.map((state) => ({
      skillId: state.skillId,
      masteredAt: state.masteredAt,
      reviewStage: state.reviewStage,
    })),
  });

  return NextResponse.json({
    child: toPublicChildProfile(child),
    summary,
    rewards: {
      totalXp: rewardEval.totalXp,
      daysLearnedThisWeek: rewardEval.daysLearnedThisWeek,
      earnedAchievementIds: rewardEval.earnedAchievementIds,
    },
    achievements: achievements.map((award) => ({
      achievementId: award.achievementId,
      awardedAt: award.awardedAt.toISOString(),
    })),
    skillStates: skillStates.map((state) => ({
      skillId: state.skillId,
      independentSessions: state.independentSessions,
      masteredAt: state.masteredAt ? state.masteredAt.toISOString() : null,
      reviewStage: state.reviewStage,
      nextReviewAt: state.nextReviewAt ? state.nextReviewAt.toISOString() : null,
    })),
  });
}
