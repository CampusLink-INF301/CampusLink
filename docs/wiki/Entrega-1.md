# Entrega 1

**Fecha de entrega:** _[ver Aula Moodle]_  
**Tag GitHub:** `v1.0-entrega1`  
**Release:** _[link al Release en GitHub]_  
**Video:** _[link al video YouTube]_

---

## Objetivo de la entrega

Construir el MVP de CampusLink con las funcionalidades prioritarias de la plataforma, implementando un CRUD completo para la entidad principal (Oportunidades) y pruebas automatizadas E2E con Playwright que validen el comportamiento de la aplicación.

---

## Alcance implementado

### CRUD de Oportunidades

| Funcionalidad | Frontend | Backend | Tests |
|---|---|---|---|
| Listar oportunidades | `/opportunities` | `GET /api/opportunities` | `opportunities.list.spec.ts` |
| Buscar y filtrar | SearchBar con texto y tipo | `?search=X&type=Y` | `opportunities.search.spec.ts` |
| Ver detalle | `/opportunities/:id` | `GET /api/opportunities/:id` | `opportunities.detail.spec.ts` |
| Crear oportunidad | `/opportunities/new` | `POST /api/opportunities` | `opportunities.create.spec.ts` |
| Editar oportunidad | `/opportunities/:id/edit` | `PUT /api/opportunities/:id` | `opportunities.edit.spec.ts` |
| Eliminar oportunidad | Botón en lista y detalle | `DELETE /api/opportunities/:id` | `opportunities.delete.spec.ts` |

### Autenticación básica

- Registro de usuarios (`POST /api/auth/register`)
- Login con JWT (`POST /api/auth/login`)
- Roles definidos: estudiante, docente, institución, administrador

---

## Cómo ejecutar el sistema (local)

### Prerequisitos
- Node.js >= 18
- PostgreSQL local (o URL de Railway)

### Backend
```bash
cd apps/backend
cp .env.example .env   # Editar DATABASE_URL
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

### Prerequisito
Backend y frontend deben estar corriendo.

### Ejecutar todos los tests
```bash
cd apps/frontend
npm run test:e2e
```

### Ver reporte HTML
```bash
npm run test:e2e:report
```

### Resultado esperado
```
19 tests passed (6 specs)
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
- Playwright fue registrado como herramienta alternativa en el foro de Aula.
- En Entrega 1, cualquier usuario puede crear/editar/eliminar oportunidades (sin control por roles).
- Se usa `synchronize: true` en TypeORM en desarrollo — en producción se migra a migrations.
- La URL del backend en Vercel debe ser configurada como variable de entorno `VITE_API_URL`.
- La URL del frontend de Vercel debe ser agregada al CORS del backend como `FRONTEND_URL`.
