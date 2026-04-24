import { test, expect } from '@playwright/test';
import { createTestOpportunity, deleteOpportunity } from './helpers/api';

test.describe('Listar oportunidades', () => {
  let createdId: string;

  test.beforeAll(async () => {
    const opp = await createTestOpportunity({ title: 'Tutoría Test Lista' });
    createdId = opp.id;
  });

  test.afterAll(async () => {
    await deleteOpportunity(createdId);
  });

  test('muestra la página de lista al navegar a /opportunities', async ({ page }) => {
    await page.goto('/opportunities');
    await expect(page).toHaveTitle(/CampusLink|Vite/i);
    await expect(page.getByRole('heading', { name: 'Oportunidades' })).toBeVisible();
  });

  test('muestra al menos una oportunidad en la lista', async ({ page }) => {
    await page.goto('/opportunities');
    const cards = page.getByTestId('opportunity-card');
    await expect(cards.first()).toBeVisible();
  });

  test('cada card muestra título y tipo', async ({ page }) => {
    await page.goto('/opportunities');
    const firstCard = page.getByTestId('opportunity-card').first();
    await expect(firstCard.getByRole('link')).toBeVisible();
  });

  test('muestra botón para crear nueva oportunidad', async ({ page }) => {
    await page.goto('/opportunities');
    await expect(page.getByTestId('btn-new-opportunity')).toBeVisible();
  });
});
