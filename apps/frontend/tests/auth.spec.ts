import { test, expect } from '@playwright/test';
import { TEST_USERS } from './helpers/api';
import { loginAs } from './helpers/auth';

test.describe('Authentication', () => {
  test('login with valid credentials redirects to opportunities', async ({ page }) => {
    await loginAs(page, 'estudiante');
    await expect(page.getByTestId('opportunity-card').first()).toBeVisible();
  });

  test('login with wrong password stays on login page', async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('login-email').fill(TEST_USERS.estudiante.email);
    await page.getByTestId('login-password').fill('WrongPass1!');
    await page.getByTestId('btn-login').click();
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/\/login/);
  });

  test('register a new user and redirect to opportunities', async ({ page }) => {
    const uniqueEmail = `e2e-new-${Date.now()}@test.com`;
    await page.goto('/register');
    await page.getByTestId('register-name').fill('Nuevo Usuario');
    await page.getByTestId('register-email').fill(uniqueEmail);
    await page.getByTestId('register-password').fill('Test1234!');
    await page.getByTestId('register-role').selectOption({ index: 0 });
    await page.getByTestId('btn-register').click();
    await expect(page).toHaveURL(/\/opportunities/);
  });
});
