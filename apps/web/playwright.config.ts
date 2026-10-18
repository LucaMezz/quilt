import { defineConfig, devices } from "@playwright/test";

const PORT = 3001;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
    testDir: "./e2e",
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    failOnFlakyTests: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    reporter: process.env.CI ? "github" : "list",
    use: {
        baseURL: BASE_URL,
        trace: "on-first-retry",
    },
    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] },
        },
    ],
    // Starts the web dev server, or reuses one already running locally.
    webServer: {
        command: "npm run dev",
        url: BASE_URL,
        reuseExistingServer: !process.env.CI,
    },
});
