# Proyecto - Estrategia de Pruebas

## Enfoque global

La estrategia de pruebas de CampusLink se construye de forma incremental a lo largo de las 3 entregas:

| Entrega | Tipo de pruebas | Herramienta | Cobertura objetivo |
|---|---|---|---|
| Entrega 1 | Unitarios | Jest | Servicios backend + componentes frontend |
| Entrega 2 | Unitarios + Integración | Jest + Supertest | Postulaciones, roles, notificaciones |
| Entrega 3 | E2E (End-to-End) | Playwright | Flujos completos desde el navegador |

---

## Entrega 1 — Tests unitarios con Jest

### Filosofía

Los tests unitarios verifican que cada pieza de lógica funciona correctamente de forma aislada. Se prioriza cubrir los servicios del backend (donde vive la lógica de negocio) y los componentes del frontend (comportamiento del usuario).

### Suite de tests — Backend (`apps/backend/src/`)

| Archivo | Qué prueba |
|---|---|
| `opportunities/opportunities.service.spec.ts` | `findAll` con filtros, `findOne`, `create`, `update`, `remove` |
| `auth/auth.service.spec.ts` | `register` (éxito y email duplicado), `login` (éxito, usuario no existe, contraseña incorrecta) |

### Suite de tests — Frontend (`apps/frontend/src/`)

| Archivo | Qué prueba |
|---|---|
| `components/OpportunityCard.test.tsx` | Render, título, tipo, descripción, deadline, botón eliminar, callback |
| `components/SearchBar.test.tsx` | Submit con texto, filtro por tipo, botón limpiar |
| `api/opportunities.test.ts` | `getAll`, `getById`, `create`, `update`, `remove` (mock axios) |

### Cómo ejecutar

```bash
# Backend
cd apps/backend
npm test

# Frontend
cd apps/frontend
npm test

# Con cobertura
npm run test:coverage
```

### Resultado esperado

```
Backend:
  OpportunitiesService
    ✓ findAll sin filtros
    ✓ findAll con tipo
    ✓ findAll con search
    ✓ findOne encontrado
    ✓ findOne lanza NotFoundException
    ✓ create
    ✓ update
    ✓ update lanza NotFoundException
    ✓ remove
    ✓ remove lanza NotFoundException

  AuthService
    ✓ register éxito
    ✓ register lanza ConflictException
    ✓ login éxito
    ✓ login usuario no encontrado
    ✓ login contraseña incorrecta

Frontend:
  OpportunityCard
    ✓ renderiza título
    ✓ renderiza tipo
    ✓ renderiza descripción
    ✓ trunca descripción larga
    ✓ no muestra botón eliminar sin onDelete
    ✓ muestra botón eliminar con onDelete
    ✓ llama onDelete con id correcto
    ✓ renderiza deadline
    ✓ no renderiza deadline si no hay

  SearchBar
    ✓ renderiza inputs
    ✓ llama onSearch al enviar
    ✓ llama onSearch con tipo seleccionado
    ✓ limpiar resetea y llama onSearch

  opportunitiesApi
    ✓ getAll sin params
    ✓ getAll con params
    ✓ getById
    ✓ create
    ✓ update
    ✓ remove
```

### Selectores `data-testid`

Todos los elementos interactivos tienen `data-testid` para que los selectores sean:
- Independientes del CSS
- Independientes del texto visible
- Semánticos y mantenibles

---

## Entrega 2 — Tests de integración

Se agregarán:
- Tests de integración de endpoints con **Supertest** (backend real con base de datos de test)
- Ampliación de tests unitarios para módulo de postulaciones y roles
- Cobertura mínima del 70% en servicios

---

## Entrega 3 — E2E con Playwright

Se agregarán:
- Tests end-to-end que ejecutan acciones reales en el navegador
- Flujos completos: registro → login → crear oportunidad → postular → gestionar estado
- Tests de accesibilidad
- Cobertura multi-browser: Chromium, Firefox, WebKit

### Configuración futura de Playwright

- **Browsers:** Chromium, Firefox, WebKit
- **Timeout:** 30 segundos por test
- **Retries:** 1 reintento en fallos
- **Screenshots:** Solo en fallos
- **Reporte:** HTML en `playwright-report/`
