// @ts-check
const { test, expect } = require("@playwright/test");

test.describe("Site index", () => {
    test("lists mutual exclusion entry", async ({ page }) => {
        await page.goto("/", { waitUntil: "domcontentloaded" });

        await expect(
            page.getByRole("link", { name: /mutual exclusion/i })
        ).toBeVisible({ timeout: 15_000 });
        await expect(page.getByRole("link", { name: /mutual exclusion/i })).toHaveAttribute(
            "href",
            /mutual-exclusion/
        );
    });
});
