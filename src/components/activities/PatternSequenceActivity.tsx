"use client";

import type { ChoiceOption } from "@/lib/content/schema";
import { t } from "@/lib/i18n/messages";
import { MotifIcon } from "./CambodianSvgMotifs";

export interface PatternSequenceActivityProps {
  pattern: string[];
  options: ChoiceOption[];
  value: string;
  onChange: (optionId: string) => void;
  activeHintCue?: string;
  disabled?: boolean;
}

export function PatternSequenceActivity({
  pattern,
  options,
  value,
  onChange,
  activeHintCue,
  disabled = false,
}: PatternSequenceActivityProps) {
  const selectedOption = options.find((opt) => opt.id === value);
  const highlightUnit = activeHintCue === "highlight-pattern-unit";

  return (
    <div className="space-y-5">
      <div
        data-testid="pattern-sequence-row"
        className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-border bg-surface p-4"
      >
        {pattern.map((token, idx) => {
          const isMissing = token === "?";
          if (isMissing) {
            return (
              <div
                key={`slot-${idx}`}
                data-testid="pattern-missing-slot"
                className={`flex h-14 w-14 items-center justify-center rounded-xl border-2 border-dashed ${
                  selectedOption
                    ? "border-accent bg-accent-soft"
                    : "border-accent/60 bg-surface-card"
                }`}
              >
                {selectedOption?.visual ? (
                  <MotifIcon kind={selectedOption.visual} className="h-10 w-10" />
                ) : (
                  <span className="text-khmer-instruction font-bold text-accent">
                    {t("patternMissingSlot")}
                  </span>
                )}
              </div>
            );
          }

          return (
            <div
              key={`tile-${idx}`}
              className={`flex h-14 w-14 items-center justify-center rounded-xl border bg-surface-card ${
                highlightUnit && idx < 2
                  ? "border-2 border-amber-500 ring-2 ring-amber-200"
                  : "border-border"
              }`}
            >
              <MotifIcon kind={token} className="h-10 w-10" />
            </div>
          );
        })}
      </div>

      <div role="group" className="flex flex-wrap items-center justify-center gap-3">
        {options.map((option) => {
          const isSelected = value === option.id;
          return (
            <button
              key={option.id}
              type="button"
              disabled={disabled}
              aria-pressed={isSelected}
              data-testid={`pattern-option-${option.id}`}
              onClick={() => onChange(option.id)}
              className={`inline-flex min-h-touch min-w-touch flex-col items-center justify-center gap-1 rounded-2xl border-2 px-4 py-2.5 overflow-visible transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                isSelected
                  ? "border-accent bg-accent-soft text-accent shadow-xs"
                  : "border-border bg-surface-card text-ink hover:bg-accent-soft/40"
              }`}
            >
              {option.visual && <MotifIcon kind={option.visual} className="h-10 w-10" />}
              <span className="text-khmer-body font-semibold leading-[1.75]">
                {option.label.km}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
