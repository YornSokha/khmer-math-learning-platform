"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FormattedNumber } from "@/components/khmer/FormattedNumber";
import { NumeralToggle } from "@/components/khmer/NumeralToggle";
import { t } from "@/lib/i18n/messages";
import {
  computeLearningPath,
  loadPlacementResult,
  type PathLessonSummary,
} from "@/lib/path/progression";
import { getAllLessonCompletions } from "@/lib/storage/progress-db";

export interface LearningPathViewProps {
  lessons: PathLessonSummary[];
}

export function LearningPathView({ lessons }: LearningPathViewProps) {
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [placementStartOrder, setPlacementStartOrder] = useState(1);

  useEffect(() => {
    let active = true;
    const savedPlacement = loadPlacementResult();

    void getAllLessonCompletions().then((completions) => {
      if (!active) return;
      if (savedPlacement) {
        setPlacementStartOrder(savedPlacement.recommendedStartOrder);
      }
      setCompletedIds(completions.map((item) => item.lessonId));
    });

    return () => {
      active = false;
    };
  }, []);

  const path = useMemo(
    () => computeLearningPath(lessons, new Set(completedIds), placementStartOrder),
    [lessons, completedIds, placementStartOrder],
  );

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 px-4 py-6 sm:px-6">
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
    </main>
  );
}
