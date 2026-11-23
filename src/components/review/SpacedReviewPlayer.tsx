"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ActivityRenderer } from "@/components/activities/ActivityRenderer";
import { FormattedNumber } from "@/components/khmer/FormattedNumber";
import { useNumeralPreference } from "@/components/khmer/NumeralPreferenceProvider";
import { NumeralToggle } from "@/components/khmer/NumeralToggle";
import { useActiveChild } from "@/components/parent/ActiveChildProvider";
import type { ActivityStep, Lesson } from "@/lib/content/schema";
import {
  evaluateActivityAnswer,
  formatTemplateText,
  resolveStepParams,
  type EvaluationResult,
} from "@/lib/engine/evaluate";
import { t } from "@/lib/i18n/messages";
import {
  buildDueReviewQueue,
  computeLocalSkillStates,
  type DueReviewCard,
} from "@/lib/review/queue";
import { getAllAttempts, recordAttempt } from "@/lib/storage/progress-db";
import { syncLocalAttemptsForChild } from "@/lib/storage/sync-client";

export interface SpacedReviewPlayerProps {
  lessons: Lesson[];
}

function allowsImplicitNumericDefault(step: ActivityStep): boolean {
  return (
    step.answer.kind === "equals" &&
    (step.activity === "ten-frame" ||
      step.activity === "number-line" ||
      step.activity === "count-tap" ||
      step.activity === "drag-to-group" ||
      step.activity === "place-value-blocks" ||
      step.activity === "partition" ||
      step.activity === "money-pay")
  );
}

interface ReviewItemPanelProps {
  card: DueReviewCard;
  isLast: boolean;
  activeChildId?: string;
  onAdvance: (hadMistake: boolean) => void;
}

