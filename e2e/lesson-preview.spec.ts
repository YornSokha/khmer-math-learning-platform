import { expect, test } from "@playwright/test";

test("lesson preview renders g1-make-ten cleanly on 360x800 mobile viewport", async ({ page }) => {
  const response = await page.goto("/preview/g1-make-ten");
  expect(response?.status()).toBe(200);

  await expect(page.locator("html")).toHaveAttribute("lang", "km");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("បង្កើត");
  await expect(page.getByTestId("review-badge-math")).toBeVisible();
  await expect(page.getByTestId("review-badge-khmer")).toBeVisible();

  const stepCards = page.locator('[data-testid^="preview-step-"]');
  await expect(stepCards).toHaveCount(8);

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(hasHorizontalOverflow).toBe(false);

  const arabicButton = page.getByRole("button", { name: "ប្រើលេខអារ៉ាប់ (123)" });
  await arabicButton.click();
  await expect(arabicButton).toHaveAttribute("aria-pressed", "true");
});
