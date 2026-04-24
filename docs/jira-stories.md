# Historias de Usuario — CampusLink (Entrega 1)
**Proyecto JIRA:** CampusLink · **Clave:** `KAN`  
**Board:** Kanban — columnas: `Backlog · To Do · In Progress · In Review · Done`

> Instrucciones: copiar cada historia en JIRA como "Story". Agregar la estimación (campo Story Points o Time Estimate). Cuando hagas commits o branches, usar el prefijo `KAN-XX` para que JIRA los vincule automáticamente.

---

## KAN-1 — Listar oportunidades disponibles

**Historia:**  
Como estudiante, quiero ver una lista de todas las oportunidades disponibles para poder explorar qué está publicado en la plataforma.

**Criterios de aceptación:**
- [ ] Se muestra una lista de oportunidades al ingresar a `/opportunities`.
- [ ] Cada oportunidad muestra: tipo, título y descripción resumida.
- [ ] La lista está ordenada por fecha de publicación (más reciente primero).
- [ ] Si no hay oportunidades, se muestra el mensaje "No hay oportunidades disponibles."
- [ ] La lista carga en menos de 3 segundos.

**Estimación:** 3h  
**Prioridad:** Alta  

---

## KAN-2 — Buscar y filtrar oportunidades

**Historia:**  
Como estudiante, quiero buscar oportunidades por nombre y filtrar por tipo para encontrar rápidamente lo que me interesa.

**Criterios de aceptación:**
- [ ] Existe un campo de búsqueda por texto que filtra por título.
- [ ] Existe un selector de tipo (tutoría, trabajo, práctica, etc.).
- [ ] Al hacer clic en "Buscar" se actualiza la lista según los filtros aplicados.
- [ ] El botón "Limpiar" resetea todos los filtros y muestra todas las oportunidades.
- [ ] La búsqueda no distingue mayúsculas de minúsculas.

**Estimación:** 3h  
**Prioridad:** Alta  

---

## KAN-3 — Ver detalle de una oportunidad

**Historia:**  
Como estudiante, quiero ver el detalle completo de una oportunidad para evaluar si me conviene postular.

**Criterios de aceptación:**
- [ ] Al hacer clic en el título de una oportunidad, se navega a la página de detalle.
- [ ] El detalle muestra: tipo, título, descripción completa, requisitos y fecha límite.
- [ ] Se muestra la fecha de publicación.
- [ ] Hay un botón para volver a la lista.
- [ ] Los botones de Editar y Eliminar son visibles en el detalle.

**Estimación:** 2h  
**Prioridad:** Alta  

---

## KAN-4 — Publicar nueva oportunidad

**Historia:**  
Como docente o publicador, quiero crear una nueva oportunidad para que los estudiantes puedan verla y postular.

**Criterios de aceptación:**
- [ ] Existe un formulario con campos: título (obligatorio), tipo (obligatorio), descripción (obligatorio), requisitos (opcional), fecha límite (opcional).
- [ ] Al enviar el formulario con datos válidos, la oportunidad aparece en la lista.
- [ ] Después de crear, se redirige al detalle de la nueva oportunidad.
- [ ] Si el formulario tiene campos obligatorios vacíos, no se envía y se muestra validación.
- [ ] El formulario es accesible desde el botón "+ Nueva oportunidad".

**Estimación:** 4h  
**Prioridad:** Alta  

---

## KAN-5 — Editar oportunidad existente

**Historia:**  
Como publicador, quiero editar una oportunidad publicada para corregir información o actualizar detalles.

**Criterios de aceptación:**
- [ ] Desde el detalle de una oportunidad, hay un botón "Editar".
- [ ] El formulario de edición carga los datos actuales de la oportunidad.
- [ ] Al guardar los cambios, se actualiza la oportunidad y se redirige al detalle.
- [ ] Los cambios guardados se reflejan inmediatamente en la vista de detalle.
- [ ] Se puede cancelar sin guardar, volviendo atrás con el navegador.

**Estimación:** 3h  
**Prioridad:** Alta  

---

## KAN-6 — Eliminar oportunidad

**Historia:**  
Como publicador, quiero eliminar una oportunidad publicada para mantener la plataforma limpia y actualizada.

**Criterios de aceptación:**
- [ ] Hay un botón "Eliminar" tanto en la lista como en el detalle de cada oportunidad.
- [ ] Al hacer clic en "Eliminar", se muestra una confirmación antes de proceder.
- [ ] Si se confirma, la oportunidad es removida de la base de datos y de la lista.
- [ ] Después de eliminar desde el detalle, se redirige a `/opportunities`.
- [ ] La oportunidad eliminada ya no aparece en búsquedas.

**Estimación:** 2h  
**Prioridad:** Alta  

