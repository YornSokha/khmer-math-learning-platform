"use client";

import type { ChoiceOption } from "@/lib/content/schema";
import { MotifIcon } from "./CambodianSvgMotifs";

export interface ChoicePictorialActivityProps {
  options: ChoiceOption[];
  value: string;
  onChange: (nextValue: string) => void;
  activeHintCue?: string;
  disabled?: boolean;
}

export function ChoicePictorialActivity({
  options,
  value,
  onChange,
  disabled = false,
}: ChoicePictorialActivityProps) {
  return (
    <div
      role="group"
      data-testid="choice-pictorial-group"
      className="grid grid-cols-2 gap-3 sm:grid-cols-2"
    >
      {options.map((option) => {
        const isSelected = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            disabled={disabled}
            aria-pressed={isSelected}
            data-testid={`choice-option-${option.id}`}
            onClick={() => onChange(option.id)}
            className={`flex min-h-24 min-w-touch flex-col items-center justify-center gap-2 rounded-2xl border-2 p-4 text-center overflow-visible transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
              isSelected
                ? "border-accent bg-accent-soft text-accent shadow-xs"
                : "border-border bg-surface-card text-ink hover:border-accent/60 hover:bg-accent-soft/40"
            }`}
          >
            {option.visual && option.visual !== "numeral" && (
              <div className="flex flex-wrap items-center justify-center gap-1">
                {Array.from({ length: Math.max(1, Math.min(10, option.count ?? 1)) }, (_, idx) => (
                  <MotifIcon
                    key={idx}
                    kind={option.visual!}
                    className={(option.count ?? 1) > 4 ? "h-7 w-7" : "h-10 w-10"}
                  />
                ))}
              </div>
            )}
            <span className="text-khmer-instruction font-bold leading-[1.75]">
              {option.label.km}
            </span>
          </button>
        );
      })}
    </div>
  );
}
