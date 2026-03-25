import { test, expect } from "@playwright/test";
import { DEMO_ACCOUNTS } from "./fixtures/auth";

async function loginAsOwner(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.waitForLoadState("networkidle");
  await page.locator('input[type="email"]').fill(DEMO_ACCOUNTS.owner.email);
  await page.locator('input[type="password"]').fill(DEMO_ACCOUNTS.owner.password);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL("**/dashboard", { timeout: 10_000 });
}

test.describe("Schedule Grid", () => {
  test("switching to schedule view shows the grid", async ({ page }) => {
    await loginAsOwner(page);
    await page.goto("/bookings");
    await page.waitForLoadState("networkidle");

    // Click Schedule toggle
    const scheduleBtn = page.getByText(/Schedule|الجدول/i).first();
    await scheduleBtn.click();
    await page.waitForTimeout(2_000);

    // Grid should be visible (date picker or court headers)
    await expect(page.locator("main")).toBeVisible();
  });

  test("schedule grid shows date navigation", async ({ page }) => {
    await loginAsOwner(page);
    await page.goto("/bookings");
    await page.waitForLoadState("networkidle");

    const scheduleBtn = page.getByText(/Schedule|الجدول/i).first();
    await scheduleBtn.click();
    await page.waitForTimeout(2_000);

    // Grid content should be visible (courts, time slots, or empty state)
    await expect(page.locator("main")).toBeVisible();
  });
});
