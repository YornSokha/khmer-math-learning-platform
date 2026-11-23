import { evaluateExpression, type ParamMap } from "@/lib/content/expression";
import { interpolateTemplate, type ActivityStep } from "@/lib/content/schema";
import {
  DEFAULT_NUMERAL_SYSTEM,
  formatNumber,
  parseNumericAnswer,
  stripZeroWidthSpaces,
  type NumeralSystem,
} from "@/lib/khmer/numerals";

export interface EvaluationResult {
  correct: boolean;
  expected: number | string;
  submitted: number | string | null;
  misconceptionId?: string;
  feedbackKm: string;
}

const DEFAULT_INCORRECT_FEEDBACK_KM = "សាកល្បងម្តងទៀតណា! ពិនិត្យចម្លើយរបស់អ្នកម្តងទៀត។";

function nextSeededUnit(state: { value: number }): number {
  state.value = (state.value * 1664525 + 1013904223) >>> 0;
  return state.value / 0x100000000;
}

export function resolveStepParams(params: ParamMap, seed = 42): Record<string, number> {
  const rngState = { value: Math.trunc(seed) >>> 0 || 1 };
  const resolved: Record<string, number> = {};

  for (const [key, spec] of Object.entries(params)) {
    if (typeof spec === "number") {
      resolved[key] = spec;
    } else {
      const [min, max] = spec.randInt;
      const span = max - min + 1;
      const offset = Math.floor(nextSeededUnit(rngState) * span);
      resolved[key] = min + offset;
    }
  }

  return resolved;
}

export function formatTemplateText(
  template: string,
  resolvedParams: Record<string, number>,
  numeralSystem: NumeralSystem = DEFAULT_NUMERAL_SYSTEM,
  extra?: Record<string, number | string>,
): string {
  const formatted: Record<string, string> = {};

  for (const [key, value] of Object.entries(resolvedParams)) {
    formatted[key] = formatNumber(value, { numeralSystem, useGrouping: false });
  }

  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      formatted[key] =
        typeof value === "number"
          ? formatNumber(value, { numeralSystem, useGrouping: false })
          : value;
    }
  }

  return interpolateTemplate(template, formatted);
}

export function evaluateActivityAnswer(
  step: ActivityStep,
  resolvedParams: Record<string, number>,
  rawAnswer: number | string | null | undefined,
  numeralSystem: NumeralSystem = DEFAULT_NUMERAL_SYSTEM,
): EvaluationResult {
  if (step.answer.kind === "choice") {
    const expected = step.answer.value;
    const submitted =
      rawAnswer === null || rawAnswer === undefined
        ? null
        : stripZeroWidthSpaces(String(rawAnswer)).trim();

    if (submitted !== null && submitted === expected) {
      return {
        correct: true,
        expected,
        submitted,
        feedbackKm: formatTemplateText(step.feedback.correct.km, resolvedParams, numeralSystem, {
          answer: expected,
        }),
      };
    }

    if (submitted !== null) {
      for (const misconception of step.feedback.misconceptions) {
        if ("choice" in misconception.when && submitted === misconception.when.choice) {
          return {
            correct: false,
            expected,
            submitted,
            misconceptionId: misconception.id,
            feedbackKm: formatTemplateText(misconception.text.km, resolvedParams, numeralSystem, {
              answer: expected,
            }),
          };
        }
      }
    }

    const fallbackKm = step.feedback.incorrect?.km ?? DEFAULT_INCORRECT_FEEDBACK_KM;
    return {
      correct: false,
      expected,
      submitted,
      feedbackKm: formatTemplateText(fallbackKm, resolvedParams, numeralSystem, {
        answer: expected,
      }),
    };
  }

  const expected = evaluateExpression(step.answer.expr, resolvedParams);

  let submitted: number | null;
  if (typeof rawAnswer === "number") {
    submitted = Number.isFinite(rawAnswer) ? rawAnswer : null;
  } else if (typeof rawAnswer === "string") {
    submitted = parseNumericAnswer(rawAnswer);
  } else {
    submitted = null;
  }

  if (submitted !== null && submitted === expected) {
    return {
      correct: true,
      expected,
      submitted,
      feedbackKm: formatTemplateText(step.feedback.correct.km, resolvedParams, numeralSystem, {
        answer: expected,
      }),
    };
  }

  if (submitted !== null) {
    for (const misconception of step.feedback.misconceptions) {
      if ("equals" in misconception.when) {
        const targetValue = evaluateExpression(misconception.when.equals, resolvedParams);
        if (submitted === targetValue) {
          return {
            correct: false,
            expected,
            submitted,
            misconceptionId: misconception.id,
            feedbackKm: formatTemplateText(misconception.text.km, resolvedParams, numeralSystem, {
              answer: expected,
            }),
          };
        }
      }
    }
  }

  const fallbackKm = step.feedback.incorrect?.km ?? DEFAULT_INCORRECT_FEEDBACK_KM;
  return {
    correct: false,
    expected,
    submitted,
    feedbackKm: formatTemplateText(fallbackKm, resolvedParams, numeralSystem, {
      answer: expected,
    }),
  };
}
