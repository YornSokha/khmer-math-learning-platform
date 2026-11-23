"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CompareGroupsActivity } from "@/components/activities/CompareGroupsActivity";
import { CountTapActivity } from "@/components/activities/CountTapActivity";
import { EquationFillActivity } from "@/components/activities/EquationFillActivity";
import { FormattedNumber } from "@/components/khmer/FormattedNumber";
import { NumeralToggle } from "@/components/khmer/NumeralToggle";
import { t } from "@/lib/i18n/messages";
import {
  computePlacementRecommendation,
  evaluatePlacementItem,
  PLACEMENT_ITEMS,
  savePlacementResult,
  type PathLessonSummary,
} from "@/lib/path/progression";

export interface PlacementCheckProps {
  lessons: PathLessonSummary[];
}

export function PlacementCheck({ lessons }: PlacementCheckProps) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [results, setResults] = useState<Record<string, boolean>>({});

  const item = PLACEMENT_ITEMS[index]!;
  const isLast = index === PLACEMENT_ITEMS.length - 1;
  const progressPercent = Math.round(((index + 1) / PLACEMENT_ITEMS.length) * 100);

  const handleSkip = () => {
    savePlacementResult({
      recommendedStartOrder: 1,
      recommendedLessonId: lessons[0]?.id ?? "g1-01-subitize-1-5",
      correctItemIds: [],
      skipped: true,
      completedAt: new Date().toISOString(),
    });
    router.push("/learn");
  };

  const handleNext = () => {
    const isCorrect = evaluatePlacementItem(item, answer);
    const nextResults = { ...results, [item.id]: isCorrect };
    setResults(nextResults);

    if (isLast) {
      const rec = computePlacementRecommendation(nextResults, lessons);
      savePlacementResult({
        ...rec,
        skipped: false,
        completedAt: new Date().toISOString(),
      });
      router.push("/learn");
      return;
    }

    setIndex(index + 1);
    setAnswer("");
  };

  return (
    <main
      id="main-content"
      className="mx-auto flex min-h-screen w-full max-w-xl flex-col gap-5 px-4 py-6 sm:px-6"
    >
      <header className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Link
            href="/learn"
            className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-xl border border-border bg-surface-card px-4 py-2 text-khmer-body font-semibold leading-[1.75] text-ink overflow-visible hover:bg-accent-soft"
          >
            ← {t("playerExit")}
          </Link>
          <NumeralToggle />
        </div>

        <div className="space-y-1">
          <h1 className="text-khmer-heading font-bold text-ink">{t("placementTitle")}</h1>
          <p className="text-khmer-body text-ink-muted">{t("placementSubtitle")}</p>
        </div>

        <div className="space-y-1.5">
          <p
            data-testid="placement-counter"
            className="text-right text-khmer-body font-semibold text-accent"
          >
            {t("placementQuestionLabel")} <FormattedNumber value={index + 1} /> /{" "}
            <FormattedNumber value={PLACEMENT_ITEMS.length} />
          </p>
          <div
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            className="h-3 w-full rounded-full bg-border"
          >
            <div
              className="h-3 rounded-full bg-accent transition-all duration-200"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </header>

      <section
        key={item.id}
        data-testid="placement-item-card"
        data-item-id={item.id}
        className="space-y-5 rounded-2xl border border-border bg-surface-card p-5 shadow-xs"
      >
        <p className="text-khmer-instruction font-semibold text-ink">{item.promptKm}</p>

        {item.kind === "count-tap" && (
          <CountTapActivity
            mode="count"
            count={item.count ?? 4}
            visualKind="mango"
            value={answer}
            onChange={setAnswer}
          />
        )}

        {item.kind === "compare-groups" && (
          <CompareGroupsActivity
            leftCount={item.left ?? 7}
            rightCount={item.right ?? 4}
            visualKind="longan"
            value={answer}
            onChange={setAnswer}
          />
        )}

        {item.kind === "equation-fill" && (
          <EquationFillActivity
            template={item.template ?? "{a} + □ = 10"}
            resolvedParams={item.params ?? { a: 7 }}
            supports="none"
            value={answer}
            onChange={setAnswer}
          />
        )}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            data-testid="placement-next-button"
            onClick={handleNext}
            className="inline-flex min-h-touch flex-1 items-center justify-center rounded-xl bg-accent px-5 py-3 text-khmer-body font-semibold leading-[1.75] text-white overflow-visible transition-colors hover:bg-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {isLast ? t("placementFinish") : t("placementNext")}
          </button>
          <button
            type="button"
            data-testid="placement-skip-button"
            onClick={handleSkip}
            className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-xl border border-border bg-surface-card px-4 py-3 text-khmer-body font-semibold leading-[1.75] text-ink-muted overflow-visible hover:bg-accent-soft"
          >
            {t("placementSkip")}
          </button>
        </div>
      </section>
    </main>
  );
}
