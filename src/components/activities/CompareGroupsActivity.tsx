"use client";

import { FormattedNumber } from "@/components/khmer/FormattedNumber";
import { t } from "@/lib/i18n/messages";
import { MotifIcon } from "./CambodianSvgMotifs";

export interface CompareGroupsActivityProps {
  leftCount: number;
  rightCount: number;
  visualKind?: string;
  value: string;
  onChange: (symbol: string) => void;
  activeHintCue?: string;
  disabled?: boolean;
}

const SYMBOLS = [
  { id: "<", ariaKey: "compareLess" },
  { id: "=", ariaKey: "compareEqual" },
  { id: ">", ariaKey: "compareGreater" },
] as const;

export function CompareGroupsActivity({
  leftCount,
  rightCount,
  visualKind = "longan",
  value,
  onChange,
  activeHintCue,
  disabled = false,
}: CompareGroupsActivityProps) {
  const showCounts = activeHintCue === "highlight-compare-counts";

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <div
          data-testid="compare-group-left"
          className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-border bg-surface p-3"
        >
          <div className="flex flex-wrap items-center justify-center gap-1">
            {Array.from({ length: Math.max(0, Math.min(12, leftCount)) }, (_, idx) => (
              <MotifIcon key={idx} kind={visualKind} className="h-7 w-7" />
            ))}
          </div>
          {showCounts && (
            <span
              data-testid="compare-count-left"
              className="rounded-full bg-accent-soft px-2.5 py-0.5 text-khmer-body font-bold text-accent"
            >
              <FormattedNumber value={leftCount} />
            </span>
          )}
        </div>

        <div
          data-testid="compare-selected-slot"
          className="flex min-h-touch min-w-12 items-center justify-center rounded-xl border-2 border-dashed border-accent bg-accent-soft px-3 py-1 text-khmer-display font-bold text-accent"
        >
          {value || "?"}
        </div>

        <div
          data-testid="compare-group-right"
          className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-border bg-surface p-3"
        >
          <div className="flex flex-wrap items-center justify-center gap-1">
            {Array.from({ length: Math.max(0, Math.min(12, rightCount)) }, (_, idx) => (
              <MotifIcon key={idx} kind={visualKind} className="h-7 w-7" />
            ))}
          </div>
          {showCounts && (
            <span
              data-testid="compare-count-right"
              className="rounded-full bg-accent-soft px-2.5 py-0.5 text-khmer-body font-bold text-accent"
            >
              <FormattedNumber value={rightCount} />
            </span>
          )}
        </div>
      </div>

      <div role="group" className="flex flex-wrap items-center justify-center gap-3">
        {SYMBOLS.map((sym) => {
          const isSelected = value === sym.id;
          return (
            <button
              key={sym.id}
              type="button"
              disabled={disabled}
              aria-pressed={isSelected}
              aria-label={t(sym.ariaKey)}
              data-testid={`compare-symbol-${sym.id}`}
              onClick={() => onChange(sym.id)}
              className={`inline-flex min-h-touch min-w-16 items-center justify-center rounded-xl border-2 px-5 py-2.5 text-khmer-display font-bold leading-[1.4] overflow-visible transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                isSelected
                  ? "border-accent bg-accent text-white shadow-xs"
                  : "border-border bg-surface-card text-ink hover:bg-accent-soft"
              }`}
            >
              {sym.id}
            </button>
          );
        })}
      </div>
    </div>
  );
}
