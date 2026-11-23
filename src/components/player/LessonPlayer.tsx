"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { ActivityRenderer } from "@/components/activities/ActivityRenderer";
import { TenFrameActivity } from "@/components/activities/TenFrameActivity";
import { FormattedNumber } from "@/components/khmer/FormattedNumber";
import { useNumeralPreference } from "@/components/khmer/NumeralPreferenceProvider";
import { NumeralToggle } from "@/components/khmer/NumeralToggle";
import {
  isLessonPublishable,
  type ActivityStep,
  type Lesson,
  type LessonStep,
} from "@/lib/content/schema";
import {
  evaluateActivityAnswer,
  formatTemplateText,
  resolveStepParams,
  type EvaluationResult,
} from "@/lib/engine/evaluate";
import { t } from "@/lib/i18n/messages";
import {
  clearLessonSession,
  createInitialLessonSession,
  DEFAULT_SESSION_SEED,
  getStepSeed,
  loadLessonSession,
  saveLessonSession,
  subscribeLessonSession,
} from "@/lib/player/session";

export interface LessonAttemptEvent {
  lessonId: string;
  lessonVersion: number;
  stepId: string;
  correct: boolean;
  hintsUsed: number;
  misconceptionId?: string;
  durationMs: number;
  timestamp: string;
}

export interface LessonCompletionEvent {
  lessonId: string;
  lessonVersion: number;
  stepsCompleted: number;
  fixedMistakes: number;
  completedAt: string;
}

export interface LessonPlayerProps {
  lesson: Lesson;
  initialSeed?: number;
  onAttempt?: (attempt: LessonAttemptEvent) => void;
  onComplete?: (summary: LessonCompletionEvent) => void;
}

