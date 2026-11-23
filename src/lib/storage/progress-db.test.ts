import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearProgressDb,
  getAllAttempts,
  getLessonCompletion,
  getPendingAttempts,
  recordAttempt,
  recordLessonCompletion,
  syncPendingAttempts,
} from "./progress-db";

describe("IndexedDB local progress store and idempotent sync queue", () => {
  beforeEach(async () => {
    await clearProgressDb();
  });

  it("persists attempts and lesson completions locally with idempotent clientEventId", async () => {
    await recordAttempt({
      clientEventId: "evt-1",
      lessonId: "g1-make-ten",
      lessonVersion: 1,
      stepId: "attempt-ten-frame-complete",
      correct: false,
      hintsUsed: 1,
      misconceptionId: "copied-given",
      durationMs: 1200,
      timestamp: "2026-11-23T06:00:00.000Z",
    });

    // Re-writing the same clientEventId does not create a duplicate
    await recordAttempt({
      clientEventId: "evt-1",
      lessonId: "g1-make-ten",
      lessonVersion: 1,
      stepId: "attempt-ten-frame-complete",
      correct: false,
      hintsUsed: 1,
      misconceptionId: "copied-given",
      durationMs: 1200,
      timestamp: "2026-11-23T06:00:00.000Z",
    });

    await recordAttempt({
      clientEventId: "evt-2",
      lessonId: "g1-make-ten",
      lessonVersion: 1,
      stepId: "attempt-ten-frame-complete",
      correct: true,
      hintsUsed: 1,
      durationMs: 2100,
      timestamp: "2026-11-23T06:00:05.000Z",
    });

    await recordLessonCompletion({
      lessonId: "g1-make-ten",
      lessonVersion: 1,
      stepsCompleted: 8,
      fixedMistakes: 1,
      completedAt: "2026-11-23T06:05:00.000Z",
    });

    const attempts = await getAllAttempts();
    expect(attempts).toHaveLength(2);
    expect(await getPendingAttempts()).toHaveLength(2);

    const completion = await getLessonCompletion("g1-make-ten");
    expect(completion).toMatchObject({
      lessonId: "g1-make-ten",
      stepsCompleted: 8,
      fixedMistakes: 1,
    });
  });

  it("retains pending attempts on sync failure and sends zero duplicates on repeated sync", async () => {
    await recordAttempt({
      clientEventId: "evt-sync-1",
      lessonId: "g1-make-ten",
      lessonVersion: 1,
      stepId: "mastery-check-bond-10",
      correct: true,
      hintsUsed: 0,
      durationMs: 900,
      timestamp: "2026-11-23T06:10:00.000Z",
    });

    const failingTransport = vi.fn().mockRejectedValue(new Error("Offline"));
    await expect(syncPendingAttempts(failingTransport)).rejects.toThrow("Offline");
    expect(await getPendingAttempts()).toHaveLength(1);

    const succeedingTransport = vi.fn().mockResolvedValue(undefined);
    const firstSync = await syncPendingAttempts(succeedingTransport);
    expect(firstSync).toEqual({ syncedCount: 1, remainingPendingCount: 0 });
    expect(succeedingTransport).toHaveBeenCalledTimes(1);

    const secondSync = await syncPendingAttempts(succeedingTransport);
    expect(secondSync).toEqual({ syncedCount: 0, remainingPendingCount: 0 });
    expect(succeedingTransport).toHaveBeenCalledTimes(1);
  });
});
