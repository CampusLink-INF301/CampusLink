# Proyecto - Arquitectura y Diseño

## Diagrama general

```
┌─────────────────┐        HTTPS         ┌──────────────────────┐
│   Vercel        │ ────────────────────► │   Railway            │
│                 │                       │                       │
│  React SPA      │  GET/POST/PUT/DELETE  │  NestJS API          │
│  (Vite build)   │  /api/*               │  puerto 3000         │
│                 │                       │         │             │
└─────────────────┘                       │         ▼             │
                                          │  PostgreSQL           │
        Browser ◄──── HTML/JS/CSS         │  (Railway managed)   │
        localStorage ← JWT token          └──────────────────────┘
```

## Estructura del repositorio (monorepo)

```
campuslink/
├── apps/
│   ├── frontend/               # React + Vite + TypeScript
│   │   ├── src/
│   │   │   ├── api/            # Clientes HTTP (axios)
│   │   │   │   ├── client.ts   # Instancia axios con interceptor JWT
│   │   │   │   ├── opportunities.ts
│   │   │   │   └── auth.ts
│   │   │   ├── components/     # Componentes reutilizables
│   │   │   │   ├── Navbar.tsx
│   │   │   │   ├── OpportunityCard.tsx
│   │   │   │   ├── OpportunityForm.tsx
│   │   │   │   └── SearchBar.tsx
│   │   │   ├── pages/
│   │   │   │   ├── opportunities/
│   │   │   │   │   ├── OpportunitiesListPage.tsx
│   │   │   │   │   ├── OpportunityDetailPage.tsx
│   │   │   │   │   ├── OpportunityCreatePage.tsx
│   │   │   │   │   └── OpportunityEditPage.tsx
│   │   │   │   └── auth/
│   │   │   │       ├── LoginPage.tsx
│   │   │   │       └── RegisterPage.tsx
│   │   │   ├── types/          # Tipos TypeScript compartidos
│   │   │   └── App.tsx         # Router principal
│   │   ├── tests/              # Tests Playwright E2E
│   │   │   ├── helpers/api.ts  # Helpers para seed/reset de datos
│   │   │   ├── opportunities.list.spec.ts
│   │   │   ├── opportunities.search.spec.ts
│   │   │   ├── opportunities.detail.spec.ts
│   │   │   ├── opportunities.create.spec.ts
│   │   │   ├── opportunities.edit.spec.ts
│   │   │   └── opportunities.delete.spec.ts
│   │   └── playwright.config.ts
│   └── backend/                # NestJS
│       └── src/
│           ├── opportunities/  # Módulo CRUD principal
│           │   ├── entities/opportunity.entity.ts
│           │   ├── dto/        # CreateDto, UpdateDto, QueryDto
│           │   ├── opportunities.service.ts
│           │   ├── opportunities.controller.ts
│           │   └── opportunities.module.ts
│           ├── auth/           # Módulo autenticación JWT
│           │   ├── entities/user.entity.ts
│           │   ├── dto/        # LoginDto, RegisterDto
│           │   ├── auth.service.ts
│           │   ├── auth.controller.ts
│           │   ├── auth.module.ts
│           │   └── jwt.strategy.ts
│           ├── app.module.ts   # Módulo raíz con TypeORM config
│           └── main.ts         # Bootstrap, CORS, ValidationPipe
├── docs/
│   ├── jira-stories.md         # Historias de usuario
│   └── wiki/                   # Contenido de la Wiki de GitHub
├── .github/workflows/
│   └── ci.yml                  # GitHub Actions
├── .gitignore
├── LICENSE
└── README.md
```

## Modelo de datos (Entrega 1)

### Entidad `Opportunity`

| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | Clave primaria generada |
| title | string | Título de la oportunidad |
| description | text | Descripción detallada |
| type | enum | tutoria, trabajo, practica, etc. |
| requirements | string? | Requisitos opcionales |
| deadline | date? | Fecha límite opcional |
| isActive | boolean | Para soft-delete futuro |
| createdAt | timestamp | Fecha de creación |
| updatedAt | timestamp | Última modificación |

### Entidad `User`

| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID | Clave primaria |
| email | string (unique) | Email del usuario |
| name | string | Nombre completo |
| password | string | Hash bcrypt |
| role | enum | estudiante, docente, institucion, admin |
| createdAt | timestamp | Fecha de registro |

## Endpoints API (Entrega 1)

| Método | Ruta | Descripción |
|---|---|---|
| GET | /api/opportunities | Listar (con filtros search, type) |
| GET | /api/opportunities/:id | Ver detalle |
| POST | /api/opportunities | Crear |
| PUT | /api/opportunities/:id | Editar |
| DELETE | /api/opportunities/:id | Eliminar |
| POST | /api/auth/register | Registro |
| POST | /api/auth/login | Login → JWT |

## Rutas Frontend

| Ruta | Componente | Descripción |
|---|---|---|
| / | → redirect | Redirige a /opportunities |
| /opportunities | OpportunitiesListPage | Lista + búsqueda |
| /opportunities/new | OpportunityCreatePage | Formulario crear |
| /opportunities/:id | OpportunityDetailPage | Detalle |
| /opportunities/:id/edit | OpportunityEditPage | Formulario editar |
| /login | LoginPage | Autenticación |
| /register | RegisterPage | Registro |
