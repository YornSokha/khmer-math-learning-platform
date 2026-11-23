import { describe, expect, it } from "vitest";
import { getAllLessons } from "@/lib/content/loader";
import {
  computeLearningPath,
  computePlacementRecommendation,
  evaluatePlacementItem,
  PLACEMENT_ITEMS,
  type PathLessonSummary,
} from "./progression";

function getGrade1Summaries(): PathLessonSummary[] {
  return getAllLessons().map((lesson, idx) => ({
    id: lesson.id,
    order: lesson.order ?? idx + 1,
    titleKm: lesson.title.km,
    moeysRef: lesson.moeysRef,
    estimatedMinutes: lesson.estimatedMinutes,
    skills: lesson.skills,
  }));
}

describe("Learning path and placement progression", () => {
  it("starts a new learner at Lesson 1 with Lessons 2–12 locked", () => {
    const summaries = getGrade1Summaries();
    const path = computeLearningPath(summaries, new Set(), 1);

    expect(path.nodes).toHaveLength(12);
    expect(path.nodes[0]?.state).toBe("available");
    expect(path.nodes[0]?.isRecommendedNext).toBe(true);
    expect(path.nextLesson?.id).toBe("g1-01-subitize-1-5");
    expect(path.nodes[1]?.state).toBe("locked");
    expect(path.nodes[11]?.state).toBe("locked");
  });

  it("marks completed lessons mastered and unlocks the next lesson", () => {
    const summaries = getGrade1Summaries();
    const path = computeLearningPath(summaries, new Set(["g1-01-subitize-1-5"]), 1);

    expect(path.nodes[0]?.state).toBe("mastered");
    expect(path.nodes[1]?.state).toBe("available");
    expect(path.nextLesson?.id).toBe("g1-02-count-0-10");
    expect(path.nodes[2]?.state).toBe("locked");
  });

  it("recommends Lesson 6 when placement shows bonds-to-10 mastered and keeps Lessons 1–5 open to revisit", () => {
    const summaries = getGrade1Summaries();
    const recommendation = computePlacementRecommendation(
      {
        "p1-subitize": true,
        "p2-compare": true,
        "p3-bond-10": true,
        "p4-add-10": false,
        "p5-tens-ones": false,
      },
      summaries,
    );

    expect(recommendation.recommendedStartOrder).toBe(6);
    expect(recommendation.recommendedLessonId).toBe("g1-06-addition-10");

    const path = computeLearningPath(summaries, new Set(), recommendation.recommendedStartOrder);
    expect(path.nextLesson?.id).toBe("g1-06-addition-10");
    // Earlier lessons 1..5 remain available to revisit
    for (let i = 0; i < 6; i += 1) {
      expect(path.nodes[i]?.state).toBe("available");
    }
    expect(path.nodes[6]?.state).toBe("locked");
  });

  it("accepts Khmer and Arabic digits when evaluating placement items", () => {
    expect(evaluatePlacementItem(PLACEMENT_ITEMS[0]!, "៤")).toBe(true);
    expect(evaluatePlacementItem(PLACEMENT_ITEMS[1]!, ">")).toBe(true);
    expect(evaluatePlacementItem(PLACEMENT_ITEMS[2]!, "៣")).toBe(true);
    expect(evaluatePlacementItem(PLACEMENT_ITEMS[3]!, "7")).toBe(true);
    expect(evaluatePlacementItem(PLACEMENT_ITEMS[4]!, "២៥")).toBe(true);
  });
});
