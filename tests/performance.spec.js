import { test, expect } from '@playwright/test';

// The watercolors are built on SVG turbulence filters, which take a phone seconds to draw. Live in
// the page they made the site slow to load on iPhones and made zone taps lag (every repaint above a
// painting re-ran them). They're pre-rendered to images by `npm run art`; keep it that way.
for (const path of ['/', '/reminders', '/guidelines', '/find-zone']) {
    test(`paintings are pre-rendered images on ${path}`, async ({ page }) => {
        await page.goto(path);
        await expect(page.locator('.hero-sky img')).toBeVisible();
        expect(await page.locator('svg filter, svg [filter]').count()).toBe(0);
        const paintings = await page.locator('.painting img, .wordmark img').evaluateAll(imgs =>
            imgs.map(i => ({ where: i.parentElement.className, src: i.src.slice(0, 40), loaded: i.complete && i.naturalWidth > 0 })));
        for (const p of paintings) {
            expect(p.loaded, `${p.where} loaded`).toBe(true);
            expect(p.src, `${p.where} is a rendered image`).not.toContain('image/svg');
        }
    });
}

// Leaflet is only for the map pages, so the schedule doesn't pay to download it.
test('the schedule page does not load the map code', async ({ page }) => {
    const scripts = [];
    page.on('request', r => r.resourceType() === 'script' && scripts.push(r.url()));
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const ours = scripts.filter(u => u.includes('/assets/'));
    expect(ours).toHaveLength(1);
    const bundle = await (await page.request.get(ours[0])).text();
    expect(bundle).not.toContain('leaflet');
    expect(bundle).not.toContain('feTurbulence');
});
