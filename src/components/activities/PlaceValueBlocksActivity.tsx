"use client";

import { useState } from "react";
import { FormattedNumber } from "@/components/khmer/FormattedNumber";
import { t } from "@/lib/i18n/messages";

export interface PlaceValueBlocksActivityProps {
  initialTens?: number;
  initialOnes?: number;
  onChange: (totalValue: number) => void;
  activeHintCue?: string;
  disabled?: boolean;
}

function TenBundleSvg() {
  return (
    <svg viewBox="0 0 36 60" aria-hidden="true" className="h-14 w-9">
      {Array.from({ length: 5 }, (_, i) => (
        <rect
          key={i}
          x={5 + i * 5.5}
          y="4"
          width="4"
          height="52"
          rx="1.5"
          fill="#d97706"
          stroke="#92400e"
          strokeWidth="0.8"
        />
      ))}
      <rect x="2" y="25" width="32" height="7" rx="3" fill="#be123c" />
    </svg>
  );
}

function OneStickSvg() {
  return (
    <svg viewBox="0 0 14 52" aria-hidden="true" className="h-12 w-3.5">
      <rect
        x="3"
        y="4"
        width="8"
        height="44"
        rx="2"
        fill="#0f766e"
        stroke="#115e59"
        strokeWidth="1.2"
      />
    </svg>
  );
}

export function PlaceValueBlocksActivity({
  initialTens = 0,
  initialOnes = 0,
  onChange,
  activeHintCue,
  disabled = false,
}: PlaceValueBlocksActivityProps) {
  const [tens, setTens] = useState(Math.max(0, Math.min(9, initialTens)));
  const [ones, setOnes] = useState(Math.max(0, Math.min(9, initialOnes)));

  const update = (nextTens: number, nextOnes: number) => {
    if (disabled) return;
    const tClamped = Math.max(0, Math.min(9, nextTens));
    const oClamped = Math.max(0, Math.min(9, nextOnes));
    setTens(tClamped);
    setOnes(oClamped);
    onChange(tClamped * 10 + oClamped);
  };

  const total = tens * 10 + ones;
  const highlight = activeHintCue === "highlight-tens-ones";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div
          data-testid="place-value-tens-column"
          className={`flex min-h-36 flex-col justify-between rounded-2xl border-2 p-3 ${
            highlight ? "border-amber-500 bg-amber-50/70" : "border-border bg-surface"
          }`}
        >
          <p className="text-center text-sm font-semibold text-ink-muted">
            {t("placeValueTens")} (<FormattedNumber value={tens} />)
          </p>
          <div className="flex min-h-16 flex-wrap items-center justify-center gap-1.5 py-2">
            {Array.from({ length: tens }, (_, i) => (
              <TenBundleSvg key={i} />
            ))}
          </div>
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              disabled={disabled || tens <= 0}
              data-testid="place-value-tens-minus"
              onClick={() => update(tens - 1, ones)}
              className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-xl border border-border bg-surface-card px-3 py-2 text-khmer-body font-bold text-ink overflow-visible disabled:opacity-40"
            >
              {t("placeValueRemoveTen")}
            </button>
            <button
              type="button"
              disabled={disabled || tens >= 9}
              data-testid="place-value-tens-plus"
              onClick={() => update(tens + 1, ones)}
              className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-xl bg-accent px-3 py-2 text-khmer-body font-bold text-white overflow-visible disabled:opacity-40"
            >
              {t("placeValueAddTen")}
            </button>
          </div>
        </div>

        <div
          data-testid="place-value-ones-column"
          className={`flex min-h-36 flex-col justify-between rounded-2xl border-2 p-3 ${
            highlight ? "border-accent bg-accent-soft/70" : "border-border bg-surface"
          }`}
        >
          <p className="text-center text-sm font-semibold text-ink-muted">
            {t("placeValueOnes")} (<FormattedNumber value={ones} />)
          </p>
          <div className="flex min-h-16 flex-wrap items-center justify-center gap-1 py-2">
            {Array.from({ length: ones }, (_, i) => (
              <OneStickSvg key={i} />
            ))}
          </div>
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              disabled={disabled || ones <= 0}
              data-testid="place-value-ones-minus"
              onClick={() => update(tens, ones - 1)}
              className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-xl border border-border bg-surface-card px-3 py-2 text-khmer-body font-bold text-ink overflow-visible disabled:opacity-40"
            >
              {t("placeValueRemoveOne")}
            </button>
            <button
              type="button"
              disabled={disabled || ones >= 9}
              data-testid="place-value-ones-plus"
              onClick={() => update(tens, ones + 1)}
              className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-xl bg-accent px-3 py-2 text-khmer-body font-bold text-white overflow-visible disabled:opacity-40"
            >
              {t("placeValueAddOne")}
            </button>
          </div>
        </div>
      </div>

      <p
        data-testid="place-value-total"
        className="text-center text-khmer-instruction font-bold text-accent"
      >
        <FormattedNumber value={total} />
      </p>
    </div>
  );
}
