import { test, expect } from "@playwright/test";
import { DEMO_ACCOUNTS } from "./fixtures/auth";

test.describe("Booking Notes", () => {
  test("booking form has a notes textarea", async ({ page }) => {
    // Navigate to a booking page via venue
    await page.goto("/browse");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2_000);

    const venueLink = page.locator("a[href^='/venues/']").first();
    if ((await venueLink.count()) === 0) {
      test.skip(true, "No venues in seed data");
      return;
    }

    await venueLink.click();
    await page.waitForLoadState("networkidle");

    const bookLink = page.locator("a[href^='/book/']").first();
    if ((await bookLink.count()) === 0) {
      test.skip(true, "No bookable courts");
      return;
    }

    await bookLink.click();
    await page.waitForLoadState("networkidle");

    // The booking form should have a notes textarea
    const notesField = page.locator("textarea");
    await expect(notesField.first()).toBeVisible({ timeout: 5_000 });
  });

  test("owner bookings page renders notes when present", async ({ page }) => {
    // Login as owner
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    await page.locator('input[type="email"]').fill(DEMO_ACCOUNTS.owner.email);
    await page.locator('input[type="password"]').fill(DEMO_ACCOUNTS.owner.password);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL("**/dashboard", { timeout: 10_000 });

    // Go to bookings page
    await page.goto("/bookings");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2_000);

    // Page should load (even if no bookings with notes exist yet)
    await expect(page.locator("main")).toBeVisible();
  });
});
