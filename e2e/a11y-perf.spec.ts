import { expect, test } from "@playwright/test";

const CORE_ROUTES = [
  "/",
  "/learn",
  "/lessons/g1-make-ten",
  "/review",
  "/daily-challenge",
  "/placement",
  "/parent",
] as const;

test("all core routes satisfy baseline Khmer accessibility, landmarks, and zero horizontal scroll at 360x800", async ({
  page,
}) => {
  for (const route of CORE_ROUTES) {
    const pageErrors: string[] = [];
    const consoleErrors: string[] = [];
    const onPageError = (err: Error) => pageErrors.push(err.message);
    const onConsole = (msg: { type: () => string; text: () => string }) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    };

    page.on("pageerror", onPageError);
    page.on("console", onConsole);

    await page.goto(route, { waitUntil: "networkidle" });

    await expect(page.locator("html")).toHaveAttribute("lang", "km");
    await expect(page.getByTestId("skip-to-content")).toHaveAttribute("href", "#main-content");
    await expect(page.locator("main#main-content")).toBeVisible();
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1").first()).toBeVisible();

    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(hasOverflow, `Route ${route} should have no horizontal overflow at 360px`).toBe(false);
    expect(pageErrors, `Route ${route} should have no uncaught page errors`).toEqual([]);
    expect(consoleErrors, `Route ${route} should have no console errors`).toEqual([]);

    page.off("pageerror", onPageError);
    page.off("console", onConsole);
  }
});

test("Parent Gate on /learn blocks wrong answers and unlocks /parent with Khmer digits (៤២)", async ({
  page,
}) => {
  await page.goto("/learn");

  await page.getByTestId("learn-parent-gate-button").click();
  await expect(page.getByTestId("parent-gate-modal")).toBeVisible();

  await page.getByTestId("parent-gate-input").fill("10");
  await page.getByTestId("parent-gate-submit").click();
  await expect(page.getByTestId("parent-gate-error")).toBeVisible();

  await page.getByTestId("parent-gate-input").fill("៤២");
  await page.getByTestId("parent-gate-submit").click();

  await expect(page).toHaveURL(/\/parent$/);
  await expect(page.locator("main#main-content")).toBeVisible();
});

test("lesson route stays within lightweight mobile JS transfer budget and touch target minimums", async ({
  page,
}) => {
  await page.goto("/lessons/g1-make-ten", { waitUntil: "networkidle" });

  // Verify primary CTA button meets >= 48px touch target height
  const ctaBox = await page.getByTestId("step-continue-button").boundingBox();
  expect(ctaBox).not.toBeNull();
  expect(ctaBox!.height).toBeGreaterThanOrEqual(48);

  // Measure real network transfer size of JS scripts on the lesson route
  const totalJsTransferBytes = await page.evaluate(() => {
    const entries = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
    return entries
      .filter((entry) => entry.initiatorType === "script" || entry.name.endsWith(".js"))
      .reduce((sum, entry) => sum + (entry.transferSize || 0), 0);
  });

  // Keep gzipped JS transfer budget lightweight for mid/low-end Android Chrome (< 350 KB)
  expect(totalJsTransferBytes).toBeLessThan(350_000);
});
