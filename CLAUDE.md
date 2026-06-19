# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CampusLink is a university community platform where students, teachers, and institutions can publish and manage opportunities (tutorías, ayudantías, prácticas, voluntariados, investigación). It is an **npm workspaces monorepo** with two apps:
- `apps/frontend/` — React 19 + Vite + TypeScript
- `apps/backend/` — NestJS 11 + TypeORM + PostgreSQL

## Commands

### Development
```bash
# From root
npm run dev:frontend        # Vite dev server → http://localhost:5173
npm run dev:backend         # NestJS watch mode → http://localhost:3000
```

`start:dev` runs a `prestart:dev` hook that kills any process on port 3000 before starting.

### Testing
```bash
# Backend unit tests (*.spec.ts)
cd apps/backend && npm test
cd apps/backend && npm run test:cov

# Run a single backend test file
cd apps/backend && npx jest src/auth/auth.service.spec.ts

# Frontend component tests (*.test.tsx)
cd apps/frontend && npm test
cd apps/frontend && npm run test:coverage

# Run a single frontend test file
cd apps/frontend && npx jest src/components/OpportunityCard.test.tsx
```

### E2E Testing (Playwright)
```bash
cd apps/frontend && npx playwright test                        # run all E2E tests
cd apps/frontend && npx playwright test tests/auth.spec.ts     # single spec
cd apps/frontend && npx playwright show-report                 # view HTML report
```

### Build & Lint
```bash
cd apps/backend && npm run build       # nest build
cd apps/backend && npm run lint        # eslint --fix

cd apps/frontend && npm run build      # tsc -b && vite build
cd apps/frontend && npm run lint       # eslint .
```

## Architecture

### Backend (NestJS)

Each domain is a self-contained NestJS module following a strict layered pattern:

```
Controller (HTTP boundary) → Service (business logic) → TypeORM Repository (data access)
```

Modules:
- `auth/` — JWT login/register, `JwtAuthGuard`, `RolesGuard`, `@Roles()` decorator
- `opportunities/` — CRUD + publisher history + deadline transitions
- `applications/` — Application state machine, finalization, feedback
- `admin/` — Admin-only endpoints: suspend/reactivate users, block/unblock opportunities. Seed the initial admin user with:
  ```bash
  cd apps/backend && ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=secret npx ts-node -r tsconfig-paths/register src/admin/seed-admin.ts
  ```
- `notifications/` — `GET /notifications`, `GET /notifications/unread-count`, `PATCH /notifications/read-all`, `PATCH /notifications/:id/read`. Types: `OPPORTUNITY_MODIFIED`, `OPPORTUNITY_DELETED`, `APPLICATION_RESULT`, `APPLICATION_FEEDBACK`, `APPLICATION_SUBMITTED`. Generated inside `ApplicationsService` and `OpportunitiesService`; returns max 50 records ordered newest-first.
- `common/util/text.ts` — `normalizeSearch()` strips accents for accent-insensitive ILIKE queries

Key conventions:
- **DTOs** in `dto/` always use `class-validator` decorators — validation at HTTP boundary only (global `ValidationPipe` with `whitelist: true, transform: true`)
- **Entities** use TypeORM decorators; `synchronize: true` is enabled in development/test — do not set it to `false` locally
- **Guards**: apply `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles(UserRole.ADMIN)` to protect routes. `RolesGuard` also rejects suspended users regardless of role.
- **Exceptions**: use NestJS built-ins (`NotFoundException`, `BadRequestException`, etc.) — no custom error classes
- **Lazy transitions**: `applyDeadlineTransitions()` in `opportunities.transitions.ts` moves opportunities from `DISPONIBLE` → `EN_EVALUACION` when their deadline passes; it is called on each read, not on a cron.
- Global API prefix is `/api`

### Frontend (React + Vite)

- All HTTP calls must go through `src/api/` — domain files: `auth.ts`, `opportunities.ts`, `applications.ts`, `admin.ts`, `notifications.ts`. Never use `fetch`/`axios` inline in components.
- `src/api/client.ts` — request interceptor injects `Authorization: Bearer <token>` from localStorage; response interceptor clears localStorage and redirects to `/login` on 401/403. `src/api/__mocks__/client.ts` provides the mock Axios instance for tests.
- Auth state lives entirely in localStorage (`token`, `user` keys) — there is no state management library or React context store.
- Pages are organized by domain under `src/pages/` (`auth/`, `opportunities/`, `admin/`, `profile/`, `notifications/`) and registered in `App.tsx` via React Router v7.
- Shared TypeScript interfaces live in `src/types/` — keep frontend types aligned with backend entities.
- CSS modules are mocked with `identity-obj-proxy` in tests.

### Data Model

| Entity | Key fields | Notes |
|--------|-----------|-------|
| `User` | UUID, email (unique), name, password (excluded from SELECT), role enum, suspended (bool) | Roles: `ESTUDIANTE`, `DOCENTE`, `INSTITUCION`, `ADMIN`. `ADMIN` cannot self-register. |
| `Opportunity` | UUID, title, description, type enum, requirements, deadline, status enum, publisher (FK→User) | Types: `TUTORIA`, `GRUPO_ESTUDIO`, `AYUDANTIA`, `TRABAJO`, `PRACTICA`, `VOLUNTARIADO`, `INVESTIGACION`, `OTRO`. Status: `DISPONIBLE`, `EN_EVALUACION`, `FINALIZADO`, `DESIERTA`, `BLOQUEADA` |
| `Application` | UUID, user (FK), opportunity (FK), status enum, feedback | Unique constraint on (user, opportunity). Status: `POSTULADO`, `EN_REVISION`, `ACEPTADO`, `RECHAZADO`, `CANCELADO`, `NO_SELECCIONADO` |

### Environment Variables

Backend (`.env` in `apps/backend/`, see `.env.example`):
```
DATABASE_URL=postgresql://user:pass@host:port/db
JWT_SECRET=<long_random_string>
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

Frontend (`.env.local` in `apps/frontend/`, optional):
```
VITE_API_URL=http://localhost:3000/api
```

CI uses `postgresql://postgres:postgres@localhost:5432/campuslink_test` via a GitHub Actions PostgreSQL 15 service container.

## Testing Patterns

**Backend** — use `Test.createTestingModule()` from `@nestjs/testing`. Mock TypeORM repositories via `{ provide: getRepositoryToken(Entity), useValue: { findOne: jest.fn(), ... } }`. Define shared fixture objects as `const baseUser = { ... }` at the top of the test file and spread/override per case.

**Frontend** — wrap page components in `<MemoryRouter>` (or `<MemoryRouter initialEntries={['/path']}>`) for tests. Mock entire API modules with `jest.mock('../api/auth')` and cast to `jest.Mocked<typeof authApi>`. Use `data-testid` attributes (e.g., `login-email`, `btn-login`) for element selection. Clear mocks and localStorage in `beforeEach`.

## Key Constraints

- **TypeScript strict** — never use `any` without explicit justification
- **No new libraries** without proposing alternatives and justifying the choice
- **Jest** for unit tests (backend: `ts-jest`, frontend: `babel-jest` + `jsdom`); **Playwright** for E2E tests (`apps/frontend/tests/`)
- **No production `synchronize: true`** — TypeORM migrations required for production deployments
- RBAC enforcement is active; do not bypass role checks. `RolesGuard` must be applied alongside `JwtAuthGuard` on any role-restricted route.
- Backend tests are co-located (`.spec.ts` alongside source); frontend tests use `.test.tsx` suffix
- Prefix intentionally unused variables with `_` to satisfy ESLint (`_unused`, `_event`, etc.)
