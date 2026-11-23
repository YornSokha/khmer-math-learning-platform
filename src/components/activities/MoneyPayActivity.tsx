"use client";

import { useState } from "react";
import { FormattedNumber } from "@/components/khmer/FormattedNumber";
import { useNumeralPreference } from "@/components/khmer/NumeralPreferenceProvider";
import { t } from "@/lib/i18n/messages";
import { formatNumber } from "@/lib/khmer/numerals";

export interface MoneyPayActivityProps {
  denominations?: number[];
  onChange: (totalRiel: number) => void;
  activeHintCue?: string;
  disabled?: boolean;
}

function RielNoteSvg({ value, label }: { value: number; label: string }) {
  const isHundred = value >= 100;
  const bg = isHundred ? "#ecfdf5" : "#fffbeb";
  const border = isHundred ? "#0f766e" : "#b45309";
  const ink = isHundred ? "#115e59" : "#92400e";

  return (
    <svg viewBox="0 0 110 56" aria-hidden="true" className="h-12 w-24">
      <rect
        x="2"
        y="2"
        width="106"
        height="52"
        rx="8"
        fill={bg}
        stroke={border}
        strokeWidth="2.5"
      />
      <rect
        x="8"
        y="8"
        width="94"
        height="40"
        rx="5"
        fill="none"
        stroke={border}
        strokeWidth="1"
        strokeDasharray="3 2"
      />
      <text x="55" y="34" textAnchor="middle" fontSize="18" fontWeight="700" fill={ink}>
        {label} ៛
      </text>
    </svg>
  );
}

export function MoneyPayActivity({
  denominations = [50, 100],
  onChange,
  activeHintCue,
  disabled = false,
}: MoneyPayActivityProps) {
  const { numeralSystem } = useNumeralPreference();
  const [trayNotes, setTrayNotes] = useState<number[]>([]);

  const total = trayNotes.reduce((sum, note) => sum + note, 0);

  const addNote = (note: number) => {
    if (disabled || trayNotes.length >= 12) return;
    const next = [...trayNotes, note];
    setTrayNotes(next);
    onChange(next.reduce((sum, n) => sum + n, 0));
  };

  const removeNoteAt = (index: number) => {
    if (disabled) return;
    const next = trayNotes.filter((_, i) => i !== index);
    setTrayNotes(next);
    onChange(next.reduce((sum, n) => sum + n, 0));
  };

  const clearTray = () => {
    if (disabled) return;
    setTrayNotes([]);
    onChange(0);
  };

  return (
    <div className="space-y-4">
      <div
        data-testid="money-pay-tray"
        className={`flex min-h-28 flex-wrap items-center justify-center gap-2 rounded-2xl border-2 p-3 ${
          activeHintCue === "highlight-riel-notes"
            ? "border-amber-500 bg-amber-50/70"
            : "border-accent/40 bg-surface"
        }`}
      >
        {trayNotes.map((note, idx) => (
          <button
            key={`${note}-${idx}`}
            type="button"
            disabled={disabled}
            data-testid={`tray-note-${idx}`}
            onClick={() => removeNoteAt(idx)}
            className="rounded-xl p-0.5 overflow-visible transition-transform active:scale-95"
          >
            <RielNoteSvg
              value={note}
              label={formatNumber(note, { numeralSystem, useGrouping: false })}
            />
          </button>
        ))}
      </div>

      <p
        data-testid="money-pay-total"
        className="text-center text-khmer-instruction font-bold text-accent"
      >
        {t("moneyPayTotalLabel")}: <FormattedNumber value={total} /> {t("moneyPayUnitRiel")}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {denominations.map((note) => {
          const label = formatNumber(note, { numeralSystem, useGrouping: false });
          return (
            <button
              key={note}
              type="button"
              disabled={disabled}
              data-testid={`add-riel-${note}`}
              onClick={() => addNote(note)}
              className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-2xl border-2 border-border bg-surface-card p-2 shadow-2xs overflow-visible transition-colors hover:border-accent hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <RielNoteSvg value={note} label={label} />
            </button>
          );
        })}

        {trayNotes.length > 0 && (
          <button
            type="button"
            disabled={disabled}
            data-testid="money-pay-clear"
            onClick={clearTray}
            className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-xl border border-border bg-surface px-4 py-2.5 text-khmer-body font-semibold leading-[1.75] text-ink-muted overflow-visible hover:bg-accent-soft"
          >
            {t("moneyPayClear")}
          </button>
        )}
      </div>
    </div>
  );
}