function ReviewItemPanel({ card, isLast, activeChildId, onAdvance }: ReviewItemPanelProps) {
  const { numeralSystem } = useNumeralPreference();
  const [answerValue, setAnswerValue] = useState("");
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [validationPrompt, setValidationPrompt] = useState<string | null>(null);
  const [revealedHints, setRevealedHints] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [stepStartMs] = useState(() => Date.now());

  const resolvedParams = useMemo(
    () => resolveStepParams(card.step.params, card.seed),
    [card.step.params, card.seed],
  );

  const activeHintCue = useMemo(() => {
    if (revealedHints === 0) return undefined;
    let cue: string | undefined;
    for (let i = 0; i < Math.min(revealedHints, card.step.hints.length); i += 1) {
      if (card.step.hints[i]?.show) {
        cue = card.step.hints[i]?.show;
      }
    }
    return cue;
  }, [card.step.hints, revealedHints]);

  const handleSubmit = () => {
    const trimmed = answerValue.trim();
    if (trimmed === "" && !allowsImplicitNumericDefault(card.step)) {
      setValidationPrompt(t("playerEnterAnswerFirst"));
      return;
    }

    setValidationPrompt(null);
    const defaultNumeric =
      card.step.activity === "drag-to-group"
        ? (resolvedParams.start ?? resolvedParams.given ?? 0)
        : 0;
    const submittedRaw =
      trimmed === "" && card.step.answer.kind === "equals" ? defaultNumeric : trimmed;
    const result = evaluateActivityAnswer(card.step, resolvedParams, submittedRaw, numeralSystem);
    setEvaluation(result);

    if (!result.correct) {
      const nextWrong = wrongAttempts + 1;
      setWrongAttempts(nextWrong);
      if (revealedHints < Math.min(nextWrong, card.step.hints.length)) {
        setRevealedHints(Math.min(nextWrong, card.step.hints.length));
      }
    }

    void recordAttempt({
      lessonId: card.lessonId,
      lessonVersion: card.lessonVersion,
      stepId: card.step.id,
      correct: result.correct,
      hintsUsed: revealedHints,
      misconceptionId: result.misconceptionId,
      durationMs: Math.max(0, Date.now() - stepStartMs),
      timestamp: new Date().toISOString(),
    }).then(() => {
      if (activeChildId) {
        void syncLocalAttemptsForChild(activeChildId);
      }
    });
  };

  return (
    <section
      data-testid="review-step-card"
      data-lesson-id={card.lessonId}
      data-step-id={card.step.id}
      data-resolved-params={JSON.stringify(resolvedParams)}
      className="space-y-5 rounded-2xl border border-border bg-surface-card p-5 shadow-xs"
    >
      <p className="text-sm font-semibold text-accent">{card.lessonTitleKm}</p>

      <p data-testid="review-prompt" className="text-khmer-instruction font-semibold text-ink">
        {formatTemplateText(card.step.prompt.km, resolvedParams, numeralSystem)}
      </p>

      <ActivityRenderer
        step={card.step}
        resolvedParams={resolvedParams}
        answerValue={answerValue}
        onAnswerChange={(next) => {
          setAnswerValue(next);
          if (evaluation && !evaluation.correct) {
            setEvaluation(null);
          }
          setValidationPrompt(null);
        }}
        activeHintCue={activeHintCue}
        disabled={evaluation?.correct === true}
      />

      {validationPrompt && (
        <p
          role="status"
          className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-khmer-body text-amber-950"
        >
          {validationPrompt}
        </p>
      )}

      {evaluation && (
        <div
          role="status"
          aria-live="polite"
          data-testid="review-feedback"
          data-correct={evaluation.correct ? "true" : "false"}
          className={`rounded-2xl border-2 px-4 py-3.5 text-khmer-body font-medium ${
            evaluation.correct
              ? "border-emerald-400 bg-emerald-50 text-emerald-950"
              : "border-amber-400 bg-amber-50 text-amber-950"
          }`}
        >
          {evaluation.feedbackKm}
        </div>
      )}

      {revealedHints > 0 && (
        <div
          data-testid="review-hints-panel"
          className="space-y-2 rounded-2xl border border-accent/30 bg-accent-soft p-4"
        >
          <p className="text-sm font-semibold text-accent">{t("hintsHeading")}</p>
          <ol className="list-decimal space-y-2 pl-6 text-khmer-body text-ink">
            {card.step.hints.slice(0, revealedHints).map((hint, idx) => (
              <li key={`${card.id}-hint-${idx}`}>
                {formatTemplateText(hint.km, resolvedParams, numeralSystem)}
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        {evaluation?.correct ? (
          <button
            type="button"
            data-testid="review-continue-button"
            onClick={() => onAdvance(wrongAttempts > 0)}
            className="inline-flex min-h-touch flex-1 items-center justify-center rounded-xl bg-accent px-5 py-3 text-khmer-body font-semibold leading-[1.75] text-white overflow-visible transition-colors hover:bg-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {isLast ? t("reviewFinishButton") : t("reviewNextItem")}
          </button>
        ) : (
          <>
            <button
              type="button"
              data-testid="review-check-button"
              onClick={handleSubmit}
              className="inline-flex min-h-touch flex-1 items-center justify-center rounded-xl bg-accent px-5 py-3 text-khmer-body font-semibold leading-[1.75] text-white overflow-visible transition-colors hover:bg-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {t("actionCheckAnswer")}
            </button>
            {revealedHints < card.step.hints.length && (
              <button
                type="button"
                data-testid="review-hint-button"
                onClick={() =>
                  setRevealedHints((prev) => Math.min(card.step.hints.length, prev + 1))
                }
                className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-xl border border-border bg-surface-card px-4 py-3 text-khmer-body font-semibold leading-[1.75] text-ink overflow-visible transition-colors hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                {t("playerShowHint")} (<FormattedNumber value={revealedHints + 1} />/
                <FormattedNumber value={card.step.hints.length} />)
              </button>
            )}
          </>
        )}
      </div>
    </section>
  );
}

export function SpacedReviewPlayer({ lessons }: SpacedReviewPlayerProps) {
  const { activeChild } = useActiveChild();
  const [loading, setLoading] = useState(true);
  const [queue, setQueue] = useState<DueReviewCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fixedMistakes, setFixedMistakes] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    let active = true;
    void getAllAttempts().then((attempts) => {
      if (!active) return;
      const states = computeLocalSkillStates(attempts, lessons);
      const dueCards = buildDueReviewQueue(lessons, states, new Date());
      setQueue(dueCards);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [lessons]);

  const currentCard = queue[currentIndex];
  const progressPercent = completed
    ? 100
    : queue.length === 0
      ? 100
      : Math.round(((currentIndex + 1) / queue.length) * 100);

  return (
    <main
      id="main-content"
      className="mx-auto flex min-h-screen w-full max-w-xl flex-col gap-5 px-4 py-6 sm:px-6"
    >
      <header className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Link
            href="/learn"
            data-testid="review-back-link"
            className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-xl border border-border bg-surface-card px-4 py-2 text-khmer-body font-semibold leading-[1.75] text-ink overflow-visible hover:bg-accent-soft"
          >
            ← {t("backToLearningPath")}
          </Link>
          <NumeralToggle />
        </div>

        <div className="space-y-2">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h1 className="text-khmer-heading font-bold text-ink">{t("reviewPageTitle")}</h1>
            {!loading && !completed && queue.length > 0 && (
              <p className="text-khmer-body font-semibold text-accent">
                <FormattedNumber value={currentIndex + 1} /> /{" "}
                <FormattedNumber value={queue.length} />
              </p>
            )}
          </div>
          {!loading && queue.length > 0 && (
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
          )}
        </div>
      </header>

      {loading ? (
        <div className="rounded-2xl border border-border bg-surface-card p-6 text-center text-khmer-body text-ink-muted">
          ...
        </div>
      ) : queue.length === 0 ? (
        <section
          data-testid="review-empty-state"
          className="space-y-4 rounded-2xl border border-border bg-surface-card p-6 text-center shadow-xs"
        >
          <h2 className="text-khmer-heading font-bold text-accent">{t("reviewEmptyTitle")}</h2>
          <p className="text-khmer-body text-ink-muted">{t("reviewEmptySubtitle")}</p>
          <Link
            href="/learn"
            className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-xl bg-accent px-5 py-3 text-khmer-body font-semibold leading-[1.75] text-white overflow-visible hover:bg-accent-strong"
          >
            {t("backToLearningPath")}
          </Link>
        </section>
      ) : completed ? (
        <section
          data-testid="review-complete-screen"
          className="space-y-5 rounded-2xl border border-border bg-surface-card p-6 text-center shadow-xs"
        >
          <h2 className="text-khmer-heading font-bold text-accent">{t("reviewCompleteTitle")}</h2>
          <p className="text-khmer-body text-ink-muted">{t("reviewCompleteSubtitle")}</p>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-accent-soft p-4">
              <p className="text-sm font-medium text-ink-muted">{t("playerSummarySteps")}</p>
              <p className="mt-1 text-khmer-instruction font-bold text-accent">
                <FormattedNumber value={queue.length} />
              </p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-4">
              <p className="text-sm font-medium text-ink-muted">
                {t("playerSummaryFixedMistakes")}
              </p>
              <p className="mt-1 text-khmer-instruction font-bold text-ink">
                <FormattedNumber value={fixedMistakes} />
              </p>
            </div>
          </div>

          <Link
            href="/learn"
            data-testid="review-complete-back-link"
            className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-xl bg-accent px-5 py-3 text-khmer-body font-semibold leading-[1.75] text-white overflow-visible hover:bg-accent-strong"
          >
            {t("backToLearningPath")}
          </Link>
        </section>
      ) : currentCard ? (
        <ReviewItemPanel
          key={currentCard.id}
          card={currentCard}
          isLast={currentIndex === queue.length - 1}
          activeChildId={activeChild?.id}
          onAdvance={(hadMistake) => {
            if (hadMistake) {
              setFixedMistakes((count) => count + 1);
            }
            if (currentIndex + 1 >= queue.length) {
              setCompleted(true);
            } else {
              setCurrentIndex((idx) => idx + 1);
            }
          }}
        />
      ) : null}
    </main>
  );
}
