# Proyecto - Evidencias

> Esta página se actualiza con cada entrega. Las evidencias incluyen capturas de pantalla, resultados de pruebas, links a PRs y releases.

---

## Entrega 1

### Resumen

**Fecha de entrega:** 1 de mayo de 2026  
**Estado:** ✅ COMPLETADO  
**Versión:** v1.0-entrega1

Entrega 1 incluye el MVP completo con CRUD de oportunidades, autenticación con JWT, y suite de pruebas unitarias con Jest.

---

### Resultados de tests Jest

**Total: 37/37 tests pasando ✓**

#### Backend (`apps/backend`)
```
 PASS  src/auth/auth.service.spec.ts
 PASS  src/opportunities/opportunities.service.spec.ts
 PASS  src/app.controller.spec.ts

Test Suites: 3 passed, 3 total
Tests:       16 passed, 16 total
Snapshots:   0 total
Time:        0.663 s
```

**Cobertura:** AuthService (register, login) + OpportunitiesService (CRUD con filtros)

#### Frontend (`apps/frontend`)
```
 PASS  src/components/OpportunityCard.test.tsx
 PASS  src/components/SearchBar.test.tsx
 PASS  src/api/opportunities.test.ts

Test Suites: 3 passed, 3 total
Tests:       21 passed, 21 total
Snapshots:   0 total
Time:        0.628 s
```

**Cobertura:** Componentes React (OpportunityCard, SearchBar) + Cliente HTTP (axios mockeado)

---

### Capturas de pantalla

> _Agregar capturas de la aplicación corriendo._

| Pantalla | Captura |
|---|---|
| Lista de oportunidades | [pendiente] |
| Formulario crear oportunidad | [pendiente] |
| Detalle de oportunidad | [pendiente] |
| Formulario editar | [pendiente] |
| Login / Register | [pendiente] |

---

### Tablero JIRA

> _Agregar captura del board con historias completadas (KAN-4 a KAN-13)._

Estado actual: **Todos los tickets en DONE** ✓

---

### Commits realizados en Entrega 1

| Commit | Descripción |
|---|---|
| KAN-4 | RULES.md — Guía para asistentes IA |
| KAN-5 | Tests Jest — Backend (AuthService + OpportunitiesService) |
| KAN-6 | Configuración Jest — Frontend (babel, jsdom, setupTests) |
| KAN-7 | Tests Jest — Frontend (componentes + API client) |
| KAN-8 | Rediseño UI — Sistema CSS con tokens de diseño |
| KAN-9 | CI GitHub Actions — Reemplazo Playwright por Jest |
| KAN-10 | Documentación actualizada — Wiki + README |
| KAN-11 | Update README — Setup instructions completo |
| KAN-12 | Update README — GitHub Wiki y Release links |
| KAN-13 | Update docs — Entrega 1 spec y tema 2 |

---

### Release

- **Tag:** `v1.0-entrega1`
- **Commit:** `29eaca4` KAN-12: Update README with GitHub Wiki and Release links
- **Link:** [GitHub Release v1.0-entrega1](https://github.com/CampusLink-INF301/CampusLink/releases/tag/v1.0-entrega1)
- **Download:** [Source code (zip)](https://github.com/CampusLink-INF301/CampusLink/archive/refs/tags/v1.0-entrega1.zip)
