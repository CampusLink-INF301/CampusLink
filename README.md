# CampusLink — Red de Oportunidades Universitarias

CampusLink es una plataforma web para la comunidad universitaria donde estudiantes, docentes e instituciones pueden publicar, descubrir y gestionar oportunidades (tutorías, grupos de estudio, trabajos part-time, prácticas, voluntariados, investigación y más) en un solo lugar.

---

## Integrantes del Equipo

| Nombre | Rol |
|---|---|
| Jose Meza | Líder de equipo / Backend |
| Matias Barraza | Frontend |
| Leonardo Chacon | QA / Testing / CI |
| Aaron Vargas | Full-stack / Documentación |

---

## Links importantes

| Recurso | Link |
|---|---|
| 🎥 Video Entrega 1 | _[pendiente — agregar link YouTube]_ |
| 📚 Wiki del proyecto | [GitHub Wiki](https://github.com/CampusLink-INF301/CampusLink/wiki) |
| 📊 Tablero JIRA | _[pendiente — agregar link JIRA]_ |
| 💬 Servidor Discord | _[pendiente — agregar link Discord]_ |
| 🏷️ Release v1.0-entrega1 | [GitHub Release](https://github.com/CampusLink-INF301/CampusLink/releases/tag/v1.0-entrega1) |
| 🌐 Frontend (Vercel) | _[pendiente — agregar URL Vercel]_ |
| ⚙️ Backend (Railway) | _[pendiente — agregar URL Railway]_ |

---

## Tecnologías

| Capa | Tecnología |
|---|---|
| Frontend | React 19 + Vite + TypeScript |
| Backend | NestJS + TypeORM |
| Base de datos | PostgreSQL |
| Hosting frontend | Vercel |
| Hosting backend/DB | Railway |
| Testing E1 | Jest (unitarios) |
| Control de versiones | Git + GitFlow |
| Gestión del proyecto | JIRA (Kanban) |
| Comunicación | Discord |

---

## Prerequisitos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** >= 18 — [descargar](https://nodejs.org/)
- **Git** — [descargar](https://git-scm.com/)
- **PostgreSQL** >= 15 — solo si vas a usar base de datos local ([descargar](https://www.postgresql.org/download/))
  - Si usas la base de datos de Railway (nube), no necesitas instalar PostgreSQL localmente.

Verifica tus versiones:

```bash
node --version   # debe mostrar v18.x o superior
npm --version    # debe mostrar 9.x o superior
git --version
```

---

## Instalación y ejecución local

### 1. Clonar el repositorio

```bash
git clone https://github.com/CampusLink-INF301/CampusLink.git
cd CampusLink
```

### 2. Instalar dependencias

Desde la raíz del proyecto instala las dependencias de ambas aplicaciones a la vez:

```bash
npm install
```

### 3. Configurar el backend

Copia el archivo de ejemplo de variables de entorno:

```bash
cd apps/backend
cp .env.example .env
```

Edita el archivo `.env` con tus datos. Tienes dos opciones:

**Opción A — Base de datos local (PostgreSQL instalado en tu máquina):**

```env
DATABASE_URL=postgresql://postgres:tu_password@localhost:5432/campuslink
JWT_SECRET=cualquier_clave_secreta_larga
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

Luego crea la base de datos en PostgreSQL:

```bash
# En la terminal de psql o en pgAdmin:
CREATE DATABASE campuslink;
```

**Opción B — Base de datos en Railway (recomendado, no requiere PostgreSQL local):**

Solicita al líder del equipo las credenciales de Railway y pega la URL completa:

```env
DATABASE_URL=postgresql://usuario:password@host.railway.app:puerto/railway
JWT_SECRET=cualquier_clave_secreta_larga
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

> El esquema de la base de datos se crea automáticamente al iniciar el backend (`synchronize: true` en desarrollo). No es necesario correr migraciones manualmente.

### 4. Iniciar el backend

```bash
# Desde apps/backend
npm run start:dev
```

El backend queda disponible en `http://localhost:3000`. Puedes verificar que funciona accediendo a `http://localhost:3000/api/opportunities` en el navegador.

### 5. Configurar el frontend

```bash
cd apps/frontend
```

Por defecto el frontend asume que el backend corre en `http://localhost:3000`. Si ese es tu caso, no necesitas crear ningún archivo adicional.

Si el backend corre en otra URL (por ejemplo, en Railway directamente), crea el archivo `.env.local`:

```bash
echo "VITE_API_URL=http://localhost:3000/api" > .env.local
```

### 6. Iniciar el frontend

```bash
# Desde apps/frontend
npm run dev
```

El frontend queda disponible en `http://localhost:5173`.

---

## Cómo ejecutar los tests (Jest)

Los tests unitarios no requieren que el backend o la base de datos estén corriendo.

```bash
# Tests del backend (servicios NestJS — 16 tests)
cd apps/backend
npm test

# Tests del frontend (componentes React y API client — 21 tests)
cd apps/frontend
npm test

# Con reporte de cobertura
npm run test:coverage
```

**Resultado esperado:**

```
Backend:  16/16 tests pasando
Frontend: 21/21 tests pasando
```

Los tests cubren:
- `AuthService`: registro, login, manejo de errores
- `OpportunitiesService`: CRUD completo con filtros y búsqueda
- `OpportunityCard`: render, props, truncado, botón eliminar
- `SearchBar`: búsqueda por texto, filtro por tipo, limpiar
- `opportunitiesApi`: todas las llamadas HTTP (axios mockeado)

---

## Scripts disponibles

Desde la raíz del proyecto:

```bash
npm run dev:frontend      # Inicia el frontend en localhost:5173
npm run dev:backend       # Inicia el backend en localhost:3000
npm run build:frontend    # Build de producción del frontend
npm run build:backend     # Build de producción del backend
```

Desde `apps/backend`:

```bash
npm run start:dev         # Backend en modo watch (recarga automática)
npm run start:prod        # Backend en modo producción
npm test                  # Jest — tests unitarios
npm run test:cov          # Jest — tests con cobertura
```

Desde `apps/frontend`:

```bash
npm run dev               # Frontend en modo desarrollo
npm run build             # Build de producción
npm test                  # Jest — tests unitarios
npm run test:coverage     # Jest — tests con cobertura
```

---

## Estructura del proyecto

```
CampusLink/
├── apps/
│   ├── frontend/                    # React 19 + Vite + TypeScript
│   │   ├── src/
│   │   │   ├── api/                 # Clientes HTTP (axios)
│   │   │   │   ├── client.ts        # Instancia axios base
│   │   │   │   ├── opportunities.ts # Llamadas CRUD oportunidades
│   │   │   │   └── auth.ts          # Llamadas de autenticación
│   │   │   ├── components/          # Componentes reutilizables
│   │   │   │   ├── Navbar.tsx
│   │   │   │   ├── OpportunityCard.tsx
│   │   │   │   ├── OpportunityForm.tsx
│   │   │   │   └── SearchBar.tsx
│   │   │   ├── pages/               # Páginas por dominio
│   │   │   │   ├── auth/            # Login, Register
│   │   │   │   └── opportunities/   # List, Detail, Create, Edit
│   │   │   └── types/               # Interfaces TypeScript compartidas
│   │   ├── tests/                   # Tests Playwright E2E (Entrega 3)
│   │   └── babel.config.cjs         # Configuración Babel para Jest
│   │
│   └── backend/                     # NestJS + TypeORM
│       └── src/
│           ├── auth/                # Módulo JWT (register, login)
│           │   ├── auth.service.ts
│           │   ├── auth.service.spec.ts
│           │   └── ...
│           ├── opportunities/       # Módulo CRUD principal
│           │   ├── opportunities.service.ts
│           │   ├── opportunities.service.spec.ts
│           │   └── ...
│           └── app.module.ts        # Módulo raíz + configuración TypeORM
│
├── docs/
│   └── wiki/                        # Fuente de la GitHub Wiki
├── .github/workflows/               # GitHub Actions CI (Jest)
├── RULES.md                         # Guía para asistentes IA
├── .gitignore
├── LICENSE
└── README.md
```

---

## Flujo GitFlow

```
main              ← código estable (releases)
develop           ← integración continua
feature/KAN-XX    ← por historia de usuario
release/v1.0      ← preparación de entrega
```

**Convención de commits:** `KAN-XX: descripción breve` (vincula con JIRA)

---

## Licencia

MIT License — ver [LICENSE](LICENSE)

---

## Información de contacto y contribución

Este proyecto fue desarrollado en el contexto del curso **INF-301** (Pruebas de Software), 2026.

**Estado actual:** `v1.0-entrega1` (MVP + Pruebas Unitarias)  
**Próxima entrega:** Entrega 2 (E2E tests + integración)

Para reportar problemas o contribuir, abrir un Issue o Pull Request en este repositorio.

---
