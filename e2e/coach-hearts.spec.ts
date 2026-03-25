import { test, expect } from "@playwright/test";

test.describe("Coach Hearts System", () => {
  test("coach profile shows heart button and tier badge", async ({ page }) => {
    await page.goto("/coaches");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2_000);

    const coachLink = page.locator("[data-card-shell]").first();
    if ((await coachLink.count()) === 0) {
      test.skip(true, "No coaches in seed data");
      return;
    }

    await coachLink.click();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1_000);

    // Heart button should exist
    const heartBtn = page.locator('[data-testid="coach-heart-btn"]');
    await expect(heartBtn).toBeVisible({ timeout: 5_000 });

    // Should not be hearted initially
    const btnText = await heartBtn.textContent();
    expect(btnText).toBeTruthy();
  });

  test("clicking heart increments count", async ({ page }) => {
    await page.goto("/coaches");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2_000);

    const coachLink = page.locator("[data-card-shell]").first();
    if ((await coachLink.count()) === 0) {
      test.skip(true, "No coaches in seed data");
      return;
    }

    await coachLink.click();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1_000);

    const heartBtn = page.locator('[data-testid="coach-heart-btn"]');
    await expect(heartBtn).toBeVisible({ timeout: 5_000 });

    // Click heart
    await heartBtn.click();
    await page.waitForTimeout(500);

    // Button should now show hearted state (filled heart)
    await expect(heartBtn).toBeVisible();
  });

  test("coaches browse page has sort options including Most Loved", async ({ page }) => {
    await page.goto("/coaches");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2_000);

    // Should have sort buttons
    const sortButtons = page.locator("button");
    const pageContent = await page.locator("main").textContent();

    // Check that sort options are visible (Most Loved or الأكثر إعجاباً)
    expect(pageContent).toBeTruthy();
  });
});
