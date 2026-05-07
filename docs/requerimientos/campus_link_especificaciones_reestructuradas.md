# CampusLink — Especificación estructurada

---

## Notación de requerimientos y ejemplos

Los requerimientos siguen una estructura identificable y trazable mediante IDs únicos.

### Formato general

* `[Fx.y-Rz]` → Requirement (requerimiento)
* `[Fx.y-Rz-Ek]` → Example (especificación por ejemplo asociada a un requerimiento)

Donde:

* `F` = Feature
* `x.y` = Sub-feature
* `Rz` = Número de requerimiento dentro de la sub-feature
* `Ek` = Número de ejemplo asociado al requerimiento

### Ejemplos

* `[F3.1-R1]` → Primer requerimiento de creación de oportunidad
* `[F3.1-R1-E1]` → Primer ejemplo de ese requerimiento
* `[F4.1-R3]` → Tercer requerimiento de postulaciones

### Reglas importantes

* Los IDs son únicos e inmutables.
* Un requerimiento representa una sola idea verificable.
* Un requerimiento puede tener múltiples ejemplos.
* Los ejemplos validan comportamientos específicos del requerimiento.

---

---

## Dominio del negocio

Facilitar el encuentro de oportunidades a estudiantes y publicadores de forma centralizada. Entiéndase oportunidades como tutorías, ayudantías, trabajos, prácticas, voluntariados, proyectos de investigación y grupos de estudio.

---

## Supuestos

* Debe al menos existir un administrador en el sistema.
* Los administradores se crean fuera del sistema.
* El administrador solo gestiona usuarios y oportunidades; no publica ni postula.
* Pueden existir varios administradores.
* La institución puede ser la misma universidad o departamentos de esta.
* Un ayudante es un estudiante.

---

## Usuarios

### Perfiles de usuarios

* Estudiante
* Docente
* Institución
* Administrador

### Roles

* **Publicador**: perfiles de Estudiante, Docente e Institución que pueden crear una oportunidad y gestionarla.
* **Postulante**: perfil de Estudiante que puede postular a una oportunidad.
* **Administrador**: perfil que puede gestionar todos los usuarios y oportunidades.

---

## Alcance

### Fuera de alcance

* Cumplir criterios avanzados de flexibilidad en requisitos no funcionales.

---

## Contexto del negocio

### Objetivos del negocio

* Facilitar el encuentro de oportunidades entre estudiantes y publicadores.
* Centralizar la gestión de oportunidades académicas y laborales.

---

## F1: Gestión de usuarios

### F1.1 Registro de usuarios

**Objetivos del negocio**

* Permitir el acceso y uso del sistema a distintos tipos de usuarios.

**Reglas del negocio**

* El email del usuario debe ser único.
* El usuario debe estar registrado para interactuar con el sistema.

#### Requirements

* [F1.1-R1] El sistema debe permitir registrar usuarios con nombre, email, contraseña y rol.
* [F1.1-R2] El email debe ser único.

#### Examples

| ID         | Input                                             | Resultado | Motivo          |
| ---------- | ------------------------------------------------- | --------- | --------------- |
| F1.1-R2-E1 | [test@mail.com](mailto:test@mail.com) (nuevo)     | Éxito     | Email único     |
| F1.1-R2-E2 | [test@mail.com](mailto:test@mail.com) (existente) | Error     | Email duplicado |

* [F3.4-R1] El sistema debe mostrar un historial de oportunidades del publicador.
* [F3.4-R2] El historial debe paginar resultados en bloques de 10.
* [F3.4-R3] El sistema debe permitir buscar oportunidades por nombre, tipo y estado.
* [F3.4-R4] El sistema debe permitir ordenar el historial por fecha de creación, fecha límite y estado.
* [F3.4-R5] El sistema debe permitir editar y eliminar oportunidades solo desde el historial del publicador.
* [F3.4-R6] El sistema debe permitir visualizar postulantes de una oportunidad en estado "En evaluación" y también en estado "Finalizado".
* [F3.4-R7] El sistema debe permitir seleccionar uno o varios postulantes únicamente en estado "En evaluación".
* [F3.4-R8] El sistema debe asignar estado "No seleccionado" a los postulantes no seleccionados al finalizar la oportunidad.
* [F3.4-R9] El sistema debe declarar la oportunidad como desierta si no se selecciona ningún postulante.
* [F3.4-R10] El sistema debe permitir registrar feedback en texto para cada postulante.

