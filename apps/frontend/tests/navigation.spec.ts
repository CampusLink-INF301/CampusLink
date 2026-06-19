import { test, expect } from '@playwright/test';

test.describe('Navigation guards', () => {
  test('accessing /profile without login redirects to /login', async ({ page }) => {
    await page.goto('/profile');
    await expect(page).toHaveURL(/\/login/);
  });
});
