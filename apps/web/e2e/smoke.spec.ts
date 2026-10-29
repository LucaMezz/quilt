// Smoke test: confirms Playwright can start the web app and load a page.
import { expect, test } from "@playwright/test";

test("home page renders", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
