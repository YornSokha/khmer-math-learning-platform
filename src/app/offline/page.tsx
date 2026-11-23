import Link from "next/link";
import { t } from "@/lib/i18n/messages";

export default function OfflineFallbackPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col items-center justify-center gap-5 px-4 py-10 text-center sm:px-6">
      <div
        data-testid="offline-fallback-card"
        className="w-full space-y-5 rounded-2xl border border-border bg-surface-card p-6 shadow-xs"
      >
        <h1 className="text-khmer-heading font-bold text-ink">{t("offlinePageTitle")}</h1>
        <p className="text-khmer-body text-ink-muted">{t("offlinePageBody")}</p>
        <div className="flex flex-col gap-3">
          <Link
            href="/lessons/g1-make-ten"
            className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-xl bg-accent px-5 py-3 text-khmer-body font-semibold leading-[1.75] text-white overflow-visible transition-colors hover:bg-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {t("navPlayLesson")}
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-xl border border-border bg-surface px-5 py-3 text-khmer-body font-semibold leading-[1.75] text-ink overflow-visible transition-colors hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {t("navHome")}
          </Link>
        </div>
      </div>
    </main>
  );
}
