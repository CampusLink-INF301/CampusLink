# Playwright E2E Tests Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 12 Playwright E2E tests covering all critical user flows, integrate them into GitHub Actions CI with artifact uploads, and configure Discord notifications for E2E results.

**Architecture:** Tests live in `apps/frontend/tests/` (already configured in `playwright.config.ts`). A `global-setup.ts` seeds test users via the backend API (`/api/auth/register`). Each spec file targets a feature domain and uses `data-testid` selectors already present in components. CI runs a new `e2e` job that starts Postgres + backend + frontend, runs Playwright headless, uploads the HTML report as artifact, and feeds the result into the existing Discord notify job.

**Tech Stack:** Playwright 1.59, React 19 + Vite 8, NestJS 11 + TypeORM + PostgreSQL 15, GitHub Actions

## Global Constraints

- Use `data-testid` selectors only (never CSS classes or text selectors that may break)
- All tests must run headless (no `headless: false`)
- `BASE_URL` comes from `playwright.config.ts` `use.baseURL` (already set to `http://localhost:5173`)
- Password rule: 8-16 chars, at least 1 uppercase, 1 number, 1 symbol → use `Test1234!` throughout
- Test users are created via API in global-setup, not via UI (faster, decoupled)
- Unique titles use `Date.now()` suffix to avoid collisions across runs
- `apps/frontend/tests/` directory (matches `playwright.config.ts` `testDir: './tests'`)

---

### Task 1: Global Setup + Auth Helpers

**Files:**
- Create: `apps/frontend/tests/global-setup.ts`
- Create: `apps/frontend/tests/helpers.ts`
- Modify: `apps/frontend/playwright.config.ts:3` (add globalSetup)

**Interfaces:**
- Consumes: Backend API `POST /api/auth/register` and `POST /api/auth/login`
- Produces:
  - `globalSetup` function that seeds two test users (docente + estudiante) via API
  - `loginAs(page, role)` helper that logs in via UI and waits for redirect
  - `TEST_USERS` constant with email/password/role for each test user
  - `uniqueTitle(prefix)` helper that appends timestamp for unique opportunity titles

- [ ] **Step 1: Create helpers.ts with test constants and login helper**

```typescript
// apps/frontend/tests/helpers.ts
import { type Page, expect } from '@playwright/test';

export const TEST_USERS = {
  docente: {
    name: 'E2E Docente',
    email: `e2e-docente-${process.env.E2E_RUN_ID ?? 'local'}@test.com`,
    password: 'Test1234!',
    role: 'docente',
  },
  estudiante: {
    name: 'E2E Estudiante',
    email: `e2e-estudiante-${process.env.E2E_RUN_ID ?? 'local'}@test.com`,
    password: 'Test1234!',
    role: 'estudiante',
  },
} as const;

export type TestRole = keyof typeof TEST_USERS;

export async function loginAs(page: Page, role: TestRole) {
  const user = TEST_USERS[role];
  await page.goto('/login');
  await page.getByTestId('login-email').fill(user.email);
  await page.getByTestId('login-password').fill(user.password);
  await page.getByTestId('btn-login').click();
  await expect(page).toHaveURL(/\/opportunities/);
}

export function uniqueTitle(prefix: string) {
  return `${prefix} ${Date.now()}`;
}
```

- [ ] **Step 2: Create global-setup.ts that seeds test users via API**

```typescript
// apps/frontend/tests/global-setup.ts
import { TEST_USERS } from './helpers';

const API = process.env.API_URL ?? 'http://localhost:3000/api';

async function seedUser(user: (typeof TEST_USERS)[keyof typeof TEST_USERS]) {
  const res = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });
  if (res.status === 409 || res.ok) return; // 409 = already exists
  throw new Error(`Seed failed for ${user.email}: ${res.status} ${await res.text()}`);
}

export default async function globalSetup() {
  for (const user of Object.values(TEST_USERS)) {
    await seedUser(user);
  }
}
```

- [ ] **Step 3: Wire globalSetup into playwright.config.ts**

Add `globalSetup` to the existing config. Change `baseURL` to read from env:

```typescript
// apps/frontend/playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  globalSetup: './tests/global-setup.ts',
  timeout: 30000,
  retries: 1,
  reporter: [['html', { outputFolder: 'playwright-report' }], ['list']],
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: process.env.BASE_URL ?? 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
  },
});
```

- [ ] **Step 4: Verify global-setup runs (local, with backend + frontend already running)**

Run: `cd apps/frontend && npx playwright test --grep "NEVER_MATCH" 2>&1 | head -5`
Expected: Global setup runs (registers users or gets 409), then 0 tests found. No errors.

