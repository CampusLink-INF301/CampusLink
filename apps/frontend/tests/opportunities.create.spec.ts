import { test, expect, request } from '@playwright/test';

test.describe('Crear nueva oportunidad', () => {
  let createdId: string;

  test.afterEach(async () => {
    if (createdId) {
      const ctx = await request.newContext();
      await ctx.delete(`http://localhost:3000/api/opportunities/${createdId}`);
      await ctx.dispose();
    }
  });

  test('navega al formulario de creación al hacer clic en Nueva oportunidad', async ({ page }) => {
    await page.goto('/opportunities');
    await page.getByTestId('btn-new-opportunity').click();
    await expect(page).toHaveURL('/opportunities/new');
    await expect(page.getByRole('heading', { name: 'Nueva Oportunidad' })).toBeVisible();
  });

  test('crea una oportunidad completando el formulario', async ({ page }) => {
    await page.goto('/opportunities/new');

    await page.getByTestId('input-title').fill('Grupo de Estudio Python');
    await page.getByTestId('select-type').selectOption('grupo_estudio');
    await page.getByTestId('input-description').fill('Sesiones semanales para aprender Python desde cero.');

    await page.getByTestId('btn-submit').click();

    await expect(page).toHaveURL(/\/opportunities\/[a-z0-9-]+$/);
    await expect(page.getByTestId('opportunity-title')).toHaveText('Grupo de Estudio Python');

    createdId = page.url().split('/').pop()!;
  });

  test('muestra error al intentar enviar formulario vacío', async ({ page }) => {
    await page.goto('/opportunities/new');
    await page.getByTestId('btn-submit').click();
    await expect(page).toHaveURL('/opportunities/new');
  });
});
