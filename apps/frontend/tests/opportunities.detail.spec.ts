import { test, expect } from '@playwright/test';
import { createTestOpportunity, deleteOpportunity } from './helpers/api';

test.describe('Ver detalle de oportunidad', () => {
  let createdId: string;

  test.beforeAll(async () => {
    const opp = await createTestOpportunity({
      title: 'Práctica en Empresa Tech',
      description: 'Descripción completa de la práctica.',
      type: 'practica',
    });
    createdId = opp.id;
  });

  test.afterAll(async () => {
    await deleteOpportunity(createdId);
  });

  test('navega al detalle desde la lista', async ({ page }) => {
    await page.goto('/opportunities');
    await page.getByText('Práctica en Empresa Tech').click();
    await expect(page).toHaveURL(new RegExp(`/opportunities/${createdId}`));
    await expect(page.getByTestId('opportunity-detail')).toBeVisible();
  });

  test('muestra el título de la oportunidad en el detalle', async ({ page }) => {
    await page.goto(`/opportunities/${createdId}`);
    await expect(page.getByTestId('opportunity-title')).toHaveText('Práctica en Empresa Tech');
  });

  test('muestra la descripción en el detalle', async ({ page }) => {
    await page.goto(`/opportunities/${createdId}`);
    await expect(page.getByTestId('opportunity-description')).toContainText('Descripción completa');
  });

  test('muestra botones de Editar y Eliminar en el detalle', async ({ page }) => {
    await page.goto(`/opportunities/${createdId}`);
    await expect(page.getByTestId('btn-edit')).toBeVisible();
    await expect(page.getByTestId('btn-delete')).toBeVisible();
  });
});