---

## KAN-7 — Registro e inicio de sesión de usuario

**Historia:**  
Como visitante, quiero registrarme e iniciar sesión para identificarme en la plataforma y publicar oportunidades.

**Criterios de aceptación:**
- [ ] El formulario de registro solicita: nombre, email y contraseña (mínimo 6 caracteres).
- [ ] Si el email ya existe, se muestra un error descriptivo.
- [ ] El formulario de login acepta email + contraseña y devuelve un token JWT.
- [ ] Si las credenciales son inválidas, se muestra "Credenciales inválidas."
- [ ] Al iniciar sesión exitosamente, el usuario es redirigido a `/opportunities`.
- [ ] El token se almacena en `localStorage` y se envía en headers de las peticiones.

**Estimación:** 5h  
**Prioridad:** Media  

---

## KAN-8 — Configurar CI/CD y entornos cloud

**Historia:**  
Como equipo de desarrollo, quiero configurar CI/CD y despliegue automático para que cada push a `develop` ejecute las pruebas y cada merge a `main` despliegue en producción.

**Criterios de aceptación:**
- [ ] GitHub Actions ejecuta build + tests en cada push a `develop` y PR a `main`.
- [ ] El backend está desplegado en Railway con la base de datos PostgreSQL conectada.
- [ ] El frontend está desplegado en Vercel apuntando al backend de Railway.
- [ ] Las variables de entorno sensibles están configuradas en Railway/Vercel (no en el repo).
- [ ] El pipeline no falla en verde con los tests actuales.

**Estimación:** 4h  
**Prioridad:** Media  

---

## KAN-9 — Configurar Playwright y escribir tests E2E del CRUD

**Historia:**  
Como equipo de QA, quiero tener tests E2E automatizados con Playwright que cubran el flujo completo del CRUD de oportunidades para detectar regresiones rápidamente.

**Criterios de aceptación:**
- [ ] Playwright está instalado y configurado en el proyecto frontend.
- [ ] Existen tests para: listar, buscar/filtrar, ver detalle, crear, editar y eliminar oportunidades.
- [ ] Los tests usan `data-testid` para seleccionar elementos (no clases CSS ni XPath frágil).
- [ ] Los tests se pueden ejecutar con `npm run test:e2e` desde `apps/frontend`.
- [ ] Los tests pasan en verde con la aplicación corriendo localmente.
- [ ] Se genera un reporte HTML en `playwright-report/`.

**Estimación:** 5h  
**Prioridad:** Alta  

---

## KAN-10 — Documentación Wiki + README

**Historia:**  
Como equipo, quiero tener documentación completa en el README y la Wiki de GitHub para que cualquier persona pueda instalar y ejecutar el proyecto sin ayuda.

**Criterios de aceptación:**
- [ ] El README incluye: descripción, integrantes, links a video/Wiki/JIRA/Discord, instrucciones de instalación local y cómo ejecutar los tests.
- [ ] La Wiki tiene las páginas: Home, Resumen, Tecnologías, Arquitectura, Estrategia de Pruebas, Supuestos y Dependencias, Evidencias, Entrega 1.
- [ ] La página "Entrega 1" en la Wiki incluye: objetivo, alcance CRUD, cómo ejecutar, pruebas (qué/cómo/resultados), evidencia y problemas encontrados.
- [ ] El README tiene una licencia visible (MIT).
- [ ] Existe un `.gitignore` que cubre `node_modules`, `.env` y `dist`.

**Estimación:** 3h  
**Prioridad:** Alta  

---

## Resumen del Sprint (Entrega 1)

| ID | Historia | Estimación | Prioridad |
|---|---|---|---|
| KAN-1 | Listar oportunidades | 3h | Alta |
| KAN-2 | Buscar y filtrar | 3h | Alta |
| KAN-3 | Ver detalle | 2h | Alta |
| KAN-4 | Publicar oportunidad | 4h | Alta |
| KAN-5 | Editar oportunidad | 3h | Alta |
| KAN-6 | Eliminar oportunidad | 2h | Alta |
| KAN-7 | Registro/login | 5h | Media |
| KAN-8 | CI/CD + cloud | 4h | Media |
| KAN-9 | Tests Playwright | 5h | Alta |
| KAN-10 | Docs Wiki + README | 3h | Alta |
| **Total** | | **34h** | |

---

## Roles del equipo sugeridos

| Integrante | Rol principal |
|---|---|
| Jose Meza | Líder de equipo + Backend (NestJS) |
| Matias Barraza | Frontend (React) |
| Leonardo Chacon | QA / Playwright + CI/CD |
| Aaron Vargas | Full-stack + Documentación |

> El equipo puede ajustar roles según disponibilidad y preferencias.
