import { test, expect } from "@playwright/test";

test.describe("SEO & Social Sharing", () => {
  test("homepage has OG meta tags", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute("content");
    expect(ogTitle).toBeTruthy();

    const ogDescription = await page.locator('meta[property="og:description"]').getAttribute("content");
    expect(ogDescription).toBeTruthy();

    const ogImage = await page.locator('meta[property="og:image"]').getAttribute("content");
    expect(ogImage).toContain("/api/og");
  });

  test("OG image meta tag is set in HTML", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const ogImage = await page.locator('meta[property="og:image"]').getAttribute("content");
    expect(ogImage).toContain("/api/og");
  });

  test("sitemap.xml returns valid XML", async ({ request }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain("<?xml");
    expect(body).toContain("<urlset");
    expect(body).toContain("<url>");
  });

  test("robots.txt exists and allows crawling", async ({ request }) => {
    const res = await request.get("/robots.txt");
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain("User-Agent");
    expect(body).toContain("Allow: /");
    expect(body).toContain("sitemap");
  });
});
