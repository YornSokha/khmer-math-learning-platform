import { expect, test } from "@playwright/test";

test("displays calm learning XP, weekly days learned without streak loss warnings, and mastery achievements on /learn", async ({
  page,
}) => {
  await page.goto("/learn");

  // Seed attempts across 3 separate days with 3 fixed mistakes in IndexedDB
  await page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const req = indexedDB.open("khmer-math-progress", 1);
      req.onupgradeneeded = () => {
        const database = req.result;
        if (!database.objectStoreNames.contains("attempts")) {
          database.createObjectStore("attempts", { keyPath: "clientEventId" });
        }
        if (!database.objectStoreNames.contains("completions")) {
          database.createObjectStore("completions", { keyPath: "lessonId" });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });

    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const items = [
      { id: "r1-w", step: "s1", correct: false, at: now - 3 * dayMs },
      { id: "r1-c", step: "s1", correct: true, at: now - 3 * dayMs + 5000 },
      { id: "r2-w", step: "s2", correct: false, at: now - 2 * dayMs },
      { id: "r2-c", step: "s2", correct: true, at: now - 2 * dayMs + 5000 },
      { id: "r3-w", step: "s3", correct: false, at: now - 10_000 },
      { id: "r3-c", step: "s3", correct: true, at: now - 5_000 },
    ];

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("attempts", "readwrite");
      const store = tx.objectStore("attempts");
      for (const item of items) {
        store.put({
          clientEventId: item.id,
          lessonId: "g1-make-ten",
          lessonVersion: 1,
          stepId: item.step,
          correct: item.correct,
          hintsUsed: item.correct ? 1 : 0,
          durationMs: 15_000,
          timestamp: new Date(item.at).toISOString(),
          syncStatus: "pending",
        });
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  });

  await page.reload();

  const summary = page.getByTestId("calm-rewards-summary");
  await expect(summary).toBeVisible();
  await expect(summary).toHaveAttribute("data-days-this-week", "3");
  await expect(summary).toHaveAttribute("data-total-xp", "60");

  await expect(page.getByTestId("achievement-badge-first-lesson")).toHaveAttribute(
    "data-earned",
    "true",
  );
  await expect(page.getByTestId("achievement-badge-mistake-fixer")).toHaveAttribute(
    "data-earned",
    "true",
  );
  await expect(page.getByTestId("achievement-badge-calm-three-days")).toHaveAttribute(
    "data-earned",
    "true",
  );

  // Verify zero horizontal scroll at 360x800 and zero time-spent gamification on /learn
  const hasOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(hasOverflow).toBe(false);
  const summaryText = (await summary.textContent()) ?? "";
  expect(summaryText).not.toMatch(/នាទី|minutes|streak/i);
});
