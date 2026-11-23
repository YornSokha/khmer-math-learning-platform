"use client";

import { DEFAULT_LOCALE, t, type Locale } from "@/lib/i18n/messages";
import type { NumeralSystem } from "@/lib/khmer/numerals";
import { useNumeralPreference } from "./NumeralPreferenceProvider";

export interface NumeralToggleProps {
  className?: string;
  locale?: Locale;
}

const baseButtonClasses =
  "inline-flex min-h-touch min-w-touch items-center justify-center rounded-xl px-4 py-2.5 text-khmer-body font-semibold leading-[1.75] overflow-visible transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export function NumeralToggle({ className = "", locale = DEFAULT_LOCALE }: NumeralToggleProps) {
  const { numeralSystem, setNumeralSystem } = useNumeralPreference();

  const options: Array<{
    system: NumeralSystem;
    label: string;
    ariaLabel: string;
  }> = [
    {
      system: "khmer",
      label: t("numeralToggleKhmerLabel", locale),
      ariaLabel: t("numeralToggleKhmerAriaLabel", locale),
    },
    {
      system: "arabic",
      label: t("numeralToggleArabicLabel", locale),
      ariaLabel: t("numeralToggleArabicAriaLabel", locale),
    },
  ];

  return (
    <div
      role="group"
      aria-label={t("numeralToggleGroupLabel", locale)}
      className={`inline-flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-surface-card p-1.5 overflow-visible ${className}`.trim()}
    >
      {options.map((option) => {
        const isActive = numeralSystem === option.system;

        return (
          <button
            key={option.system}
            type="button"
            aria-pressed={isActive}
            aria-label={option.ariaLabel}
            onClick={() => setNumeralSystem(option.system)}
            className={`${baseButtonClasses} ${
              isActive
                ? "bg-accent text-white shadow-xs"
                : "bg-surface-card text-ink hover:bg-accent-soft"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
