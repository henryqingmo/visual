// @ts-check
const { test, expect } = require("@playwright/test");

test.describe("Mutual exclusion visualization", () => {
    test("loads chart, SVG, and main heading", async ({ page }) => {
        await page.goto("/mutual-exclusion/index.html#central-overview", {
            waitUntil: "domcontentloaded",
        });

        await expect(page.locator("#chart")).toBeVisible({ timeout: 15_000 });
        await expect(page.locator("#chart svg")).toBeVisible({ timeout: 20_000 });
        await expect(
            page.getByRole("heading", { name: /central server/i })
        ).toBeVisible({ timeout: 20_000 });
    });

    test("dropdown menu contains all section links", async ({ page }) => {
        await page.goto("/mutual-exclusion/index.html", { waitUntil: "domcontentloaded" });

        const menu = page.locator("nav .dropdown-menu");
        await expect(menu.locator('a[href="#home"]')).toBeAttached({ timeout: 20_000 });
        await expect(menu.locator('a[href="#central-overview"]')).toBeAttached();
        await expect(menu.locator('a[href="#central-demo"]')).toBeAttached();
        await expect(menu.locator('a[href="#ring-overview"]')).toBeAttached();
        await expect(menu.locator('a[href="#ring-demo"]')).toBeAttached();
        await expect(menu.locator('a[href="#ra-overview"]')).toBeAttached();
        await expect(menu.locator('a[href="#ra-demo"]')).toBeAttached();
        await expect(menu.locator('a[href="#conclusion"]')).toBeAttached();
        await expect(menu.locator("a")).toHaveCount(8);
    });

    test("mobile menu opens and shows section links", async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto("/mutual-exclusion/index.html", { waitUntil: "domcontentloaded" });

        await page.waitForSelector('nav .dropdown-menu a[href="#home"]', {
            state: "attached",
            timeout: 20_000,
        });
        await page.locator("nav .navbar-toggle").click();

        const menu = page.locator("nav .dropdown-menu");
        await expect(menu.locator('a[href="#ring-demo"]')).toBeVisible();
    });

    test("hash navigation switches frame content", async ({ page }) => {
        await page.goto("/mutual-exclusion/index.html#ring-overview", {
            waitUntil: "domcontentloaded",
        });

        await expect(page.getByRole("heading", { name: /token ring/i })).toBeVisible({
            timeout: 20_000,
        });
        await expect(page.locator("#chart svg g.node")).toHaveCount(3, { timeout: 15_000 });
    });

    test("Continue control appears and advances narration", async ({ page }) => {
        await page.goto("/mutual-exclusion/index.html#central-overview", {
            waitUntil: "domcontentloaded",
        });

        const resume = page.locator("button.btn.resume");
        await expect(resume).toBeVisible({ timeout: 20_000 });

        await resume.click();
        await expect(page.getByText(/enter\(\)/i)).toBeVisible({ timeout: 15_000 });
    });

    test("central demo shows four nodes (leader + three processes)", async ({ page }) => {
        await page.goto("/mutual-exclusion/index.html#central-demo", {
            waitUntil: "domcontentloaded",
        });

        await expect(page.locator("#chart svg g.node")).toHaveCount(4, { timeout: 20_000 });
        await expect(page.getByRole("heading", { name: /walkthrough/i })).toBeVisible({
            timeout: 20_000,
        });
    });

    test("Ricart–Agrawala overview loads three peers", async ({ page }) => {
        await page.goto("/mutual-exclusion/index.html#ra-overview", {
            waitUntil: "domcontentloaded",
        });

        await expect(page.getByRole("heading", { name: /ricart/i })).toBeVisible({
            timeout: 20_000,
        });
        await expect(page.locator("#chart svg g.node")).toHaveCount(3, { timeout: 15_000 });
    });
});
