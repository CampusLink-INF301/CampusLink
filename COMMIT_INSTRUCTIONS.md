# Instrucciones de Commits — CampusLink Reestructuración

## Contexto para el asistente IA

Este documento contiene instrucciones exactas para realizar **10 commits secuenciales** sobre el repositorio CampusLink. El repositorio ya contiene todos los archivos en su estado final (fue entregado como ZIP). Tu tarea es ejecutar los commits en el orden indicado, añadiendo exactamente los archivos especificados en cada uno.

**Reglas importantes:**
- Ejecuta los commits **en orden numérico estricto** (1 → 2 → 3 ...).
- En cada commit, haz `git add` **solo** de los archivos listados en esa sección — nada más.
- Usa el mensaje de commit **exactamente como está escrito**.
- Algunos archivos están marcados como `[NUEVO]` — son archivos que no existían antes; igual se añaden con `git add` normal.
- No ejecutes `git push` hasta que el usuario te lo indique.
- Si un archivo listado no existe en el disco, avisa al usuario antes de continuar.

---

## COMPAÑERO A — Commits 1 al 5

---

### Commit 1 — Modelo de datos, enums y tipos compartidos

**Descripción:** Se actualizan las entidades del backend para añadir el campo `suspended` en usuarios, reemplazar `isActive: boolean` por el enum `OpportunityStatus` en oportunidades, y actualizar los estados de postulaciones. Se añade el helper `normalizeSearch`. Los tipos del frontend se sincronizan con estos cambios.

**Archivos a incluir:**

```
apps/backend/src/auth/entities/user.entity.ts
apps/backend/src/opportunities/entities/opportunity.entity.ts
apps/backend/src/applications/entities/application.entity.ts
apps/backend/src/common/util/text.ts           [NUEVO]
apps/frontend/src/types/opportunity.ts
apps/frontend/src/types/application.ts
apps/backend/package.json
apps/frontend/package.json
package-lock.json
```

**Comandos a ejecutar:**
```bash
git add apps/backend/src/auth/entities/user.entity.ts
git add apps/backend/src/opportunities/entities/opportunity.entity.ts
git add apps/backend/src/applications/entities/application.entity.ts
git add apps/backend/src/common/util/text.ts
git add apps/frontend/src/types/opportunity.ts
git add apps/frontend/src/types/application.ts
git add apps/backend/package.json
git add apps/frontend/package.json
git add package-lock.json
git commit -m "feat: modelo de datos, enums y tipos compartidos"
```

---

### Commit 2 — RBAC: decorador de roles, guard y validación de registro

**Descripción:** Se implementa el control de acceso basado en roles. Se crean el decorador `@Roles()` y el `RolesGuard` que rechaza usuarios sin el rol correcto o suspendidos. El `JwtStrategy` ahora consulta la BD para incluir `suspended` en el token. El registro rechaza el rol `ADMIN`. El frontend añade un interceptor en el cliente HTTP para manejar 401/403, y el Navbar oculta opciones según el rol.

**Archivos a incluir:**

```
apps/backend/src/auth/roles.decorator.ts       [NUEVO]
apps/backend/src/auth/roles.guard.ts           [NUEVO]
apps/backend/src/auth/jwt.strategy.ts
apps/backend/src/auth/dto/register.dto.ts
apps/backend/src/auth/auth.service.ts
apps/backend/src/auth/auth.controller.ts
apps/frontend/src/api/client.ts
apps/frontend/src/api/auth.ts
apps/frontend/src/components/Navbar.tsx
```

**Comandos a ejecutar:**
```bash
git add apps/backend/src/auth/roles.decorator.ts
git add apps/backend/src/auth/roles.guard.ts
git add apps/backend/src/auth/jwt.strategy.ts
git add apps/backend/src/auth/dto/register.dto.ts
git add apps/backend/src/auth/auth.service.ts
git add apps/backend/src/auth/auth.controller.ts
git add apps/frontend/src/api/client.ts
git add apps/frontend/src/api/auth.ts
git add apps/frontend/src/components/Navbar.tsx
git commit -m "feat: RBAC con decorador de roles, guard y validación de registro"
```

---

### Commit 3 — Validaciones de postulación y transiciones lazy de estado

**Descripción:** El servicio de postulaciones valida que la oportunidad esté `DISPONIBLE` y con deadline futuro al postular. Permite cancelar postulaciones y reactiva postulaciones canceladas previas en lugar de fallar. Se añade `applyDeadlineTransitions` para transicionar oportunidades a `EN_EVALUACION` cuando su deadline vence (ejecutado de forma lazy en cada lectura). El perfil del estudiante muestra el botón de cancelación.

**Archivos a incluir:**

```
apps/backend/src/opportunities/opportunities.transitions.ts   [NUEVO]
apps/backend/src/opportunities/opportunities.module.ts
apps/backend/src/applications/applications.service.ts
apps/backend/src/applications/applications.controller.ts
apps/frontend/src/api/applications.ts
apps/frontend/src/pages/profile/ProfilePage.tsx
```

