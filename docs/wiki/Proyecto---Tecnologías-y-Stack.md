# Proyecto - Tecnologías y Stack

## Stack tecnológico

| Capa | Tecnología | Versión | Justificación |
|---|---|---|---|
| Frontend | React + Vite | React 19, Vite 8 | Ecosistema amplio, componentes reactivos, build ultrarrápido |
| Lenguaje | TypeScript | ~6.0 | Tipado estático reduce bugs en tiempo de compilación |
| Routing | React Router v7 | 7.x | Estándar para SPA con React |
| HTTP client | Axios | 1.x | Interceptores para JWT, API limpia |
| Backend | NestJS | 11.x | Arquitectura modular, inyección de dependencias, decoradores |
| ORM | TypeORM | 0.3.x | Integración nativa con NestJS, entidades TypeScript |
| Base de datos | PostgreSQL | 15+ | Relacional, robusta, soportada por Railway |
| Autenticación | JWT + Passport | — | Stateless, compatible con Railway/Vercel |
| Hashing | bcrypt | — | Estándar para contraseñas seguras |
| Testing E1 | Jest | 29.x | Tests unitarios backend y componentes frontend |
| Testing E3 | Playwright | _(futuro)_ | E2E en navegador real, planificado para Entrega 3 |
| CI/CD | GitHub Actions | — | Integración nativa con GitHub |
| Hosting frontend | Vercel | — | Deploy automático desde GitHub, CDN global |
| Hosting backend | Railway | — | PostgreSQL + NestJS en un solo proyecto |

## Relación con las pruebas

### Jest como herramienta de testing (Entrega 1)

Jest fue elegido para Entrega 1 porque:
- Permite probar la **lógica de negocio** de los servicios NestJS de forma aislada (sin base de datos real).
- Permite verificar el comportamiento de componentes React desde la perspectiva del usuario.
- Los mocks de repositorios TypeORM hacen los tests rápidos y deterministas.
- Compatible nativamente con TypeScript a través de `ts-jest` (backend) y `babel-jest` (frontend).
- Genera reportes de **cobertura de código** integrados.

### Cobertura de pruebas en Entrega 1

**Backend (`apps/backend/src/`):**

| Archivo | Lo que prueba |
|---|---|
| `opportunities/opportunities.service.spec.ts` | `findAll` con filtros, `findOne`, `create`, `update`, `remove` |
| `auth/auth.service.spec.ts` | `register` (éxito y conflicto), `login` (éxito, credenciales incorrectas) |

**Frontend (`apps/frontend/src/`):**

| Archivo | Lo que prueba |
|---|---|
| `components/OpportunityCard.test.tsx` | Render, tipo, descripción, deadline, botón eliminar, callback |
| `components/SearchBar.test.tsx` | Submit con texto, filtro por tipo, botón limpiar |
| `api/opportunities.test.ts` | `getAll`, `getById`, `create`, `update`, `remove` (mock axios) |

### Relación entre stack y calidad

- **TypeScript** en frontend y backend detecta errores de tipo antes de llegar a tests.
- **class-validator** en NestJS valida el esquema de los DTOs en el servidor, reduciendo la necesidad de tests de validación adicionales.
- **data-testid** en todos los elementos interactivos hace los selectores de tests estables e independientes del CSS.
- **`@nestjs/testing`** permite crear módulos de prueba con dependencias mockeadas limpiamente.

### Evolución de la estrategia de testing

| Entrega | Herramienta | Tipo |
|---|---|---|
| Entrega 1 | Jest | Unitarios |
| Entrega 2 | Jest + Supertest | Integración |
| Entrega 3 | Playwright | E2E (navegador real) |