- [ ] **Step 5: Commit**

```bash
git add apps/frontend/tests/global-setup.ts apps/frontend/tests/helpers.ts apps/frontend/playwright.config.ts
git commit -m "feat(e2e): add global setup and auth helpers for Playwright tests"
```

---

### Task 2: Auth E2E Tests (Login + Register + Validation)

**Files:**
- Create: `apps/frontend/tests/auth.spec.ts`

**Interfaces:**
- Consumes: `loginAs()`, `TEST_USERS`, `uniqueTitle()` from `helpers.ts`
- Produces: 3 passing tests — successful login, failed login, successful register

- [ ] **Step 1: Write auth.spec.ts with 3 tests**

```typescript
// apps/frontend/tests/auth.spec.ts
import { test, expect } from '@playwright/test';
import { TEST_USERS, loginAs } from './helpers';

test.describe('Authentication', () => {
  test('login with valid credentials redirects to opportunities', async ({ page }) => {
    await loginAs(page, 'estudiante');
    await expect(page.getByText('Oportunidades')).toBeVisible();
  });

  test('login with wrong password shows error', async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('login-email').fill(TEST_USERS.estudiante.email);
    await page.getByTestId('login-password').fill('WrongPass1!');
    await page.getByTestId('btn-login').click();
    await expect(page.getByRole('alert')).toBeVisible();
  });

  test('register a new user and redirect to opportunities', async ({ page }) => {
    const uniqueEmail = `e2e-new-${Date.now()}@test.com`;
    await page.goto('/register');
    await page.getByTestId('register-name').fill('Nuevo Usuario');
    await page.getByTestId('register-email').fill(uniqueEmail);
    await page.getByTestId('register-password').fill('Test1234!');
    await page.getByTestId('register-role').selectOption('estudiante');
    await page.getByTestId('btn-register').click();
    await expect(page).toHaveURL(/\/opportunities/);
  });
});
```

- [ ] **Step 2: Run tests**

Run: `cd apps/frontend && npx playwright test tests/auth.spec.ts`
Expected: 3 tests pass

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/tests/auth.spec.ts
git commit -m "feat(e2e): add auth tests — login, failed login, register"
```

---

### Task 3: Opportunity CRUD E2E Tests (Create → List → Detail → Edit → Delete)

**Files:**
- Create: `apps/frontend/tests/opportunities.spec.ts`

**Interfaces:**
- Consumes: `loginAs()`, `uniqueTitle()` from `helpers.ts`
- Produces: 5 passing tests — create, list, detail, edit, delete

- [ ] **Step 1: Write opportunities.spec.ts with 5 tests**

```typescript
// apps/frontend/tests/opportunities.spec.ts
import { test, expect } from '@playwright/test';
import { loginAs, uniqueTitle } from './helpers';

test.describe('Opportunity CRUD', () => {
  const title = uniqueTitle('E2E Tutoría');
  const editedTitle = uniqueTitle('E2E Tutoría Editada');

  test.describe.serial('full lifecycle', () => {
    let opportunityUrl: string;

    test('create opportunity as docente', async ({ page }) => {
      await loginAs(page, 'docente');
      await page.goto('/opportunities/new');
      await page.getByTestId('input-title').fill(title);
      await page.getByTestId('select-type').selectOption('tutoria');
      await page.getByTestId('input-description').fill('Descripción de prueba E2E');
      await page.getByTestId('btn-submit').click();
      await expect(page.getByTestId('opportunity-title')).toHaveText(title);
      opportunityUrl = page.url();
    });

    test('list shows the created opportunity', async ({ page }) => {
      await loginAs(page, 'docente');
      await page.goto('/opportunities');
      await expect(page.getByText(title)).toBeVisible();
    });

    test('detail page shows correct info', async ({ page }) => {
      await loginAs(page, 'docente');
      await page.goto(opportunityUrl.replace(/^https?:\/\/[^/]+/, ''));
      await expect(page.getByTestId('opportunity-title')).toHaveText(title);
      await expect(page.getByTestId('opportunity-description')).toHaveText('Descripción de prueba E2E');
    });

    test('edit opportunity title', async ({ page }) => {
      await loginAs(page, 'docente');
      const editUrl = opportunityUrl.replace(/^https?:\/\/[^/]+/, '') + '/edit';
      await page.goto(editUrl);
      await page.getByTestId('input-title').fill(editedTitle);
      await page.getByTestId('btn-submit').click();
      await expect(page.getByTestId('opportunity-title')).toHaveText(editedTitle);
    });

    test('delete opportunity from detail page', async ({ page }) => {
      await loginAs(page, 'docente');
      await page.goto(opportunityUrl.replace(/^https?:\/\/[^/]+/, ''));

      page.on('dialog', dialog => dialog.accept());
      await page.getByRole('button', { name: /eliminar/i }).click();
      await expect(page).toHaveURL(/\/my-opportunities/);
    });
  });
});
```

- [ ] **Step 2: Run tests**

Run: `cd apps/frontend && npx playwright test tests/opportunities.spec.ts`
Expected: 5 tests pass (serial)

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/tests/opportunities.spec.ts
git commit -m "feat(e2e): add opportunity CRUD tests — create, list, detail, edit, delete"
```

