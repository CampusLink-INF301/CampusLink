import { test, expect } from '@playwright/test';
import { createTestOpportunity } from './helpers/api';
import { loginAs } from './helpers/auth';

test.describe('Delete opportunity', () => {
  test('deletes from my-opportunities and card disappears', async ({ page }) => {
    const opp = await createTestOpportunity('docente', { title: 'E2E Para Eliminar' });
    await loginAs(page, 'docente');
    await page.goto('/my-opportunities');
    await expect(page.getByText('E2E Para Eliminar')).toBeVisible();

    page.on('dialog', (dialog) => dialog.accept());
    await page.getByText('E2E Para Eliminar')
      .locator('xpath=ancestor::article')
      .getByRole('button', { name: 'Eliminar oportunidad' })
      .click();

    await expect(page.getByText('E2E Para Eliminar')).not.toBeVisible();
  });
});
