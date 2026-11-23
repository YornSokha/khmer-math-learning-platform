import { expect, test } from "@playwright/test";

test("surfaces Today's Review on /learn for a due mastered skill and clears queue after review on 360x800", async ({
  page,
}) => {
  await page.goto("/learn");

  // Seed two separate-day independent attempts in IndexedDB for g1-make-ten so bond-10 is mastered & due
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

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("attempts", "readwrite");
      const store = tx.objectStore("attempts");
      store.put({
        clientEventId: "seed-review-1",
        lessonId: "g1-make-ten",
        lessonVersion: 1,
        stepId: "mastery-check-bond-10",
        correct: true,
        hintsUsed: 0,
        durationMs: 12000,
        timestamp: "2026-11-18T08:00:00.000Z",
        syncStatus: "pending",
      });
      store.put({
        clientEventId: "seed-review-2",
        lessonId: "g1-make-ten",
        lessonVersion: 1,
        stepId: "mastery-check-bond-10",
        correct: true,
        hintsUsed: 0,
        durationMs: 10000,
        timestamp: "2026-11-19T08:00:00.000Z",
        syncStatus: "pending",
      });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  });

  await page.reload();
  await expect(page.getByTestId("todays-review-card")).toBeVisible();
  await expect(page.getByTestId("todays-review-card")).toHaveAttribute("data-due-count", "1");

  await page.getByTestId("todays-review-link").click();
  await expect(page).toHaveURL(/\/review$/);

  const card = page.getByTestId("review-step-card");
  await expect(card).toHaveAttribute("data-lesson-id", "g1-make-ten");

  const stepId = await card.getAttribute("data-step-id");
  const params = JSON.parse((await card.getAttribute("data-resolved-params")) ?? "{}") as Record<
    string,
    number
  >;

  if (stepId === "attempt-ten-frame-complete") {
    for (let i = params.given ?? 0; i < 10; i += 1) {
      await page.getByTestId(`ten-frame-cell-${i}`).click();
    }
  } else if (stepId === "practice-tuktuk-number-line") {
    const hops = 10 - (params.start ?? 0);
    for (let i = 0; i < hops; i += 1) {
      await page.getByTestId("number-line-forward").click();
    }
  } else {
    const ans = 10 - (params.a ?? 0);
    await page.getByTestId(`keypad-digit-${ans}`).click();
  }

  await page.getByTestId("review-check-button").click();
  await expect(page.getByTestId("review-feedback")).toHaveAttribute("data-correct", "true");
  await page.getByTestId("review-continue-button").click();

  await expect(page.getByTestId("review-complete-screen")).toBeVisible();
  await page.getByTestId("review-complete-back-link").click();
  await expect(page).toHaveURL(/\/learn$/);
  await expect(page.getByTestId("todays-review-card")).toHaveCount(0);
});

test("Daily Challenge can be skipped without penalty on /daily-challenge and reflects on /learn", async ({
  page,
}) => {
  await page.goto("/daily-challenge");
  await expect(page.getByTestId("daily-challenge-card")).toBeVisible();

  const hasOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(hasOverflow).toBe(false);

  await page.getByTestId("daily-skip-button").click();
  await expect(page.getByTestId("daily-skipped-screen")).toBeVisible();

  await page.getByTestId("daily-skipped-back-link").click();
  await expect(page).toHaveURL(/\/learn$/);
  await expect(page.getByTestId("daily-challenge-dashboard-card")).toHaveAttribute(
    "data-daily-status",
    "skipped",
  );
});
