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

# Or within each workspace
cd apps/backend && npm run start:dev
cd apps/frontend && npm run dev
```

### Testing
```bash
# Backend unit tests (*.spec.ts)
cd apps/backend && npm test
cd apps/backend && npm run test:watch
cd apps/backend && npm run test:cov

# Frontend component tests (*.test.tsx)
cd apps/frontend && npm test
cd apps/frontend && npm run test:watch

# From root (workspace flag)
npm run test --workspace=apps/backend
npm run test --workspace=apps/frontend
```

**Do NOT add or run Playwright tests** — E2E testing is reserved for a future deliverable. Do not modify `playwright.config.ts`.

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

Modules: `auth/`, `opportunities/`, `applications/`

- **DTOs** in `dto/` always use `class-validator` decorators — validation happens only at the HTTP boundary (global `ValidationPipe` with `whitelist: true, transform: true`)
- **Entities** use TypeORM decorators; `synchronize: true` is enabled in development/test — do not set it to `false` locally
- **Guards**: `JwtAuthGuard` protects routes requiring authentication; the JWT strategy reads `Authorization: Bearer <token>`
- **Exceptions**: use NestJS built-ins (`NotFoundException`, `BadRequestException`, etc.) — no custom error classes
- Global API prefix is `/api`

### Frontend (React + Vite)

- All HTTP calls must go through `src/api/` (domain files: `auth.ts`, `opportunities.ts`, `applications.ts`) — never use `fetch`/`axios` inline in components
- `src/api/__mocks__/client.ts` mocks the Axios instance in tests
- Pages are organized by domain under `src/pages/` and registered in `App.tsx` via React Router v7
- Shared TypeScript interfaces live in `src/types/` — keep frontend types aligned with backend entities

### Data Model

| Entity | Key fields | Notes |
|--------|-----------|-------|
| `User` | UUID, email (unique), name, password (excluded from SELECT), role enum | Roles: `ESTUDIANTE`, `DOCENTE`, `INSTITUCION`, `ADMIN` |
| `Opportunity` | UUID, title, description, type enum, requirements, deadline, isActive, publisher (FK→User) | Types: `TUTORIA`, `GRUPO_ESTUDIO`, `AYUDANTIA`, `TRABAJO`, `PRACTICA`, `VOLUNTARIADO`, `INVESTIGACION`, `OTRO` |
| `Application` | UUID, user (FK), opportunity (FK), status enum | Unique constraint on (user, opportunity). Status: `POSTULADO`, `EN_REVISION`, `ACEPTADO`, `RECHAZADO` |

### Environment Variables

Backend (`.env` in `apps/backend/`):
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

## Key Constraints

- **TypeScript strict** — never use `any` without explicit justification
- **No new libraries** without proposing alternatives and justifying the choice
- **No Playwright** — tests use Jest only (backend: `ts-jest`, frontend: `babel-jest` + `jsdom`)
- **No production `synchronize: true`** — TypeORM migrations required for production deployments
- RBAC enforcement is in place (from Entrega 2); do not bypass role checks when editing auth-related code
- Backend tests are co-located (`.spec.ts` alongside source); frontend tests use `.test.tsx` suffix
