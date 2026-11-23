import Link from "next/link";
import { notFound } from "next/navigation";
import { FormattedNumber } from "@/components/khmer/FormattedNumber";
import { NumeralToggle } from "@/components/khmer/NumeralToggle";
import { getAllLessons, getLessonById } from "@/lib/content/loader";
import { isLessonPublishable, type LessonStep } from "@/lib/content/schema";
import { t } from "@/lib/i18n/messages";

export function generateStaticParams() {
  return getAllLessons().map((lesson) => ({ lessonId: lesson.id }));
}

function StepCard({ step, index }: { step: LessonStep; index: number }) {
  return (
    <article
      data-testid={`preview-step-${step.id}`}
      className="space-y-3 rounded-2xl border border-border bg-surface-card p-5 shadow-xs"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-khmer-body font-semibold text-accent">
          <span>{t("stepLabel")}</span>
          <FormattedNumber value={index + 1} />
        </span>
        <span className="rounded-lg border border-border bg-surface px-2.5 py-1 text-sm font-medium text-ink-muted">
          {step.type}
          {"activity" in step ? ` · ${step.activity} (${step.mode})` : ""}
        </span>
      </div>

      {step.type === "intro" && (
        <p className="text-khmer-instruction font-semibold text-ink">{step.text.km}</p>
      )}

      {step.type === "explore" && (
        <p className="text-khmer-instruction font-semibold text-ink">{step.prompt.km}</p>
      )}

      {step.type === "explain" && (
        <div className="space-y-3">
          <p className="text-khmer-body text-ink">{step.text.km}</p>
          {step.mathTerms.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-sm font-semibold text-ink-muted">{t("mathTermsHeading")}</p>
              <div className="flex flex-wrap gap-2">
                {step.mathTerms.map((term) => (
                  <span
                    key={term.km}
                    className="rounded-xl border border-border bg-accent-soft px-3 py-1.5 text-khmer-body font-semibold text-accent"
                  >
                    {term.km}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {step.type === "activity" && (
        <div className="space-y-4">
          <p className="text-khmer-instruction font-semibold text-ink">{step.prompt.km}</p>

          {step.template && (
            <div className="rounded-xl border border-border bg-surface px-4 py-3 text-center text-khmer-instruction font-bold text-accent">
              {step.template}
            </div>
          )}

          <div className="rounded-xl border border-border bg-surface p-3.5 text-sm text-ink-muted">
            <p className="font-semibold text-ink">{t("correctFeedbackHeading")}</p>
            <p className="mt-1 text-khmer-body text-ink">{step.feedback.correct.km}</p>
          </div>

          {step.feedback.misconceptions.length > 0 && (
            <div className="space-y-2 rounded-xl border border-border bg-surface p-3.5">
              <p className="text-sm font-semibold text-ink">{t("misconceptionsHeading")}</p>
              <ul className="space-y-1.5 text-khmer-body text-ink-muted">
                {step.feedback.misconceptions.map((item) => (
                  <li key={item.id}>
                    <span className="font-semibold text-ink">{item.id}:</span> {item.text.km}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-2 rounded-xl border border-border bg-accent-soft p-3.5">
            <p className="text-sm font-semibold text-accent">{t("hintsHeading")}</p>
            <ol className="list-decimal space-y-1.5 pl-6 text-khmer-body text-ink">
              {step.hints.map((hint, hintIdx) => (
                <li key={`${step.id}-hint-${hintIdx}`}>
                  {hint.km}
                  {hint.show ? (
                    <span className="ml-2 inline-block rounded bg-surface-card px-2 py-0.5 text-xs font-medium text-accent">
                      {hint.show}
                    </span>
                  ) : null}
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </article>
  );
}

export default async function LessonPreviewPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  const lesson = getLessonById(lessonId);

  if (!lesson) {
    notFound();
  }

  const publishable = isLessonPublishable(lesson);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/"
          className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-xl border border-border bg-surface-card px-4 py-2.5 text-khmer-body font-semibold leading-[1.75] text-ink overflow-visible transition-colors hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          ← {t("navHome")}
        </Link>
        <NumeralToggle />
      </div>

      <header className="space-y-3 rounded-2xl border border-border bg-surface-card p-5 shadow-xs">
        <p className="text-sm font-semibold text-accent">{t("previewBannerLabel")}</p>
        <h1 className="text-khmer-heading font-bold text-ink">{lesson.title.km}</h1>
        <div className="flex flex-wrap gap-2 text-sm">
          <span
            data-testid="review-badge-math"
            className={`rounded-full px-3 py-1 font-semibold ${
              lesson.reviewStatus.math === "approved"
                ? "bg-accent-soft text-accent"
                : "bg-amber-100 text-amber-900"
            }`}
          >
            {t("reviewMathLabel")}:{" "}
            {lesson.reviewStatus.math === "approved" ? t("reviewApproved") : t("reviewDraft")}
          </span>
          <span
            data-testid="review-badge-khmer"
            className={`rounded-full px-3 py-1 font-semibold ${
              lesson.reviewStatus.khmer === "approved"
                ? "bg-accent-soft text-accent"
                : "bg-amber-100 text-amber-900"
            }`}
          >
            {t("reviewKhmerLabel")}:{" "}
            {lesson.reviewStatus.khmer === "approved" ? t("reviewApproved") : t("reviewDraft")}
          </span>
          <span className="rounded-full border border-border bg-surface px-3 py-1 font-medium text-ink-muted">
            {lesson.moeysRef.join(", ")} · v<FormattedNumber value={lesson.version} /> ·{" "}
            {publishable ? "publishable" : "preview-only"}
          </span>
        </div>
      </header>

      <section className="space-y-4" aria-label={lesson.title.km}>
        {lesson.steps.map((step, index) => (
          <StepCard key={step.id} step={step} index={index} />
        ))}
      </section>
    </main>
  );
}
