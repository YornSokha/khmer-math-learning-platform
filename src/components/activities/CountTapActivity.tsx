"use client";

import { useEffect, useState } from "react";
import { FormattedNumber } from "@/components/khmer/FormattedNumber";
import { useNumeralPreference } from "@/components/khmer/NumeralPreferenceProvider";
import { t } from "@/lib/i18n/messages";
import { formatNumber } from "@/lib/khmer/numerals";
import { MotifIcon } from "./CambodianSvgMotifs";
import { NumericKeypad } from "./NumericKeypad";

export interface CountTapActivityProps {
  mode: "count" | "subitize";
  count: number;
  visualKind?: string;
  flashMs?: number;
  value: string;
  onChange: (nextValue: string) => void;
  activeHintCue?: string;
  disabled?: boolean;
}

export function CountTapActivity({
  mode,
  count,
  visualKind = "mango",
  flashMs = 2000,
  value,
  onChange,
  activeHintCue,
  disabled = false,
}: CountTapActivityProps) {
  const { numeralSystem } = useNumeralPreference();
  const safeCount = Math.max(0, Math.min(20, count));
  const [tappedIds, setTappedIds] = useState<number[]>([]);
  const [trayVisible, setTrayVisible] = useState(true);
  const [flashTick, setFlashTick] = useState(0);

  useEffect(() => {
    if (mode !== "subitize" || activeHintCue === "highlight-objects") {
      return;
    }
    const timer = window.setTimeout(() => {
      setTrayVisible(false);
    }, flashMs);
    return () => {
      window.clearTimeout(timer);
    };
  }, [mode, flashMs, flashTick, activeHintCue]);

  const showTray = mode !== "subitize" || trayVisible || activeHintCue === "highlight-objects";

  const handleTapItem = (idx: number) => {
    if (disabled || mode === "subitize") return;
    const exists = tappedIds.includes(idx);
    const next = exists ? tappedIds.filter((i) => i !== idx) : [...tappedIds, idx];
    setTappedIds(next);
    onChange(String(next.length));
  };

  return (
    <div className="space-y-4">
      <div
        data-testid="count-tap-tray"
        className={`mx-auto flex min-h-32 w-full max-w-sm flex-wrap items-center justify-center gap-3 rounded-2xl border-2 p-4 ${
          activeHintCue === "highlight-objects"
            ? "border-amber-400 bg-amber-50/70"
            : "border-border bg-surface"
        }`}
      >
        {showTray ? (
          Array.from({ length: safeCount }, (_, idx) => {
            const isTapped = tappedIds.includes(idx);
            const displayIdx = formatNumber(idx + 1, { numeralSystem, useGrouping: false });
            if (mode === "subitize") {
              return (
                <div
                  key={idx}
                  data-testid={`subitize-item-${idx}`}
                  className="flex h-12 w-12 items-center justify-center"
                >
                  <MotifIcon kind={visualKind} className="h-11 w-11" />
                </div>
              );
            }
            return (
              <button
                key={idx}
                type="button"
                disabled={disabled}
                aria-pressed={isTapped}
                aria-label={`${t("countTapPromptCount")} ${displayIdx}`}
                data-testid={`count-tap-item-${idx}`}
                onClick={() => handleTapItem(idx)}
                className={`relative flex min-h-touch min-w-touch items-center justify-center rounded-xl border-2 p-1.5 overflow-visible transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                  isTapped
                    ? "border-accent bg-accent-soft ring-2 ring-accent/40"
                    : "border-border bg-surface-card hover:bg-accent-soft/40"
                }`}
              >
                <MotifIcon kind={visualKind} className="h-10 w-10" />
                {isTapped && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
                    {formatNumber(tappedIds.indexOf(idx) + 1, {
                      numeralSystem,
                      useGrouping: false,
                    })}
                  </span>
                )}
              </button>
            );
          })
        ) : (
          <button
            type="button"
            data-testid="subitize-replay-button"
            onClick={() => {
              setTrayVisible(true);
              setFlashTick((n) => n + 1);
            }}
            className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-xl border border-accent bg-accent-soft px-5 py-2.5 text-khmer-body font-semibold leading-[1.75] text-accent overflow-visible"
          >
            {t("countTapFlashReplay")}
          </button>
        )}
      </div>

      {mode === "subitize" ? (
        <NumericKeypad value={value} onChange={onChange} disabled={disabled} maxLength={2} />
      ) : (
        <p data-testid="count-tap-total" className="text-center text-khmer-body text-ink-muted">
          {t("countTapPromptCount")}:{" "}
          <FormattedNumber value={tappedIds.length} className="font-bold text-accent" />
        </p>
      )}
    </div>
  );
}
