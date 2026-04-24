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
| Video Entrega 1 | _[pendiente — agregar link YouTube]_ |
| Wiki del proyecto | _[pendiente — agregar link GitHub Wiki]_ |
| Tablero JIRA | _[pendiente — agregar link JIRA]_ |
| Servidor Discord | _[pendiente — agregar link Discord]_ |
| Release v1.0-entrega1 | _[pendiente — agregar link Release]_ |
| Frontend (Vercel) | _[pendiente — agregar URL Vercel]_ |
| Backend (Railway) | _[pendiente — agregar URL Railway]_ |

---

## Tecnologías

| Capa | Tecnología |
|---|---|
| Frontend | React 19 + Vite + TypeScript |
| Backend | NestJS + TypeORM |
| Base de datos | PostgreSQL |
| Hosting frontend | Vercel |
| Hosting backend/DB | Railway |
| Testing | Playwright (E2E) |
| Control de versiones | Git + GitFlow |
| Gestión del proyecto | JIRA (Kanban) |
| Comunicación | Discord |

---

## Instalación y ejecución local

### Prerequisitos

- Node.js >= 18
- PostgreSQL corriendo localmente (o usar la URL de Railway)
- Git

### 1. Clonar el repositorio

```bash
git clone https://github.com/<org>/campuslink.git
cd campuslink
```

### 2. Configurar el backend

```bash
cd apps/backend
cp .env.example .env
# Editar .env con tus credenciales de base de datos
npm install
```

Crear la base de datos en PostgreSQL:

```sql
CREATE DATABASE campuslink;
```

Iniciar el backend (el esquema se crea automáticamente con `synchronize: true` en desarrollo):

```bash
npm run start:dev
# El backend queda en http://localhost:3000
```

### 3. Configurar el frontend

```bash
cd apps/frontend
# Opcional: crear .env.local si el backend no corre en localhost:3000
# echo "VITE_API_URL=http://localhost:3000/api" > .env.local
npm install
npm run dev
# El frontend queda en http://localhost:5173
```

---

## Cómo ejecutar los tests (Playwright E2E)

> Requiere que tanto el backend como el frontend estén corriendo antes de ejecutar.

```bash
# Terminal 1 — backend
cd apps/backend && npm run start:dev

# Terminal 2 — frontend (Playwright lo inicia automáticamente, pero puedes dejarlo corriendo)
cd apps/frontend

# Terminal 3 — tests
cd apps/frontend
npm run test:e2e

# Ver reporte HTML
npm run test:e2e:report
```

Los tests cubren:
- Listar oportunidades
- Buscar y filtrar por tipo/texto
- Ver detalle de oportunidad
- Crear nueva oportunidad
- Editar oportunidad existente
- Eliminar oportunidad

---

## Estructura del proyecto

```
campuslink/
├── apps/
│   ├── frontend/               # React + Vite + TypeScript
│   │   ├── src/
│   │   │   ├── api/            # Clientes HTTP (axios)
│   │   │   ├── components/     # Componentes reutilizables
│   │   │   ├── pages/          # Páginas por ruta
│   │   │   └── types/          # Tipos TypeScript
│   │   ├── tests/              # Tests Playwright E2E
│   │   └── playwright.config.ts
│   └── backend/                # NestJS + TypeORM
│       └── src/
│           ├── opportunities/  # Módulo CRUD principal
│           └── auth/           # Módulo de autenticación JWT
├── docs/                       # Documentación adicional
│   └── jira-stories.md         # Historias de usuario listas para JIRA
├── .github/workflows/          # GitHub Actions CI
├── .gitignore
├── LICENSE                     # MIT
└── README.md
```

---

## Flujo GitFlow

```
main          ← código estable (releases)
develop       ← integración continua
feature/KAN-XX-nombre  ← por historia de usuario
release/v1.0  ← preparación de entrega
```

**Convención de commits:** `KAN-XX: descripción breve` (vincula con JIRA)

---

## Licencia

MIT License — ver [LICENSE](LICENSE)

---

## Información de contacto y contribución

Este proyecto fue desarrollado en el contexto del curso **INF-301** (Pruebas de Software), 2026.

Para reportar problemas o contribuir, abrir un Issue o Pull Request en este repositorio.  
Para comunicación del equipo: [Servidor Discord](<!-- link Discord -->) 
