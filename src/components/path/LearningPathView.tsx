"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormattedNumber } from "@/components/khmer/FormattedNumber";
import { NumeralToggle } from "@/components/khmer/NumeralToggle";
import { ParentGateModal } from "@/components/parent/ParentGateModal";
import { CalmRewardsSummary } from "@/components/rewards/CalmRewardsSummary";
import { t } from "@/lib/i18n/messages";
import { getDueReviewSkills, toUtcDateKey } from "@/lib/mastery/scheduler";
import {
  computeLearningPath,
  loadPlacementResult,
  type PathLessonSummary,
} from "@/lib/path/progression";
import {
  computeLocalSkillStates,
  loadDailyChallengeHistory,
  loadDailyChallengeStatus,
  saveDailyChallengeStatus,
  type DailyChallengeStatus,
} from "@/lib/review/queue";
import { evaluateRewards, type RewardSummary } from "@/lib/rewards/engine";
import { getAllAttempts, getAllLessonCompletions } from "@/lib/storage/progress-db";

export interface LearningPathViewProps {
  lessons: PathLessonSummary[];
}

export function LearningPathView({ lessons }: LearningPathViewProps) {
  const router = useRouter();
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [placementStartOrder, setPlacementStartOrder] = useState(1);
  const [dueReviewCount, setDueReviewCount] = useState(0);
  const [dailyStatus, setDailyStatus] = useState<DailyChallengeStatus | null>(null);
  const [rewards, setRewards] = useState<RewardSummary>(() => evaluateRewards({ attempts: [] }));
  const [parentGateOpen, setParentGateOpen] = useState(false);
  const todayKey = useMemo(() => toUtcDateKey(new Date()), []);

  useEffect(() => {
    let active = true;
    const savedPlacement = loadPlacementResult();
    const savedDaily = loadDailyChallengeStatus(todayKey);
    const dailyHistory = loadDailyChallengeHistory();

    void Promise.all([getAllLessonCompletions(), getAllAttempts()]).then(
      ([completions, attempts]) => {
        if (!active) return;
        if (savedPlacement) {
          setPlacementStartOrder(savedPlacement.recommendedStartOrder);
        }
        setCompletedIds(completions.map((item) => item.lessonId));
        setDailyStatus(savedDaily);

        const localSkillStates = computeLocalSkillStates(attempts, lessons);
        setDueReviewCount(getDueReviewSkills(localSkillStates, new Date()).length);
        setRewards(
          evaluateRewards({
            attempts,
            completions,
            skillStates: localSkillStates,
            dailyChallengeHistory: dailyHistory,
            now: new Date(),
          }),
        );
      },
    );

    return () => {
      active = false;
    };
  }, [lessons, todayKey]);

  const handleSkipDailyChallenge = () => {
    saveDailyChallengeStatus("skipped", todayKey);
    setDailyStatus("skipped");
  };

  const path = useMemo(
    () => computeLearningPath(lessons, new Set(completedIds), placementStartOrder),
    [lessons, completedIds, placementStartOrder],
  );

  return (
    <main
      id="main-content"
      className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 px-4 py-6 sm:px-6"
    >
      <header className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Link
            href="/"
            className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-xl border border-border bg-surface-card px-4 py-2 text-khmer-body font-semibold leading-[1.75] text-ink overflow-visible hover:bg-accent-soft"
          >
            ← {t("navHome")}
          </Link>
          <NumeralToggle />
        </div>

        <div className="space-y-1">
          <h1 className="text-khmer-heading font-bold text-ink">{t("pathTitle")}</h1>
          <p className="text-khmer-body text-ink-muted">{t("pathSubtitle")}</p>
        </div>
      </header>

      {path.nextLesson && (
        <section
          data-testid="next-lesson-card"
          data-lesson-id={path.nextLesson.id}
          className="space-y-4 rounded-2xl border-2 border-accent bg-accent-soft p-5 shadow-xs"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-accent">{t("pathNextLessonLabel")}</p>
            <span className="rounded-full bg-surface-card px-3 py-1 text-sm font-semibold text-ink">
              {t("pathMasteredSummary")}: <FormattedNumber value={path.masteredCount} /> /{" "}
              <FormattedNumber value={path.nodes.length} />
            </span>
          </div>

          <div className="space-y-1">
            <h2 className="text-khmer-instruction font-bold text-ink">
              <FormattedNumber value={path.nextLesson.order} />. {path.nextLesson.titleKm}
            </h2>
            <p className="text-sm text-ink-muted">
              {path.nextLesson.moeysRef.join(", ")} · ~
              <FormattedNumber value={path.nextLesson.estimatedMinutes} /> {t("pathMinutesSuffix")}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/lessons/${path.nextLesson.id}`}
              data-testid="next-lesson-start-link"
              className="inline-flex min-h-touch flex-1 items-center justify-center rounded-xl bg-accent px-5 py-3 text-khmer-body font-semibold leading-[1.75] text-white overflow-visible transition-colors hover:bg-accent-strong"
            >
              {t("pathStartLessonButton")}
            </Link>
            <Link
              href="/placement"
              data-testid="retake-placement-link"
              className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-xl border border-border bg-surface-card px-4 py-3 text-khmer-body font-semibold leading-[1.75] text-ink overflow-visible hover:bg-surface"
            >
              {t("placementRetake")}
            </Link>
          </div>
        </section>
      )}

      <section
        aria-label={t("dailyChallengeCardTitle")}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
      >
        {dueReviewCount > 0 && (
          <article
            data-testid="todays-review-card"
            data-due-count={dueReviewCount}
            className="flex flex-col justify-between gap-3 rounded-2xl border-2 border-emerald-400 bg-emerald-50/60 p-4 shadow-xs"
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-khmer-body font-bold text-emerald-950">
                  {t("reviewCardTitle")}
                </h2>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-sm font-bold text-emerald-900">
                  <FormattedNumber value={dueReviewCount} />
                </span>
              </div>
              <p className="text-sm text-emerald-900">{t("reviewCardSubtitle")}</p>
            </div>

            <Link
              href="/review"
              data-testid="todays-review-link"
              className="inline-flex min-h-touch items-center justify-center rounded-xl bg-emerald-700 px-4 py-2 text-khmer-body font-semibold leading-[1.75] text-white overflow-visible transition-colors hover:bg-emerald-800"
            >
              {t("reviewStartButton")}
            </Link>
          </article>
        )}

        <article
          data-testid="daily-challenge-dashboard-card"
          data-daily-status={dailyStatus ?? "open"}
          className={`flex flex-col justify-between gap-3 rounded-2xl border border-border bg-surface-card p-4 shadow-xs ${
            dueReviewCount === 0 ? "sm:col-span-2" : ""
          }`}
        >
          <div className="space-y-1">
            <h2 className="text-khmer-body font-bold text-ink">{t("dailyChallengeCardTitle")}</h2>
            <p className="text-sm text-ink-muted">{t("dailyChallengeCardSubtitle")}</p>
          </div>

          {dailyStatus === "completed" ? (
            <p
              data-testid="daily-challenge-status-badge"
              className="rounded-xl bg-emerald-50 px-3.5 py-2 text-sm font-semibold text-emerald-900"
            >
              ✓ {t("dailyChallengeCompletedBadge")}
            </p>
          ) : dailyStatus === "skipped" ? (
            <p
              data-testid="daily-challenge-status-badge"
              className="rounded-xl bg-surface px-3.5 py-2 text-sm font-medium text-ink-muted"
            >
              {t("dailyChallengeSkippedBadge")}
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Link
                href="/daily-challenge"
                data-testid="daily-challenge-start-link"
                className="inline-flex min-h-touch flex-1 items-center justify-center rounded-xl bg-accent px-4 py-2 text-khmer-body font-semibold leading-[1.75] text-white overflow-visible transition-colors hover:bg-accent-strong"
              >
                {t("dailyChallengeStartButton")}
              </Link>
              <button
                type="button"
                data-testid="daily-challenge-dashboard-skip"
                onClick={handleSkipDailyChallenge}
                className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold leading-[1.75] text-ink-muted overflow-visible hover:bg-accent-soft hover:text-ink"
              >
                {t("dailyChallengeSkipButton")}
              </button>
            </div>
          )}
        </article>
      </section>

      <CalmRewardsSummary rewards={rewards} />

      <section aria-label={t("pathTitle")} className="space-y-3">
        {path.nodes.map((node) => {
          const isLocked = node.state === "locked";
          const isMastered = node.state === "mastered";

          return (
            <article
              key={node.id}
              data-testid={`path-node-${node.id}`}
              data-lesson-state={node.state}
              className={`flex flex-col gap-3 rounded-2xl border p-4 shadow-2xs sm:flex-row sm:items-center sm:justify-between ${
                isMastered
                  ? "border-emerald-300 bg-emerald-50/50"
                  : isLocked
                    ? "border-border bg-surface opacity-75"
                    : node.isRecommendedNext
                      ? "border-2 border-accent bg-surface-card"
                      : "border-border bg-surface-card"
              }`}
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-accent-soft text-sm font-bold text-accent">
                    <FormattedNumber value={node.order} />
                  </span>
                  <h3 className="text-khmer-body font-bold text-ink">{node.titleKm}</h3>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm text-ink-muted">
                  <span>{node.moeysRef.join(", ")}</span>
                  <span>·</span>
                  <span>
                    ~<FormattedNumber value={node.estimatedMinutes} /> {t("pathMinutesSuffix")}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      isMastered
                        ? "bg-emerald-100 text-emerald-900"
                        : isLocked
                          ? "bg-slate-200 text-slate-700"
                          : "bg-accent-soft text-accent"
                    }`}
                  >
                    {isMastered
                      ? t("pathStateMastered")
                      : isLocked
                        ? t("pathStateLocked")
                        : t("pathStateAvailable")}
                  </span>
                </div>
              </div>

              {isLocked ? (
                <span
                  aria-disabled="true"
                  className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-xl border border-border bg-surface px-4 py-2 text-khmer-body font-semibold text-ink-muted"
                >
                  🔒 {t("pathStateLocked")}
                </span>
              ) : (
                <Link
                  href={`/lessons/${node.id}`}
                  data-testid={`path-open-${node.id}`}
                  className={`inline-flex min-h-touch min-w-touch items-center justify-center rounded-xl px-4 py-2 text-khmer-body font-semibold leading-[1.75] overflow-visible transition-colors ${
                    node.isRecommendedNext
                      ? "bg-accent text-white hover:bg-accent-strong"
                      : "border border-border bg-surface-card text-ink hover:bg-accent-soft"
                  }`}
                >
                  {isMastered ? t("pathReplayButton") : t("pathStartLessonButton")}
                </Link>
              )}
            </article>
          );
        })}
      </section>
      <footer className="flex justify-center pt-2 pb-4">
        <button
          type="button"
          data-testid="learn-parent-gate-button"
          onClick={() => setParentGateOpen(true)}
          className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-xl border border-border bg-surface-card px-4 py-2 text-sm font-semibold leading-[1.75] text-ink-muted overflow-visible hover:bg-accent-soft hover:text-ink"
        >
          🔒 {t("parentGateOpenButton")}
        </button>
      </footer>

      <ParentGateModal
        open={parentGateOpen}
        onClose={() => setParentGateOpen(false)}
        onUnlock={() => {
          setParentGateOpen(false);
          router.push("/parent");
        }}
      />
    </main>
  );
}
