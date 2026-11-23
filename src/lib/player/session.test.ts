import { beforeEach, describe, expect, it } from "vitest";
import {
  clearLessonSession,
  createInitialLessonSession,
  getStepSeed,
  loadLessonSession,
  saveLessonSession,
} from "./session";

describe("Lesson session persistence", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("saves and restores mid-lesson step index and seed for matching lesson version", () => {
    const initial = createInitialLessonSession("g1-make-ten", 1, 202);
    saveLessonSession({
      ...initial,
      stepIndex: 3,
      completedStepIds: ["hook-dinner-plates", "explore-ten-frame", "attempt-ten-frame-complete"],
      fixedMistakes: 1,
    });

    const restored = loadLessonSession("g1-make-ten", 1, 8);
    expect(restored.stepIndex).toBe(3);
    expect(restored.sessionSeed).toBe(202);
    expect(restored.fixedMistakes).toBe(1);
    expect(restored.completedStepIds).toHaveLength(3);
  });

  it("resets cleanly if lesson version changes or session is cleared", () => {
    saveLessonSession({
      ...createInitialLessonSession("g1-make-ten", 1, 202),
      stepIndex: 4,
    });

    const bumpedVersion = loadLessonSession("g1-make-ten", 2, 8);
    expect(bumpedVersion.stepIndex).toBe(0);
    expect(bumpedVersion.lessonVersion).toBe(2);

    clearLessonSession("g1-make-ten");
    expect(loadLessonSession("g1-make-ten", 1, 8).stepIndex).toBe(0);
  });

  it("generates distinct deterministic step seeds", () => {
    expect(getStepSeed(101, 0)).toBe(getStepSeed(101, 0));
    expect(getStepSeed(101, 0)).not.toBe(getStepSeed(101, 1));
  });
});
