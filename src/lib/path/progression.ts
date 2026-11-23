import { parseNumericAnswer, stripZeroWidthSpaces } from "@/lib/khmer/numerals";

export type LessonNodeState = "mastered" | "available" | "locked";

export interface PathLessonSummary {
  id: string;
  order: number;
  titleKm: string;
  moeysRef: string[];
  estimatedMinutes: number;
  skills: string[];
  reviewItemIds?: string[];
}

export interface LearningPathNode extends PathLessonSummary {
  state: LessonNodeState;
  isRecommendedNext: boolean;
}

export interface LearningPathResult {
  nodes: LearningPathNode[];
  nextLesson: LearningPathNode | null;
  masteredCount: number;
}

export interface PlacementItem {
  id: string;
  skill: string;
  kind: "count-tap" | "compare-groups" | "equation-fill";
  promptKm: string;
  expectedAnswer: string;
  count?: number;
  left?: number;
  right?: number;
  template?: string;
  params?: Record<string, number>;
}

export interface PlacementResult {
  recommendedStartOrder: number;
  recommendedLessonId: string;
  correctItemIds: string[];
  skipped: boolean;
  completedAt: string;
}

export const PLACEMENT_STORAGE_KEY = "khmer-math:placement-result";

export const PLACEMENT_ITEMS: readonly PlacementItem[] = [
  {
    id: "p1-subitize",
    skill: "subitize-1-5",
    kind: "count-tap",
    promptKm: "ចុចរាប់ផ្លែស្វាយទាំងអស់នៅលើថាស។",
    expectedAnswer: "4",
    count: 4,
  },
  {
    id: "p2-compare",
    skill: "compare-10",
    kind: "compare-groups",
    promptKm: "ជ្រើសរើសសញ្ញាប្រៀបធៀប < = ឬ >។",
    expectedAnswer: ">",
    left: 7,
    right: 4,
  },
  {
    id: "p3-bond-10",
    skill: "bond-10",
    kind: "equation-fill",
    promptKm: "បំពេញលេខដែលបាត់ដើម្បីបង្កើត ១០។",
    expectedAnswer: "3",
    template: "{a} + □ = 10",
    params: { a: 7 },
  },
  {
    id: "p4-add-10",
    skill: "add-within-10",
    kind: "equation-fill",
    promptKm: "គណនាផលបូកខាងក្រោម។",
    expectedAnswer: "7",
    template: "{a} + {b} = □",
    params: { a: 4, b: 3 },
  },
  {
    id: "p5-tens-ones",
    skill: "place-value-99",
    kind: "equation-fill",
    promptKm: "បូកខ្ទង់ដប់ និងខ្ទង់រាយចូលគ្នា។",
    expectedAnswer: "25",
    template: "{tensVal}0 + {onesVal} = □",
    params: { tensVal: 2, onesVal: 5 },
  },
];

export function evaluatePlacementItem(item: PlacementItem, rawAnswer: string): boolean {
  const cleaned = stripZeroWidthSpaces(rawAnswer).trim();
  if (item.kind === "compare-groups") {
    return cleaned === item.expectedAnswer;
  }
  const parsed = parseNumericAnswer(cleaned);
  return parsed !== null && String(parsed) === item.expectedAnswer;
}

/**
 * Recommends a Grade 1 starting lesson based on contiguous placement mastery:
 * - Bonds-to-10 (items 1–3) mastered -> start at Lesson 6 (`g1-06-addition-10`).
 */
export function computePlacementRecommendation(
  itemCorrectMap: Record<string, boolean>,
  lessons: readonly PathLessonSummary[],
): { recommendedStartOrder: number; recommendedLessonId: string; correctItemIds: string[] } {
  const correctItemIds = PLACEMENT_ITEMS.filter((item) => itemCorrectMap[item.id] === true).map(
    (item) => item.id,
  );

  let contiguousCorrect = 0;
  for (const item of PLACEMENT_ITEMS) {
    if (itemCorrectMap[item.id] === true) {
      contiguousCorrect += 1;
    } else {
      break;
    }
  }

  let targetOrder = 1;
  if (contiguousCorrect === 1) {
    targetOrder = 2;
  } else if (contiguousCorrect === 2) {
    targetOrder = 5;
  } else if (contiguousCorrect === 3) {
    targetOrder = 6;
  } else if (contiguousCorrect === 4) {
    targetOrder = 8;
  } else if (contiguousCorrect >= 5) {
    targetOrder = 10;
  }

  const matched =
    lessons.find((lesson) => lesson.order === targetOrder) ??
    lessons[Math.min(targetOrder - 1, Math.max(0, lessons.length - 1))];

  return {
    recommendedStartOrder: matched?.order ?? targetOrder,
    recommendedLessonId: matched?.id ?? "g1-01-subitize-1-5",
    correctItemIds,
  };
}

export function computeLearningPath(
  lessons: readonly PathLessonSummary[],
  completedLessonIds: ReadonlySet<string>,
  placementStartOrder = 1,
): LearningPathResult {
  const sorted = [...lessons].sort((a, b) => a.order - b.order);

  let highestMasteredOrder = 0;
  for (const lesson of sorted) {
    if (completedLessonIds.has(lesson.id) && lesson.order > highestMasteredOrder) {
      highestMasteredOrder = lesson.order;
    }
  }

  const unlockedUpToOrder = Math.max(placementStartOrder, highestMasteredOrder + 1);

  const firstRecommended =
    sorted.find((l) => l.order >= placementStartOrder && !completedLessonIds.has(l.id)) ??
    sorted.find((l) => !completedLessonIds.has(l.id)) ??
    null;

  const nodes: LearningPathNode[] = sorted.map((lesson) => {
    let state: LessonNodeState;
    if (completedLessonIds.has(lesson.id)) {
      state = "mastered";
    } else if (lesson.order <= unlockedUpToOrder) {
      state = "available";
    } else {
      state = "locked";
    }

    return {
      ...lesson,
      state,
      isRecommendedNext: firstRecommended?.id === lesson.id,
    };
  });

  const nextLesson = nodes.find((node) => node.isRecommendedNext) ?? nodes[0] ?? null;
  const masteredCount = nodes.filter((node) => node.state === "mastered").length;

  return { nodes, nextLesson, masteredCount };
}

export function loadPlacementResult(): PlacementResult | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(PLACEMENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PlacementResult>;
    if (
      typeof parsed.recommendedStartOrder !== "number" ||
      typeof parsed.recommendedLessonId !== "string" ||
      !Array.isArray(parsed.correctItemIds) ||
      typeof parsed.skipped !== "boolean"
    ) {
      return null;
    }
    return {
      recommendedStartOrder: parsed.recommendedStartOrder,
      recommendedLessonId: parsed.recommendedLessonId,
      correctItemIds: parsed.correctItemIds.filter((x): x is string => typeof x === "string"),
      skipped: parsed.skipped,
      completedAt: typeof parsed.completedAt === "string" ? parsed.completedAt : "",
    };
  } catch {
    return null;
  }
}

export function savePlacementResult(result: PlacementResult): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PLACEMENT_STORAGE_KEY, JSON.stringify(result));
  } catch {
    // Ignore storage write errors in restricted contexts.
  }
}

export function clearPlacementResult(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(PLACEMENT_STORAGE_KEY);
  } catch {
    // Ignore storage errors.
  }
}