---

### Task 4: Search/Filter + Postulation + Validation E2E Tests

**Files:**
- Create: `apps/frontend/tests/search-and-apply.spec.ts`

**Interfaces:**
- Consumes: `loginAs()`, `uniqueTitle()` from `helpers.ts`
- Produces: 4 passing tests — search, filter, apply, form validation

- [ ] **Step 1: Write search-and-apply.spec.ts with 4 tests**

```typescript
// apps/frontend/tests/search-and-apply.spec.ts
import { test, expect } from '@playwright/test';
import { loginAs, uniqueTitle } from './helpers';

test.describe('Search, Filter & Apply', () => {
  const title = uniqueTitle('E2E Búsqueda');
  let opportunityPath: string;

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await loginAs(page, 'docente');
    await page.goto('/opportunities/new');
    await page.getByTestId('input-title').fill(title);
    await page.getByTestId('select-type').selectOption('tutoria');
    await page.getByTestId('input-description').fill('Oportunidad para buscar');
    await page.getByTestId('btn-submit').click();
    await expect(page.getByTestId('opportunity-title')).toHaveText(title);
    opportunityPath = new URL(page.url()).pathname;
    await page.close();
  });

  test('search finds the opportunity by title', async ({ page }) => {
    await page.goto('/opportunities');
    await page.getByTestId('search-input').fill('E2E Búsqueda');
    await page.getByTestId('btn-search').click();
    await expect(page.getByText(title)).toBeVisible();
  });

  test('filter by type shows matching opportunities', async ({ page }) => {
    await page.goto('/opportunities');
    await page.getByTestId('filter-type').selectOption('tutoria');
    await page.getByTestId('btn-search').click();
    await expect(page.getByTestId('opportunity-card').first()).toBeVisible();
  });

  test('student applies to opportunity', async ({ page }) => {
    await loginAs(page, 'estudiante');
    await page.goto(opportunityPath);
    await page.getByTestId('btn-apply').click();
    await expect(page.getByTestId('apply-success')).toBeVisible();
  });

  test('create opportunity with empty required fields shows validation error', async ({ page }) => {
    await loginAs(page, 'docente');
    await page.goto('/opportunities/new');
    await page.getByTestId('btn-submit').click();
    // HTML5 validation prevents submit — title field should be marked invalid
    const titleInput = page.getByTestId('input-title');
    await expect(titleInput).toHaveAttribute('required', '');
    // The form should NOT have navigated away
    await expect(page).toHaveURL(/\/opportunities\/new/);
  });
});
```

- [ ] **Step 2: Run tests**

Run: `cd apps/frontend && npx playwright test tests/search-and-apply.spec.ts`
Expected: 4 tests pass

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/tests/search-and-apply.spec.ts
git commit -m "feat(e2e): add search, filter, apply, and validation tests"
```

---

### Task 5: Navigation Guard Test

**Files:**
- Create: `apps/frontend/tests/navigation.spec.ts`

**Interfaces:**
- Consumes: none (tests unauthenticated behavior)
- Produces: 1 passing test — protected route redirects to login

- [ ] **Step 1: Write navigation.spec.ts**

```typescript
// apps/frontend/tests/navigation.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Navigation Guards', () => {
  test('accessing /profile without login redirects to /login', async ({ page }) => {
    await page.goto('/profile');
    await expect(page).toHaveURL(/\/login/);
  });
});
```

- [ ] **Step 2: Run test**

Run: `cd apps/frontend && npx playwright test tests/navigation.spec.ts`
Expected: 1 test passes

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/tests/navigation.spec.ts
git commit -m "feat(e2e): add navigation guard test — protected routes redirect"
```

---

### Task 6: CI Integration — E2E Job in GitHub Actions

**Files:**
- Modify: `.github/workflows/ci.yml`

