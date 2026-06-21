import { test, expect } from '@playwright/test';
import { createTestOpportunity, deleteOpportunity } from './helpers/api';
import { loginAs, uniqueTitle } from './helpers/auth';

test.describe('Edit opportunity', () => {
  let createdId: string;

  test.beforeAll(async () => {
    const opp = await createTestOpportunity('docente', { title: 'E2E Editar Original' });
    createdId = opp.id;
  });

  test.afterAll(async () => {
    await deleteOpportunity('docente', createdId);
  });

  test('loads existing data in edit form', async ({ page }) => {
    await loginAs(page, 'docente');
    await page.goto(`/opportunities/${createdId}/edit`);
    await expect(page.getByTestId('input-title')).toHaveValue('E2E Editar Original');
  });

  test('saves changes and redirects to detail with new title', async ({ page }) => {
    const newTitle = uniqueTitle('E2E Editada');
    await loginAs(page, 'docente');
    await page.goto(`/opportunities/${createdId}/edit`);
    await page.getByTestId('input-title').fill(newTitle);
    await page.getByTestId('btn-submit').click();
    await expect(page).toHaveURL(new RegExp(`/opportunities/${createdId}$`));
    await expect(page.getByTestId('opportunity-title')).toHaveText(newTitle);
  });
});
