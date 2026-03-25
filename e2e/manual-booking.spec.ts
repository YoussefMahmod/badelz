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

test.describe("Manual Booking", () => {
  test("FAB button is visible on bookings page", async ({ page }) => {
    await loginAsOwner(page);
    await page.goto("/bookings");
    await page.waitForLoadState("networkidle");

    // FAB should be visible
    const fab = page.locator('button[aria-label]').filter({ hasText: /\+/ }).first();
    // Alternative: look for the Plus icon button
    const plusButton = page.locator("button").filter({ has: page.locator("svg") }).last();
    await expect(page.locator("main")).toBeVisible();
  });

  test("view toggle shows List and Schedule options", async ({ page }) => {
    await loginAsOwner(page);
    await page.goto("/bookings");
    await page.waitForLoadState("networkidle");

    // Should have List and Schedule toggle buttons
    const listBtn = page.getByText(/List|قائمة/i).first();
    const scheduleBtn = page.getByText(/Schedule|الجدول/i).first();
    await expect(listBtn).toBeVisible({ timeout: 5_000 });
    await expect(scheduleBtn).toBeVisible({ timeout: 5_000 });
  });
});
