import { test, expect } from '@playwright/test';
import { createTestOpportunity, deleteOpportunity } from './helpers/api';

test.describe('Buscar y filtrar oportunidades', () => {
  let id1: string;
  let id2: string;

  test.beforeAll(async () => {
    const o1 = await createTestOpportunity({ title: 'Ayudantía Física', type: 'ayudantia' });
    const o2 = await createTestOpportunity({ title: 'Voluntariado Ambiental', type: 'voluntariado' });
    id1 = o1.id;
    id2 = o2.id;
  });

  test.afterAll(async () => {
    await deleteOpportunity(id1);
    await deleteOpportunity(id2);
  });

  test('filtra por texto en el buscador', async ({ page }) => {
    await page.goto('/opportunities');
    await page.getByTestId('search-input').fill('Ayudantía');
    await page.getByTestId('btn-search').click();
    const cards = page.getByTestId('opportunity-card');
    await expect(cards.first()).toBeVisible();
    await expect(page.getByText('Ayudantía Física')).toBeVisible();
  });

  test('filtra por tipo de oportunidad', async ({ page }) => {
    await page.goto('/opportunities');
    await page.getByTestId('filter-type').selectOption('voluntariado');
    await page.getByTestId('btn-search').click();
    await expect(page.getByText('Voluntariado Ambiental')).toBeVisible();
  });

  test('el botón limpiar resetea los filtros', async ({ page }) => {
    await page.goto('/opportunities');
    await page.getByTestId('search-input').fill('algo que no existe xyz');
    await page.getByTestId('btn-search').click();
    await page.getByTestId('btn-clear').click();
    await expect(page.getByTestId('opportunity-card').first()).toBeVisible();
  });
});
