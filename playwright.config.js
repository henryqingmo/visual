// @ts-check
const { defineConfig, devices } = require("@playwright/test");

const PORT = process.env.PORT || 4173;
const HOST = "127.0.0.1";

module.exports = defineConfig({
    testDir: "./e2e",
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: "list",
    use: {
        baseURL: `http://${HOST}:${PORT}`,
        trace: "on-first-retry",
    },
    projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
    webServer: {
        command: `python3 -m http.server ${PORT} -b ${HOST}`,
        url: `http://${HOST}:${PORT}/`,
        reuseExistingServer: !process.env.CI,
        timeout: 60_000,
    },
});
