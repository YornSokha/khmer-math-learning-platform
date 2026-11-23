"use client";

import { FormattedNumber } from "@/components/khmer/FormattedNumber";
import { useNumeralPreference } from "@/components/khmer/NumeralPreferenceProvider";
import { t } from "@/lib/i18n/messages";
import { formatNumber } from "@/lib/khmer/numerals";

export interface NumberLineActivityProps {
  mode: "jump" | "place";
  start?: number;
  target?: number;
  max?: number;
  value: number;
  onChange?: (hops: number) => void;
  activeHintCue?: string;
  readOnly?: boolean;
}

const SVG_WIDTH = 340;
const SVG_HEIGHT = 128;
const PADDING_X = 20;
const TRACK_Y = 82;

export function NumberLineActivity({
  start = 0,
  target = 10,
  max = 10,
  value,
  onChange,
  activeHintCue,
  readOnly = false,
}: NumberLineActivityProps) {
  const { numeralSystem } = useNumeralPreference();
  const safeMax = Math.max(1, max);
  const safeStart = Math.max(0, Math.min(safeMax, start));
  const safeHops = Math.max(0, Math.min(safeMax - safeStart, value));
  const currentStop = safeStart + safeHops;

  const getX = (stop: number) => PADDING_X + (stop / safeMax) * (SVG_WIDTH - PADDING_X * 2);

  const handleForward = () => {
    if (readOnly || currentStop >= safeMax) return;
    onChange?.(safeHops + 1);
  };

  const handleBack = () => {
    if (readOnly || safeHops <= 0) return;
    onChange?.(safeHops - 1);
  };

  const showHintArcs = activeHintCue === "show-jump-arcs" && target > safeStart;
  const hintArcCount = showHintArcs ? Math.min(safeMax, target) - safeStart : 0;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-surface p-3">
        <svg
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          role="img"
          aria-label={t("numberLineLabel")}
          data-testid="number-line-svg"
          className="h-auto w-full overflow-visible"
        >
          {/* Hint preview arcs */}
          {Array.from({ length: hintArcCount }, (_, idx) => {
            const x1 = getX(safeStart + idx);
            const x2 = getX(safeStart + idx + 1);
            const midX = (x1 + x2) / 2;
            return (
              <path
                key={`hint-${idx}`}
                data-testid={`hint-arc-${idx}`}
                d={`M ${x1} ${TRACK_Y - 8} Q ${midX} ${TRACK_Y - 48} ${x2} ${TRACK_Y - 8}`}
                fill="none"
                stroke="#d97706"
                strokeWidth="2.5"
                strokeDasharray="4 4"
              />
            );
          })}

          {/* Learner hop arcs */}
          {Array.from({ length: safeHops }, (_, idx) => {
            const x1 = getX(safeStart + idx);
            const x2 = getX(safeStart + idx + 1);
            const midX = (x1 + x2) / 2;
            return (
              <path
                key={`hop-${idx}`}
                data-testid={`hop-arc-${idx}`}
                d={`M ${x1} ${TRACK_Y - 6} Q ${midX} ${TRACK_Y - 42} ${x2} ${TRACK_Y - 6}`}
                fill="none"
                stroke="#0f766e"
                strokeWidth="3"
                strokeLinecap="round"
              />
            );
          })}

          {/* Base track */}
          <line
            x1={PADDING_X}
            y1={TRACK_Y}
            x2={SVG_WIDTH - PADDING_X}
            y2={TRACK_Y}
            stroke="#334155"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Ticks & numeral labels */}
          {Array.from({ length: safeMax + 1 }, (_, stop) => {
            const x = getX(stop);
            const isTarget = stop === target;
            const isStart = stop === safeStart;
            const label = formatNumber(stop, { numeralSystem, useGrouping: false });
            return (
              <g key={stop}>
                <line
                  x1={x}
                  y1={TRACK_Y - 7}
                  x2={x}
                  y2={TRACK_Y + 7}
                  stroke={isTarget ? "#0f766e" : "#475569"}
                  strokeWidth={isTarget || isStart ? "3" : "2"}
                />
                {isTarget && (
                  <circle
                    cx={x}
                    cy={TRACK_Y}
                    r="6"
                    fill="#f0fdfa"
                    stroke="#0f766e"
                    strokeWidth="2.5"
                  />
                )}
                <text
                  x={x}
                  y={TRACK_Y + 28}
                  textAnchor="middle"
                  fontSize="13"
                  fontWeight={isTarget || stop === currentStop ? "700" : "500"}
                  fill={isTarget ? "#0f766e" : "#1e293b"}
                >
                  {label}
                </text>
              </g>
            );
          })}

          {/* Tuk-tuk marker at current stop */}
          <g
            data-testid="number-line-marker"
            transform={`translate(${getX(currentStop)}, ${TRACK_Y - 18})`}
          >
            <circle cx="0" cy="0" r="11" fill="#0f766e" stroke="#ffffff" strokeWidth="2.5" />
            <text x="0" y="4" textAnchor="middle" fontSize="11" fontWeight="700" fill="#ffffff">
              {formatNumber(currentStop, { numeralSystem, useGrouping: false })}
            </text>
          </g>
        </svg>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {!readOnly && (
          <>
            <button
              type="button"
              disabled={safeHops <= 0}
              data-testid="number-line-back"
              onClick={handleBack}
              className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-xl border border-border bg-surface-card px-4 py-2.5 text-khmer-body font-semibold leading-[1.75] text-ink overflow-visible transition-colors hover:bg-accent-soft disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {t("numberLineHopBack")}
            </button>
            <button
              type="button"
              disabled={currentStop >= safeMax}
              data-testid="number-line-forward"
              onClick={handleForward}
              className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-xl bg-accent px-5 py-2.5 text-khmer-body font-semibold leading-[1.75] text-white overflow-visible transition-colors hover:bg-accent-strong disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {t("numberLineHopForward")}
            </button>
          </>
        )}
      </div>

      <p
        data-testid="number-line-hops-count"
        className="text-center text-khmer-body text-ink-muted"
      >
        {t("numberLineHopsCount")}:{" "}
        <FormattedNumber value={safeHops} className="font-bold text-accent" />
      </p>
    </div>
  );
}