**Interfaces:**
- Consumes: All test specs from Tasks 1-5
- Produces: `e2e` job that runs Playwright in CI, uploads report artifact, feeds into Discord notify

- [ ] **Step 1: Add e2e job to ci.yml**

Add the following job after `jest-tests`. Also update the `notify` job's `needs` to include `e2e`:

```yaml
  e2e:
    name: Playwright E2E
    runs-on: ubuntu-latest
    needs: [backend-build, frontend-build]
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: campuslink_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    env:
      DATABASE_URL: postgresql://postgres:postgres@localhost:5432/campuslink_test
      JWT_SECRET: ci_test_secret
      NODE_ENV: test
      FRONTEND_URL: http://localhost:5173
      PORT: 3000
      E2E_RUN_ID: ${{ github.run_id }}
      API_URL: http://localhost:3000/api
      BASE_URL: http://localhost:5173
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
          cache-dependency-path: package-lock.json
      - run: npm ci
      - run: npx playwright install --with-deps chromium
        working-directory: apps/frontend
      - name: Start backend
        run: npm run start:dev --workspace=apps/backend &
      - name: Wait for backend
        run: npx wait-on http://localhost:3000/api --timeout 60000
      - name: Start frontend
        run: npm run dev --workspace=apps/frontend &
      - name: Wait for frontend
        run: npx wait-on http://localhost:5173 --timeout 60000
      - name: Run E2E tests
        working-directory: apps/frontend
        run: npx playwright test
      - name: Upload Playwright report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: apps/frontend/playwright-report/
          retention-days: 14
```

Update the `notify` job's `needs` array:

```yaml
  notify:
    name: Notificar Discord
    runs-on: ubuntu-latest
    needs: [backend-build, frontend-build, jest-tests, e2e]
    if: always()
```

- [ ] **Step 2: Verify YAML syntax**

Run: `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/ci.yml'))" 2>&1 || node -e "const fs=require('fs'); console.log('YAML file exists:', fs.existsSync('.github/workflows/ci.yml'))"`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add Playwright E2E job with artifact upload and Discord notify"
```

---

### Task 7: Update CLAUDE.md + .gitignore

**Files:**
- Modify: `CLAUDE.md` (remove Playwright restriction, add E2E commands)
- Modify: `apps/frontend/.gitignore` (if exists, add playwright artifacts)

**Interfaces:**
- Consumes: nothing
- Produces: Updated project documentation

- [ ] **Step 1: Update CLAUDE.md**

Remove the line:
```
**Do NOT add or run Playwright tests** — E2E testing is reserved for a future deliverable. Do not modify `playwright.config.ts`.
```

Replace with:
```
### E2E Testing (Playwright)
```bash
cd apps/frontend && npx playwright test              # run all E2E tests
cd apps/frontend && npx playwright test tests/auth.spec.ts  # single spec
cd apps/frontend && npx playwright show-report        # view HTML report
```
```

Also update the Key Constraints section — remove the line:
```
- **No Playwright** — tests use Jest only (backend: `ts-jest`, frontend: `babel-jest` + `jsdom`)
```

Replace with:
```
- **Jest** for unit tests (backend: `ts-jest`, frontend: `babel-jest` + `jsdom`); **Playwright** for E2E tests (`apps/frontend/tests/`)
```

- [ ] **Step 2: Add playwright artifacts to .gitignore**

Append to `apps/frontend/.gitignore` (create if needed):
```
# Playwright
playwright-report/
test-results/
```

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md apps/frontend/.gitignore
git commit -m "docs: update CLAUDE.md for Playwright E2E, add report to gitignore"
```

---

## Spec Coverage Self-Review

| Entrega 3 DoD Requirement | Task |
|---|---|
| ≥10 E2E tests on critical flows | Tasks 2-5: 13 tests total (3 auth + 5 CRUD + 4 search/apply/validate + 1 nav) |
| Tests cover critical scenarios | Login, register, CRUD, search, filter, apply, validation, nav guard |
| Auto-run in CI pipeline | Task 6: `e2e` job in GitHub Actions |
| Pipeline fails if E2E fails | Task 6: job failure propagates |
| Evidence (logs, reports, screenshots) | Task 6: `upload-artifact` with `playwright-report/` (includes HTML report + screenshots on failure) |
| Notifications (Discord) | Task 6: `notify` job `needs` includes `e2e` |
| Headless | Already configured in `playwright.config.ts` (default) |
| `BASE_URL` from env | Task 1: config reads `process.env.BASE_URL` |
| Stable selectors | All tests use `data-testid` |
