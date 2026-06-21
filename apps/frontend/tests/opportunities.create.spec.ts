import { test, expect } from '@playwright/test';
import { loginAs, uniqueTitle } from './helpers/auth';

test.describe('Create opportunity', () => {
  test('creates an opportunity and redirects to detail', async ({ page }) => {
    const title = uniqueTitle('E2E Crear');
    await loginAs(page, 'docente');
    await page.goto('/opportunities/new');
    await page.getByTestId('input-title').fill(title);
    await page.getByTestId('select-type').selectOption('tutoria');
    await page.getByTestId('input-description').fill('Descripción de prueba E2E.');
    await page.getByTestId('btn-submit').click();
    await expect(page).toHaveURL(/\/opportunities\/[a-f0-9-]+$/);
    await expect(page.getByTestId('opportunity-title')).toHaveText(title);
  });

  test('stays on form when submitting with empty required fields', async ({ page }) => {
    await loginAs(page, 'docente');
    await page.goto('/opportunities/new');
    await page.getByTestId('btn-submit').click();
    await expect(page).toHaveURL(/\/opportunities\/new/);
  });
});
