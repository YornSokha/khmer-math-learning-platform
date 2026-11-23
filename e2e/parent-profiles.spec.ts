import { expect, test } from "@playwright/test";

test("parent signs up with consent, creates child profile, hands device to child, and deletes child on 360x800", async ({
  page,
}) => {
  const uniqueEmail = `parent-${Date.now()}@example.com`;

  await page.goto("/");
  await page.getByTestId("home-parent-portal-link").click();
  await expect(page).toHaveURL(/\/parent$/);

  await expect(page.getByTestId("parent-auth-card")).toBeVisible();

  // Attempting signup without parental consent shows an error
  await page.getByTestId("parent-email-input").fill(uniqueEmail);
  await page.getByTestId("parent-password-input").fill("password123");
  await page.getByTestId("parent-auth-submit").click();
  await expect(page.getByTestId("parent-auth-error")).toBeVisible();

  // Check explicit under-16 parental consent and complete signup
  await page.getByTestId("parent-consent-checkbox").check();
  await page.getByTestId("parent-auth-submit").click();

  await expect(page.getByTestId("parent-account-summary")).toContainText(uniqueEmail);

  // Confirm no horizontal overflow at 360x800
  const hasOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(hasOverflow).toBe(false);

  // Add a minimal non-PII child profile with Arabic numeral preference
  await page.getByTestId("child-nickname-input").fill("សុខា");
  await page.getByTestId("avatar-option-tuktuk").click();
  await page.getByTestId("child-numeral-arabic").click();
  await page.getByTestId("add-child-submit").click();

  const childCard = page.locator('[data-testid^="child-card-"]').first();
  await expect(childCard).toBeVisible();
  await expect(childCard).toContainText("សុខា");

  // Hand device to child -> redirects to /learn with child's numeral preference applied
  await childCard.locator('[data-testid^="child-hand-device-"]').click();
  await expect(page).toHaveURL(/\/learn$/);
  await expect(page.getByTestId("next-lesson-card")).toContainText("0 / 12");

  // Return to /parent, confirm persistence, and permanently delete child profile
  await page.goto("/parent");
  const persistedCard = page.locator('[data-testid^="child-card-"]').first();
  await expect(persistedCard).toContainText("សុខា");

  await persistedCard.locator('[data-testid^="child-delete-button-"]').click();
  await persistedCard.locator('[data-testid^="child-confirm-delete-"]').click();
  await expect(page.getByTestId("parent-empty-children")).toBeVisible();
});
