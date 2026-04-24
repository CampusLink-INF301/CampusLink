import { test, expect } from '@playwright/test';
import { createTestOpportunity, deleteOpportunity } from './helpers/api';

test.describe('Editar oportunidad', () => {
  let createdId: string;

  test.beforeEach(async () => {
    const opp = await createTestOpportunity({ title: 'Oportunidad Original' });
    createdId = opp.id;
  });

  test.afterEach(async () => {
    await deleteOpportunity(createdId);
  });

  test('navega al formulario de edición desde el detalle', async ({ page }) => {
    await page.goto(`/opportunities/${createdId}`);
    await page.getByTestId('btn-edit').click();
    await expect(page).toHaveURL(`/opportunities/${createdId}/edit`);
    await expect(page.getByRole('heading', { name: 'Editar Oportunidad' })).toBeVisible();
  });

  test('el formulario de edición carga los datos existentes', async ({ page }) => {
    await page.goto(`/opportunities/${createdId}/edit`);
    await expect(page.getByTestId('input-title')).toHaveValue('Oportunidad Original');
  });

  test('guarda los cambios y redirige al detalle con el nuevo título', async ({ page }) => {
    await page.goto(`/opportunities/${createdId}/edit`);
    await page.getByTestId('input-title').clear();
    await page.getByTestId('input-title').fill('Título Actualizado');
    await page.getByTestId('btn-submit').click();

    await expect(page).toHaveURL(`/opportunities/${createdId}`);
    await expect(page.getByTestId('opportunity-title')).toHaveText('Título Actualizado');
  });
});
