# Entrega 1

**Fecha de entrega:** _[ver Aula Moodle]_  
**Tag GitHub:** `v1.0-entrega1`  
**Release:** _[link al Release en GitHub]_  
**Video:** _[link al video YouTube]_

---

## Objetivo de la entrega

Construir el MVP de CampusLink con las funcionalidades prioritarias de la plataforma, implementando un CRUD completo para la entidad principal (Oportunidades) con autenticación JWT y pruebas unitarias con Jest que validen la lógica de negocio del sistema.

---

## Alcance implementado

### CRUD de Oportunidades

| Funcionalidad | Frontend | Backend | Tests |
|---|---|---|---|
| Listar oportunidades | `/opportunities` | `GET /api/opportunities` | `opportunities.service.spec.ts` |
| Buscar y filtrar | SearchBar con texto y tipo | `?search=X&type=Y` | `opportunities.service.spec.ts` |
| Ver detalle | `/opportunities/:id` | `GET /api/opportunities/:id` | `opportunities.service.spec.ts` |
| Crear oportunidad | `/opportunities/new` | `POST /api/opportunities` | `opportunities.service.spec.ts` |
| Editar oportunidad | `/opportunities/:id/edit` | `PUT /api/opportunities/:id` | `opportunities.service.spec.ts` |
| Eliminar oportunidad | Botón en lista y detalle | `DELETE /api/opportunities/:id` | `opportunities.service.spec.ts` |

### Autenticación básica

- Registro de usuarios (`POST /api/auth/register`) — cubierto por `auth.service.spec.ts`
- Login con JWT (`POST /api/auth/login`) — cubierto por `auth.service.spec.ts`
- Roles definidos: estudiante, docente, institución, administrador

### Componentes frontend testeados

| Componente | Archivo de test |
|---|---|
| `OpportunityCard` | `components/OpportunityCard.test.tsx` |
| `SearchBar` | `components/SearchBar.test.tsx` |
| `opportunitiesApi` | `api/opportunities.test.ts` |

---

## Cómo ejecutar el sistema (local)

### Prerequisitos
- Node.js >= 18
- PostgreSQL local o URL de Railway

### Backend
```bash
cd apps/backend
cp .env.example .env   # Editar DATABASE_URL y JWT_SECRET
npm install
npm run start:dev      # http://localhost:3000
```

### Frontend
```bash
cd apps/frontend
npm install
npm run dev            # http://localhost:5173
```

---

## Pruebas — Cómo ejecutar

### Backend (tests unitarios de servicios)
```bash
cd apps/backend
npm test
```

### Frontend (tests de componentes)
```bash
cd apps/frontend
npm test
```

### Con cobertura
```bash
npm run test:coverage
```

### Resultado esperado
```
Backend:  15 tests passed
Frontend: 18 tests passed
```

---

## Evidencia

> _Completar con capturas reales antes de la entrega_

- Capturas de la app funcionando → [Evidencias](Proyecto---Evidencias.md)
- Captura del board JIRA con historias completadas
- Link al tag en GitHub: `v1.0-entrega1`
- Link a los PRs principales

---

## Problemas encontrados

> _Documentar problemas reales encontrados durante el desarrollo y cómo se resolvieron._

| Problema | Impacto | Solución |
|---|---|---|
| _[agregar]_ | — | — |

---

## Supuestos y dependencias específicas de E1

- El equipo tiene 4 integrantes (el curso indica 3) — verificado con docente.
- En Entrega 1, cualquier usuario puede crear/editar/eliminar oportunidades (sin control por roles).
- Se usa `synchronize: true` en TypeORM en desarrollo — en producción se migra a migrations.
- La URL del backend en Railway debe ser configurada como variable de entorno `VITE_API_URL` en Vercel.
- La URL del frontend de Vercel debe ser agregada al CORS del backend como `FRONTEND_URL`.
- Los tests E2E con Playwright están planificados para Entrega 3.
