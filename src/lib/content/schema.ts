import { parse as parseYaml } from "yaml";
import { z } from "zod";
import { validateExpressionDomain, type ParamMap } from "./expression";

export const localizedTextSchema = z.object({
  km: z.string().trim().min(1, "Khmer text is required"),
  en: z.string().trim().min(1).optional(),
});

export type LocalizedText = z.infer<typeof localizedTextSchema>;

export const randIntParamSchema = z
  .object({
    randInt: z.tuple([z.number().int(), z.number().int()]),
  })
  .refine(({ randInt: [min, max] }) => min <= max, {
    message: "randInt minimum must be less than or equal to maximum",
  });

export const paramSpecSchema = z.union([z.number().int(), randIntParamSchema]);

export const paramsRecordSchema = z.record(
  z.string().regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, "Invalid parameter identifier"),
  paramSpecSchema,
);

export const activityTypeSchema = z.enum([
  "ten-frame",
  "number-line",
  "equation-fill",
  "count-tap",
  "choice-pictorial",
  "compare-groups",
  "drag-to-group",
  "number-bond",
  "place-value-blocks",
  "pattern-sequence",
  "partition",
  "money-pay",
]);
export type ActivityType = z.infer<typeof activityTypeSchema>;

export const activityModeSchema = z.enum([
  "fill",
  "read",
  "complete",
  "jump",
  "place",
  "solve",
  "count",
  "subitize",
  "select",
  "compare",
  "add",
  "remove",
  "build",
  "extend",
  "shade",
  "pay",
]);
export type ActivityMode = z.infer<typeof activityModeSchema>;

export const supportsLevelSchema = z.enum(["full", "partial", "none"]);
export type SupportsLevel = z.infer<typeof supportsLevelSchema>;

export const choiceOptionSchema = z.object({
  id: z.string().trim().min(1, "Option id is required"),
  label: localizedTextSchema,
  count: z.number().int().min(0).max(100).optional(),
  visual: z
    .enum([
      "mango",
      "rambutan",
      "banana",
      "orange",
      "longan",
      "krama-red",
      "krama-teal",
      "krama-gold",
      "lotus",
      "jasmine",
      "half-equal",
      "half-unequal",
      "quarter-equal",
      "quarter-unequal",
      "numeral",
    ])
    .optional(),
});
export type ChoiceOption = z.infer<typeof choiceOptionSchema>;

export const answerSpecSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("equals"),
    expr: z.string().trim().min(1, "Answer expression is required"),
    integerOnly: z.boolean().default(true),
  }),
  z.object({
    kind: z.literal("choice"),
    value: z.string().trim().min(1, "Choice answer value is required"),
  }),
]);
export type AnswerSpec = z.infer<typeof answerSpecSchema>;

export const misconceptionConditionSchema = z.union([
  z.object({
    equals: z.string().trim().min(1, "Misconception expression is required"),
  }),
  z.object({
    choice: z.string().trim().min(1, "Misconception choice value is required"),
  }),
]);

export const misconceptionRuleSchema = z.object({
  id: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/, "Misconception id must be kebab-case"),
  when: misconceptionConditionSchema,
  text: localizedTextSchema,
});

export const hintVisualCueSchema = z.enum([
  "highlight-empty-cells",
  "highlight-filled-cells",
  "show-jump-arcs",
  "show-target-marker",
  "highlight-ten-frame-model",
  "highlight-objects",
  "highlight-compare-counts",
  "highlight-basket-target",
  "highlight-bond-parts",
  "highlight-tens-ones",
  "highlight-pattern-unit",
  "highlight-equal-parts",
  "highlight-riel-notes",
]);

export const hintStepSchema = z.object({
  km: z.string().trim().min(1, "Hint Khmer text is required"),
  en: z.string().trim().min(1).optional(),
  show: hintVisualCueSchema.optional(),
});

export const feedbackSchema = z.object({
  correct: localizedTextSchema,
  incorrect: localizedTextSchema.optional(),
  misconceptions: z.array(misconceptionRuleSchema).default([]),
});

export const introStepSchema = z.object({
  id: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/, "Step id must be kebab-case"),
  type: z.literal("intro"),
  text: localizedTextSchema,
  image: z.string().trim().min(1).optional(),
  audio: z.string().trim().min(1).optional(),
});

