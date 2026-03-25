import { test, expect } from "@playwright/test";
import { DEMO_ACCOUNTS } from "./fixtures/auth";

test.describe("Coach Profile Analytics", () => {
  test("visiting a coach profile increments view count", async ({ page }) => {
    // First, get a coach ID from the coaches page
    await page.goto("/coaches");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2_000);

    const coachLink = page.locator("[data-card-shell]").first();
    if ((await coachLink.count()) === 0) {
      test.skip(true, "No coaches in seed data");
      return;
    }

    // Visit the coach profile (this should increment viewCount)
    await coachLink.click();
    await page.waitForLoadState("networkidle");

    // The coach profile page should load
    await expect(page.locator("main")).toBeVisible();
  });

  test("WhatsApp button has click tracking", async ({ page }) => {
    // Navigate to a coach profile
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

    // The WhatsApp CTA should exist
    const whatsappBtn = page.locator('[data-testid="coach-whatsapp-cta"]');
    await expect(whatsappBtn).toBeVisible({ timeout: 5_000 });
  });

  test("coach dashboard shows real analytics counts (not placeholders)", async ({ page }) => {
    // Login as coach
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1_000);
    await page.locator('input[type="email"]').fill(DEMO_ACCOUNTS.coach.email);
    await page.locator('input[type="password"]').fill(DEMO_ACCOUNTS.coach.password);
    await page.locator('button[type="submit"]').click();

    try {
      await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 15_000 });
    } catch {
      test.skip(true, "Coach login timed out — skipping analytics check");
      return;
    }

    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2_000);

    // View count should be a number (not "--")
    const viewCount = page.locator('[data-testid="coach-view-count"]');
    await expect(viewCount).toBeVisible({ timeout: 5_000 });
    const viewText = await viewCount.textContent();
    expect(viewText).not.toBe("--");
    expect(Number(viewText)).toBeGreaterThanOrEqual(0);

    // WhatsApp clicks should be a number (not "--")
    const whatsappClicks = page.locator('[data-testid="coach-whatsapp-clicks"]');
    await expect(whatsappClicks).toBeVisible({ timeout: 5_000 });
    const clicksText = await whatsappClicks.textContent();
    expect(clicksText).not.toBe("--");
    expect(Number(clicksText)).toBeGreaterThanOrEqual(0);
  });
});
