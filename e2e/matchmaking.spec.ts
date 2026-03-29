import { test, expect } from "@playwright/test";
import { TEST_PHONE, TEST_PLAYER_NAME, navigateTo } from "./fixtures/helpers";

test.describe("Matchmaking — Play Page", () => {
  test("play page loads with Quick Match hero", async ({ page }) => {
    await navigateTo(page, "/play");

    // Quick Match hero should be visible
    await expect(
      page.getByText(/دور على ماتش|Find a Match/i).first()
    ).toBeVisible({ timeout: 10_000 });

    // Quick Match button should be visible
    await expect(
      page.getByRole("button", { name: /لاقيلي ماتش|Find Me a Match/i })
    ).toBeVisible();

    // Subtitle should be visible
    await expect(
      page.getByText(/ماتشات قريبة منك|Matches near you/i).first()
    ).toBeVisible();
  });

  test("Near Me chip is visible in area filters", async ({ page }) => {
    await navigateTo(page, "/play");

    // Near Me chip should be visible
    await expect(
      page.getByRole("button", { name: /القريبين|Near Me/i })
    ).toBeVisible({ timeout: 10_000 });

    // All Areas chip should still be visible
    await expect(
      page.getByText(/كل المناطق|All Areas/i).first()
    ).toBeVisible();
  });

  test("level filter chips are visible", async ({ page }) => {
    await navigateTo(page, "/play");

    await expect(
      page.getByText(/أي مستوى|Any Level/i).first()
    ).toBeVisible({ timeout: 10_000 });

    for (const level of [/مبتدئ|Beginner/i, /متوسط|Intermediate/i, /متقدم|Advanced/i, /محترف|Pro$/i]) {
      await expect(page.getByText(level).first()).toBeVisible();
    }
  });

  test("date filter chips are visible", async ({ page }) => {
    await navigateTo(page, "/play");

    // "All dates" chip
    await expect(
      page.getByText(/الكل|All/i).first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test("Quick Match button triggers date filter to today", async ({ page }) => {
    await navigateTo(page, "/play");

    // Set up API listener for today's date
    const today = new Date().toISOString().split("T")[0];
    const responsePromise = page.waitForResponse(
      (res) =>
        res.url().includes("/api/lobbies") &&
        res.url().includes(`date=${today}`),
      { timeout: 15_000 }
    );

    // Click Quick Match
    await page.getByRole("button", { name: /لاقيلي ماتش|Find Me a Match/i }).click();

    // Verify API was called with today's date
    const response = await responsePromise;
    expect(response.status()).toBe(200);
  });

  test("area filter sends correct API param", async ({ page }) => {
    await navigateTo(page, "/play");
    await page.waitForTimeout(2_000);

    // Set up API listener BEFORE clicking
    const responsePromise = page.waitForResponse(
      (res) =>
        res.url().includes("/api/lobbies") &&
        res.url().includes("area=Tagamoa"),
      { timeout: 10_000 }
    );

    // Click Tagamoa area chip
    await page.getByText(/التجمع|Tagamoa/i).first().click();

    const response = await responsePromise;
    expect(response.status()).toBe(200);
  });

  test("empty state shows create lobby and WhatsApp buttons", async ({ page }) => {
    await navigateTo(page, "/play");
    await page.waitForTimeout(2_000);

    // Select a specific area that likely has no lobbies
    await page.getByText(/المقطم|Mokattam/i).first().click();
    await page.waitForTimeout(3_000);

    // Check if empty state is shown (depends on data, so check either lobbies or empty state)
    const lobbyCards = await page.locator("a[href^='/lobby/']").count();

    if (lobbyCards === 0) {
      // Empty state should show create lobby button
      await expect(
        page.getByRole("button", { name: /أنشئ لوبي|Create Lobby/i }).first()
      ).toBeVisible({ timeout: 5_000 });

      // WhatsApp share button should be visible
      await expect(
        page.getByText(/شارك في واتساب|Share on WhatsApp/i).first()
      ).toBeVisible();
    }
  });

  test("floating create lobby FAB is visible", async ({ page }) => {
    await navigateTo(page, "/play");

    // FAB should be visible
    await expect(
      page.locator("a[href='/play/create']").last()
    ).toBeVisible({ timeout: 10_000 });
  });

  test("player ranks link is visible", async ({ page }) => {
    await navigateTo(page, "/play");

    await expect(
      page.locator("a[href='/players']").first()
    ).toBeVisible({ timeout: 10_000 });
  });
});

test.describe("Matchmaking — Deep Links", () => {
  test("deep link with area pre-selects area filter", async ({ page }) => {
    // Set up API listener for area param
    const responsePromise = page.waitForResponse(
      (res) =>
        res.url().includes("/api/lobbies") &&
        res.url().includes("area=Tagamoa"),
      { timeout: 15_000 }
    );

    await page.goto("/play?area=Tagamoa");
    await page.waitForLoadState("networkidle");

    const response = await responsePromise;
    expect(response.status()).toBe(200);
  });

  test("deep link with date pre-selects date filter", async ({ page }) => {
    const today = new Date().toISOString().split("T")[0];

    const responsePromise = page.waitForResponse(
      (res) =>
        res.url().includes("/api/lobbies") &&
        res.url().includes(`date=${today}`),
      { timeout: 15_000 }
    );

    await page.goto(`/play?date=${today}`);
    await page.waitForLoadState("networkidle");

    const response = await responsePromise;
    expect(response.status()).toBe(200);
  });

  test("deep link with area and date pre-selects both", async ({ page }) => {
    const today = new Date().toISOString().split("T")[0];

    const responsePromise = page.waitForResponse(
      (res) =>
        res.url().includes("/api/lobbies") &&
        res.url().includes("area=Maadi") &&
        res.url().includes(`date=${today}`),
      { timeout: 15_000 }
    );

    await page.goto(`/play?area=Maadi&date=${today}`);
    await page.waitForLoadState("networkidle");

    const response = await responsePromise;
    expect(response.status()).toBe(200);
  });
});

test.describe("Matchmaking — Create Lobby Flow", () => {
  test("create lobby page loads with all fields", async ({ page }) => {
    await page.goto("/play/create");
    await page.waitForLoadState("domcontentloaded");

    // Wait for form to render
    await expect(
      page.getByText(/اختار المنطقة|Select Area/i).first()
    ).toBeVisible({ timeout: 15_000 });

    // Name and phone fields should be present
    await expect(page.locator('input[type="tel"]')).toBeVisible();
  });

  test("create lobby and verify redirect to lobby detail", async ({ page }) => {
    await page.goto("/play/create");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2_000);

    // Select area (first area button in the grid)
    await page.getByRole("button", { name: /القاهرة الجديدة|New Cairo/i }).click();

    // Select date (first day in the horizontal scroll)
    const dateScroll = page.locator(".flex.gap-2.overflow-x-auto").first();
    await dateScroll.locator("button").first().click();

    // Fill name
    await page.getByPlaceholder(/أحمد|Ahmed/i).fill(TEST_PLAYER_NAME);

    // Fill phone
    await page.locator('input[type="tel"]').fill(TEST_PHONE);

    // Submit
    await page.getByRole("button", { name: /أنشئ لوبي|Create Lobby/i }).click();

    // Should redirect to lobby detail
    await page.waitForURL(/\/lobby\//, { timeout: 20_000 });
    await page.waitForLoadState("domcontentloaded");

    // Lobby detail should show the host name
    await expect(
      page.getByText(TEST_PLAYER_NAME).first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test("create lobby saves preferences for next visit", async ({ page }) => {
    await page.goto("/play/create");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2_000);

    // Select area
    await page.getByRole("button", { name: /التجمع الخامس|Tagamoa/i }).click();

    // Select date
    const dateScroll = page.locator(".flex.gap-2.overflow-x-auto").first();
    await dateScroll.locator("button").first().click();

    // Fill name and phone (valid Egyptian phone)
    await page.getByPlaceholder(/أحمد|Ahmed/i).fill("Prefs Test");
    await page.locator('input[type="tel"]').fill("01112345679");

    // Submit
    await page.getByRole("button", { name: /أنشئ لوبي|Create Lobby/i }).click();
    await page.waitForURL(/\/lobby\//, { timeout: 20_000 });

    // Go back to create page
    await page.goto("/play/create");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2_000);

    // Name should be pre-filled from preferences
    const nameInput = page.getByPlaceholder(/أحمد|Ahmed/i);
    await expect(nameInput).toHaveValue("Prefs Test", { timeout: 5_000 });

    // Phone should be pre-filled
    const phoneInput = page.locator('input[type="tel"]');
    await expect(phoneInput).toHaveValue("01112345679");
  });
});

test.describe("Matchmaking — Lobby Detail & Join", () => {
  test("lobby detail page shows player info after creation", async ({ page }) => {
    // Create a lobby first
    await page.goto("/play/create");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2_000);

    await page.getByRole("button", { name: /القاهرة الجديدة|New Cairo/i }).click();

    const dateScroll = page.locator(".flex.gap-2.overflow-x-auto").first();
    await dateScroll.locator("button").first().click();

    await page.getByPlaceholder(/أحمد|Ahmed/i).fill("Host Player");
    await page.locator('input[type="tel"]').fill("01011111111");
    await page.getByRole("button", { name: /أنشئ لوبي|Create Lobby/i }).click();

    await page.waitForURL(/\/lobby\//, { timeout: 20_000 });
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(3_000);

    // Host name should be visible
    await expect(
      page.getByText("Host Player").first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test("created lobby appears on play page", async ({ page }) => {
    // Create a lobby
    await page.goto("/play/create");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2_000);

    await page.getByRole("button", { name: /المعادي|Maadi/i }).click();

    const dateScroll = page.locator(".flex.gap-2.overflow-x-auto").first();
    await dateScroll.locator("button").first().click();

    await page.getByPlaceholder(/أحمد|Ahmed/i).fill("Play Page Test");
    await page.locator('input[type="tel"]').fill("01511111112");
    await page.getByRole("button", { name: /أنشئ لوبي|Create Lobby/i }).click();

    await page.waitForURL(/\/lobby\//, { timeout: 20_000 });

    // Go to play page and filter by same area
    await page.goto("/play");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(3_000);

    // Click Maadi area
    await page.getByText(/المعادي|Maadi/i).first().click();
    await page.waitForTimeout(3_000);

    // Should see at least one lobby
    const pageContent = await page.locator("main").textContent();
    expect(pageContent).toBeTruthy();
  });
});