**Comandos a ejecutar:**
```bash
git add apps/backend/src/opportunities/opportunities.transitions.ts
git add apps/backend/src/opportunities/opportunities.module.ts
git add apps/backend/src/applications/applications.service.ts
git add apps/backend/src/applications/applications.controller.ts
git add apps/frontend/src/api/applications.ts
git add apps/frontend/src/pages/profile/ProfilePage.tsx
git commit -m "feat: validaciones de postulación y transiciones lazy de estado"
```

---

### Commit 4 — Historial del publicador con filtros y paginación

**Descripción:** Docentes e instituciones pueden ver sus oportunidades publicadas en `/my-opportunities` con búsqueda, filtros por tipo/estado, ordenamiento y paginación. Se añade el endpoint `GET /opportunities/mine`. La lista pública pasa a scroll infinito (offset/limit). El detalle de oportunidad oculta el botón "Postular" cuando el estado no es `DISPONIBLE`.

**Archivos a incluir:**

```
apps/backend/src/opportunities/dto/publisher-history.dto.ts   [NUEVO]
apps/backend/src/opportunities/dto/create-opportunity.dto.ts
apps/backend/src/opportunities/opportunities.service.ts
apps/backend/src/opportunities/opportunities.controller.ts
apps/frontend/src/pages/opportunities/PublisherHistoryPage.tsx [NUEVO]
apps/frontend/src/App.tsx
apps/frontend/src/api/opportunities.ts
apps/frontend/src/pages/opportunities/OpportunitiesListPage.tsx
apps/frontend/src/pages/opportunities/OpportunityDetailPage.tsx
```

**Comandos a ejecutar:**
```bash
git add apps/backend/src/opportunities/dto/publisher-history.dto.ts
git add apps/backend/src/opportunities/dto/create-opportunity.dto.ts
git add apps/backend/src/opportunities/opportunities.service.ts
git add apps/backend/src/opportunities/opportunities.controller.ts
git add apps/frontend/src/pages/opportunities/PublisherHistoryPage.tsx
git add apps/frontend/src/App.tsx
git add apps/frontend/src/api/opportunities.ts
git add apps/frontend/src/pages/opportunities/OpportunitiesListPage.tsx
git add apps/frontend/src/pages/opportunities/OpportunityDetailPage.tsx
git commit -m "feat: historial del publicador con filtros, ordenamiento y paginación"
```

---

### Commit 5 — Listado de postulantes, selección y feedback

**Descripción:** Los publicadores pueden ver quiénes postularon a cada oportunidad en estado `EN_EVALUACION`, seleccionar aceptados y finalizar el proceso. Los no seleccionados quedan como `NO_SELECCIONADO` y la oportunidad pasa a `FINALIZADO` (o `DESIERTA` si no hay aceptados). Después de finalizar, el publicador puede añadir feedback individual a cada postulación.

**Archivos a incluir:**

```
apps/backend/src/applications/dto/finalize-opportunity.dto.ts [NUEVO]
apps/backend/src/applications/dto/feedback.dto.ts             [NUEVO]
apps/frontend/src/pages/opportunities/OpportunityApplicantsPage.tsx [NUEVO]
```

**Comandos a ejecutar:**
```bash
git add apps/backend/src/applications/dto/finalize-opportunity.dto.ts
git add apps/backend/src/applications/dto/feedback.dto.ts
git add apps/frontend/src/pages/opportunities/OpportunityApplicantsPage.tsx
git commit -m "feat: listado de postulantes, selección, finalización y feedback"
```

---

## COMPAÑERO B — Commits 6 al 10

---

### Commit 6 — Búsqueda sin tildes, scroll infinito y aviso de deadline

**Descripción:** La búsqueda de oportunidades usa `searchText ILIKE` con normalización de tildes para que "practica" encuentre "Práctica". La lista pública usa `IntersectionObserver` para carga infinita. El `SearchBar` tiene debounce de 300ms. Se añade el componente `DeadlineWarning` que muestra un contador regresivo cuando quedan menos de 60 minutos para el cierre.

**Archivos a incluir:**

```
apps/backend/src/opportunities/dto/query-opportunity.dto.ts
apps/backend/src/applications/dto/query-application.dto.ts    [NUEVO]
apps/frontend/src/components/SearchBar.tsx
apps/frontend/src/components/DeadlineWarning.tsx              [NUEVO]
```

**Comandos a ejecutar:**
```bash
git add apps/backend/src/opportunities/dto/query-opportunity.dto.ts
git add apps/backend/src/applications/dto/query-application.dto.ts
git add apps/frontend/src/components/SearchBar.tsx
git add apps/frontend/src/components/DeadlineWarning.tsx
git commit -m "feat: búsqueda sin tildes, scroll infinito y aviso de deadline"
```

---

### Commit 7 — Módulo de administración (backend)

**Descripción:** Se crea el módulo `admin` con endpoints protegidos por rol `ADMIN`: listar/buscar usuarios con paginación, suspender/reactivar usuarios, listar todas las oportunidades y bloquear/desbloquear oportunidades. Se añade un script `seed-admin.ts` para crear el usuario administrador inicial desde variables de entorno.