export const exploreStepSchema = z.object({
  id: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/, "Step id must be kebab-case"),
  type: z.literal("explore"),
  activity: activityTypeSchema,
  mode: activityModeSchema,
  prompt: localizedTextSchema,
  params: paramsRecordSchema.default({}),
  options: z.array(choiceOptionSchema).optional(),
  pattern: z.array(z.string().trim().min(1)).optional(),
  visualKind: z.string().trim().min(1).optional(),
  audio: z.string().trim().min(1).optional(),
});

export const activityStepSchema = z.object({
  id: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/, "Step id must be kebab-case"),
  type: z.literal("activity"),
  activity: activityTypeSchema,
  mode: activityModeSchema,
  supports: supportsLevelSchema.default("full"),
  prompt: localizedTextSchema,
  params: paramsRecordSchema.default({}),
  template: z.string().trim().min(1).optional(),
  options: z.array(choiceOptionSchema).optional(),
  pattern: z.array(z.string().trim().min(1)).optional(),
  visualKind: z.string().trim().min(1).optional(),
  answer: answerSpecSchema,
  feedback: feedbackSchema,
  hints: z.array(hintStepSchema).min(1).max(3),
  audio: z.string().trim().min(1).optional(),
});

export const explainVisualSchema = z.object({
  activity: activityTypeSchema,
  mode: activityModeSchema,
  params: z.record(z.string(), z.number().int()).default({}),
});

export const explainStepSchema = z.object({
  id: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/, "Step id must be kebab-case"),
  type: z.literal("explain"),
  text: localizedTextSchema,
  visual: explainVisualSchema.optional(),
  mathTerms: z.array(localizedTextSchema).max(2).default([]),
  audio: z.string().trim().min(1).optional(),
});

export const lessonStepSchema = z.discriminatedUnion("type", [
  introStepSchema,
  exploreStepSchema,
  activityStepSchema,
  explainStepSchema,
]);

export type LessonStep = z.infer<typeof lessonStepSchema>;
export type ActivityStep = z.infer<typeof activityStepSchema>;
export type ExploreStep = z.infer<typeof exploreStepSchema>;
export type ExplainStep = z.infer<typeof explainStepSchema>;
export type IntroStep = z.infer<typeof introStepSchema>;

export const reviewStatusValueSchema = z.enum(["draft", "approved"]);

