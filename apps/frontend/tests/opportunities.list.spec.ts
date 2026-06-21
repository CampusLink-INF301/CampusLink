import { test, expect } from '@playwright/test';
import { createTestOpportunity, deleteOpportunity } from './helpers/api';
import { loginAs, uniqueTitle } from './helpers/auth';

test.describe('List opportunities', () => {
  const title = uniqueTitle('E2E Lista');
  let createdId: string;

  test.beforeAll(async () => {
    const opp = await createTestOpportunity('docente', { title });
    createdId = opp.id;
  });

  test.afterAll(async () => {
    await deleteOpportunity('docente', createdId);
  });

  test('shows opportunities on the main list', async ({ page }) => {
    await page.goto('/opportunities');
    await expect(page.getByTestId('opportunity-card').first()).toBeVisible();
  });

  test('shows the created opportunity on the list', async ({ page }) => {
    await page.goto('/opportunities');
    await expect(page.getByText(title)).toBeVisible();
  });
});
