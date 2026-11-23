import "fake-indexeddb/auto";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { NumeralPreferenceProvider } from "@/components/khmer/NumeralPreferenceProvider";
import { getAllLessons } from "@/lib/content/loader";
import { clearPlacementResult, savePlacementResult } from "@/lib/path/progression";
import { clearProgressDb, recordLessonCompletion } from "@/lib/storage/progress-db";
import { LearningPathView } from "./LearningPathView";

function getSummaries() {
  return getAllLessons().map((lesson, idx) => ({
    id: lesson.id,
    order: lesson.order ?? idx + 1,
    titleKm: lesson.title.km,
    moeysRef: lesson.moeysRef,
    estimatedMinutes: lesson.estimatedMinutes,
    skills: lesson.skills,
  }));
}

describe("LearningPathView", () => {
  beforeEach(async () => {
    window.localStorage.clear();
    clearPlacementResult();
    await clearProgressDb();
  });

  it("shows Lesson 1 available and Lessons 2–12 locked for a new learner", async () => {
    render(
      <NumeralPreferenceProvider>
        <LearningPathView lessons={getSummaries()} />
      </NumeralPreferenceProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("next-lesson-card")).toHaveAttribute(
        "data-lesson-id",
        "g1-01-subitize-1-5",
      );
    });
    expect(screen.getByTestId("path-node-g1-01-subitize-1-5")).toHaveAttribute(
      "data-lesson-state",
      "available",
    );
    expect(screen.getByTestId("path-node-g1-02-count-0-10")).toHaveAttribute(
      "data-lesson-state",
      "locked",
    );
  });

  it("applies placement recommendation at Lesson 6 while keeping earlier lessons open and marking completed ones mastered", async () => {
    savePlacementResult({
      recommendedStartOrder: 6,
      recommendedLessonId: "g1-06-addition-10",
      correctItemIds: ["p1-subitize", "p2-compare", "p3-bond-10"],
      skipped: false,
      completedAt: "2026-11-23T12:00:00.000Z",
    });

    await recordLessonCompletion({
      lessonId: "g1-01-subitize-1-5",
      lessonVersion: 1,
      stepsCompleted: 6,
      fixedMistakes: 0,
      completedAt: "2026-11-23T12:05:00.000Z",
    });

    render(
      <NumeralPreferenceProvider>
        <LearningPathView lessons={getSummaries()} />
      </NumeralPreferenceProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("next-lesson-card")).toHaveAttribute(
        "data-lesson-id",
        "g1-06-addition-10",
      );
    });

    expect(screen.getByTestId("path-node-g1-01-subitize-1-5")).toHaveAttribute(
      "data-lesson-state",
      "mastered",
    );
    expect(screen.getByTestId("path-node-g1-make-ten")).toHaveAttribute(
      "data-lesson-state",
      "available",
    );
    expect(screen.getByTestId("path-open-g1-make-ten")).toHaveAttribute(
      "href",
      "/lessons/g1-make-ten",
    );
    expect(screen.getByTestId("path-node-g1-07-subtraction-10")).toHaveAttribute(
      "data-lesson-state",
      "locked",
    );
  });
});
