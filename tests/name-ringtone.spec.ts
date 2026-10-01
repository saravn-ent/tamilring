import { test, expect } from '@playwright/test';

test('verify name ringtone generation flow', async ({ page }) => {
    // 1. Visit Name Ringtone tool directly
    await page.goto('/tools/name-ringtone');

    // 2. Wait for UI to load
    await expect(page.getByRole('heading', { name: /AI Name Ringtone/i })).toBeVisible();

    // 3. Enter name
    await page.getByPlaceholder(/Enter your name/i).fill('Antigravity');
    await page.waitForTimeout(500);

    // 4. Select a message (Step 3)
    await page.getByText(/Someone is calling you|Boss! Your phone is ringing/i).first().click();

    // 5. Click Generate
    await page.getByRole('button', { name: /Generate Ringtone/i }).click();

    // 6. Wait for Generation (Check for player)
    await expect(page.getByText(/Antigravity's Ringtone/i)).toBeVisible({ timeout: 15000 });

    // 7. Check for Download buttons
    await expect(page.getByRole('button', { name: /Android \(MP3\)/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /iPhone \(M4R\)/i })).toBeVisible();

    console.log('Name Ringtone test passed!');
});
