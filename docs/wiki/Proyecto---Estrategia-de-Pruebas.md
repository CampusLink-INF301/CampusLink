# Proyecto - Estrategia de Pruebas

## Enfoque global

La estrategia de pruebas de CampusLink se construye de forma incremental a lo largo de las 3 entregas:

| Entrega | Tipo de pruebas | Herramienta | Cobertura objetivo |
|---|---|---|---|
| Entrega 1 | E2E (End-to-End) | Playwright | CRUD completo de Oportunidades |
| Entrega 2 | E2E + Unitarios | Playwright + Vitest | Postulaciones, roles, notificaciones |
| Entrega 3 | E2E + Unitarios + Integración | Playwright + Vitest + Selenium | Flujos completos, accesibilidad |

## Entrega 1 — Pruebas E2E con Playwright

### Filosofía

Los tests E2E verifican que la aplicación funciona correctamente **desde la perspectiva del usuario final**, ejecutando acciones reales en el navegador. Se priorizan sobre tests unitarios en Entrega 1 porque el CRUD es la funcionalidad central y necesita validación de la integración completa (frontend → API → base de datos).

### Selectores

Todos los elementos interactivos tienen atributo `data-testid` para que los selectores sean:
- Independientes del CSS (no se rompen con rediseño visual)
- Independientes del texto visible (no se rompen con traducciones)
- Semánticos y mantenibles

### Suite de tests (Entrega 1)

| Archivo | Escenarios | Estado |
|---|---|---|
| `opportunities.list.spec.ts` | Carga de lista, cards visibles, botón crear | Implementado |
| `opportunities.search.spec.ts` | Filtro por texto, por tipo, limpiar | Implementado |
| `opportunities.detail.spec.ts` | Navegación, campos, botones edit/delete | Implementado |
| `opportunities.create.spec.ts` | Formulario, validación, redirect | Implementado |
| `opportunities.edit.spec.ts` | Carga datos, edición, persistencia | Implementado |
| `opportunities.delete.spec.ts` | Desde lista, desde detalle | Implementado |

### Gestión de datos de prueba

Cada spec usa helpers en `tests/helpers/api.ts` para:
- **Crear** datos de prueba via API antes de cada test (`beforeAll` / `beforeEach`)
- **Limpiar** datos después de cada test (`afterAll` / `afterEach`)

Esto garantiza que los tests sean **idempotentes** y no dejen datos basura en la BD.

### Cómo ejecutar

```bash
cd apps/frontend

# Requiere backend y frontend corriendo
npm run test:e2e

# Ver reporte HTML
npm run test:e2e:report

# Modo UI interactivo
npm run test:e2e:ui
```

### Configuración de Playwright

- **Browser:** Chromium (principal). Se puede agregar Firefox y WebKit.
- **Timeout:** 30 segundos por test.
- **Retries:** 1 reintento en caso de fallo.
- **WebServer:** Playwright inicia el servidor Vite automáticamente si no está corriendo.
- **Screenshots:** Solo en fallos.
- **Traces:** En primer reintento.
- **Reporte:** HTML en `playwright-report/`.

## Criterios de calidad

- Los tests no deben depender del orden de ejecución.
- Cada test debe ser autónomo (crea y limpia sus propios datos).
- Los tests no deben usar `page.waitForTimeout()` — usar auto-wait de Playwright.
- Los `data-testid` son contratos: no se renombran sin actualizar los tests.

## Plan para Entrega 2

Se agregarán:
- Tests unitarios de servicios NestJS con Jest
- Tests de integración de endpoints con supertest
- Tests de componentes React con Vitest + Testing Library
- Cobertura para módulo de postulaciones y roles