#### Examples

| ID         | Escenario                      | Resultado                           |
| ---------- | ------------------------------ | ----------------------------------- |
| F3.4-R2-E1 | 25 oportunidades en historial  | Se muestran en 3 páginas (10/10/5)  |
| F3.4-R3-E1 | Búsqueda por tipo "Práctica"   | Lista filtrada por tipo             |
| F3.4-R6-E1 | Oportunidad en "Disponible"    | No permite ver postulantes          |
| F3.4-R6-E2 | Oportunidad en "En evaluación" | Permite ver postulantes             |
| F3.4-R7-E1 | Selecciona 2 postulantes       | Ambos pasan a "Aceptado"            |
| F3.4-R8-E1 | Finaliza selección             | Restantes pasan a "No seleccionado" |
| F3.4-R9-E1 | No selecciona postulantes      | Oportunidad desierta                |

---

## F4: Postulaciones

### F4.1 Gestión de postulaciones

**Objetivos del negocio**

* Permitir a los estudiantes postular a oportunidades.

**Reglas del negocio**

* Solo los estudiantes pueden postular.
* La postulación debe realizarse antes de la fecha límite.

#### Requirements

* [F4.1-R1] Una postulación solo puede realizarse antes de la fecha límite.
* [F4.1-R2] Una postulación realizada obtiene estado "Postulado".
* [F4.1-R3] Puede cancelarse antes de la fecha límite.
* [F4.1-R4] Pasa a "En evaluación" tras superar la fecha límite.
* [F4.1-R5] Pasa a "Aceptado" o "No seleccionado" según selección.

#### Examples

| ID         | Estado actual | Evento                | Siguiente estado |
| ---------- | ------------- | --------------------- | ---------------- |
| F4.1-R2-E1 | -             | Postula               | Postulado        |
| F4.1-R4-E1 | Postulado     | Fecha límite superada | En evaluación    |
| F4.1-R5-E1 | En evaluación | Seleccionado          | Aceptado         |
| F4.1-R5-E2 | En evaluación | No seleccionado       | No seleccionado  |

---

## F5: Feedback

### F5.1 Registro de feedback

**Objetivos del negocio**

* Permitir evaluación del proceso de postulación.

**Reglas del negocio**

* El feedback solo puede darse cuando la oportunidad está finalizada.

#### Requirements

* [F5.1-R1] El publicador puede dejar feedback individual a cada postulante cuando la oportunidad está en estado "Finalizado".

#### Examples

| ID         | Estado oportunidad | Puede dejar feedback |
| ---------- | ------------------ | -------------------- |
| F5.1-R1-E1 | Finalizado         | True                 |
| F5.1-R1-E2 | Otro               | False                |

---

## F6: Administración

### F6.1 Gestión administrativa

**Objetivos del negocio**

* Permitir control y supervisión del sistema.

**Reglas del negocio**

* El administrador no puede crear oportunidades.
* El administrador no puede postular a oportunidades.

#### Requirements

* [F6.1-R1] El administrador puede ver todos los usuarios.
* [F6.1-R2] El administrador puede ver todas las oportunidades.
* [F6.1-R3] El administrador puede suspender usuarios.
* [F6.1-R4] El administrador puede bloquear oportunidades y enviarlas a revisión.

#### Examples

| ID         | Acción                  | Resultado               |
| ---------- | ----------------------- | ----------------------- |
| F6.1-R1-E1 | Admin accede a usuarios | Lista completa visible  |
| F6.1-R3-E1 | Suspende usuario        | Usuario bloqueado       |
| F6.1-R4-E1 | Bloquea oportunidad     | Oportunidad en revisión |

---

## F7: Búsqueda de oportunidades (postulante)