function IntroVisualCard({ image }: { image?: string }) {
  if (!image) return null;

  return (
    <div
      aria-hidden="true"
      className="mx-auto flex w-full max-w-xs items-center justify-center rounded-2xl border border-border bg-accent-soft p-5"
    >
      <svg viewBox="0 0 220 96" className="h-24 w-full">
        {Array.from({ length: 10 }, (_, idx) => {
          const col = idx % 5;
          const row = Math.floor(idx / 5);
          const cx = 32 + col * 39;
          const cy = 28 + row * 40;
          const isFilled = idx < 7;
          return (
            <g key={idx}>
              <circle
                cx={cx}
                cy={cy}
                r="14"
                fill={isFilled ? "#f59e0b" : "#ffffff"}
                stroke={isFilled ? "#b45309" : "#0f766e"}
                strokeWidth="2"
                strokeDasharray={isFilled ? undefined : "4 3"}
              />
              {isFilled && (
                <circle cx={cx - 4} cy={cy - 4} r="3" fill="#ffffff" fillOpacity="0.4" />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

interface ActiveStepPanelProps {
  lesson: Lesson;
  step: LessonStep;
  stepIndex: number;
  totalSteps: number;
  sessionSeed: number;
  onAdvance: (hadMistakeBeforeSuccess: boolean) => void;
  onAttempt?: (attempt: LessonAttemptEvent) => void;
}

function ActiveStepPanel({
  lesson,
  step,
  stepIndex,
  totalSteps,
  sessionSeed,
  onAdvance,
  onAttempt,
}: ActiveStepPanelProps) {
  const { numeralSystem } = useNumeralPreference();
  const [answerValue, setAnswerValue] = useState("");
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [validationPrompt, setValidationPrompt] = useState<string | null>(null);
  const [revealedHints, setRevealedHints] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [audioNotice, setAudioNotice] = useState(false);
  const [stepStartMs] = useState(() => Date.now());

  const resolvedParams = useMemo(() => {
    if (step.type === "activity" || step.type === "explore") {
      return resolveStepParams(step.params, getStepSeed(sessionSeed, stepIndex));
    }
    return {};
  }, [step, sessionSeed, stepIndex]);

  const activeHintCue = useMemo(() => {
    if (step.type !== "activity" || revealedHints === 0) return undefined;
    let cue: string | undefined;
    for (let i = 0; i < Math.min(revealedHints, step.hints.length); i += 1) {
      const hint = step.hints[i];
      if (hint?.show) {
        cue = hint.show;
      }
    }
    return cue;
  }, [step, revealedHints]);

  const handlePlayAudio = () => {
    if (step.audio && step.audio !== "auto" && typeof Audio !== "undefined") {
      try {
        const audio = new Audio(step.audio);
        void audio.play().catch(() => {
          setAudioNotice(true);
        });
        return;
      } catch {
        setAudioNotice(true);
        return;
      }
    }
    setAudioNotice(true);
  };

  const handleSubmitActivity = (activityStep: ActivityStep) => {
    const trimmed = answerValue.trim();
    const allowsImplicitDefault =
      activityStep.answer.kind === "equals" &&
      (activityStep.activity === "ten-frame" ||
        activityStep.activity === "number-line" ||
        activityStep.activity === "count-tap" ||
        activityStep.activity === "drag-to-group" ||
        activityStep.activity === "place-value-blocks" ||
        activityStep.activity === "partition" ||
        activityStep.activity === "money-pay");

    if (trimmed === "" && !allowsImplicitDefault) {
      setValidationPrompt(t("playerEnterAnswerFirst"));
      return;
    }

    setValidationPrompt(null);
    const defaultNumeric =
      activityStep.activity === "drag-to-group"
        ? (resolvedParams.start ?? resolvedParams.given ?? 0)
        : 0;
    const submittedRaw =
      trimmed === "" && activityStep.answer.kind === "equals" ? defaultNumeric : trimmed;
    const result = evaluateActivityAnswer(
      activityStep,
      resolvedParams,
      submittedRaw,
      numeralSystem,
    );
    setEvaluation(result);

    if (!result.correct) {
      const nextWrong = wrongAttempts + 1;
      setWrongAttempts(nextWrong);
      if (nextWrong >= 1 && revealedHints < Math.min(nextWrong, activityStep.hints.length)) {
        setRevealedHints(Math.min(nextWrong, activityStep.hints.length));
      }
    }

    onAttempt?.({
      lessonId: lesson.id,
      lessonVersion: lesson.version,
      stepId: activityStep.id,
      correct: result.correct,
      hintsUsed: revealedHints,
      misconceptionId: result.misconceptionId,
      durationMs: Math.max(0, Date.now() - stepStartMs),
      timestamp: new Date().toISOString(),
    });
  };

  const handleRequestHint = (activityStep: ActivityStep) => {
    setRevealedHints((prev) => Math.min(activityStep.hints.length, prev + 1));
  };

  const isLastStep = stepIndex === totalSteps - 1;
  const continueLabel = isLastStep ? t("playerFinishLesson") : t("playerContinue");

  return (
    <section
      data-testid="lesson-step-card"
      data-step-id={step.id}
      data-step-type={step.type}
      data-resolved-params={JSON.stringify(resolvedParams)}
      className="space-y-5 rounded-2xl border border-border bg-surface-card p-5 shadow-xs"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          data-testid="lesson-audio-button"
          onClick={handlePlayAudio}
          className="inline-flex min-h-touch min-w-touch items-center gap-2 rounded-xl border border-border bg-accent-soft px-4 py-2 text-khmer-body font-semibold leading-[1.75] text-accent overflow-visible transition-colors hover:bg-accent hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <span aria-hidden="true">🔊</span>
          <span>{t("playerAudioPlay")}</span>
        </button>
      </div>

      {audioNotice && (
        <p className="rounded-xl border border-border bg-surface px-3.5 py-2 text-sm text-ink-muted">
          {t("playerAudioPending")}
        </p>
      )}

      {step.type === "intro" && (
        <div className="space-y-5">
          <IntroVisualCard image={step.image} />
          <p data-testid="step-prompt" className="text-khmer-instruction font-semibold text-ink">
            {step.text.km}
          </p>
          <button
            type="button"
            data-testid="step-continue-button"
            onClick={() => onAdvance(false)}
            className="inline-flex min-h-touch w-full items-center justify-center rounded-xl bg-accent px-5 py-3 text-khmer-body font-semibold leading-[1.75] text-white overflow-visible transition-colors hover:bg-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {continueLabel}
          </button>
        </div>
      )}

      {step.type === "explore" && (
        <div className="space-y-5">
          <p data-testid="step-prompt" className="text-khmer-instruction font-semibold text-ink">
            {formatTemplateText(step.prompt.km, resolvedParams, numeralSystem)}
          </p>
          <ActivityRenderer
            step={step}
            resolvedParams={resolvedParams}
            answerValue={answerValue}
            onAnswerChange={setAnswerValue}
          />
          <button
            type="button"
            data-testid="step-continue-button"
            onClick={() => onAdvance(false)}
            className="inline-flex min-h-touch w-full items-center justify-center rounded-xl bg-accent px-5 py-3 text-khmer-body font-semibold leading-[1.75] text-white overflow-visible transition-colors hover:bg-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {continueLabel}
          </button>
        </div>
      )}

      {step.type === "explain" && (
        <div className="space-y-5">
          {step.visual?.activity === "ten-frame" && (
            <TenFrameActivity
              mode="read"
              given={step.visual.params.given ?? 7}
              value={Math.max(
                0,
                (step.visual.params.target ?? 10) - (step.visual.params.given ?? 7),
              )}
              readOnly
            />
          )}
          <p data-testid="step-prompt" className="text-khmer-body text-ink">
            {step.text.km}
          </p>
          {step.mathTerms.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-ink-muted">{t("mathTermsHeading")}</p>
              <div className="flex flex-wrap gap-2">
                {step.mathTerms.map((term) => (
                  <span
                    key={term.km}
                    className="rounded-xl border border-border bg-accent-soft px-3.5 py-1.5 text-khmer-body font-semibold text-accent"
                  >
                    {term.km}
                  </span>
                ))}
              </div>
            </div>
          )}
          <button
            type="button"
            data-testid="step-continue-button"
            onClick={() => onAdvance(false)}
            className="inline-flex min-h-touch w-full items-center justify-center rounded-xl bg-accent px-5 py-3 text-khmer-body font-semibold leading-[1.75] text-white overflow-visible transition-colors hover:bg-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {continueLabel}
          </button>
        </div>
      )}

      {step.type === "activity" && (
        <div className="space-y-5">
          <p data-testid="step-prompt" className="text-khmer-instruction font-semibold text-ink">
            {formatTemplateText(step.prompt.km, resolvedParams, numeralSystem)}
          </p>

          <ActivityRenderer
            step={step}
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
              data-testid="step-validation-prompt"
              className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-khmer-body text-amber-950"
            >
              {validationPrompt}
            </p>
          )}

          {evaluation && (
            <div
              role="status"
              aria-live="polite"
              data-testid="step-feedback"
              data-correct={evaluation.correct ? "true" : "false"}
              data-misconception={evaluation.misconceptionId ?? ""}
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
              data-testid="step-hints-panel"
              className="space-y-2 rounded-2xl border border-accent/30 bg-accent-soft p-4"
            >
              <p className="text-sm font-semibold text-accent">{t("hintsHeading")}</p>
              <ol className="list-decimal space-y-2 pl-6 text-khmer-body text-ink">
                {step.hints.slice(0, revealedHints).map((hint, idx) => (
                  <li key={`${step.id}-hint-${idx}`} data-testid={`revealed-hint-${idx + 1}`}>
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
                data-testid="step-continue-button"
                onClick={() => onAdvance(wrongAttempts > 0)}
                className="inline-flex min-h-touch flex-1 items-center justify-center rounded-xl bg-accent px-5 py-3 text-khmer-body font-semibold leading-[1.75] text-white overflow-visible transition-colors hover:bg-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                {continueLabel}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  data-testid="step-check-button"
                  onClick={() => handleSubmitActivity(step)}
                  className="inline-flex min-h-touch flex-1 items-center justify-center rounded-xl bg-accent px-5 py-3 text-khmer-body font-semibold leading-[1.75] text-white overflow-visible transition-colors hover:bg-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  {t("actionCheckAnswer")}
                </button>
                {revealedHints < step.hints.length && (
                  <button
                    type="button"
                    data-testid="step-hint-button"
                    onClick={() => handleRequestHint(step)}
                    className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-xl border border-border bg-surface-card px-4 py-3 text-khmer-body font-semibold leading-[1.75] text-ink overflow-visible transition-colors hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    {t("playerShowHint")} (
                    <FormattedNumber value={revealedHints + 1} />/
                    <FormattedNumber value={step.hints.length} />)
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

export function LessonPlayer({
  lesson,
  initialSeed = DEFAULT_SESSION_SEED,
  onAttempt,
  onComplete,
}: LessonPlayerProps) {
  const totalSteps = lesson.steps.length;

  const subscribe = useCallback(
    (callback: () => void) => subscribeLessonSession(lesson.id, callback),
    [lesson.id],
  );

  const getSnapshot = useCallback(
    () => loadLessonSession(lesson.id, lesson.version, totalSteps),
    [lesson.id, lesson.version, totalSteps],
  );

  const serverSnapshot = useMemo(
    () => createInitialLessonSession(lesson.id, lesson.version, initialSeed),
    [lesson.id, lesson.version, initialSeed],
  );

  const getServerSnapshot = useCallback(() => serverSnapshot, [serverSnapshot]);

  const session = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const currentStep = lesson.steps[session.stepIndex];
  const publishable = isLessonPublishable(lesson);

  const handleAdvance = (hadMistakeBeforeSuccess: boolean) => {
    if (!currentStep) return;

    const nextCompletedIds = session.completedStepIds.includes(currentStep.id)
      ? session.completedStepIds
      : [...session.completedStepIds, currentStep.id];
    const nextFixedMistakes = session.fixedMistakes + (hadMistakeBeforeSuccess ? 1 : 0);

    if (session.stepIndex + 1 >= totalSteps) {
      const completedAt = new Date().toISOString();
      saveLessonSession({
        ...session,
        completedStepIds: nextCompletedIds,
        fixedMistakes: nextFixedMistakes,
        completed: true,
        updatedAt: completedAt,
      });

      onComplete?.({
        lessonId: lesson.id,
        lessonVersion: lesson.version,
        stepsCompleted: nextCompletedIds.length,
        fixedMistakes: nextFixedMistakes,
        completedAt,
      });
      return;
    }

    saveLessonSession({
      ...session,
      stepIndex: session.stepIndex + 1,
      completedStepIds: nextCompletedIds,
      fixedMistakes: nextFixedMistakes,
      completed: false,
    });
  };

  const handleReplay = () => {
    clearLessonSession(lesson.id);
    saveLessonSession(
      createInitialLessonSession(lesson.id, lesson.version, session.sessionSeed + 1),
    );
  };

  const progressPercent = session.completed
    ? 100
    : Math.round(((session.stepIndex + 1) / Math.max(1, totalSteps)) * 100);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col gap-5 px-4 py-6 sm:px-6">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Link
            href="/"
            data-testid="lesson-exit-link"
            className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-xl border border-border bg-surface-card px-4 py-2 text-khmer-body font-semibold leading-[1.75] text-ink overflow-visible transition-colors hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            ← {t("playerExit")}
          </Link>
          <NumeralToggle />
        </div>

        {!publishable && (
          <p className="rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2 text-sm font-medium text-amber-950">
            {t("playerDraftNotice")}
          </p>
        )}

        <div className="space-y-2">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h1 className="text-khmer-heading font-bold text-ink">{lesson.title.km}</h1>
            {!session.completed && (
              <p
                data-testid="lesson-step-counter"
                className="text-khmer-body font-semibold text-accent"
              >
                {t("stepLabel")} <FormattedNumber value={session.stepIndex + 1} /> /{" "}
                <FormattedNumber value={totalSteps} />
              </p>
            )}
          </div>
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

      {session.completed ? (
        <section
          data-testid="lesson-complete-screen"
          className="space-y-5 rounded-2xl border border-border bg-surface-card p-6 text-center shadow-xs"
        >
          <h2 className="text-khmer-heading font-bold text-accent">{t("playerCompleteTitle")}</h2>
          <p className="text-khmer-body text-ink-muted">{t("playerCompleteSubtitle")}</p>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-accent-soft p-4">
              <p className="text-sm font-medium text-ink-muted">{t("playerSummarySteps")}</p>
              <p className="mt-1 text-khmer-instruction font-bold text-accent">
                <FormattedNumber value={session.completedStepIds.length || totalSteps} />
              </p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-4">
              <p className="text-sm font-medium text-ink-muted">
                {t("playerSummaryFixedMistakes")}
              </p>
              <p className="mt-1 text-khmer-instruction font-bold text-ink">
                <FormattedNumber value={session.fixedMistakes} />
              </p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link
              href="/learn"
              className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-xl bg-accent px-5 py-3 text-khmer-body font-semibold leading-[1.75] text-white overflow-visible transition-colors hover:bg-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {t("navLearningPath")}
            </Link>
            <button
              type="button"
              data-testid="lesson-replay-button"
              onClick={handleReplay}
              className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-xl border border-border bg-surface-card px-5 py-3 text-khmer-body font-semibold leading-[1.75] text-ink overflow-visible transition-colors hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {t("playerReplayLesson")}
            </button>
          </div>
        </section>
      ) : currentStep ? (
        <ActiveStepPanel
          key={`${session.sessionSeed}-${currentStep.id}`}
          lesson={lesson}
          step={currentStep}
          stepIndex={session.stepIndex}
          totalSteps={totalSteps}
          sessionSeed={session.sessionSeed}
          onAdvance={handleAdvance}
          onAttempt={onAttempt}
        />
      ) : null}
    </main>
  );
}
