import { type Page, expect } from '@playwright/test';
import { TEST_USERS, type TestRole } from './api';

export async function loginAs(page: Page, role: TestRole) {
  const user = TEST_USERS[role];
  await page.goto('/login');
  await page.getByTestId('login-email').fill(user.email);
  await page.getByTestId('login-password').fill(user.password);
  await page.getByTestId('btn-login').click();
  await expect(page).toHaveURL(/\/opportunities/);
}

export function uniqueTitle(prefix: string) {
  return `${prefix} ${Date.now()}`;
}
