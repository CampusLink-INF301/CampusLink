# CampusLink — AI Rules & Project Guide

## 1. Qué es este proyecto

CampusLink es una plataforma web para la comunidad universitaria donde estudiantes, docentes
y áreas institucionales pueden publicar, descubrir y gestionar oportunidades (tutorías,
ayudantías, prácticas, voluntariados, investigación) en un solo lugar.

Repositorio: monorepo npm workspaces
- `apps/frontend/` — React + Vite
- `apps/backend/`  — NestJS + TypeORM
- `docs/`          — Documentación del proyecto
- `docs/wiki/`     — Wiki con detalles de cada entrega

---

## 2. Stack tecnológico (versiones exactas)

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Frontend | React | 19.x |
| Frontend | Vite | 8.x |
| Frontend | TypeScript | 6.x |
| Frontend | React Router | v7 |
| Frontend | Axios | 1.x |
| Backend | NestJS | 11.x |
| Backend | TypeORM | 0.3.x |
| Backend | PostgreSQL | 15 |
| Backend | Passport JWT | — |
| Backend | class-validator | — |
| Testing | Jest | 30.x (backend), 29.x compatible (frontend) |
| Deploy | Frontend | Vercel |
| Deploy | Backend | Railway |
| Paquetes | npm workspaces | — |

---

## 3. Estructura de carpetas

### Backend (`apps/backend/src/`)

```
auth/
  auth.controller.ts    — endpoints /api/auth/*
  auth.service.ts
  auth.module.ts
  jwt.strategy.ts
  dto/                  — login.dto.ts, register.dto.ts
  entities/             — user.entity.ts

opportunities/
  opportunities.controller.ts   — endpoints /api/opportunities/*
  opportunities.service.ts
  opportunities.module.ts
  dto/                  — create-opportunity.dto.ts, update-opportunity.dto.ts, query-opportunity.dto.ts
  entities/             — opportunity.entity.ts
```

### Frontend (`apps/frontend/src/`)

```
api/         — cliente Axios + llamadas por dominio (auth.ts, opportunities.ts)
components/  — componentes reutilizables (Navbar, OpportunityCard, SearchBar, OpportunityForm)
pages/       — una carpeta por dominio (auth/, opportunities/)
types/       — interfaces TypeScript compartidas
```

---

## 4. Convenciones de código

### Backend
- Cada módulo sigue el patrón: Controller → Service → TypeORM Repository
- DTOs **siempre** usan decoradores de `class-validator` para validación en boundary
- Entidades usan decoradores TypeORM
- Excepciones NestJS built-in: `NotFoundException`, `BadRequestException`, etc.
- API prefix global: `/api`
- JWT en header `Authorization: Bearer <token>`

### Frontend
- Llamadas HTTP solo en `src/api/` — nunca `fetch`/`axios` inline en componentes
- React Router v7 para navegación
- Props tipadas siempre (no `any`)
- Formularios usan estado local (no librería externa por ahora)

---

## 5. Testing

**Herramienta principal: Jest**

- Backend: tests unitarios en `src/**/*.spec.ts` (co-ubicados con el código)
- Frontend: tests de componentes en `src/**/*.test.tsx` con Jest
- **NO usar Playwright** — está reservado para Entrega 3

Comandos:
```bash
# Backend — unit tests
cd apps/backend && npm test

# Frontend — component tests
cd apps/frontend && npm test

# Desde raíz
npm run test --workspace=apps/backend
npm run test --workspace=apps/frontend
```

---

## 6. Entorno de desarrollo local

```bash
# Backend
cd apps/backend
cp .env.example .env   # configurar DATABASE_URL y JWT_SECRET
npm install
npm run start:dev      # → http://localhost:3000

# Frontend
cd apps/frontend
npm install
npm run dev            # → http://localhost:5173
```

Variables de entorno requeridas (backend):
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — clave para firmar tokens
- `PORT` — opcional, default 3000
- `FRONTEND_URL` — URL del frontend para CORS

Variables de entorno requeridas (frontend):
- `VITE_API_URL` — URL del backend (`http://localhost:3000` en desarrollo)

---

## 7. Alcance Entrega 1

### CRUD Oportunidades

| Funcionalidad | Frontend route | Backend endpoint |
|---|---|---|
| Listar | `/opportunities` | `GET /api/opportunities` |
| Filtrar | SearchBar | `?search=X&type=Y` |
| Ver detalle | `/opportunities/:id` | `GET /api/opportunities/:id` |
| Crear | `/opportunities/new` | `POST /api/opportunities` |
| Editar | `/opportunities/:id/edit` | `PUT /api/opportunities/:id` |
| Eliminar | Botón en lista/detalle | `DELETE /api/opportunities/:id` |

### Autenticación

- Registro: `POST /api/auth/register`
- Login: `POST /api/auth/login` → devuelve JWT
- Roles definidos: `estudiante`, `docente`, `institución`, `administrador`
- En Entrega 1: cualquier usuario autenticado puede hacer CRUD (sin restricción por rol aún)

---

## 8. Deployment

| App | Plataforma | Comando build |
|-----|-----------|---------------|
| Frontend | Vercel | `npm run build` en `apps/frontend` |
| Backend | Railway | `npm run build` en `apps/backend` |

- Backend usa `synchronize: true` en TypeORM **solo en desarrollo/staging**
- En producción migrar a TypeORM migrations
- CORS del backend debe incluir la `FRONTEND_URL` de Vercel

---

## 9. Reglas para asistentes IA

### Siempre hacer
- Seguir los patrones NestJS/React ya establecidos — no reinventar la arquitectura
- Usar TypeScript estricto — nunca `any` sin justificación explícita
- Validar en boundaries: DTOs con `class-validator` en backend, tipos en frontend
- Mantener frontend y backend alineados en tipos (usar `src/types/` del frontend)
- Escribir tests Jest al agregar lógica de negocio
- Leer este archivo al inicio de cada sesión de trabajo

### Nunca hacer
- **NO** agregar tests Playwright ni modificar `playwright.config.ts` — reservado para Entrega 3
- **NO** usar `synchronize: false` en TypeORM en desarrollo
- **NO** hacer push o force-push sin confirmación explícita del usuario
- **NO** agregar funcionalidades fuera del alcance de la entrega actual sin preguntar
- **NO** instalar librerías nuevas sin proponer alternativas y justificar la elección
- **NO** añadir comentarios que expliquen QUÉ hace el código (los nombres ya lo dicen)
- **NO** crear archivos de documentación `.md` sin que el usuario los pida explícitamente
- **NO** hacer commits sin que el usuario lo solicite

---

## 10. Decisiones de arquitectura tomadas

| Decisión | Justificación |
|---|---|
| Monorepo npm workspaces | Compartir tipos, scripts unificados, CI simple |
| TypeORM `synchronize: true` en dev | Velocidad de iteración en Entrega 1 |
| JWT stateless | Sin sesiones en servidor, simplifica escalado |
| Sin RBAC en Entrega 1 | Priorizar CRUD funcional; roles se aplican en Entrega 2 |
| Jest para frontend y backend | Un solo framework de testing, consistencia en el equipo |
| Playwright reservado para E2E | Tests unitarios primero; E2E en Entrega 3 |
