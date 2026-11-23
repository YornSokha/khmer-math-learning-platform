import { expect, test } from "@playwright/test";

test("placement check places bonds-to-10 learner at Lesson 6 while allowing earlier lessons on 360x800", async ({
  page,
}) => {
  await page.goto("/placement");
  await expect(page.locator("html")).toHaveAttribute("lang", "km");

  // Q1: count 4 mangoes
  await expect(page.getByTestId("placement-item-card")).toHaveAttribute(
    "data-item-id",
    "p1-subitize",
  );
  for (let i = 0; i < 4; i += 1) {
    await page.getByTestId(`count-tap-item-${i}`).click();
  }
  await page.getByTestId("placement-next-button").click();

  // Q2: compare 7 > 4
  await expect(page.getByTestId("placement-item-card")).toHaveAttribute(
    "data-item-id",
    "p2-compare",
  );
  await page.getByTestId("compare-symbol->").click();
  await page.getByTestId("placement-next-button").click();

  // Q3: 7 + □ = 10 -> 3 (bonds-to-10 mastered)
  await expect(page.getByTestId("placement-item-card")).toHaveAttribute(
    "data-item-id",
    "p3-bond-10",
  );
  await page.getByTestId("keypad-digit-3").click();
  await page.getByTestId("placement-next-button").click();

  // Q4: miss 4 + 3 (enter 9)
  await expect(page.getByTestId("placement-item-card")).toHaveAttribute(
    "data-item-id",
    "p4-add-10",
  );
  await page.getByTestId("keypad-digit-9").click();
  await page.getByTestId("placement-next-button").click();

  // Q5: miss tens & ones (enter 1)
  await expect(page.getByTestId("placement-item-card")).toHaveAttribute(
    "data-item-id",
    "p5-tens-ones",
  );
  await page.getByTestId("keypad-digit-1").click();
  await page.getByTestId("placement-next-button").click();

  // Lands on /learn recommending Lesson 6
  await expect(page).toHaveURL(/\/learn$/);
  await expect(page.getByTestId("next-lesson-card")).toHaveAttribute(
    "data-lesson-id",
    "g1-06-addition-10",
  );
  await expect(page.getByTestId("path-node-g1-01-subitize-1-5")).toHaveAttribute(
    "data-lesson-state",
    "available",
  );
  await expect(page.getByTestId("path-node-g1-07-subtraction-10")).toHaveAttribute(
    "data-lesson-state",
    "locked",
  );

  const hasOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(hasOverflow).toBe(false);

  // Child can still revisit an earlier lesson (Lesson 1)
  await page.getByTestId("path-open-g1-01-subitize-1-5").click();
  await expect(page).toHaveURL(/\/lessons\/g1-01-subitize-1-5$/);
  await expect(page.getByTestId("lesson-step-card")).toBeVisible();
});

test("learner can skip placement directly to Lesson 1 on /learn", async ({ page }) => {
  await page.goto("/placement");
  await page.getByTestId("placement-skip-button").click();

  await expect(page).toHaveURL(/\/learn$/);
  await expect(page.getByTestId("next-lesson-card")).toHaveAttribute(
    "data-lesson-id",
    "g1-01-subitize-1-5",
  );
});
