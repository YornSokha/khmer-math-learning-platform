"use client";

import type { KeyboardEvent } from "react";
import { useNumeralPreference } from "@/components/khmer/NumeralPreferenceProvider";
import type { SupportsLevel } from "@/lib/content/schema";
import { formatTemplateText } from "@/lib/engine/evaluate";
import { t } from "@/lib/i18n/messages";
import { formatNumber, normalizeDigits, parseNumericAnswer } from "@/lib/khmer/numerals";
import { NumericKeypad } from "./NumericKeypad";
import { TenFrameActivity } from "./TenFrameActivity";

export interface EquationFillActivityProps {
  template: string;
  resolvedParams: Record<string, number>;
  supports?: SupportsLevel;
  value: string;
  onChange: (nextValue: string) => void;
  activeHintCue?: string;
  disabled?: boolean;
}

function localizeDigitsInTemplate(text: string, numeralSystem: "khmer" | "arabic"): string {
  return text.replace(/\d+/g, (match) =>
    formatNumber(Number(match), { numeralSystem, useGrouping: false }),
  );
}

export function EquationFillActivity({
  template,
  resolvedParams,
  supports = "none",
  value,
  onChange,
  activeHintCue,
  disabled = false,
}: EquationFillActivityProps) {
  const { numeralSystem } = useNumeralPreference();

  const substituted = localizeDigitsInTemplate(
    formatTemplateText(template, resolvedParams, numeralSystem),
    numeralSystem,
  );
  const parts = substituted.split("□");
  const parsedValue = parseNumericAnswer(value);
  const formattedAnswer =
    value.length > 0 && parsedValue !== null
      ? formatNumber(parsedValue, { numeralSystem, useGrouping: false })
      : "?";

  const showTenFrame =
    supports === "full" || supports === "partial" || activeHintCue === "highlight-ten-frame-model";

  const firstParam = resolvedParams.a ?? resolvedParams.given ?? 0;

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (event.key === "Backspace") {
      event.preventDefault();
      onChange(value.slice(0, -1));
      return;
    }

    const normalized = normalizeDigits(event.key);
    if (/^[0-9]$/.test(normalized) && value.length < 3) {
      event.preventDefault();
      onChange(value === "0" ? normalized : `${value}${normalized}`);
    }
  };

  return (
    <div className="space-y-5" onKeyDown={handleKeyDown}>
      {showTenFrame && (
        <div
          data-testid="equation-visual-scaffold"
          aria-label={t("equationVisualModelLabel")}
          className="space-y-2"
        >
          <TenFrameActivity
            mode="read"
            given={firstParam}
            value={parsedValue ?? 0}
            activeHintCue={
              activeHintCue === "highlight-ten-frame-model" ? "highlight-empty-cells" : undefined
            }
            readOnly
          />
        </div>
      )}

      <div
        tabIndex={0}
        aria-label={t("equationAnswerPlaceholder")}
        data-testid="equation-display"
        className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border-2 border-border bg-surface p-4 text-center text-khmer-display font-bold text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <span>{parts[0]}</span>
        <span
          data-testid="equation-answer-slot"
          className={`inline-flex min-h-touch min-w-16 items-center justify-center rounded-xl border-2 px-3 py-1 ${
            value.length > 0
              ? "border-accent bg-accent-soft text-accent"
              : "border-dashed border-accent/60 bg-surface-card text-ink-muted"
          }`}
        >
          {formattedAnswer}
        </span>
        {parts[1] ? <span>{parts[1]}</span> : null}
      </div>

      <NumericKeypad value={value} onChange={onChange} disabled={disabled} />
    </div>
  );
}