**Archivos a incluir:**

```
apps/backend/src/admin/admin.module.ts      [NUEVO]
apps/backend/src/admin/admin.service.ts     [NUEVO]
apps/backend/src/admin/admin.controller.ts  [NUEVO]
apps/backend/src/admin/seed-admin.ts        [NUEVO]
apps/backend/src/app.module.ts
```

**Comandos a ejecutar:**
```bash
git add apps/backend/src/admin/admin.module.ts
git add apps/backend/src/admin/admin.service.ts
git add apps/backend/src/admin/admin.controller.ts
git add apps/backend/src/admin/seed-admin.ts
git add apps/backend/src/app.module.ts
git commit -m "feat: módulo de administración backend con gestión de usuarios y oportunidades"
```

---

### Commit 8 — Panel de administración (frontend)

**Descripción:** Se añaden las páginas `/admin/users` y `/admin/opportunities` accesibles solo para el rol `admin`. Desde `/admin/users` se puede buscar, paginar y suspender/reactivar usuarios. Desde `/admin/opportunities` se pueden ver todas las oportunidades (todos los estados) y bloquear/desbloquear. El Navbar muestra los links de administración solo al rol `admin`.

**Archivos a incluir:**

```
apps/frontend/src/api/admin.ts                          [NUEVO]
apps/frontend/src/pages/admin/AdminUsersPage.tsx        [NUEVO]
apps/frontend/src/pages/admin/AdminOpportunitiesPage.tsx [NUEVO]
```

**Comandos a ejecutar:**
```bash
git add apps/frontend/src/api/admin.ts
git add apps/frontend/src/pages/admin/AdminUsersPage.tsx
git add apps/frontend/src/pages/admin/AdminOpportunitiesPage.tsx
git commit -m "feat: panel de administración frontend para usuarios y oportunidades"
```

---

### Commit 9 — Tests unitarios backend

**Descripción:** Se añaden y actualizan los tests del backend: `RolesGuard` (permite por rol, deniega por rol incorrecto, deniega por suspendido), `AdminService` (findUsers, suspendUser, findOpportunities, blockOpportunity), `OpportunitiesService` (findAvailable con filtros y paginación, findByPublisher, applyDeadlineTransitions), `ApplicationsService` (state machine completa: postular → cancelar → re-postular, finalize, setFeedback).

**Archivos a incluir:**

```
apps/backend/src/auth/roles.guard.spec.ts               [NUEVO]
apps/backend/src/admin/admin.service.spec.ts            [NUEVO]
apps/backend/src/opportunities/opportunities.service.spec.ts
apps/backend/src/applications/applications.service.spec.ts
apps/backend/src/auth/auth.service.spec.ts
apps/backend/src/main.ts
```

**Comandos a ejecutar:**
```bash
git add apps/backend/src/auth/roles.guard.spec.ts
git add apps/backend/src/admin/admin.service.spec.ts
git add apps/backend/src/opportunities/opportunities.service.spec.ts
git add apps/backend/src/applications/applications.service.spec.ts
git add apps/backend/src/auth/auth.service.spec.ts
git add apps/backend/src/main.ts
git commit -m "test: cobertura de tests unitarios backend"
```

---

### Commit 10 — Tests frontend y configuración de linting

**Descripción:** Se añaden tests de componentes y páginas frontend: `DeadlineWarning` (countdown, expiración, callback), `OpportunitiesListPage` (scroll infinito, filtros), `ProfilePage` (filtros, feedback, cancelar postulación). Se actualizan los tests existentes de `OpportunityCard` y `opportunities.api`. Se ajustan las configuraciones de ESLint de backend y frontend.

**Archivos a incluir:**

```
apps/frontend/src/components/DeadlineWarning.test.tsx              [NUEVO]
apps/frontend/src/pages/opportunities/OpportunitiesListPage.test.tsx [NUEVO]
apps/frontend/src/pages/profile/ProfilePage.test.tsx               [NUEVO]
apps/frontend/src/components/OpportunityCard.test.tsx
apps/frontend/src/api/opportunities.test.ts
apps/backend/eslint.config.mjs
apps/frontend/eslint.config.js
```

**Comandos a ejecutar:**
```bash
git add apps/frontend/src/components/DeadlineWarning.test.tsx
git add apps/frontend/src/pages/opportunities/OpportunitiesListPage.test.tsx
git add apps/frontend/src/pages/profile/ProfilePage.test.tsx
git add apps/frontend/src/components/OpportunityCard.test.tsx
git add apps/frontend/src/api/opportunities.test.ts
git add apps/backend/eslint.config.mjs
git add apps/frontend/eslint.config.js
git commit -m "test: tests frontend y ajustes de configuración de linting"
```

---

## Verificación final (opcional)

Una vez aplicados todos los commits correspondientes, el asistente puede verificar con:

```bash
# Ver el historial de commits realizados
git log --oneline

# Verificar que no quedan archivos sin commitear
git status
```

Si `git status` muestra archivos sin commitear después del último commit asignado, **no los añadas** — pertenecen al otro compañero o ya fueron incluidos.
