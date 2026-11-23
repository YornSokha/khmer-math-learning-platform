import Link from "next/link";
import { FormattedNumber } from "@/components/khmer/FormattedNumber";
import { NumeralToggle } from "@/components/khmer/NumeralToggle";
import { t } from "@/lib/i18n/messages";

const GRADE_1_SAMPLE_NUMBERS = [0, 5, 7, 10, 100] as const;

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col gap-6 px-4 py-8 sm:px-6">
      <header className="space-y-2 text-center">
        <h1 className="text-khmer-heading font-bold text-ink">{t("appTitle")}</h1>
        <p className="text-khmer-body text-ink-muted">{t("appTagline")}</p>
      </header>

      <section
        aria-label={t("navPlayLesson")}
        className="flex flex-col gap-3 rounded-2xl border border-accent/30 bg-surface-card p-5 shadow-xs"
      >
        <Link
          href="/lessons/g1-make-ten"
          data-testid="home-start-lesson-link"
          className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-xl bg-accent px-5 py-3 text-center text-khmer-body font-semibold leading-[1.75] text-white overflow-visible transition-colors hover:bg-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {t("navPlayLesson")}
        </Link>
        <Link
          href="/preview/g1-make-ten"
          className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-xl border border-border bg-surface px-5 py-2.5 text-center text-khmer-body font-semibold leading-[1.75] text-ink overflow-visible transition-colors hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {t("navPreviewLesson")}
        </Link>
      </section>

      <section
        aria-label={t("numeralToggleGroupLabel")}
        className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface-card p-5 text-center shadow-xs"
      >
        <p className="text-khmer-body font-medium text-ink">{t("numeralToggleGroupLabel")}</p>
        <NumeralToggle />
      </section>

      <section
        aria-labelledby="khmer-specimen-heading"
        className="space-y-4 rounded-2xl border border-border bg-surface-card p-5 shadow-xs"
      >
        <h2 id="khmer-specimen-heading" className="text-khmer-body font-semibold text-accent">
          {t("instructionSectionLabel")}
        </h2>
        <p
          data-testid="khmer-instruction"
          className="text-khmer-instruction font-semibold text-ink"
        >
          បង្កើតដប់៖ រាប់ផ្លែស្វាយ និងប្រៀបធៀបចំនួនប្រាំបួន។
        </p>
        <p data-testid="khmer-body" className="text-khmer-body text-ink-muted">
          គ្រូបង្រៀន និងស្ត្រីលក់ផ្លែឈើជួយកូនសិស្សរៀនរាប់លេខ និងផ្គុំចំនួនតាមរូបភាព។
        </p>
      </section>

      <section
        aria-labelledby="sample-numbers-heading"
        className="space-y-4 rounded-2xl border border-border bg-surface-card p-5 shadow-xs"
      >
        <h2 id="sample-numbers-heading" className="text-khmer-body font-semibold text-ink">
          {t("sampleNumbersLabel")}
        </h2>
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
      </section>

      <section
        aria-labelledby="sample-actions-heading"
        className="space-y-4 rounded-2xl border border-border bg-surface-card p-5 shadow-xs"
      >
        <h2 id="sample-actions-heading" className="text-khmer-body font-semibold text-ink">
          {t("sampleActionsLabel")}
        </h2>
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
      </section>
    </main>
  );
}
