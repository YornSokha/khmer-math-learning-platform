"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ActivityRenderer } from "@/components/activities/ActivityRenderer";
import { FormattedNumber } from "@/components/khmer/FormattedNumber";
import { useNumeralPreference } from "@/components/khmer/NumeralPreferenceProvider";
import { useActiveChild } from "@/components/parent/ActiveChildProvider";
import type { ActivityStep, Lesson } from "@/lib/content/schema";
import {
  evaluateActivityAnswer,
  formatTemplateText,
  resolveStepParams,
  type EvaluationResult,
} from "@/lib/engine/evaluate";
import { t } from "@/lib/i18n/messages";
import { toUtcDateKey } from "@/lib/mastery/scheduler";
import {
  loadDailyChallengeStatus,
  saveDailyChallengeStatus,
  selectDailyChallenge,
  type DailyChallengeItem,
  type DailyChallengeStatus,
} from "@/lib/review/queue";
import { getAllLessonCompletions, recordAttempt } from "@/lib/storage/progress-db";
import { syncLocalAttemptsForChild } from "@/lib/storage/sync-client";

export interface DailyChallengePlayerProps {
  lessons: Lesson[];
  dateKeyOverride?: string;
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

export function DailyChallengePlayer({ lessons, dateKeyOverride }: DailyChallengePlayerProps) {
  const { numeralSystem } = useNumeralPreference();
  const { activeChild } = useActiveChild();
  const dateKey = useMemo(() => dateKeyOverride ?? toUtcDateKey(new Date()), [dateKeyOverride]);

  const [loading, setLoading] = useState(true);
  const [challenge, setChallenge] = useState<DailyChallengeItem | null>(null);
  const [status, setStatus] = useState<DailyChallengeStatus | null>(null);
  const [answerValue, setAnswerValue] = useState("");
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [validationPrompt, setValidationPrompt] = useState<string | null>(null);
  const [revealedHints, setRevealedHints] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [startMs] = useState(() => Date.now());

  useEffect(() => {
    let active = true;
    const savedStatus = loadDailyChallengeStatus(dateKey);

    void getAllLessonCompletions().then((completions) => {
      if (!active) return;
      const completedSet = new Set(completions.map((item) => item.lessonId));
      const picked = selectDailyChallenge(lessons, dateKey, completedSet);
      setChallenge(picked);
      setStatus(savedStatus);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [lessons, dateKey]);

  const resolvedParams = useMemo(() => {
    if (!challenge) return {};
    return resolveStepParams(challenge.step.params, challenge.seed);
  }, [challenge]);

  const activeHintCue = useMemo(() => {
    if (!challenge || revealedHints === 0) return undefined;
    let cue: string | undefined;
    for (let i = 0; i < Math.min(revealedHints, challenge.step.hints.length); i += 1) {
      if (challenge.step.hints[i]?.show) {
        cue = challenge.step.hints[i]?.show;
      }
    }
    return cue;
  }, [challenge, revealedHints]);

  const handleSubmit = () => {
    if (!challenge) return;
    const trimmed = answerValue.trim();
    if (trimmed === "" && !allowsImplicitNumericDefault(challenge.step)) {
      setValidationPrompt(t("playerEnterAnswerFirst"));
      return;
    }

    setValidationPrompt(null);
    const defaultNumeric =
      challenge.step.activity === "drag-to-group"
        ? (resolvedParams.start ?? resolvedParams.given ?? 0)
        : 0;
    const submittedRaw =
      trimmed === "" && challenge.step.answer.kind === "equals" ? defaultNumeric : trimmed;
    const result = evaluateActivityAnswer(
      challenge.step,
      resolvedParams,
      submittedRaw,
      numeralSystem,
    );
    setEvaluation(result);

    if (!result.correct) {
      const nextWrong = wrongAttempts + 1;
      setWrongAttempts(nextWrong);
      if (revealedHints < Math.min(nextWrong, challenge.step.hints.length)) {
        setRevealedHints(Math.min(nextWrong, challenge.step.hints.length));
      }
    }

    void recordAttempt({
      lessonId: challenge.lessonId,
      lessonVersion: challenge.lessonVersion,
      stepId: challenge.step.id,
      correct: result.correct,
      hintsUsed: revealedHints,
      misconceptionId: result.misconceptionId,
      durationMs: Math.max(0, Date.now() - startMs),
      timestamp: new Date().toISOString(),
    }).then(() => {
      if (activeChild?.id) {
        void syncLocalAttemptsForChild(activeChild.id);
      }
    });
  };

  const handleFinish = () => {
    saveDailyChallengeStatus("completed", dateKey);
    setStatus("completed");
  };

  const handleSkip = () => {
    saveDailyChallengeStatus("skipped", dateKey);
    setStatus("skipped");
  };

  return (
    <main
      id="main-content"
      className="mx-auto flex w-full max-w-xl flex-col gap-5 px-4 py-6 sm:px-6"
    >
      <header className="space-y-1">
        <h1 className="text-khmer-heading font-bold text-ink">{t("dailyChallengeCardTitle")}</h1>
        <p className="text-khmer-body text-ink-muted">{t("dailyChallengeCardSubtitle")}</p>
      </header>

      {loading ? (
        <div className="rounded-2xl border border-border bg-surface-card p-6 text-center text-khmer-body text-ink-muted">
          ...
        </div>
      ) : status === "completed" ? (
        <section
          data-testid="daily-complete-screen"
          className="space-y-5 rounded-2xl border border-border bg-surface-card p-6 text-center shadow-xs"
        >
          <h2 className="text-khmer-heading font-bold text-accent">
            {t("dailyChallengeCompleteTitle")}
          </h2>
          <p className="text-khmer-body text-ink-muted">{t("dailyChallengeCompleteSubtitle")}</p>
          <Link
            href="/learn"
            data-testid="daily-complete-back-link"
            className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-xl bg-accent px-5 py-3 text-khmer-body font-semibold leading-[1.75] text-white overflow-visible hover:bg-accent-strong"
          >
            {t("backToLearningPath")}
          </Link>
        </section>
      ) : status === "skipped" ? (
        <section
          data-testid="daily-skipped-screen"
          className="space-y-5 rounded-2xl border border-border bg-surface-card p-6 text-center shadow-xs"
        >
          <h2 className="text-khmer-heading font-bold text-ink">
            {t("dailyChallengeSkippedTitle")}
          </h2>
          <p className="text-khmer-body text-ink-muted">{t("dailyChallengeSkippedSubtitle")}</p>
          <Link
            href="/learn"
            data-testid="daily-skipped-back-link"
            className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-xl bg-accent px-5 py-3 text-khmer-body font-semibold leading-[1.75] text-white overflow-visible hover:bg-accent-strong"
          >
            {t("backToLearningPath")}
          </Link>
        </section>
      ) : challenge ? (
        <section
          data-testid="daily-challenge-card"
          data-lesson-id={challenge.lessonId}
          data-step-id={challenge.step.id}
          data-resolved-params={JSON.stringify(resolvedParams)}
          className="space-y-5 rounded-2xl border border-border bg-surface-card p-5 shadow-xs"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-accent">{challenge.lessonTitleKm}</p>
            <button
              type="button"
              data-testid="daily-skip-button"
              onClick={handleSkip}
              className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold leading-[1.75] text-ink-muted overflow-visible hover:bg-accent-soft hover:text-ink"
            >
              {t("dailyChallengeSkipButton")}
            </button>
          </div>

          <p data-testid="daily-prompt" className="text-khmer-instruction font-semibold text-ink">
            {formatTemplateText(challenge.step.prompt.km, resolvedParams, numeralSystem)}
          </p>

          <ActivityRenderer
            step={challenge.step}
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
              data-testid="daily-feedback"
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
              data-testid="daily-hints-panel"
              className="space-y-2 rounded-2xl border border-accent/30 bg-accent-soft p-4"
            >
              <p className="text-sm font-semibold text-accent">{t("hintsHeading")}</p>
              <ol className="list-decimal space-y-2 pl-6 text-khmer-body text-ink">
                {challenge.step.hints.slice(0, revealedHints).map((hint, idx) => (
                  <li key={`daily-hint-${idx}`}>
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
                data-testid="daily-finish-button"
                onClick={handleFinish}
                className="inline-flex min-h-touch flex-1 items-center justify-center rounded-xl bg-accent px-5 py-3 text-khmer-body font-semibold leading-[1.75] text-white overflow-visible transition-colors hover:bg-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                {t("playerContinue")}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  data-testid="daily-check-button"
                  onClick={handleSubmit}
                  className="inline-flex min-h-touch flex-1 items-center justify-center rounded-xl bg-accent px-5 py-3 text-khmer-body font-semibold leading-[1.75] text-white overflow-visible transition-colors hover:bg-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  {t("actionCheckAnswer")}
                </button>
                {revealedHints < challenge.step.hints.length && (
                  <button
                    type="button"
                    data-testid="daily-hint-button"
                    onClick={() =>
                      setRevealedHints((prev) => Math.min(challenge.step.hints.length, prev + 1))
                    }
                    className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-xl border border-border bg-surface-card px-4 py-3 text-khmer-body font-semibold leading-[1.75] text-ink overflow-visible transition-colors hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    {t("playerShowHint")} (<FormattedNumber value={revealedHints + 1} />/
                    <FormattedNumber value={challenge.step.hints.length} />)
                  </button>
                )}
              </>
            )}
          </div>
        </section>
      ) : null}
    </main>
  );
}
