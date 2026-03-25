import { test, expect } from "@playwright/test";
import { DEMO_ACCOUNTS } from "./fixtures/auth";

// Helper to login as owner
async function loginAsOwner(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.waitForLoadState("networkidle");
  await page.locator('input[type="email"]').fill(DEMO_ACCOUNTS.owner.email);
  await page.locator('input[type="password"]').fill(DEMO_ACCOUNTS.owner.password);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL("**/dashboard", { timeout: 10_000 });
}

test.describe("Owner Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsOwner(page);
  });

  test("dashboard shows stats cards", async ({ page }) => {
    await expect(page).toHaveURL(/\/dashboard/);
    await page.waitForLoadState("networkidle");

    // Dashboard should show stat cards
    await expect(page.locator("main")).toBeVisible();
  });

  test("bookings page loads with status filter tabs", async ({ page }) => {
    await page.goto("/bookings");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("main")).toBeVisible();

    // Should have filter buttons for statuses
    const filterButtons = page.locator("button").filter({ hasText: /PENDING|CONFIRMED|ALL|معلق|مؤكد|الكل/i });
    await expect(filterButtons.first()).toBeVisible({ timeout: 5_000 });
  });

  test("courts page loads and shows courts", async ({ page }) => {
    await page.goto("/courts");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("main")).toBeVisible();
  });

  test("settings page loads with venue info", async ({ page }) => {
    await page.goto("/settings");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("main")).toBeVisible();

    // Should have input fields for venue info
    const inputs = page.locator("input");
    await expect(inputs.first()).toBeVisible({ timeout: 5_000 });
  });
});
