import { test, expect } from '@playwright/test';

test('smoke test: verify core flows', async ({ page }) => {
    console.log('Starting smoke test...');
    try {
        // 1. Visit Homepage
        await page.goto('/');
        console.log('Visited homepage');
        await expect(page).toHaveTitle(/TamilRing/);

        // 2. Click Search (Bottom Nav)
        console.log('Clicking Search...');
        await page.getByRole('link', { name: 'Search' }).click();

        // Verify
        console.log('Waiting for URL...');
        await expect(page).toHaveURL(/.*\/categories/);

        // 3. Click 'Love'
        console.log('Clicking Love category...');
        await page.getByText('Love', { exact: true }).click();

        // 4. Wait for ringtone and click
        console.log('Waiting for ringstones...');
        const ringtone = page.locator('a[href^="/ringtone/"]').first();
        await expect(ringtone).toBeVisible({ timeout: 10000 });
        console.log('Clicking ringtone...');
        await ringtone.click();

        // 5. Verify Detail
        console.log('Verifying detail page...');
        await expect(page.locator('h1')).toBeVisible();
        await expect(page.getByRole('button', { name: /download/i })).toBeVisible();
        console.log('Test passed!');
    } catch (e) {
        console.log('Test Failed!');
        console.log('Current URL:', page.url());
        console.error('Error:', e);
        await page.screenshot({ path: 'test-failure.png' });
        throw e;
    }
});
