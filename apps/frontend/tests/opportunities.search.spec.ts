import { test, expect } from '@playwright/test';
import { createTestOpportunity, deleteOpportunity } from './helpers/api';
import { uniqueTitle, loginAs } from './helpers/auth';

test.describe('Search and filter opportunities', () => {
  const searchTitle = uniqueTitle('E2E Buscar Investigación');
  let id1: string;
  let id2: string;

  test.beforeAll(async () => {
    const o1 = await createTestOpportunity('docente', {
      title: searchTitle,
      type: 'investigacion',
    });
    const o2 = await createTestOpportunity('docente', {
      title: uniqueTitle('E2E Tutoria Extra'),
      type: 'tutoria',
    });
    id1 = o1.id;
    id2 = o2.id;
  });

  test.afterAll(async () => {
    await deleteOpportunity('docente', id1);
    await deleteOpportunity('docente', id2);
  });

  test('search by text finds matching opportunity', async ({ page }) => {
    await loginAs(page, 'estudiante');
    await page.goto('/opportunities');
    await page.getByTestId('search-input').fill('E2E Buscar Investigación');
    await page.getByTestId('btn-search').click();
    await expect(page.getByText(searchTitle)).toBeVisible();
  });

  test('filter by type shows matching opportunities', async ({ page }) => {
    await loginAs(page, 'estudiante');
    await page.goto('/opportunities');
    await page.getByTestId('filter-type').selectOption('investigacion');
    await page.getByTestId('btn-search').click();
    await expect(page.getByTestId('opportunity-card').first()).toBeVisible();
  });

  test('clear button resets filters', async ({ page }) => {
    await loginAs(page, 'estudiante');
    await page.goto('/opportunities');
    await page.getByTestId('search-input').fill('xyznoexiste999');
    await page.getByTestId('btn-search').click();
    await page.getByTestId('btn-clear').click();
    await expect(page.getByTestId('opportunity-card').first()).toBeVisible();
  });
});
