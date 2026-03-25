import { Page, expect } from "@playwright/test";

/**
 * Wait for an API response matching the given URL pattern.
 */
export async function waitForAPI(page: Page, urlPattern: string | RegExp) {
  return page.waitForResponse(
    (res) =>
      typeof urlPattern === "string"
        ? res.url().includes(urlPattern)
        : urlPattern.test(res.url()),
    { timeout: 10_000 }
  );
}

/**
 * Assert that a success or error message appears on the page.
 */
export async function assertMessage(page: Page, text: string | RegExp) {
  await expect(page.getByText(text).first()).toBeVisible({ timeout: 5_000 });
}

/**
 * Fill an Egyptian phone number field (handles dir="ltr" inputs).
 */
export async function fillPhone(page: Page, phone: string) {
  const phoneInput = page.locator('input[type="tel"]').first();
  await phoneInput.fill(phone);
}

/**
 * Get all visible status badges on the page.
 */
export async function getStatusBadges(page: Page) {
  return page.locator("[data-status]").all();
}

/**
 * Navigate and wait for page to be fully loaded.
 */
export async function navigateTo(page: Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState("networkidle");
}

/**
 * Standard Egyptian phone for test bookings.
 */
export const TEST_PHONE = "01012345678";
export const TEST_PLAYER_NAME = "Test Player";
