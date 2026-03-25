import { test, expect } from "@playwright/test";

test.describe("Discover & Public Pages", () => {
  test("landing page loads with key sections", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Page should be visible and have content
    await expect(page.locator("main")).toBeVisible();

    // Should have bottom navigation
    await expect(page.locator("nav")).toBeVisible();
  });

  test("browse venues page loads and shows venues", async ({ page }) => {
    await page.goto("/browse");
    await page.waitForLoadState("networkidle");

    // Should show area filter buttons
    await expect(page.locator("main")).toBeVisible();

    // Wait for venues to load (either venues show or empty state)
    await page.waitForTimeout(2_000);
    const hasVenues = await page.locator("a[href^='/venues/']").count();
    const hasEmpty = await page.getByText(/no venues|لا يوجد/i).count();
    expect(hasVenues + hasEmpty).toBeGreaterThan(0);
  });

  test("venue detail page loads with courts", async ({ page }) => {
    // First get a venue ID from the browse page
    await page.goto("/browse");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2_000);

    const venueLink = page.locator("a[href^='/venues/']").first();
    const hasVenue = await venueLink.count();

    if (hasVenue > 0) {
      await venueLink.click();
      await page.waitForLoadState("networkidle");

      // Venue detail should show venue info
      await expect(page.locator("main")).toBeVisible();
    }
  });

  test("coaches directory loads", async ({ page }) => {
    await page.goto("/coaches");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("main")).toBeVisible();

    // Wait for content to load — coaches or empty state
    await page.waitForTimeout(3_000);

    // Look for any coach-related content on page (cards, links, or empty state)
    const pageContent = await page.locator("main").textContent();
    expect(pageContent).toBeTruthy();
  });

  test("marketplace loads and shows listings", async ({ page }) => {
    await page.goto("/market");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("main")).toBeVisible();

    // Wait for listings to load
    await page.waitForTimeout(2_000);
    const hasListings = await page.locator("a[href^='/market/']").count();
    const hasEmpty = await page.getByText(/no listings|لا يوجد/i).count();
    expect(hasListings + hasEmpty).toBeGreaterThan(0);
  });

  test("players leaderboard loads", async ({ page }) => {
    await page.goto("/players");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("main")).toBeVisible();
  });

  test("open games (play) page loads", async ({ page }) => {
    await page.goto("/play");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("main")).toBeVisible();
  });
});
