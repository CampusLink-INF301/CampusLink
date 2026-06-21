import { test, expect } from '@playwright/test';
import { createTestOpportunity, deleteOpportunity } from './helpers/api';
import { loginAs } from './helpers/auth';

test.describe('Opportunity detail', () => {
  let createdId: string;

  test.beforeAll(async () => {
    const opp = await createTestOpportunity('docente', {
      title: 'E2E Detalle Oportunidad',
      description: 'Descripción completa para E2E.',
      type: 'investigacion',
    });
    createdId = opp.id;
  });

  test.afterAll(async () => {
    await deleteOpportunity('docente', createdId);
  });

  test('shows title and description on detail page', async ({ page }) => {
    await loginAs(page, 'docente');
    await page.goto(`/opportunities/${createdId}`);
    await expect(page.getByTestId('opportunity-title')).toHaveText('E2E Detalle Oportunidad');
    await expect(page.getByTestId('opportunity-description')).toContainText('Descripción completa');
  });

  test('shows status badge', async ({ page }) => {
    await loginAs(page, 'docente');
    await page.goto(`/opportunities/${createdId}`);
    await expect(page.getByTestId('opportunity-status')).toBeVisible();
  });
});
