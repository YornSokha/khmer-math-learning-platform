"use client";

import { useState } from "react";
import { FormattedNumber } from "@/components/khmer/FormattedNumber";
import { useNumeralPreference } from "@/components/khmer/NumeralPreferenceProvider";
import { t } from "@/lib/i18n/messages";
import { formatNumber } from "@/lib/khmer/numerals";

export interface TenFrameActivityProps {
  mode: "fill" | "complete" | "read";
  given?: number;
  value?: number;
  onChange?: (addedCount: number) => void;
  activeHintCue?: string;
  readOnly?: boolean;
}

const TOTAL_CELLS = 10;

function MangoCounterSvg({ variant }: { variant: "given" | "added" }) {
  const fill = variant === "given" ? "#f59e0b" : "#0f766e";
  const stroke = variant === "given" ? "#b45309" : "#115e59";
  const leaf = variant === "given" ? "#15803d" : "#5eead4";

  return (
    <svg
      viewBox="0 0 40 40"
      aria-hidden="true"
      className="h-9 w-9 transition-transform duration-150"
    >
      <ellipse cx="20" cy="22" rx="13" ry="11" fill={fill} stroke={stroke} strokeWidth="2" />
      <path d="M20 11 C21 6, 26 5, 28 8 C25 10, 22 11, 20 11 Z" fill={leaf} />
      <circle cx="15" cy="18" r="2.2" fill="#ffffff" fillOpacity="0.45" />
    </svg>
  );
}

export function TenFrameActivity({
  mode,
  given = 0,
  value = 0,
  onChange,
  activeHintCue,
  readOnly = false,
}: TenFrameActivityProps) {
  const { numeralSystem } = useNumeralPreference();
  const clampedGiven = Math.max(0, Math.min(TOTAL_CELLS, given));
  const isReadOnly = readOnly || mode === "read";

  const [selectedCells, setSelectedCells] = useState<number[]>(() => {
    const initial: number[] = [];
    const maxAdded = TOTAL_CELLS - clampedGiven;
    const count = Math.max(0, Math.min(maxAdded, value));
    for (let i = 0; i < count; i += 1) {
      initial.push(clampedGiven + i);
    }
    return initial;
  });

  const effectiveSelected = isReadOnly
    ? Array.from(
        { length: Math.max(0, Math.min(TOTAL_CELLS - clampedGiven, value)) },
        (_, i) => clampedGiven + i,
      )
    : selectedCells;

  const addedCount = effectiveSelected.length;
  const totalCount = clampedGiven + addedCount;

  const toggleCell = (cellIndex: number) => {
    if (isReadOnly || cellIndex < clampedGiven) return;

    const exists = selectedCells.includes(cellIndex);
    const next = exists
      ? selectedCells.filter((idx) => idx !== cellIndex)
      : [...selectedCells, cellIndex].sort((a, b) => a - b);

    setSelectedCells(next);
    onChange?.(next.length);
  };

  const highlightEmpty = activeHintCue === "highlight-empty-cells";

  return (
    <div className="space-y-4">
      <div
        role="group"
        aria-label={t("tenFrameLabel")}
        data-testid="ten-frame-grid"
        className="mx-auto grid w-full max-w-sm grid-cols-5 gap-2 rounded-2xl border-2 border-accent/30 bg-surface p-3"
      >
        {Array.from({ length: TOTAL_CELLS }, (_, index) => {
          const isGiven = index < clampedGiven;
          const isAdded = effectiveSelected.includes(index);
          const isEmpty = !isGiven && !isAdded;
          const isHinted = highlightEmpty && isEmpty;
          const cellNumber = formatNumber(index + 1, { numeralSystem, useGrouping: false });

          if (isGiven || isReadOnly) {
            return (
              <div
                key={index}
                data-testid={`ten-frame-cell-${index}`}
                data-state={isGiven ? "given" : isAdded ? "added" : "empty"}
                data-hint-highlighted={isHinted ? "true" : "false"}
                className={`flex min-h-touch min-w-touch items-center justify-center rounded-xl border-2 ${
                  isGiven
                    ? "border-amber-300 bg-amber-50"
                    : isAdded
                      ? "border-accent bg-accent-soft"
                      : isHinted
                        ? "border-dashed border-amber-500 bg-amber-50/70"
                        : "border-border bg-surface-card"
                }`}
              >
                {isGiven ? (
                  <MangoCounterSvg variant="given" />
                ) : isAdded ? (
                  <MangoCounterSvg variant="added" />
                ) : null}
              </div>
            );
          }

          return (
            <button
              key={index}
              type="button"
              aria-pressed={isAdded}
              aria-label={`${t("tenFrameLabel")} ${cellNumber}`}
              data-testid={`ten-frame-cell-${index}`}
              data-state={isAdded ? "added" : "empty"}
              data-hint-highlighted={isHinted ? "true" : "false"}
              onClick={() => toggleCell(index)}
              className={`flex min-h-touch min-w-touch items-center justify-center rounded-xl border-2 overflow-visible transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                isAdded
                  ? "border-accent bg-accent-soft"
                  : isHinted
                    ? "border-dashed border-amber-500 bg-amber-50 ring-2 ring-amber-300"
                    : "border-border bg-surface-card hover:border-accent/60 hover:bg-accent-soft/40"
              }`}
            >
              {isAdded ? (
                <MangoCounterSvg variant="added" />
              ) : isHinted ? (
                <span className="text-sm font-bold text-amber-700" aria-hidden="true">
                  +
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 text-khmer-body text-ink-muted">
        {mode === "complete" && (
          <p data-testid="ten-frame-added-count">
            {t("tenFrameAddedCount")}:{" "}
            <FormattedNumber value={addedCount} className="font-bold text-accent" />
          </p>
        )}
        <p data-testid="ten-frame-total-count">
          {t("tenFrameTotalCount")}:{" "}
          <FormattedNumber value={totalCount} className="font-bold text-ink" /> /{" "}
          <FormattedNumber value={TOTAL_CELLS} className="font-semibold text-ink-muted" />
        </p>
      </div>
    </div>
  );
}
