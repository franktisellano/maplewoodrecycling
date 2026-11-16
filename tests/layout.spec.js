import { test, expect } from '@playwright/test';

// The sky sits behind the header and must reach the very top of the page; when it fell short,
// phones showed a band of plain paper above it (the header wraps to two lines there).
for (const path of ['/', '/guidelines', '/reminders', '/find-zone']) {
    test(`the sky reaches the top of ${path}`, async ({ page }) => {
        await page.goto(path);
        const top = await page.locator('.hero-sky').evaluate(el => el.getBoundingClientRect().top);
        expect(top).toBeLessThanOrEqual(0);
    });
}

test('a link opens the next page at the top', async ({ page }) => {
    await page.goto('/');
    const cta = page.getByRole('link', { name: 'Set up reminders' });
    await cta.scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => scrollY)).toBeGreaterThan(200);
    if (test.info().project.use.hasTouch) await cta.tap();
    else await cta.click();
    await expect(page).toHaveURL(/\/reminders$/);
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
});

test('back returns to where you were', async ({ page }) => {
    await page.goto('/');
    const cta = page.getByRole('link', { name: 'Set up reminders' });
    await cta.scrollIntoViewIfNeeded();
    const before = await page.evaluate(() => scrollY);
    await cta.click();
    await expect(page).toHaveURL(/\/reminders$/);
    await page.goBack();
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before - 50);
});
