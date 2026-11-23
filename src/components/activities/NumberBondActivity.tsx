"use client";

import { useNumeralPreference } from "@/components/khmer/NumeralPreferenceProvider";
import { t } from "@/lib/i18n/messages";
import { formatNumber, parseNumericAnswer } from "@/lib/khmer/numerals";
import { NumericKeypad } from "./NumericKeypad";

export interface NumberBondActivityProps {
  whole: number;
  knownPart: number;
  value: string;
  onChange: (nextValue: string) => void;
  activeHintCue?: string;
  disabled?: boolean;
}

export function NumberBondActivity({
  whole,
  knownPart,
  value,
  onChange,
  activeHintCue,
  disabled = false,
}: NumberBondActivityProps) {
  const { numeralSystem } = useNumeralPreference();
  const parsed = parseNumericAnswer(value);
  const wholeDisplay = formatNumber(whole, { numeralSystem, useGrouping: false });
  const knownDisplay = formatNumber(knownPart, { numeralSystem, useGrouping: false });
  const answerDisplay =
    value.length > 0 && parsed !== null
      ? formatNumber(parsed, { numeralSystem, useGrouping: false })
      : "?";

  const highlightParts = activeHintCue === "highlight-bond-parts";

  return (
    <div className="space-y-5">
      <div className="mx-auto w-full max-w-xs rounded-2xl border border-border bg-surface p-4">
        <svg
          viewBox="0 0 240 165"
          role="img"
          aria-label={`${t("bondWholeLabel")} ${wholeDisplay}`}
          data-testid="number-bond-svg"
          className="h-auto w-full"
        >
          <line x1="120" y1="62" x2="62" y2="112" stroke="#0f766e" strokeWidth="3.5" />
          <line x1="120" y1="62" x2="178" y2="112" stroke="#0f766e" strokeWidth="3.5" />

          <circle cx="120" cy="40" r="28" fill="#0f766e" stroke="#115e59" strokeWidth="3" />
          <text x="120" y="48" textAnchor="middle" fontSize="24" fontWeight="700" fill="#ffffff">
            {wholeDisplay}
          </text>

          <circle
            cx="62"
            cy="126"
            r="26"
            fill="#fef3c7"
            stroke={highlightParts ? "#d97706" : "#b45309"}
            strokeWidth="3"
          />
          <text x="62" y="134" textAnchor="middle" fontSize="22" fontWeight="700" fill="#1e293b">
            {knownDisplay}
          </text>

          <circle
            cx="178"
            cy="126"
            r="26"
            fill={value.length > 0 ? "#f0fdfa" : "#ffffff"}
            stroke={highlightParts ? "#d97706" : "#0f766e"}
            strokeWidth="3"
            strokeDasharray={value.length > 0 ? undefined : "5 4"}
          />
          <text
            x="178"
            y="134"
            textAnchor="middle"
            fontSize="22"
            fontWeight="700"
            fill="#0f766e"
            data-testid="number-bond-answer-slot"
          >
            {answerDisplay}
          </text>
        </svg>
      </div>

      <NumericKeypad value={value} onChange={onChange} disabled={disabled} maxLength={2} />
    </div>
  );
}
