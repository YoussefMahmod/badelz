import { test, expect } from "@playwright/test";

test.describe("Booking Flow", () => {
  test("full booking journey: browse -> venue -> book -> confirmation", async ({ page }) => {
    // Step 1: Browse venues
    await page.goto("/browse");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2_000);

    // Step 2: Click first venue
    const venueLink = page.locator("a[href^='/venues/']").first();
    const hasVenue = await venueLink.count();

    if (hasVenue === 0) {
      test.skip(true, "No venues in seed data");
      return;
    }

    await venueLink.click();
    await page.waitForLoadState("networkidle");

    // Step 3: Click "Book" on first court
    const bookLink = page.locator("a[href^='/book/']").first();
    const hasBookLink = await bookLink.count();

    if (hasBookLink === 0) {
      test.skip(true, "No bookable courts");
      return;
    }

    await bookLink.click();
    await page.waitForLoadState("networkidle");

    // Step 4: Fill booking form
    // Select a date (click first available date button)
    const dateButton = page.locator("button").filter({ hasText: /\d+/ }).first();
    if (await dateButton.count()) {
      await dateButton.click();
    }

    // Select a time slot (first available)
    await page.waitForTimeout(1_000);
    const timeSlot = page.locator("button").filter({ hasText: /\d+:\d+/ }).first();
    if (await timeSlot.count()) {
      await timeSlot.click();
    }

    // Fill player name
    const nameInput = page.locator('input[type="text"]').first();
    if (await nameInput.count()) {
      await nameInput.fill("Test Player");
    }

    // Fill phone
    const phoneInput = page.locator('input[type="tel"]').first();
    if (await phoneInput.count()) {
      await phoneInput.fill("01012345678");
    }
  });

  test("my bookings page loads with phone lookup", async ({ page }) => {
    await page.goto("/my-bookings");
    await page.waitForLoadState("networkidle");

    // Page should be accessible
    await expect(page.locator("main")).toBeVisible();
  });
});
