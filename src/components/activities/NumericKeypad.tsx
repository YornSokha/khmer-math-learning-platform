"use client";

import { useNumeralPreference } from "@/components/khmer/NumeralPreferenceProvider";
import { t } from "@/lib/i18n/messages";
import { formatNumber } from "@/lib/khmer/numerals";

export interface NumericKeypadProps {
  value: string;
  onChange: (nextValue: string) => void;
  maxLength?: number;
  disabled?: boolean;
}

const KEYPAD_DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

export function NumericKeypad({
  value,
  onChange,
  maxLength = 3,
  disabled = false,
}: NumericKeypadProps) {
  const { numeralSystem } = useNumeralPreference();

  const appendDigit = (digit: number) => {
    if (disabled) return;
    const digitStr = String(digit);
    if (value === "0") {
      onChange(digitStr);
      return;
    }
    if (value.length >= maxLength) return;
    onChange(`${value}${digitStr}`);
  };

  const handleBackspace = () => {
    if (disabled || value.length === 0) return;
    onChange(value.slice(0, -1));
  };

  const handleClear = () => {
    if (disabled || value.length === 0) return;
    onChange("");
  };

  const buttonClasses =
    "inline-flex min-h-touch min-w-touch items-center justify-center rounded-xl border border-border bg-surface-card px-3 py-2.5 text-khmer-instruction font-bold leading-[1.75] text-ink overflow-visible shadow-2xs transition-colors hover:bg-accent-soft active:bg-accent active:text-white disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

  return (
    <div
      role="group"
      aria-label={t("keypadLabel")}
      className="mx-auto grid w-full max-w-xs grid-cols-3 gap-2.5"
    >
      {KEYPAD_DIGITS.map((digit) => {
        const display = formatNumber(digit, { numeralSystem, useGrouping: false });
        return (
          <button
            key={digit}
            type="button"
            disabled={disabled}
            aria-label={display}
            data-testid={`keypad-digit-${digit}`}
            onClick={() => appendDigit(digit)}
            className={buttonClasses}
          >
            {display}
          </button>
        );
      })}

      <button
        type="button"
        disabled={disabled}
        data-testid="keypad-clear"
        onClick={handleClear}
        className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-xl border border-border bg-surface px-3 py-2.5 text-khmer-body font-semibold leading-[1.75] text-ink-muted overflow-visible transition-colors hover:bg-accent-soft disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {t("keypadClear")}
      </button>

      <button
        type="button"
        disabled={disabled}
        aria-label={formatNumber(0, { numeralSystem, useGrouping: false })}
        data-testid="keypad-digit-0"
        onClick={() => appendDigit(0)}
        className={buttonClasses}
      >
        {formatNumber(0, { numeralSystem, useGrouping: false })}
      </button>

      <button
        type="button"
        disabled={disabled}
        data-testid="keypad-backspace"
        onClick={handleBackspace}
        className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-xl border border-border bg-surface px-3 py-2.5 text-khmer-body font-semibold leading-[1.75] text-ink-muted overflow-visible transition-colors hover:bg-accent-soft disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {t("keypadBackspace")}
      </button>
    </div>
  );
}
