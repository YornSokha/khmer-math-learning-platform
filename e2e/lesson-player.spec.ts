import { expect, test } from "@playwright/test";

test("plays Grade 1 Make Ten lesson end-to-end on 360x800 including hints and mid-lesson resume", async ({
  page,
}) => {
  await page.goto("/lessons/g1-make-ten");
  await expect(page.locator("html")).toHaveAttribute("lang", "km");

  const hasOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(hasOverflow).toBe(false);

  // Step 1: intro
  await expect(page.getByTestId("lesson-step-card")).toHaveAttribute(
    "data-step-id",
    "hook-dinner-plates",
  );
  await page.getByTestId("step-continue-button").click();

  // Step 2: explore ten-frame
  await expect(page.getByTestId("lesson-step-card")).toHaveAttribute(
    "data-step-id",
    "explore-ten-frame",
  );
  await page.getByTestId("ten-frame-cell-6").click();
  await page.getByTestId("step-continue-button").click();

  // Step 3: ten-frame complete — verify mid-lesson reload resumes on exact same step
  await expect(page.getByTestId("lesson-step-card")).toHaveAttribute(
    "data-step-id",
    "attempt-ten-frame-complete",
  );
  const step3ParamsBeforeReload = await page
    .getByTestId("lesson-step-card")
    .getAttribute("data-resolved-params");

  await page.reload();
  await expect(page.getByTestId("lesson-step-card")).toHaveAttribute(
    "data-step-id",
    "attempt-ten-frame-complete",
  );
  expect(await page.getByTestId("lesson-step-card").getAttribute("data-resolved-params")).toBe(
    step3ParamsBeforeReload,
  );

  const step3Params = JSON.parse(step3ParamsBeforeReload ?? "{}") as { given: number };
  // Submit 1 wrong attempt first to exercise instant feedback and progressive hint 1
  await page.getByTestId(`ten-frame-cell-${step3Params.given}`).click();
  await page.getByTestId("step-check-button").click();
  await expect(page.getByTestId("step-feedback")).toHaveAttribute("data-correct", "false");
  await expect(page.getByTestId("revealed-hint-1")).toBeVisible();

  // Fill remaining empty cells to complete 10
  for (let i = step3Params.given + 1; i < 10; i += 1) {
    await page.getByTestId(`ten-frame-cell-${i}`).click();
  }
  await page.getByTestId("step-check-button").click();
  await expect(page.getByTestId("step-feedback")).toHaveAttribute("data-correct", "true");
  await page.getByTestId("step-continue-button").click();

  // Step 4: visual explanation
  await expect(page.getByTestId("lesson-step-card")).toHaveAttribute(
    "data-step-id",
    "explain-make-ten",
  );
  await page.getByTestId("step-continue-button").click();

  // Step 5: tuk-tuk number-line jump
  await expect(page.getByTestId("lesson-step-card")).toHaveAttribute(
    "data-step-id",
    "practice-tuktuk-number-line",
  );
  const step5Params = JSON.parse(
    (await page.getByTestId("lesson-step-card").getAttribute("data-resolved-params")) ?? "{}",
  ) as { start: number };
  const hopsNeeded = 10 - step5Params.start;
  for (let i = 0; i < hopsNeeded; i += 1) {
    await page.getByTestId("number-line-forward").click();
  }
  await page.getByTestId("step-check-button").click();
  await expect(page.getByTestId("step-feedback")).toHaveAttribute("data-correct", "true");
  await page.getByTestId("step-continue-button").click();

  // Step 6: equation-fill partial supports
  await expect(page.getByTestId("lesson-step-card")).toHaveAttribute(
    "data-step-id",
    "practice-equation-partial",
  );
  await expect(page.getByTestId("equation-visual-scaffold")).toBeVisible();
  const step6Params = JSON.parse(
    (await page.getByTestId("lesson-step-card").getAttribute("data-resolved-params")) ?? "{}",
  ) as { a: number };
  await page.getByTestId(`keypad-digit-${10 - step6Params.a}`).click();
  await page.getByTestId("step-check-button").click();
  await expect(page.getByTestId("step-feedback")).toHaveAttribute("data-correct", "true");
  await page.getByTestId("step-continue-button").click();

  // Step 7: abstract equation-fill (supports: none) — unlock hint 3 to reveal ten-frame model
  await expect(page.getByTestId("lesson-step-card")).toHaveAttribute(
    "data-step-id",
    "challenge-abstract-equation",
  );
  await expect(page.getByTestId("equation-visual-scaffold")).toHaveCount(0);
  await page.getByTestId("step-hint-button").click();
  await page.getByTestId("step-hint-button").click();
  await page.getByTestId("step-hint-button").click();
  await expect(page.getByTestId("equation-visual-scaffold")).toBeVisible();

  const step7Params = JSON.parse(
    (await page.getByTestId("lesson-step-card").getAttribute("data-resolved-params")) ?? "{}",
  ) as { a: number };
  await page.getByTestId(`keypad-digit-${10 - step7Params.a}`).click();
  await page.getByTestId("step-check-button").click();
  await expect(page.getByTestId("step-feedback")).toHaveAttribute("data-correct", "true");
  await page.getByTestId("step-continue-button").click();

  // Step 8: mastery check
  await expect(page.getByTestId("lesson-step-card")).toHaveAttribute(
    "data-step-id",
    "mastery-check-bond-10",
  );
  const step8Params = JSON.parse(
    (await page.getByTestId("lesson-step-card").getAttribute("data-resolved-params")) ?? "{}",
  ) as { a: number };
  await page.getByTestId(`keypad-digit-${10 - step8Params.a}`).click();
  await page.getByTestId("step-check-button").click();
  await expect(page.getByTestId("step-feedback")).toHaveAttribute("data-correct", "true");
  await page.getByTestId("step-continue-button").click();

  // Calm natural stop screen
  await expect(page.getByTestId("lesson-complete-screen")).toBeVisible();
  await expect(page.getByText("ធ្វើបានល្អណាស់! ជួបគ្នាថ្ងៃស្អែក។")).toBeVisible();
});
