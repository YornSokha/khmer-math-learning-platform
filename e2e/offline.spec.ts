import { expect, test } from "@playwright/test";

test("completes Make Ten lesson completely offline and persists progress in IndexedDB after reload", async ({
  context,
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "km");

  // Wait for Serwist service worker registration and activation
  const swReady = await page.evaluate(async () => {
    if (!("serviceWorker" in navigator)) return false;
    const reg = await navigator.serviceWorker.ready;
    return Boolean(reg.active);
  });
  expect(swReady).toBe(true);

  // Navigate to lesson online once so page & chunks are controlled by SW
  await page.goto("/lessons/g1-make-ten");
  await expect(page.getByTestId("lesson-step-card")).toHaveAttribute(
    "data-step-id",
    "hook-dinner-plates",
  );

  // Switch completely offline
  await context.setOffline(true);

  // Reload lesson page offline and verify SW serves it cleanly + offline banner shows
  await page.reload();
  await expect(page.getByTestId("offline-status-banner")).toBeVisible();
  await expect(page.getByTestId("lesson-step-card")).toHaveAttribute(
    "data-step-id",
    "hook-dinner-plates",
  );

  // Complete all 8 steps offline
  await page.getByTestId("step-continue-button").click(); // 1 -> 2
  await page.getByTestId("step-continue-button").click(); // 2 -> 3

  // Step 3: ten-frame complete
  const step3Params = JSON.parse(
    (await page.getByTestId("lesson-step-card").getAttribute("data-resolved-params")) ?? "{}",
  ) as { given: number };
  for (let i = step3Params.given; i < 10; i += 1) {
    await page.getByTestId(`ten-frame-cell-${i}`).click();
  }
  await page.getByTestId("step-check-button").click();
  await expect(page.getByTestId("step-feedback")).toHaveAttribute("data-correct", "true");
  await page.getByTestId("step-continue-button").click(); // 3 -> 4

  // Step 4: explain
  await page.getByTestId("step-continue-button").click(); // 4 -> 5

  // Step 5: number-line jump
  const step5Params = JSON.parse(
    (await page.getByTestId("lesson-step-card").getAttribute("data-resolved-params")) ?? "{}",
  ) as { start: number };
  for (let i = 0; i < 10 - step5Params.start; i += 1) {
    await page.getByTestId("number-line-forward").click();
  }
  await page.getByTestId("step-check-button").click();
  await expect(page.getByTestId("step-feedback")).toHaveAttribute("data-correct", "true");
  await page.getByTestId("step-continue-button").click(); // 5 -> 6

  // Step 6: equation-fill partial
  const step6Params = JSON.parse(
    (await page.getByTestId("lesson-step-card").getAttribute("data-resolved-params")) ?? "{}",
  ) as { a: number };
  await page.getByTestId(`keypad-digit-${10 - step6Params.a}`).click();
  await page.getByTestId("step-check-button").click();
  await expect(page.getByTestId("step-feedback")).toHaveAttribute("data-correct", "true");
  await page.getByTestId("step-continue-button").click(); // 6 -> 7

  // Step 7: equation-fill abstract
  const step7Params = JSON.parse(
    (await page.getByTestId("lesson-step-card").getAttribute("data-resolved-params")) ?? "{}",
  ) as { a: number };
  await page.getByTestId(`keypad-digit-${10 - step7Params.a}`).click();
  await page.getByTestId("step-check-button").click();
  await expect(page.getByTestId("step-feedback")).toHaveAttribute("data-correct", "true");
  await page.getByTestId("step-continue-button").click(); // 7 -> 8

  // Step 8: mastery check
  const step8Params = JSON.parse(
    (await page.getByTestId("lesson-step-card").getAttribute("data-resolved-params")) ?? "{}",
  ) as { a: number };
  await page.getByTestId(`keypad-digit-${10 - step8Params.a}`).click();
  await page.getByTestId("step-check-button").click();
  await expect(page.getByTestId("step-feedback")).toHaveAttribute("data-correct", "true");
  await page.getByTestId("step-continue-button").click(); // complete

  await expect(page.getByTestId("lesson-complete-screen")).toBeVisible();
  await expect(page.getByTestId("local-progress-indicator")).toHaveAttribute(
    "data-completion-saved",
    "true",
  );

  // Reload again while still offline and confirm completion + IndexedDB records persist
  await page.reload();
  await expect(page.getByTestId("lesson-complete-screen")).toBeVisible();

  const storedStats = await page.evaluate(async () => {
    return new Promise<{ attempts: number; completionId: string | null }>((resolve, reject) => {
      const req = indexedDB.open("khmer-math-progress", 1);
      req.onerror = () => reject(req.error);
      req.onsuccess = () => {
        const db = req.result;
        const tx = db.transaction(["attempts", "completions"], "readonly");
        const attemptsReq = tx.objectStore("attempts").getAll();
        const completionReq = tx.objectStore("completions").get("g1-make-ten");
        tx.oncomplete = () => {
          resolve({
            attempts: (attemptsReq.result as unknown[]).length,
            completionId:
              (completionReq.result as { lessonId?: string } | undefined)?.lessonId ?? null,
          });
          db.close();
        };
      };
    });
  });

  expect(storedStats.attempts).toBeGreaterThanOrEqual(5);
  expect(storedStats.completionId).toBe("g1-make-ten");

  // Navigating to an uncached document route offline renders Khmer /offline fallback
  const offlinePage = await context.newPage();
  const offlineResponse = await offlinePage.goto("/uncached-offline-route");
  expect(offlineResponse?.status()).toBe(200);
  await expect(offlinePage.getByTestId("offline-fallback-card")).toBeVisible();
  const hasOverflow = await offlinePage.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(hasOverflow).toBe(false);
  await offlinePage.close();

  await context.setOffline(false);
});
