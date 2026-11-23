import Link from "next/link";
import { FormattedNumber } from "@/components/khmer/FormattedNumber";
import { NumeralToggle } from "@/components/khmer/NumeralToggle";
import { LessonCompletionBadge } from "@/components/offline/LessonCompletionBadge";
import { t } from "@/lib/i18n/messages";

const GRADE_1_SAMPLE_NUMBERS = [0, 5, 7, 10, 100] as const;

export default function HomePage() {
  return (
    <main
      id="main-content"
      className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8"
    >
      <header className="space-y-2 text-center">
        <h1 className="text-khmer-heading font-bold text-ink">{t("appTitle")}</h1>
        <p className="text-khmer-body text-ink-muted">{t("appTagline")}</p>
      </header>

      <section
        aria-label={t("navPrimaryLabel")}
        data-testid="home-primary-menu"
        className="grid grid-cols-1 gap-3 sm:grid-cols-2"
      >
        <Link
          href="/learn"
          data-testid="home-learning-path-link"
          className="flex min-h-touch flex-col justify-between gap-2 rounded-2xl bg-accent p-5 text-white shadow-xs overflow-visible transition-colors hover:bg-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:col-span-2"
        >
          <span className="text-khmer-instruction font-bold leading-[1.7] overflow-visible">
            {t("navLearningPath")}
          </span>
          <span className="text-khmer-body leading-[1.75] text-white/90 overflow-visible">
            {t("pathSubtitle")}
          </span>
        </Link>

        <Link
          href="/placement"
          data-testid="home-placement-link"
          className="flex min-h-touch flex-col justify-center gap-1 rounded-2xl border-2 border-accent/40 bg-accent-soft p-4 text-left text-accent shadow-2xs overflow-visible transition-colors hover:bg-accent hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <span className="text-khmer-body font-bold leading-[1.75] overflow-visible">
            {t("navPlacementCheck")}
          </span>
        </Link>

        <Link
          href="/parent"
          data-testid="home-parent-portal-link"
          className="flex min-h-touch flex-col justify-center gap-1 rounded-2xl border border-border bg-surface-card p-4 text-left text-ink shadow-2xs overflow-visible transition-colors hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <span className="text-khmer-body font-bold leading-[1.75] overflow-visible">
            {t("navParentPortal")}
          </span>
        </Link>

        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface-card p-4 shadow-2xs sm:col-span-2">
          <Link
            href="/lessons/g1-make-ten"
            data-testid="home-start-lesson-link"
            className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-xl border border-accent/30 bg-surface px-5 py-3 text-center text-khmer-body font-semibold leading-[1.75] text-ink overflow-visible transition-colors hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {t("navPlayLesson")}
          </Link>
          <LessonCompletionBadge lessonId="g1-make-ten" />
        </div>
      </section>

      <section
        aria-labelledby="home-showcase-heading"
        data-testid="home-showcase-footer"
        className="mt-4 space-y-5 rounded-2xl border border-border/80 bg-surface-card/70 p-4 sm:p-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
          <h2 id="home-showcase-heading" className="text-khmer-body font-semibold text-ink-muted">
            {t("homeShowcaseHeading")}
          </h2>
          <Link
            href="/preview/g1-make-ten"
            data-testid="home-preview-lesson-link"
            className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-xl border border-border bg-surface px-4 py-2 text-center text-sm font-semibold leading-[1.75] text-ink-muted overflow-visible transition-colors hover:bg-accent-soft hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {t("navPreviewLesson")}
          </Link>
        </div>

        <div
          aria-label={t("numeralToggleGroupLabel")}
          className="flex flex-col items-center gap-3 rounded-xl border border-border bg-surface p-4 text-center"
        >
          <p className="text-khmer-body font-medium text-ink">{t("numeralToggleGroupLabel")}</p>
          <NumeralToggle />
        </div>

        <div
          aria-labelledby="khmer-specimen-heading"
          className="space-y-3 rounded-xl border border-border bg-surface p-4"
        >
          <h3 id="khmer-specimen-heading" className="text-khmer-body font-semibold text-accent">
            {t("instructionSectionLabel")}
          </h3>
          <p
            data-testid="khmer-instruction"
            className="text-khmer-instruction font-semibold text-ink"
          >
            បង្កើតដប់៖ រាប់ផ្លែស្វាយ និងប្រៀបធៀបចំនួនប្រាំបួន។
          </p>
          <p data-testid="khmer-body" className="text-khmer-body text-ink-muted">
            គ្រូបង្រៀន និងស្ត្រីលក់ផ្លែឈើជួយកូនសិស្សរៀនរាប់លេខ និងផ្គុំចំនួនតាមរូបភាព។
          </p>
        </div>

        <div
          aria-labelledby="sample-numbers-heading"
          className="space-y-3 rounded-xl border border-border bg-surface p-4"
        >
          <h3 id="sample-numbers-heading" className="text-khmer-body font-semibold text-ink">
            {t("sampleNumbersLabel")}
          </h3>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {GRADE_1_SAMPLE_NUMBERS.map((value) => (
              <div
                key={value}
                className="flex min-h-touch items-center justify-center rounded-xl border border-border bg-accent-soft px-3 py-2 text-center"
              >
                <FormattedNumber
                  value={value}
                  data-testid={`sample-number-${value}`}
                  className="text-khmer-instruction font-bold text-accent"
                />
              </div>
            ))}
          </div>
        </div>

        <div
          aria-labelledby="sample-actions-heading"
          className="space-y-3 rounded-xl border border-border bg-surface p-4"
        >
          <h3 id="sample-actions-heading" className="text-khmer-body font-semibold text-ink">
            {t("sampleActionsLabel")}
          </h3>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              data-testid="khmer-control-start"
              className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-xl bg-accent px-5 py-2.5 text-khmer-body font-semibold leading-[1.75] text-white overflow-visible transition-colors hover:bg-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {t("actionStartPractice")}
            </button>
            <button
              type="button"
              data-testid="khmer-control-listen"
              className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-xl border border-border bg-surface-card px-5 py-2.5 text-khmer-body font-semibold leading-[1.75] text-ink overflow-visible transition-colors hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {t("actionListenAgain")}
            </button>
            <button
              type="button"
              data-testid="khmer-control-check"
              className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-xl border border-border bg-surface-card px-5 py-2.5 text-khmer-body font-semibold leading-[1.75] text-ink overflow-visible transition-colors hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {t("actionCheckAnswer")}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
