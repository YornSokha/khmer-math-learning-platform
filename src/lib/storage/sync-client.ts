import {
  getPendingAttempts,
  syncPendingAttempts,
  type StoredAttempt,
} from "@/lib/storage/progress-db";

export interface ChildSyncOutcome {
  syncedCount: number;
  remainingPendingCount: number;
  status: "synced" | "idle" | "offline" | "deferred";
}

export async function syncLocalAttemptsForChild(childProfileId: string): Promise<ChildSyncOutcome> {
  if (!childProfileId) {
    const pending = await getPendingAttempts();
    return { syncedCount: 0, remainingPendingCount: pending.length, status: "deferred" };
  }

  if (typeof navigator !== "undefined" && !navigator.onLine) {
    const pending = await getPendingAttempts();
    return { syncedCount: 0, remainingPendingCount: pending.length, status: "offline" };
  }

  const pendingBefore = await getPendingAttempts();
  if (pendingBefore.length === 0) {
    return { syncedCount: 0, remainingPendingCount: 0, status: "idle" };
  }

  try {
    const result = await syncPendingAttempts(async (batch: StoredAttempt[]) => {
      const response = await fetch("/api/sync/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          childProfileId,
          attempts: batch.map((item) => ({
            clientEventId: item.clientEventId,
            lessonId: item.lessonId,
            lessonVersion: item.lessonVersion,
            stepId: item.stepId,
            correct: item.correct,
            hintsUsed: item.hintsUsed,
            misconceptionId: item.misconceptionId ?? null,
            durationMs: item.durationMs,
            timestamp: item.timestamp,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`Sync failed with HTTP ${response.status}`);
      }
    });

    return {
      syncedCount: result.syncedCount,
      remainingPendingCount: result.remainingPendingCount,
      status: "synced",
    };
  } catch {
    const remaining = await getPendingAttempts();
    return {
      syncedCount: 0,
      remainingPendingCount: remaining.length,
      status: "deferred",
    };
  }
}
