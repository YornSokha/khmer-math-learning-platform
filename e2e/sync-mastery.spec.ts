import { expect, test } from "@playwright/test";

test("syncs child lesson attempts to backend idempotently and shows parent progress overview on 360x800", async ({
  page,
}) => {
  const uniqueEmail = `sync-${Date.now()}@example.com`;

  // 1. Parent signs up with consent and creates a child profile
  await page.goto("/parent");
  await page.getByTestId("parent-email-input").fill(uniqueEmail);
  await page.getByTestId("parent-password-input").fill("password123");
  await page.getByTestId("parent-consent-checkbox").check();
  await page.getByTestId("parent-auth-submit").click();
  await expect(page.getByTestId("parent-account-summary")).toContainText(uniqueEmail);

  await page.getByTestId("child-nickname-input").fill("រ៉ានី");
  await page.getByTestId("avatar-option-lotus").click();
  await page.getByTestId("child-numeral-arabic").click();
  await page.getByTestId("add-child-submit").click();

  const childCard = page.locator('[data-testid^="child-card-"]').first();
  await expect(childCard).toBeVisible();
  const childTestId = await childCard.getAttribute("data-testid");
  const childId = childTestId?.replace("child-card-", "") ?? "";
  expect(childId).not.toBe("");

  // 2. Hand device to child and open g1-make-ten
  await childCard.locator('[data-testid^="child-hand-device-"]').click();
  await expect(page).toHaveURL(/\/learn$/);

  await page.goto("/lessons/g1-make-ten");
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
  await page.getByTestId("step-continue-button").click();

  // Step 3: ten-frame complete -> triggers automatic attempt sync to /api/sync/attempts
  await expect(page.getByTestId("lesson-step-card")).toHaveAttribute(
    "data-step-id",
    "attempt-ten-frame-complete",
  );
  const rawParams = await page.getByTestId("lesson-step-card").getAttribute("data-resolved-params");
  const { given } = JSON.parse(rawParams ?? "{}") as { given: number };

  const syncResponsePromise = page.waitForResponse(
    (res) => res.url().includes("/api/sync/attempts") && res.status() === 200,
  );
  for (let i = given; i < 10; i += 1) {
    await page.getByTestId(`ten-frame-cell-${i}`).click();
  }
  await page.getByTestId("step-check-button").click();

  const syncResponse = await syncResponsePromise;
  const syncBody = (await syncResponse.json()) as {
    acceptedCount: number;
    duplicateCount: number;
  };
  expect(syncBody.acceptedCount).toBe(1);
  expect(syncBody.duplicateCount).toBe(0);

  // 3. Re-submitting an identical clientEventId from the authenticated browser creates zero duplicates
  const duplicateCheck = await page.evaluate(async (targetChildId) => {
    const payload = {
      childProfileId: targetChildId,
      attempts: [
        {
          clientEventId: "e2e-idempotent-evt-1",
          lessonId: "g1-make-ten",
          lessonVersion: 1,
          stepId: "mastery-check-bond-10",
          correct: true,
          hintsUsed: 0,
          durationMs: 62000,
          timestamp: new Date().toISOString(),
        },
      ],
    };
    const first = await fetch("/api/sync/attempts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((r) => r.json());
    const second = await fetch("/api/sync/attempts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((r) => r.json());
    return { first, second };
  }, childId);

  expect(duplicateCheck.first.acceptedCount).toBe(1);
  expect(duplicateCheck.second.acceptedCount).toBe(0);
  expect(duplicateCheck.second.duplicateCount).toBe(1);

  // 4. Parent returns to /parent and sees calm progress summary (attempts, practice skills, minutes)
  await page.goto("/parent");
  const progressBox = page.getByTestId(`child-progress-${childId}`);
  await expect(progressBox).toBeVisible();
  await expect(page.getByTestId(`child-attempts-count-${childId}`)).toContainText("2");
  await expect(page.getByTestId(`child-minutes-today-${childId}`)).toContainText("1");
});
