# Proyecto - Supuestos y Dependencias

## Supuestos generales

1. **Usuarios autenticados pueden publicar**: En Entrega 1, cualquier usuario registrado puede crear, editar y eliminar oportunidades. En entregas futuras se implementará control por roles.

2. **Base de datos PostgreSQL disponible**: Se asume acceso a una instancia PostgreSQL (local o Railway). El esquema se crea automáticamente con `synchronize: true` en entorno de desarrollo.

3. **Un equipo de 4 personas**: El documento de entrega indica equipos de 3, pero el equipo tiene 4 integrantes. Se asume que esto es aceptado por el docente (verificado).

4. **Jest para Entrega 1**: Se eligió Jest como herramienta de testing para Entrega 1, cubriendo tests unitarios de servicios backend y componentes frontend. Los tests E2E con Playwright están planificados para Entrega 3.

5. **Monorepo**: El proyecto usa un repositorio único con `npm workspaces`. Los CIs y despliegues apuntan a subcarpetas `apps/frontend` y `apps/backend`.

6. **Railway/Vercel gratuitos para MVP**: Se usan los planes gratuitos de Railway y Vercel. Si se necesita más capacidad o dominios custom, se debe upgradar.

7. **Sin manejo de archivos en Entrega 1**: Las imágenes o adjuntos en oportunidades no están implementados en Entrega 1.

## Dependencias externas

| Dependencia | Tipo | Riesgo | Mitigación |
|---|---|---|---|
| Railway (backend + DB) | Hosting | Límites del plan gratuito | Monitorear uso; apagar cuando no se use |
| Vercel (frontend) | Hosting | Límites del plan gratuito | Proyecto académico, dentro de límites |
| GitHub (org + repo) | Control de versiones | Bajo | Plan free es suficiente |
| JIRA (Atlassian) | Gestión de proyecto | Límite de 10 usuarios en plan free | El equipo es de 4, OK |
| npm packages | Dependencias de código | Vulnerabilidades de seguridad | `npm audit` en CI |
| PostgreSQL | BD | Caída del servicio Railway | Solo impacta demos |
| Node.js >= 18 | Runtime | Versión incorrecta en máquina local | Documentado en README |

## Limitaciones técnicas conocidas

- **`synchronize: true`** en TypeORM solo se usa en desarrollo. En producción se deben usar migrations.
- El **CORS** del backend permite solo `localhost:5173` y `FRONTEND_URL`. Agregar la URL de Vercel en la variable de entorno al desplegar.
- El **JWT** no tiene refresh token. Expira en 7 días (configurable con `JWT_EXPIRATION`).
- Los **tests Jest** del backend usan mocks del repositorio TypeORM — no requieren base de datos para ejecutar.
