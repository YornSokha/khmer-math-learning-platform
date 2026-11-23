"use client";

import { type FormEvent, useEffect, useState } from "react";
import { FormattedNumber } from "@/components/khmer/FormattedNumber";
import { t } from "@/lib/i18n/messages";
import { parseNumericAnswer } from "@/lib/khmer/numerals";

export const PARENT_GATE_CHALLENGE = {
  a: 7,
  b: 6,
  answer: 42,
} as const;

export function isValidParentGateAnswer(raw: string): boolean {
  const parsed = parseNumericAnswer(raw);
  return parsed !== null && parsed === PARENT_GATE_CHALLENGE.answer;
}

export interface ParentGateModalProps {
  open: boolean;
  onClose: () => void;
  onUnlock: () => void;
}

export function ParentGateModal({ open, onClose, onUnlock }: ParentGateModalProps) {
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (isValidParentGateAnswer(answer)) {
      setError(null);
      setAnswer("");
      onUnlock();
      return;
    }
    setError(t("parentGateWrongAnswer"));
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="parent-gate-title"
      data-testid="parent-gate-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-6"
    >
      <div className="w-full max-w-md space-y-4 rounded-2xl border border-border bg-surface-card p-6 shadow-lg">
        <div className="space-y-1 text-center">
          <h2 id="parent-gate-title" className="text-khmer-heading font-bold text-ink">
            {t("parentGateTitle")}
          </h2>
          <p className="text-khmer-body text-ink-muted">{t("parentGateSubtitle")}</p>
        </div>

        <p
          data-testid="parent-gate-question"
          className="rounded-xl bg-accent-soft py-3 text-center text-khmer-heading font-bold text-accent"
        >
          <FormattedNumber value={PARENT_GATE_CHALLENGE.a} /> ×{" "}
          <FormattedNumber value={PARENT_GATE_CHALLENGE.b} /> = ?
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="parent-gate-input"
              className="block text-khmer-body font-medium text-ink"
            >
              {t("parentGateInputLabel")}
            </label>
            <input
              id="parent-gate-input"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={answer}
              onChange={(event) => {
                setAnswer(event.target.value);
                if (error) setError(null);
              }}
              data-testid="parent-gate-input"
              className="min-h-touch w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-khmer-instruction font-semibold text-ink focus:border-accent"
            />
          </div>

          {error && (
            <p
              role="alert"
              data-testid="parent-gate-error"
              className="rounded-xl border border-amber-400 bg-amber-50 px-4 py-2 text-khmer-body text-amber-950"
            >
              {error}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              data-testid="parent-gate-submit"
              className="inline-flex min-h-touch flex-1 items-center justify-center rounded-xl bg-accent px-4 py-2.5 text-khmer-body font-semibold leading-[1.75] text-white overflow-visible hover:bg-accent-strong"
            >
              {t("parentGateSubmitButton")}
            </button>
            <button
              type="button"
              data-testid="parent-gate-cancel"
              onClick={onClose}
              className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-xl border border-border bg-surface px-4 py-2.5 text-khmer-body font-semibold leading-[1.75] text-ink overflow-visible hover:bg-accent-soft"
            >
              {t("parentDeleteCancelButton")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
