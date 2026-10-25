import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

async function scrollThroughSections(page: Page) {
    const sections = page.locator("main section");
    const count = await sections.count();

    for (let index = 0; index < count; index++) {
        const section = sections.nth(index);
        await section.scrollIntoViewIfNeeded();
        await expect
            .poll(() =>
                section.evaluate(
                    (element) =>
                        [
                            element,
                            ...element.querySelectorAll<HTMLElement>("*"),
                        ].filter(
                            (node) =>
                                getComputedStyle(node).opacity === "0" ||
                                (node.style.opacity !== "" &&
                                    node.style.opacity !== "1"),
                        ).length,
                ),
            )
            .toBe(0);
    }
}

test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("sign in call to action opens the login page", async ({ page }) => {
    await page
        .getByRole("main")
        .getByRole("link", { name: /sign in/i })
        .first()
        .click();

    await expect(page).toHaveURL(/\/login$/);
});

test("every in-page link points to a section on the page", async ({ page }) => {
    const missing = await page.evaluate(() =>
        [...document.querySelectorAll<HTMLAnchorElement>("a[href*='#']")]
            .map((anchor) => new URL(anchor.href))
            .filter(
                (url) =>
                    url.origin === location.origin &&
                    url.pathname === location.pathname &&
                    url.hash,
            )
            .map((url) => decodeURIComponent(url.hash.slice(1)))
            .filter((id) => !document.getElementById(id)),
    );

    expect(missing).toEqual([]);
});

test("every section is visible once scrolled into view", async ({ page }) => {
    await scrollThroughSections(page);
});

test("has no detectable accessibility violations", async ({ page }) => {
    await scrollThroughSections(page);

    const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

    expect(results.violations).toEqual([]);
});
