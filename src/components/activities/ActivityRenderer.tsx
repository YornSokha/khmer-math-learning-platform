"use client";

import type { ActivityStep, ExploreStep } from "@/lib/content/schema";
import { parseNumericAnswer } from "@/lib/khmer/numerals";
import { EquationFillActivity } from "./EquationFillActivity";
import { NumberLineActivity } from "./NumberLineActivity";
import { TenFrameActivity } from "./TenFrameActivity";

export interface ActivityRendererProps {
  step: ActivityStep | ExploreStep;
  resolvedParams: Record<string, number>;
  answerValue: string;
  onAnswerChange: (nextValue: string) => void;
  activeHintCue?: string;
  disabled?: boolean;
}

export function ActivityRenderer({
  step,
  resolvedParams,
  answerValue,
  onAnswerChange,
  activeHintCue,
  disabled = false,
}: ActivityRendererProps) {
  const numericValue = parseNumericAnswer(answerValue) ?? 0;

  switch (step.activity) {
    case "ten-frame":
      return (
        <TenFrameActivity
          mode={step.mode === "fill" || step.mode === "read" ? step.mode : "complete"}
          given={resolvedParams.given ?? 0}
          value={numericValue}
          onChange={(count) => onAnswerChange(String(count))}
          activeHintCue={activeHintCue}
          readOnly={disabled}
        />
      );

    case "number-line":
      return (
        <NumberLineActivity
          mode={step.mode === "place" ? "place" : "jump"}
          start={resolvedParams.start ?? 0}
          target={resolvedParams.target ?? 10}
          max={resolvedParams.max ?? 10}
          value={numericValue}
          onChange={(hops) => onAnswerChange(String(hops))}
          activeHintCue={activeHintCue}
          readOnly={disabled}
        />
      );

    case "equation-fill":
      return (
        <EquationFillActivity
          template={step.type === "activity" && step.template ? step.template : "{a} + □ = 10"}
          resolvedParams={resolvedParams}
          supports={step.type === "activity" ? step.supports : "full"}
          value={answerValue}
          onChange={onAnswerChange}
          activeHintCue={activeHintCue}
          disabled={disabled}
        />
      );
  }
}
