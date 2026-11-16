import { test, expect } from '@playwright/test';

const ZONES = [
    { day: 'Tuesday', short: 'Tue', nightBefore: 'Monday Night' },
    { day: 'Wednesday', short: 'Wed', nightBefore: 'Tuesday Night' },
    { day: 'Monday', short: 'Mon', nightBefore: 'Sunday Night' },
];

// A fixed day early in the year, so there is always a full schedule ahead.
test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-03-04T10:00:00'));
});

// Taps on touch devices, clicks elsewhere.
async function choose(page, day) {
    const input = page.locator(`.zone-picker input[value="${day}"]`);
    const card = input.locator('xpath=..');
    if (test.info().project.use.hasTouch) await card.tap();
    else await card.click();
    return input;
}

test.describe('schedule page', () => {
    test('choosing a zone switches the schedule to that weekday', async ({ page }) => {
        await page.goto('/');
        for (const { day, short } of ZONES) {
            const input = await choose(page, day);
            await expect(input).toBeChecked();
            await expect(page.locator('.next-date')).toContainText(day);
            // Holidays can push a pickup a day later, so most (not all) dates fall on the zone's weekday.
            const dates = await page.locator('.weeks .week-date').allTextContents();
            expect(dates.filter(d => d.startsWith(short)).length).toBeGreaterThanOrEqual(dates.length - 1);
        }
    });

    test('the chosen zone is remembered on reload and on other pages', async ({ page }) => {
        await page.goto('/');
        await choose(page, 'Wednesday');
        await page.reload();
        await expect(page.locator('.zone-picker input[value="Wednesday"]')).toBeChecked();
        await page.getByRole('link', { name: 'Reminders' }).first().click();
        await expect(page.locator('.zone-picker input[value="Wednesday"]')).toBeChecked();
    });
});

test('reminders page follows the chosen zone', async ({ page }) => {
    await page.goto('/reminders');
    for (const { day, nightBefore } of ZONES) {
        const input = await choose(page, day);
        await expect(input).toBeChecked();
        await expect(page.getByText(nightBefore)).toBeVisible();
    }
});

// The watercolors use SVG turbulence filters. Inline in the page, every repaint above them re-runs
// the filters, which made tapping a zone on a phone lag by seconds. They must stay <img>s.
for (const path of ['/', '/reminders', '/guidelines']) {
    test(`no live SVG filters on ${path}`, async ({ page }) => {
        await page.goto(path);
        await expect(page.locator('.hero-sky img')).toBeVisible();
        expect(await page.locator('svg [filter], svg filter').count()).toBe(0);
        // And every painting actually loaded.
        const broken = await page.locator('img').evaluateAll(imgs =>
            imgs.filter(i => !i.complete || i.naturalWidth === 0).map(i => i.parentElement.className));
        expect(broken).toEqual([]);
    });
}
