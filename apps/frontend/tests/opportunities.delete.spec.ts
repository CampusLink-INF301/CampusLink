import { test, expect } from '@playwright/test';
import { createTestOpportunity } from './helpers/api';

test.describe('Eliminar oportunidad', () => {
  test('elimina desde la lista y la card desaparece', async ({ page }) => {
    const opp = await createTestOpportunity({ title: 'Para Eliminar Desde Lista' });

    await page.goto('/opportunities');
    await expect(page.getByText('Para Eliminar Desde Lista')).toBeVisible();

    page.on('dialog', (dialog) => dialog.accept());
    await page.getByText('Para Eliminar Desde Lista')
      .locator('../..')
      .getByRole('button', { name: 'Eliminar oportunidad' })
      .click();

    await expect(page.getByText('Para Eliminar Desde Lista')).not.toBeVisible();
  });

  test('elimina desde el detalle y redirige a la lista', async ({ page }) => {
    const opp = await createTestOpportunity({ title: 'Para Eliminar Desde Detalle' });

    await page.goto(`/opportunities/${opp.id}`);
    page.on('dialog', (dialog) => dialog.accept());
    await page.getByTestId('btn-delete').click();

    await expect(page).toHaveURL('/opportunities');
    await expect(page.getByText('Para Eliminar Desde Detalle')).not.toBeVisible();
  });
});
