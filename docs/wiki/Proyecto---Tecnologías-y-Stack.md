# Proyecto - Tecnologías y Stack

## Stack tecnológico

| Capa | Tecnología | Versión | Justificación |
|---|---|---|---|
| Frontend | React + Vite | React 19, Vite 8 | Ecosistema amplio, componentes reactivos, build ultrarrápido |
| Lenguaje | TypeScript | ~6.0 | Tipado estático reduce bugs en tiempo de compilación |
| Routing | React Router v7 | 7.x | Estándar para SPA con React |
| HTTP client | Axios | 1.x | Interceptores para JWT, API limpia |
| Backend | NestJS | 11.x | Arquitectura modular, inyección de dependencias, decoradores |
| ORM | TypeORM | última | Integración nativa con NestJS, migrations, entidades TS |
| Base de datos | PostgreSQL | 15+ | Relacional, robusta, soportada por Railway |
| Autenticación | JWT + Passport | — | Stateless, compatible con Railway/Vercel |
| Hashing | bcrypt | — | Estándar para contraseñas seguras |
| Testing | Playwright | 1.59 | E2E real en navegador, soporte multi-browser |
| CI/CD | GitHub Actions | — | Integración nativa con GitHub |
| Hosting frontend | Vercel | — | Deploy automático desde GitHub, CDN global |
| Hosting backend | Railway | — | PostgreSQL + NestJS en un solo proyecto, sin gestión de infraestructura |

## Relación con las pruebas

### Playwright como herramienta de testing E2E

Playwright fue elegido porque:
- Permite ejecutar tests en el **navegador real** (Chromium, Firefox, WebKit), detectando problemas de UI que los tests unitarios no ven.
- Tiene **auto-wait**: espera automáticamente a que los elementos sean visibles e interactuables, reduciendo tests flaky.
- Soporta **intercepción de red** para simular errores de API en tests.
- Genera **reportes HTML** con screenshots de fallos.
- Compatible con TypeScript de forma nativa.

### Cobertura de pruebas en Entrega 1

Los 6 specs implementados cubren el flujo completo del CRUD:

| Spec | Lo que prueba |
|---|---|
| `opportunities.list.spec.ts` | Renderizado de lista, cards, botón crear |
| `opportunities.search.spec.ts` | Filtro por texto, por tipo, limpiar filtros |
| `opportunities.detail.spec.ts` | Navegación al detalle, campos visibles, botones |
| `opportunities.create.spec.ts` | Formulario, validación, redirección post-creación |
| `opportunities.edit.spec.ts` | Carga de datos, edición, persistencia del cambio |
| `opportunities.delete.spec.ts` | Eliminación desde lista y desde detalle |

### Relación entre stack y calidad

- **TypeScript** en frontend y backend detecta errores de tipo antes de llegar a tests.
- **class-validator** en NestJS valida el esquema de los DTOs en el servidor, reduciendo tests de validación necesarios en E2E.
- **data-testid** en todos los elementos interactivos hace los selectores de Playwright estables e independientes del CSS.
