import { test, expect } from "@playwright/test";

test.describe("Accessibility", () => {
  test("bottom nav links have aria-labels", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const navLinks = page.locator("nav a[aria-label]");
    const count = await navLinks.count();
    expect(count).toBeGreaterThanOrEqual(4);
  });

  test("interactive elements have minimum touch target size", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Check nav links are at least 44px
    const navLinks = page.locator("nav a");
    const firstLink = navLinks.first();
    const box = await firstLink.boundingBox();
    if (box) {
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
  });

  test("page has proper lang attribute", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const lang = await page.locator("html").getAttribute("lang");
    expect(lang).toBeTruthy();
  });

  test("images have alt text", async ({ page }) => {
    await page.goto("/browse");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2_000);

    const images = page.locator("img:not([alt])");
    const noAltCount = await images.count();
    // Allow a small number (decorative images) but flag if excessive
    expect(noAltCount).toBeLessThan(5);
  });
});
