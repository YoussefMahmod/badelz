import { test, expect } from "@playwright/test";
import { TEST_PHONE } from "./fixtures/helpers";

test.describe("Lobby Level Feature", () => {
  test("create lobby form shows level selector chips", async ({ page }) => {
    await page.goto("/play/create");
    await page.waitForLoadState("networkidle");

    // Level label should be visible
    await expect(
      page.getByText(/المستوى|Level/i).first()
    ).toBeVisible({ timeout: 10_000 });

    // "Any Level" chip should be visible
    await expect(
      page.getByRole("button", { name: /أي مستوى|Any Level/i })
    ).toBeVisible();

    // All 4 level chips should be present
    for (const level of [
      /مبتدئ|Beginner/i,
      /متوسط|Intermediate/i,
      /متقدم|Advanced/i,
      /محترف|Pro$/i,
    ]) {
      await expect(page.getByRole("button", { name: level })).toBeVisible();
    }
  });

  test("level chips toggle correctly", async ({ page }) => {
    await page.goto("/play/create");
    await page.waitForLoadState("networkidle");

    const anyChip = page.getByRole("button", { name: /أي مستوى|Any Level/i });
    await expect(anyChip).toBeVisible({ timeout: 10_000 });

    // "Any Level" should be active by default
    await expect(anyChip).toHaveClass(/bg-\[#c8ff00\]/);

    // Click Advanced — it should become active
    const advancedChip = page.getByRole("button", { name: /متقدم|Advanced/i });
    await advancedChip.click();
    await expect(advancedChip).toHaveClass(/bg-\[#c8ff00\]/);

    // Click "Any Level" — goes back to default
    await anyChip.click();
    await expect(anyChip).toHaveClass(/bg-\[#c8ff00\]/);
  });

  test("create lobby with level and verify on detail page", async ({ page }) => {
    await page.goto("/play/create");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1_000);

    // Select area
    const areaGrid = page.locator(".grid.grid-cols-2");
    await areaGrid.locator("button").first().click();

    // Select date
    const dateScroll = page.locator(".flex.gap-2.overflow-x-auto").first();
    await dateScroll.locator("button").first().click();

    // Select level: Advanced
    await page.getByRole("button", { name: /متقدم|Advanced/i }).click();

    // Fill name
    await page.getByPlaceholder(/أحمد|Ahmed/i).fill("Test Player");

    // Fill phone
    await page.locator('input[type="tel"]').fill(TEST_PHONE);

    // Submit
    await page.locator('button[type="submit"]').click();

    // Wait for redirect to lobby detail page
    await page.waitForURL(/\/lobby\//, { timeout: 15_000 });
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2_000);

    // Level should be displayed on the detail page
    await expect(
      page.getByText(/متقدم|Advanced/i).first()
    ).toBeVisible({ timeout: 5_000 });
  });

  test("create lobby without level succeeds", async ({ page }) => {
    await page.goto("/play/create");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1_000);

    // Select area
    const areaGrid = page.locator(".grid.grid-cols-2");
    await areaGrid.locator("button").first().click();

    // Select date
    const dateScroll = page.locator(".flex.gap-2.overflow-x-auto").first();
    await dateScroll.locator("button").first().click();

    // Do NOT select a level — leave as "Any Level"

    // Fill name
    await page.getByPlaceholder(/أحمد|Ahmed/i).fill("No Level Player");

    // Fill phone
    await page.locator('input[type="tel"]').fill("01112345679");

    // Submit
    await page.locator('button[type="submit"]').click();

    // Should redirect to lobby detail
    await page.waitForURL(/\/lobby\//, { timeout: 15_000 });
    await page.waitForLoadState("networkidle");

    // Lobby detail page should show the area name
    await expect(page.getByText(/New Cairo|القاهرة الجديدة/i).first()).toBeVisible({
      timeout: 5_000,
    });
  });

  test("browse page shows level filter chips", async ({ page }) => {
    await page.goto("/play");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(3_000);

    // Level filter chips should be visible
    await expect(
      page.getByText(/أي مستوى|Any Level/i).first()
    ).toBeVisible({ timeout: 10_000 });

    await expect(
      page.getByText(/مبتدئ|Beginner/i).first()
    ).toBeVisible();
  });

  test("level filter sends correct API param", async ({ page }) => {
    await page.goto("/play");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(3_000);

    // Set up API listener BEFORE clicking
    const responsePromise = page.waitForResponse(
      (res) =>
        res.url().includes("/api/lobbies") &&
        res.url().includes("level=ADVANCED"),
      { timeout: 10_000 }
    );

    // Find and click Advanced filter button
    await page.getByText(/متقدم|Advanced/i).first().click();

    // Verify API was called with level param
    const response = await responsePromise;
    expect(response.status()).toBe(200);
  });
});
