"use client";

import { useState } from "react";
import { FormattedNumber } from "@/components/khmer/FormattedNumber";
import { t } from "@/lib/i18n/messages";
import { MotifIcon } from "./CambodianSvgMotifs";

export interface DragToGroupActivityProps {
  mode: "add" | "remove";
  initialCount: number;
  maxCount?: number;
  visualKind?: string;
  value?: number;
  onChange: (basketCount: number) => void;
  activeHintCue?: string;
  disabled?: boolean;
}

export function DragToGroupActivity({
  mode,
  initialCount,
  maxCount = 12,
  visualKind = "banana",
  onChange,
  activeHintCue,
  disabled = false,
}: DragToGroupActivityProps) {
  const [basketCount, setBasketCount] = useState(Math.max(0, initialCount));
  const safeMax = Math.max(initialCount, maxCount);

  const updateCount = (next: number) => {
    if (disabled) return;
    const clamped = Math.max(0, Math.min(safeMax, next));
    setBasketCount(clamped);
    onChange(clamped);
  };

  return (
    <div className="space-y-4">
      <div
        data-testid="drag-group-basket"
        className={`mx-auto flex min-h-32 w-full max-w-sm flex-wrap items-center justify-center gap-2 rounded-3xl border-2 p-4 ${
          activeHintCue === "highlight-basket-target"
            ? "border-amber-500 bg-amber-50/70"
            : "border-accent/40 bg-accent-soft/60"
        }`}
      >
        {Array.from({ length: basketCount }, (_, idx) => (
          <button
            key={idx}
            type="button"
            disabled={disabled || mode !== "remove"}
            data-testid={`basket-item-${idx}`}
            onClick={() => updateCount(basketCount - 1)}
            className="flex min-h-touch min-w-touch items-center justify-center rounded-xl bg-surface-card/90 p-1 shadow-2xs overflow-visible transition-transform active:scale-95"
          >
            <MotifIcon kind={visualKind} className="h-9 w-9" />
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          disabled={disabled || basketCount <= 0}
          data-testid="basket-remove-button"
          onClick={() => updateCount(basketCount - 1)}
          className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-xl border border-border bg-surface-card px-4 py-2.5 text-khmer-body font-semibold leading-[1.75] text-ink overflow-visible transition-colors hover:bg-accent-soft disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {t("basketRemoveItem")}
        </button>
        <button
          type="button"
          disabled={disabled || basketCount >= safeMax}
          data-testid="basket-add-button"
          onClick={() => updateCount(basketCount + 1)}
          className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-xl bg-accent px-5 py-2.5 text-khmer-body font-semibold leading-[1.75] text-white overflow-visible transition-colors hover:bg-accent-strong disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {t("basketAddItem")}
        </button>
      </div>

      <p data-testid="basket-count-label" className="text-center text-khmer-body text-ink-muted">
        {t("basketInCount")}:{" "}
        <FormattedNumber value={basketCount} className="font-bold text-accent" />
      </p>
    </div>
  );
}
