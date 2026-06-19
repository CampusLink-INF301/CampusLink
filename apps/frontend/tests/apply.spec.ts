import { test, expect } from '@playwright/test';
import { createTestOpportunity, deleteOpportunity } from './helpers/api';
import { loginAs, uniqueTitle } from './helpers/auth';

test.describe('Apply to opportunity', () => {
  const title = uniqueTitle('E2E Postulación');
  let opportunityId: string;

  test.beforeAll(async () => {
    const opp = await createTestOpportunity('docente', { title });
    opportunityId = opp.id;
  });

  test.afterAll(async () => {
    await deleteOpportunity('docente', opportunityId);
  });

  test('student applies to opportunity successfully', async ({ page }) => {
    await loginAs(page, 'estudiante');
    await page.goto(`/opportunities/${opportunityId}`);
    await page.getByTestId('btn-apply').click();
    await expect(page.getByTestId('apply-success')).toBeVisible();
  });
});
