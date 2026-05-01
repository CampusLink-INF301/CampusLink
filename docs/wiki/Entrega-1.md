# Entrega 1

**Fecha de entrega:** 1 de mayo de 2026
**Tag GitHub:** [`v1.0-entrega1`](https://github.com/CampusLink-INF301/CampusLink/releases/tag/v1.0-entrega1)
**Release:** [GitHub Release v1.0-entrega1](https://github.com/CampusLink-INF301/CampusLink/releases/tag/v1.0-entrega1)
**Video:** _[pendiente — agregar link YouTube]_

---

## Objetivo de la entrega

Construir el MVP de CampusLink con las funcionalidades prioritarias de la plataforma, implementando un CRUD completo para la entidad principal (Oportunidades) con autenticación JWT, y pruebas unitarias con **Jest** que validen la lógica de negocio del sistema.

---

## Alcance implementado

### CRUD de Oportunidades

| Funcionalidad | Frontend | Backend | Cobertura de test |
|---|---|---|---|
| Listar oportunidades | `/opportunities` | `GET /api/opportunities` | `opportunities.service.spec.ts` |
| Buscar y filtrar | SearchBar (texto + tipo) | `?search=X&type=Y` | `opportunities.service.spec.ts` |
| Ver detalle | `/opportunities/:id` | `GET /api/opportunities/:id` | `opportunities.service.spec.ts` |
| Crear oportunidad | `/opportunities/new` | `POST /api/opportunities` | `opportunities.service.spec.ts` |
| Editar oportunidad | `/opportunities/:id/edit` | `PUT /api/opportunities/:id` | `opportunities.service.spec.ts` |
| Eliminar oportunidad | Botón en lista y detalle | `DELETE /api/opportunities/:id` | `opportunities.service.spec.ts` |

### Autenticación JWT

| Funcionalidad | Endpoint | Cobertura de test |
|---|---|---|
| Registro de usuario | `POST /api/auth/register` | `auth.service.spec.ts` |
| Login | `POST /api/auth/login` → JWT | `auth.service.spec.ts` |

Roles definidos: `estudiante`, `docente`, `institución`, `administrador`.
En Entrega 1, cualquier usuario autenticado puede ejecutar el CRUD (sin restricción por rol).

### Componentes frontend testeados

| Componente | Archivo de test | Qué cubre |
|---|---|---|
| `OpportunityCard` | `components/OpportunityCard.test.tsx` | Render, props, truncado descripción, botón eliminar, link editar |
| `SearchBar` | `components/SearchBar.test.tsx` | Submit texto, filtro tipo, botón limpiar |
| `opportunitiesApi` | `api/opportunities.test.ts` | getAll, getById, create, update, remove (axios mockeado) |

---

## Cómo ejecutar el sistema (local)

### Prerequisitos

- Node.js >= 18
- PostgreSQL local **o** credenciales de Railway (contactar al líder del equipo)

### 1. Clonar e instalar

```bash
git clone https://github.com/CampusLink-INF301/CampusLink.git
cd CampusLink
npm install
```

### 2. Configurar backend

```bash
cd apps/backend
cp .env.example .env
# Editar .env con DATABASE_URL y JWT_SECRET
npm run start:dev      # → http://localhost:3000
```

### 3. Iniciar frontend

```bash
cd apps/frontend
npm run dev            # → http://localhost:5173
```

> Instrucciones completas de configuración (incluyendo opciones de base de datos) en el [README](https://github.com/CampusLink-INF301/CampusLink#instalación-y-ejecución-local).

---

## Pruebas — Estrategia y resultados

### Herramienta

**Jest 29.x** — tests unitarios para backend (NestJS) y frontend (React).

### Suite de tests — Backend

| Archivo | Casos de prueba |
|---|---|
| `auth/auth.service.spec.ts` | register éxito, register email duplicado (ConflictException), login éxito, login usuario no encontrado, login contraseña incorrecta |
| `opportunities/opportunities.service.spec.ts` | findAll sin filtros, findAll con tipo, findAll con búsqueda, findOne encontrado, findOne NotFoundException, create, update éxito, update NotFoundException, remove éxito, remove NotFoundException |

### Suite de tests — Frontend

| Archivo | Casos de prueba |
|---|---|
| `components/OpportunityCard.test.tsx` | renderiza título, tipo, descripción; trunca descripciones largas; muestra/oculta botón eliminar; llama onDelete; renderiza deadline |
| `components/SearchBar.test.tsx` | renderiza inputs; envía búsqueda con texto; filtra por tipo; botón limpiar resetea y llama onSearch |
| `api/opportunities.test.ts` | getAll sin params, getAll con params, getById, create, update, remove (axios mockeado con jest.fn()) |

### Cómo ejecutar los tests

```bash
# Backend — 16 tests
cd apps/backend
npm test

# Frontend — 21 tests
cd apps/frontend
npm test

# Con reporte de cobertura
npm run test:coverage
```

### Resultado esperado

```
Backend:
  Test Suites: 3 passed, 3 total
  Tests:       16 passed, 16 total

Frontend:
  Test Suites: 3 passed, 3 total
  Tests:       21 passed, 21 total
```

**Total: 37/37 tests pasando ✓**

---

## Evidencia

### Tests ejecutados

Ver resultados detallados en [Proyecto - Evidencias](Proyecto---Evidencias).

### Release y tag

- **Tag:** `v1.0-entrega1`
- **Release:** [GitHub Release v1.0-entrega1](https://github.com/CampusLink-INF301/CampusLink/releases/tag/v1.0-entrega1)
- **Descarga código fuente:** [Source code (zip)](https://github.com/CampusLink-INF301/CampusLink/archive/refs/tags/v1.0-entrega1.zip)

### Tablero JIRA

- **Board:** [KAN — CampusLink](https://campuslink-inf301.atlassian.net/jira/software/projects/KAN/boards/1)
- Estado: todos los tickets de Entrega 1 en **Done** ✓

### Commits principales de Entrega 1

| Commit | Descripción |
|---|---|
| KAN-4 | RULES.md — guía para asistentes IA |
| KAN-5 | Tests Jest backend (AuthService + OpportunitiesService) |
| KAN-6 | Configuración Jest frontend (babel-jest, jsdom, mocks) |
| KAN-7 | Tests Jest frontend (componentes + API client) |
| KAN-8 | Rediseño UI con sistema CSS (reemplaza estilos inline) |
| KAN-9 | CI actualizado: Jest en lugar de Playwright |
| KAN-10 | Documentación: Jest para E1, Playwright reservado para E3 |
| KAN-11 | README: instrucciones de setup local completas |
| KAN-12 | README: links a Wiki y Release |

### Capturas de pantalla

> _Agregar capturas antes de la entrega final._

| Pantalla | Estado |
|---|---|
| Lista de oportunidades | pendiente |
| Formulario crear oportunidad | pendiente |
| Detalle de oportunidad | pendiente |
| Login / Register | pendiente |
| Tablero JIRA (tickets Done) | pendiente |
| Output `npm test` backend | pendiente |
| Output `npm test` frontend | pendiente |

---

## Problemas encontrados y soluciones

| Problema | Impacto | Solución aplicada |
|---|---|---|
| `setupFilesAfterFramework` no es una clave válida en Jest — debía ser `setupFilesAfterEnv` | `@testing-library/jest-dom` no se cargaba; matchers como `toBeInTheDocument()` fallaban | Corregida la clave en el bloque `jest` de `package.json` |
| `import.meta.env` en `api/client.ts` rompe Jest (CommonJS no soporta `import.meta`) | Todos los tests del API fallaban al intentar importar el módulo | Creado `src/api/__mocks__/client.ts`; Jest usa el mock automáticamente cuando se llama `jest.mock('./client')` |
| `TextEncoder is not defined` al usar `react-router-dom` en tests con jsdom | `OpportunityCard.test.tsx` no podía correr porque react-router-dom usa `TextEncoder` internamente | Agregado polyfill `TextEncoder`/`TextDecoder` desde `util` de Node en `setupTests.ts` |
| `ts-jest` fallaba con TypeScript 6 por `rootDir` no definido y `baseUrl` deprecado | Los 3 spec files del backend no compilaban | Agregado `rootDir: "./src"` e `ignoreDeprecations: "6.0"` en `tsconfig.json` del backend |
| `DATABASE_URL` interna de Railway no funciona en desarrollo local | El backend no podía conectarse a la base de datos al correr localmente | Usar `DATABASE_PUBLIC_URL` (junction.proxy.rlwy.net) para desarrollo local; `DATABASE_URL` solo funciona dentro de la red de Railway |

---

## Supuestos y dependencias específicas de E1

- El equipo tiene 4 integrantes (el curso indica 3) — acordado con el docente.
- En Entrega 1, cualquier usuario puede crear/editar/eliminar oportunidades sin control por roles. El RBAC se implementa en Entrega 2.
- Se usa `synchronize: true` en TypeORM en desarrollo para que el esquema se cree automáticamente. En producción (Railway) se usará migrations.
- La variable `VITE_API_URL` del frontend debe apuntar a la URL del backend de Railway cuando se despliega en Vercel.
- La variable `FRONTEND_URL` del backend debe incluir la URL de Vercel para que CORS permita las peticiones.
- Los tests E2E con Playwright están planificados para Entrega 3; en esta entrega solo se usan tests unitarios con Jest.
