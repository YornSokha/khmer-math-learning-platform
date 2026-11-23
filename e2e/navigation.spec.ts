import { expect, test } from "@playwright/test";

test("mobile bottom bar navigates cleanly between Learn, Review, Daily Challenge, and Parents with >=48px targets and unclipped Khmer labels at 360x800", async ({
  page,
}) => {
  await page.goto("/learn");

  await expect(page.getByTestId("app-top-header")).toBeVisible();
  await expect(page.getByTestId("mobile-bottom-nav")).toBeVisible();
  await expect(page.getByTestId("desktop-nav")).toBeHidden();
  await expect(page.getByTestId("nav-numeral-toggle")).toBeVisible();
  await expect(page.getByRole("button", { name: "ប្រើលេខអារ៉ាប់ (123)" })).toHaveCount(1);

  await expect(page.getByTestId("mobile-nav-learn")).toHaveAttribute("aria-current", "page");

  const tabIds = [
    "mobile-nav-learn",
    "mobile-nav-review",
    "mobile-nav-daily",
    "mobile-nav-parents",
  ] as const;

  for (const id of tabIds) {
    const tab = page.getByTestId(id);
    await expect(tab).toBeVisible();
    const box = await tab.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(48);
    expect(box!.height).toBeGreaterThanOrEqual(48);

    const clipping = await tab.evaluate((element) => {
      const style = window.getComputedStyle(element);
      const label = element.querySelector("span:last-child");
      const labelStyle = label ? window.getComputedStyle(label) : null;
      return {
        overflow: style.overflow,
        labelOverflow: labelStyle?.overflow ?? "visible",
        labelScrollHeight: label?.scrollHeight ?? 0,
        labelClientHeight: label?.clientHeight ?? 0,
      };
    });

    expect(clipping.overflow).not.toBe("hidden");
    expect(clipping.labelOverflow).not.toBe("hidden");
    expect(clipping.labelScrollHeight).toBeLessThanOrEqual(clipping.labelClientHeight + 1);
  }

  let hasOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(hasOverflow).toBe(false);

  // Navigate to Review via mobile bottom bar
  await page.getByTestId("mobile-nav-review").click();
  await expect(page).toHaveURL(/\/review$/);
  await expect(page.getByTestId("mobile-nav-review")).toHaveAttribute("aria-current", "page");
  hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(hasOverflow).toBe(false);

  // Navigate to Daily Challenge via mobile bottom bar
  await page.getByTestId("mobile-nav-daily").click();
  await expect(page).toHaveURL(/\/daily-challenge$/);
  await expect(page.getByTestId("mobile-nav-daily")).toHaveAttribute("aria-current", "page");
  hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(hasOverflow).toBe(false);

  // Navigate directly to Parents when no child profile is active
  await page.getByTestId("mobile-nav-parents").click();
  await expect(page).toHaveURL(/\/parent$/);
  await expect(page.getByTestId("parent-gate-modal")).toHaveCount(0);
  await expect(page.getByTestId("mobile-nav-parents")).toHaveAttribute("aria-current", "page");
  hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(hasOverflow).toBe(false);
});

test("focus mode hides global header and bottom tab bar on active lessons and placement", async ({
  page,
}) => {
  await page.goto("/lessons/g1-make-ten");
  await expect(page.getByTestId("app-top-header")).toHaveCount(0);
  await expect(page.getByTestId("mobile-bottom-nav")).toHaveCount(0);
  await expect(page.getByTestId("lesson-exit-link")).toBeVisible();

  await page.goto("/placement");
  await expect(page.getByTestId("app-top-header")).toHaveCount(0);
  await expect(page.getByTestId("mobile-bottom-nav")).toHaveCount(0);
  await expect(page.getByRole("link", { name: /ចាកចេញ/ })).toBeVisible();
});

test("active child chip appears in header and Parents tab opens Parent Gate when a child is active", async ({
  page,
}) => {
  await page.goto("/learn");

  await page.evaluate(() => {
    window.localStorage.setItem(
      "khmer-math:active-child:v1",
      JSON.stringify({
        id: "chd_nav_1",
        nickname: "សុខា",
        avatarId: "tuktuk",
        grade: 1,
        numeralPref: "khmer",
      }),
    );
  });

  await page.reload();

  await expect(page.getByTestId("nav-active-child-chip")).toBeVisible();
  await expect(page.getByTestId("nav-active-child-chip")).toContainText("សុខា");

  const hasOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(hasOverflow).toBe(false);

  // Tapping Parents triggers the Parent Gate instead of navigating immediately
  await page.getByTestId("mobile-nav-parents").click();
  await expect(page).toHaveURL(/\/learn$/);
  await expect(page.getByTestId("parent-gate-modal")).toBeVisible();

  // Wrong answer stays blocked
  await page.getByTestId("parent-gate-input").fill("12");
  await page.getByTestId("parent-gate-submit").click();
  await expect(page.getByTestId("parent-gate-error")).toBeVisible();

  // Correct Khmer digits unlock /parent
  await page.getByTestId("parent-gate-input").fill("៤២");
  await page.getByTestId("parent-gate-submit").click();
  await expect(page).toHaveURL(/\/parent$/);
});

test("home route renders clean primary menu above subordinate showcase footer with a single numeral toggle", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.getByTestId("app-top-header")).toBeVisible();
  await expect(page.getByTestId("mobile-bottom-nav")).toBeVisible();
  await expect(page.getByTestId("nav-numeral-toggle")).toHaveCount(0);

  await expect(page.getByTestId("home-learning-path-link")).toBeVisible();
  await expect(page.getByTestId("home-placement-link")).toBeVisible();
  await expect(page.getByTestId("home-parent-portal-link")).toBeVisible();
  await expect(page.getByTestId("home-start-lesson-link")).toBeVisible();
  await expect(page.getByTestId("home-preview-lesson-link")).toBeVisible();

  const primaryBox = await page.getByTestId("home-primary-menu").boundingBox();
  const footerBox = await page.getByTestId("home-showcase-footer").boundingBox();
  expect(primaryBox).not.toBeNull();
  expect(footerBox).not.toBeNull();
  expect(primaryBox!.y).toBeLessThan(footerBox!.y);

  // Exactly one numeral toggle exists on /
  await expect(page.getByRole("button", { name: "ប្រើលេខអារ៉ាប់ (123)" })).toHaveCount(1);
  await expect(page.getByRole("button", { name: "ប្រើលេខខ្មែរ (១២៣)" })).toHaveCount(1);

  const hasOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(hasOverflow).toBe(false);
});
