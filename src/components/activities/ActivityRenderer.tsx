"use client";

import type { ActivityStep, ExploreStep } from "@/lib/content/schema";
import { parseNumericAnswer } from "@/lib/khmer/numerals";
import { ChoicePictorialActivity } from "./ChoicePictorialActivity";
import { CompareGroupsActivity } from "./CompareGroupsActivity";
import { CountTapActivity } from "./CountTapActivity";
import { DragToGroupActivity } from "./DragToGroupActivity";
import { EquationFillActivity } from "./EquationFillActivity";
import { MoneyPayActivity } from "./MoneyPayActivity";
import { NumberBondActivity } from "./NumberBondActivity";
import { NumberLineActivity } from "./NumberLineActivity";
import { PartitionActivity } from "./PartitionActivity";
import { PatternSequenceActivity } from "./PatternSequenceActivity";
import { PlaceValueBlocksActivity } from "./PlaceValueBlocksActivity";
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

    case "count-tap":
      return (
        <CountTapActivity
          mode={step.mode === "subitize" ? "subitize" : "count"}
          count={resolvedParams.count ?? resolvedParams.given ?? 3}
          visualKind={step.visualKind ?? "mango"}
          flashMs={resolvedParams.flashMs ?? 2000}
          value={answerValue}
          onChange={onAnswerChange}
          activeHintCue={activeHintCue}
          disabled={disabled}
        />
      );

    case "choice-pictorial":
      return (
        <ChoicePictorialActivity
          options={step.options ?? []}
          value={answerValue}
          onChange={onAnswerChange}
          activeHintCue={activeHintCue}
          disabled={disabled}
        />
      );

    case "compare-groups":
      return (
        <CompareGroupsActivity
          leftCount={resolvedParams.left ?? 5}
          rightCount={resolvedParams.right ?? 3}
          visualKind={step.visualKind ?? "longan"}
          value={answerValue}
          onChange={onAnswerChange}
          activeHintCue={activeHintCue}
          disabled={disabled}
        />
      );

    case "drag-to-group":
      return (
        <DragToGroupActivity
          mode={step.mode === "remove" ? "remove" : "add"}
          initialCount={resolvedParams.start ?? resolvedParams.given ?? 0}
          maxCount={resolvedParams.max ?? 12}
          visualKind={step.visualKind ?? (step.mode === "remove" ? "orange" : "banana")}
          value={numericValue}
          onChange={(count) => onAnswerChange(String(count))}
          activeHintCue={activeHintCue}
          disabled={disabled}
        />
      );

    case "number-bond":
      return (
        <NumberBondActivity
          whole={resolvedParams.whole ?? 10}
          knownPart={resolvedParams.part ?? resolvedParams.given ?? 6}
          value={answerValue}
          onChange={onAnswerChange}
          activeHintCue={activeHintCue}
          disabled={disabled}
        />
      );

    case "place-value-blocks":
      return (
        <PlaceValueBlocksActivity
          initialTens={resolvedParams.initialTens ?? 0}
          initialOnes={resolvedParams.initialOnes ?? 0}
          onChange={(total) => onAnswerChange(String(total))}
          activeHintCue={activeHintCue}
          disabled={disabled}
        />
      );

    case "pattern-sequence":
      return (
        <PatternSequenceActivity
          pattern={step.pattern ?? ["krama-red", "krama-teal", "krama-red", "?"]}
          options={step.options ?? []}
          value={answerValue}
          onChange={onAnswerChange}
          activeHintCue={activeHintCue}
          disabled={disabled}
        />
      );

    case "partition":
      return (
        <PartitionActivity
          parts={resolvedParams.parts ?? 2}
          onChange={(shaded) => onAnswerChange(String(shaded))}
          activeHintCue={activeHintCue}
          disabled={disabled}
        />
      );

    case "money-pay":
      return (
        <MoneyPayActivity
          onChange={(total) => onAnswerChange(String(total))}
          activeHintCue={activeHintCue}
          disabled={disabled}
        />
      );
  }
}