### F7.1 Búsqueda de oportunidades

**Objetivos del negocio**

* Permitir a los postulantes descubrir oportunidades disponibles.

**Reglas del negocio**

* Solo se muestran oportunidades en estado "Disponible".
* La lista se ordena por fecha de creación descendente.
* Se muestran resultados en bloques de 20 mediante scroll.
* La búsqueda permite texto parcial, sin distinguir mayúsculas ni tildes.
* Si una oportunidad deja de estar disponible, no aparece en nuevas búsquedas.
* Si el usuario ya está en el detalle, se muestra advertencia antes del cierre.

#### Requirements

* [F7.1-R1] El sistema debe permitir buscar oportunidades por nombre y tipo.
* [F7.1-R2] El sistema debe mostrar oportunidades disponibles ordenadas por fecha de creación descendente.
* [F7.1-R3] El sistema debe cargar resultados en bloques de 20 mediante scroll.
* [F7.1-R4] El sistema debe permitir limpiar los filtros de búsqueda.
* [F7.1-R5] El sistema debe permitir acceder al detalle de una oportunidad.
* [F7.1-R6] El sistema debe mostrar un mensaje de advertencia cuando una oportunidad está por cerrar.
* [F7.1-R7] El sistema debe impedir postular si la oportunidad deja de estar disponible.

#### Examples

| ID         | Escenario              | Resultado                                    |
| ---------- | ---------------------- | -------------------------------------------- |
| F7.1-R2-E1 | Sin filtros            | Lista de oportunidades disponibles recientes |
| F7.1-R3-E1 | Scroll                 | Carga siguientes 20 resultados               |
| F7.1-R6-E1 | Oportunidad por cerrar | Muestra advertencia con temporizador         |
| F7.1-R7-E1 | Tiempo agotado         | No permite postular                          |
| F7.1-R1-E1 | Búsqueda "progra"      | Encuentra "Programación"                     |
| F7.1-R1-E2 | Búsqueda "PRACTICA"    | Encuentra "práctica"                         |
| F7.1-R4-E1 | Limpia filtros         | Lista vuelve a estado inicial                |

---

### F4.2 Historial de postulaciones

**Objetivos del negocio**

* Permitir al postulante revisar el estado de sus postulaciones.

**Reglas del negocio**

* Se muestran todas las oportunidades postuladas.
* Se puede filtrar por nombre, tipo y estado.
* Se muestra estado de la oportunidad y resultado personal.
* No se permite postular más de una vez a la misma oportunidad.

#### Requirements

* [F4.2-R1] El sistema debe mostrar un historial de postulaciones del usuario.
* [F4.2-R2] El sistema debe permitir filtrar por nombre, tipo y estado.
* [F4.2-R3] El sistema debe mostrar el estado de la oportunidad.
* [F4.2-R4] El sistema debe mostrar el resultado personal (Pendiente, Aceptado, No seleccionado).
* [F4.2-R5] El sistema debe impedir postulaciones duplicadas a una misma oportunidad.

#### Examples

| ID         | Escenario                      | Resultado                         |
| ---------- | ------------------------------ | --------------------------------- |
| F4.2-R1-E1 | Usuario con postulaciones      | Lista de oportunidades postuladas |
| F4.2-R2-E1 | Filtro por estado "Finalizado" | Lista filtrada                    |
| F4.2-R4-E1 | Resultado visible              | Muestra "Aceptado"                |
| F4.2-R5-E1 | Intenta postular nuevamente    | Error                             |
| F4.2-R3-E1 | Estado "En evaluación"         | Visible en card                   |
| F4.2-R4-E2 | Resultado pendiente            | Muestra "Pendiente"               |

---

## Requerimientos no funcionales

* [NFR-1] Accesibilidad: diseño responsive.
* [NFR-2] Seguridad: persistencia de datos.
* [NFR-3] Transparencia: visibilidad de estados.

---

## Notas

* Los IDs son únicos e inmutables.
* Los ejemplos corresponden a especificación por ejemplo.
* Se pueden agregar nuevos requerimientos sin modificar los existentes.
