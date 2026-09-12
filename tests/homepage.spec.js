const { test, expect } = require('@playwright/test');

test('grocery list page loads with the right heading', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toHaveText('Grocery List');
});