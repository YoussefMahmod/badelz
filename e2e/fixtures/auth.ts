import { test as base, Page } from "@playwright/test";

// Demo accounts from seed data
export const DEMO_ACCOUNTS = {
  owner: { email: "owner@badelz.app", password: "password123" },
  owner2: { email: "owner2@badelz.app", password: "password123" },
  player: { email: "player@badelz.app", password: "password123" },
  coach: { email: "coach@badelz.app", password: "password123" },
} as const;

type Role = keyof typeof DEMO_ACCOUNTS;

/**
 * Login as a specific role via the UI login form.
 */
async function loginAs(page: Page, role: Role) {
  const { email, password } = DEMO_ACCOUNTS[role];

  await page.goto("/login");
  await page.waitForLoadState("networkidle");

  // Fill credentials
  await page.getByPlaceholder(/email|البريد/i).fill(email);
  await page.getByPlaceholder(/password|كلمة/i).fill(password);

  // Submit
  await page.getByRole("button", { name: /login|دخول|تسجيل/i }).click();

  // Wait for redirect away from /login
  await page.waitForURL((url) => !url.pathname.includes("/login"), {
    timeout: 10_000,
  });
}

// Extend base test with auth fixtures
export const test = base.extend<{
  ownerPage: Page;
  playerPage: Page;
  coachPage: Page;
}>({
  ownerPage: async ({ page }, use) => {
    await loginAs(page, "owner");
    await use(page);
  },
  playerPage: async ({ page }, use) => {
    await loginAs(page, "player");
    await use(page);
  },
  coachPage: async ({ page }, use) => {
    await loginAs(page, "coach");
    await use(page);
  },
});

export { loginAs };
export { expect } from "@playwright/test";
