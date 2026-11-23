"use client";

import { useState } from "react";
import { FormattedNumber } from "@/components/khmer/FormattedNumber";
import { t } from "@/lib/i18n/messages";

export interface PartitionActivityProps {
  parts: number;
  onChange: (shadedCount: number) => void;
  activeHintCue?: string;
  disabled?: boolean;
}

export function PartitionActivity({
  parts = 2,
  onChange,
  activeHintCue,
  disabled = false,
}: PartitionActivityProps) {
  const safeParts = Math.max(2, Math.min(4, parts));
  const [shaded, setShaded] = useState<number[]>([]);

  const togglePart = (idx: number) => {
    if (disabled) return;
    const exists = shaded.includes(idx);
    const next = exists ? shaded.filter((i) => i !== idx) : [...shaded, idx];
    setShaded(next);
    onChange(next.length);
  };

  return (
    <div className="space-y-4">
      <div
        role="group"
        data-testid="partition-grid"
        className={`mx-auto grid w-full max-w-xs overflow-hidden rounded-3xl border-2 ${
          activeHintCue === "highlight-equal-parts" ? "border-amber-500" : "border-accent"
        } ${safeParts === 4 ? "grid-cols-2" : "grid-cols-2"}`}
      >
        {Array.from({ length: safeParts }, (_, idx) => {
          const isShaded = shaded.includes(idx);
          return (
            <button
              key={idx}
              type="button"
              disabled={disabled}
              aria-pressed={isShaded}
              data-testid={`partition-part-${idx}`}
              onClick={() => togglePart(idx)}
              className={`flex min-h-24 min-w-touch items-center justify-center border border-accent/40 p-4 text-khmer-body font-bold overflow-visible transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent ${
                isShaded ? "bg-accent text-white" : "bg-amber-50 text-ink hover:bg-accent-soft"
              }`}
            >
              {isShaded ? "✓" : ""}
            </button>
          );
        })}
      </div>

      <p
        data-testid="partition-shaded-count"
        className="text-center text-khmer-body text-ink-muted"
      >
        {t("partitionShadedLabel")}:{" "}
        <FormattedNumber value={shaded.length} className="font-bold text-accent" /> /{" "}
        <FormattedNumber value={safeParts} />
      </p>
    </div>
  );
}