export const lessonSchema = z
  .object({
    id: z
      .string()
      .trim()
      .regex(/^[a-z0-9-]+$/, "Lesson id must be kebab-case"),
    order: z.number().int().positive().optional(),
    version: z.number().int().positive(),
    title: localizedTextSchema,
    grade: z.number().int().min(1).max(6),
    strand: z.enum([
      "number-sense",
      "addition-subtraction",
      "multiplication-division",
      "fractions",
      "decimals",
      "percentages",
      "patterns-algebra",
      "measurement",
      "geometry",
      "data-chance",
    ]),
    moeysRef: z.array(z.string().trim().min(1)).min(1),
    skills: z.array(z.string().trim().min(1)).min(1),
    prerequisites: z.array(z.string().trim().min(1)).default([]),
    estimatedMinutes: z.number().int().min(1).max(30),
    numerals: z.enum(["khmer", "arabic", "child-preference"]).default("khmer"),
    steps: z.array(lessonStepSchema).min(1),
    review: z.object({
      items: z.array(z.string().trim().min(1)).min(1),
    }),
    reviewStatus: z.object({
      math: reviewStatusValueSchema,
      khmer: reviewStatusValueSchema,
      reviewer: z.string().trim().optional(),
    }),
  })
  .superRefine((lesson, ctx) => {
    const seenStepIds = new Set<string>();
    const activityStepIds = new Set<string>();

    lesson.steps.forEach((step, index) => {
      if (seenStepIds.has(step.id)) {
        ctx.addIssue({
          code: "custom",
          path: ["steps", index, "id"],
          message: `Lesson "${lesson.id}" has duplicate step id "${step.id}"`,
        });
      }
      seenStepIds.add(step.id);

      if (step.type !== "activity") {
        return;
      }

      activityStepIds.add(step.id);
      const params: ParamMap = step.params;
      const minValue = lesson.grade === 1 ? 0 : undefined;

      if (step.answer.kind === "equals") {
        const answerCheck = validateExpressionDomain(step.answer.expr, params, {
          integerOnly: step.answer.integerOnly,
          minValue,
        });

        if (!answerCheck.valid) {
          ctx.addIssue({
            code: "custom",
            path: ["steps", index, "answer", "expr"],
            message: `Lesson "${lesson.id}" step "${step.id}": ${answerCheck.error}`,
          });
        }
      } else if (step.options && step.options.length > 0) {
        const optionIds = new Set(step.options.map((option) => option.id));
        if (!optionIds.has(step.answer.value)) {
          ctx.addIssue({
            code: "custom",
            path: ["steps", index, "answer", "value"],
            message: `Lesson "${lesson.id}" step "${step.id}": choice answer "${step.answer.value}" is not listed in options`,
          });
        }
      }

      step.feedback.misconceptions.forEach((misconception, mIndex) => {
        if ("equals" in misconception.when) {
          const integerOnly = step.answer.kind === "equals" ? step.answer.integerOnly : true;
          const misconceptionCheck = validateExpressionDomain(misconception.when.equals, params, {
            integerOnly,
          });

          if (!misconceptionCheck.valid) {
            ctx.addIssue({
              code: "custom",
              path: ["steps", index, "feedback", "misconceptions", mIndex, "when", "equals"],
              message: `Lesson "${lesson.id}" step "${step.id}" misconception "${misconception.id}": ${misconceptionCheck.error}`,
            });
          }
        }
      });

      const allowedPlaceholders = new Set([...Object.keys(params), "answer"]);
      const textsToCheck: Array<{ path: Array<string | number>; value: string }> = [
        { path: ["steps", index, "prompt", "km"], value: step.prompt.km },
        { path: ["steps", index, "feedback", "correct", "km"], value: step.feedback.correct.km },
      ];

      if (step.template) {
        textsToCheck.push({ path: ["steps", index, "template"], value: step.template });
      }
      step.hints.forEach((hint, hIndex) => {
        textsToCheck.push({ path: ["steps", index, "hints", hIndex, "km"], value: hint.km });
      });

      for (const item of textsToCheck) {
        const matches = item.value.matchAll(/\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g);
        for (const match of matches) {
          const placeholder = match[1];
          if (placeholder && !allowedPlaceholders.has(placeholder)) {
            ctx.addIssue({
              code: "custom",
              path: item.path,
              message: `Lesson "${lesson.id}" step "${step.id}": unknown placeholder "{${placeholder}}"`,
            });
          }
        }
      }
    });

    lesson.review.items.forEach((reviewStepId, rIndex) => {
      if (!seenStepIds.has(reviewStepId)) {
        ctx.addIssue({
          code: "custom",
          path: ["review", "items", rIndex],
          message: `Lesson "${lesson.id}": review.items references unknown step "${reviewStepId}"`,
        });
      } else if (!activityStepIds.has(reviewStepId)) {
        ctx.addIssue({
          code: "custom",
          path: ["review", "items", rIndex],
          message: `Lesson "${lesson.id}": review.items step "${reviewStepId}" must be an activity step`,
        });
      }
    });
  });

export type Lesson = z.infer<typeof lessonSchema>;

export interface ValidationFailure {
  success: false;
  errors: string[];
}

export interface ValidationSuccess {
  success: true;
  lesson: Lesson;
}

export type LessonValidationResult = ValidationSuccess | ValidationFailure;

export function validateLesson(data: unknown): LessonValidationResult {
  const result = lessonSchema.safeParse(data);
  if (result.success) {
    return { success: true, lesson: result.data };
  }

  return {
    success: false,
    errors: result.error.issues.map((issue) => {
      const loc = issue.path.length > 0 ? issue.path.join(".") : "(root)";
      return `${loc}: ${issue.message}`;
    }),
  };
}

export function parseLessonYaml(yamlSource: string): LessonValidationResult {
  let parsed: unknown;
  try {
    parsed = parseYaml(yamlSource);
  } catch (err) {
    return {
      success: false,
      errors: [`YAML syntax error: ${err instanceof Error ? err.message : String(err)}`],
    };
  }

  return validateLesson(parsed);
}

export function isLessonPublishable(lesson: Lesson): boolean {
  return lesson.reviewStatus.math === "approved" && lesson.reviewStatus.khmer === "approved";
}

export function interpolateTemplate(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g, (full, key: string) => {
    const replacement = values[key];
    return replacement !== undefined ? String(replacement) : full;
  });
}
