import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

const SCREENSHOT_PATH = path.join("test-results", "khmer-foundation-360x800.png");

test("Khmer typography, self-hosted fonts, touch targets, and numeral toggle at 360x800", async ({
  page,
}, testInfo) => {
  const externalFontRequests: string[] = [];

  page.on("request", (request) => {
    const url = request.url();
    if (/fonts\.(googleapis|gstatic)\.com/i.test(url)) {
      externalFontRequests.push(url);
    }
  });

  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page.locator("html")).toHaveAttribute("lang", "km");

  await page.evaluate(() => document.fonts.ready);

  expect(externalFontRequests).toEqual([]);

  const fontDiagnostics = await page.evaluate(() => {
    const bodyStyle = window.getComputedStyle(document.body);
    const loadedFamilies = Array.from(document.fonts)
      .filter((font) => font.status === "loaded")
      .map((font) => font.family);

    return {
      bodyFontFamily: bodyStyle.fontFamily,
      loadedFamilies,
    };
  });

  expect(fontDiagnostics.bodyFontFamily).toMatch(/kantumruy/i);
  expect(fontDiagnostics.loadedFamilies.some((family) => /kantumruy/i.test(family))).toBe(true);

  const metrics = await page.evaluate(() => {
    const measure = (selector: string) => {
      const element = document.querySelector<HTMLElement>(selector);
      if (!element) {
        throw new Error(`Missing element: ${selector}`);
      }
      const style = window.getComputedStyle(element);
      const fontSize = Number.parseFloat(style.fontSize);
      const lineHeight = Number.parseFloat(style.lineHeight);

      return {
        fontSize,
        lineHeight,
        ratio: lineHeight / fontSize,
        scrollHeight: element.scrollHeight,
        clientHeight: element.clientHeight,
      };
    };

    return {
      body: measure('[data-testid="khmer-body"]'),
      instruction: measure('[data-testid="khmer-instruction"]'),
      hasHorizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
    };
  });

  expect(metrics.body.fontSize).toBeGreaterThanOrEqual(18);
  expect(metrics.body.ratio).toBeGreaterThanOrEqual(1.7);
  expect(metrics.body.scrollHeight).toBeLessThanOrEqual(metrics.body.clientHeight + 1);

  expect(metrics.instruction.fontSize).toBeGreaterThanOrEqual(24);
  expect(metrics.instruction.ratio).toBeGreaterThanOrEqual(1.7);
  expect(metrics.instruction.scrollHeight).toBeLessThanOrEqual(
    metrics.instruction.clientHeight + 1,
  );

  expect(metrics.hasHorizontalOverflow).toBe(false);

  const buttons = page.locator("button");
  const buttonCount = await buttons.count();
  expect(buttonCount).toBeGreaterThanOrEqual(5);

  for (let index = 0; index < buttonCount; index += 1) {
    const button = buttons.nth(index);
    const box = await button.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(48);
    expect(box!.height).toBeGreaterThanOrEqual(48);

    const overflowCheck = await button.evaluate((element) => {
      const style = window.getComputedStyle(element);
      return {
        overflow: style.overflow,
        overflowX: style.overflowX,
        overflowY: style.overflowY,
        scrollHeight: element.scrollHeight,
        clientHeight: element.clientHeight,
      };
    });

    expect(overflowCheck.overflow).not.toBe("hidden");
    expect(overflowCheck.overflowX).not.toBe("hidden");
    expect(overflowCheck.overflowY).not.toBe("hidden");
    expect(overflowCheck.scrollHeight).toBeLessThanOrEqual(overflowCheck.clientHeight + 1);
  }

  fs.mkdirSync(path.dirname(SCREENSHOT_PATH), { recursive: true });
  await page.screenshot({ path: SCREENSHOT_PATH, fullPage: true });
  await testInfo.attach("khmer-foundation-360x800", {
    path: SCREENSHOT_PATH,
    contentType: "image/png",
  });

  await expect(page.getByTestId("sample-number-0")).toHaveText("០");
  await expect(page.getByTestId("sample-number-7")).toHaveText("៧");
  await expect(page.getByTestId("sample-number-10")).toHaveText("១០");

  const arabicButton = page.getByRole("button", { name: "ប្រើលេខអារ៉ាប់ (123)" });
  const khmerButton = page.getByRole("button", { name: "ប្រើលេខខ្មែរ (១២៣)" });

  await arabicButton.click();
  await expect(arabicButton).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("sample-number-0")).toHaveText("0");
  await expect(page.getByTestId("sample-number-7")).toHaveText("7");
  await expect(page.getByTestId("sample-number-10")).toHaveText("10");

  await page.reload();
  await expect(arabicButton).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("sample-number-7")).toHaveText("7");
  await expect(page.getByTestId("sample-number-10")).toHaveText("10");

  await khmerButton.click();
  await expect(khmerButton).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("sample-number-7")).toHaveText("៧");
  await expect(page.getByTestId("sample-number-10")).toHaveText("១០");
});

test("respects prefers-reduced-motion media query", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const transitionSeconds = await page
    .getByTestId("khmer-control-start")
    .evaluate((element) => Number.parseFloat(window.getComputedStyle(element).transitionDuration));

  expect(transitionSeconds).toBeLessThanOrEqual(0.001);
});
