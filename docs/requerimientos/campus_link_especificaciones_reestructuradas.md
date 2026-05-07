# CampusLink — Especificación estructurada revisada

---

# Notación de requerimientos y ejemplos

Los requerimientos siguen una estructura identificable y trazable mediante IDs únicos.

## Formato general

* `[Fx.y-Rz]` → Requirement (requerimiento)
* `[Fx.y-Rz-Ek]` → Example (especificación por ejemplo asociada a un requerimiento)

Donde:

* `F` = Feature
* `x.y` = Sub-feature
* `Rz` = Número de requerimiento dentro de la sub-feature
* `Ek` = Número de ejemplo asociado al requerimiento

## Ejemplos

* `[F3.1-R1]` → Primer requerimiento de creación de oportunidad
* `[F3.1-R1-E1]` → Primer ejemplo de ese requerimiento
* `[F4.2-R3]` → Tercer requerimiento del historial de postulaciones

## Reglas importantes

* Los IDs son únicos e inmutables.
* Un requerimiento representa una sola idea verificable.
* Un requerimiento puede tener múltiples ejemplos.
* Los ejemplos validan comportamientos específicos del requerimiento.
* Nuevos requerimientos pueden agregarse sin modificar IDs existentes.

---

# Dominio del negocio

CampusLink permite centralizar oportunidades académicas y laborales para estudiantes.

Se consideran oportunidades:

* Tutorías
* Ayudantías
* Grupos de estudio
* Trabajos part-time
* Prácticas
* Voluntariados
* Proyectos de investigación

---

# Supuestos

* Debe existir al menos un administrador.
* Los administradores se crean fuera del sistema.
* El administrador no publica ni postula oportunidades.
* Un ayudante es considerado estudiante.
* Las instituciones pueden corresponder a universidades, facultades o departamentos.
* Un usuario puede tener capacidades de publicador y postulante simultáneamente dependiendo de su perfil.

---

# Usuarios

## Perfiles

* Estudiante
* Docente
* Institución
* Administrador

## Roles funcionales

### Publicador

Puede crear y gestionar oportunidades.

### Postulante

Puede postular a oportunidades.

### Administrador

Puede gestionar usuarios y oportunidades.

---

# Reglas globales del sistema

* Toda oportunidad posee un formulario base obligatorio.
* Toda oportunidad pertenece a un tipo específico.
* Toda oportunidad tiene un estado.
* Toda postulación tiene un estado.
* Un publicador no puede editar oportunidades de otro publicador.
* Una oportunidad con postulaciones no puede editarse.
* Una oportunidad finalizada no puede reabrirse.
* Un usuario no puede postular dos veces a la misma oportunidad.

---

# F1: Gestión de usuarios

## F1.1 Registro de usuarios

### Objetivos del negocio

* Permitir el acceso de distintos tipos de usuarios.

### Reglas del negocio

* El email debe ser único.
* El usuario debe registrarse para utilizar el sistema.

### Requirements

* [F1.1-R1] El sistema debe permitir registrar usuarios con nombre, email, contraseña y perfil.
* [F1.1-R2] El email debe ser único.
* [F1.1-R3] El sistema debe permitir seleccionar el perfil del usuario durante el registro.

### Examples

| ID         | Escenario                    | Resultado                       |
| ---------- | ---------------------------- | ------------------------------- |
| F1.1-R2-E1 | Registro con email nuevo     | Éxito                           |
| F1.1-R2-E2 | Registro con email existente | Error                           |
| F1.1-R3-E1 | Registro como Docente        | Usuario registrado como Docente |

---

# F2: Autenticación y validaciones

## F2.1 Validación de email

### Requirements

* [F2.1-R1] El email debe tener formato válido.
* [F2.1-R2] El email debe ser único.
* [F2.1-R3] La validación debe ignorar mayúsculas y minúsculas.

### Examples

| ID         | Input                                           | Resultado |
| ---------- | ----------------------------------------------- | --------- |
| F2.1-R1-E1 | [usuario@mail.com](mailto:usuario@mail.com)     | Éxito     |
| F2.1-R1-E2 | usuariomail.com                                 | Error     |
| F2.1-R2-E1 | [TEST@mail.com](mailto:TEST@mail.com) existente | Error     |

---

## F2.2 Validación de contraseña

### Requirements

* [F2.2-R1] La contraseña debe tener entre 8 y 16 caracteres.
* [F2.2-R2] Debe contener al menos una mayúscula.
* [F2.2-R3] Debe contener al menos un número.
* [F2.2-R4] Debe contener al menos un símbolo.

### Examples

| ID         | Input    | Resultado |
| ---------- | -------- | --------- |
| F2.2-R1-E1 | aB12@    | Error     |
| F2.2-R2-E1 | asvr@567 | Error     |
| F2.2-R3-E1 | aservA@t | Error     |
| F2.2-R4-E1 | 12345asD | Error     |
| F2.2-R1-E2 | 1234Av@n | Éxito     |

---

# F3: Gestión de oportunidades

## F3.1 Creación de oportunidad

### Objetivos del negocio

* Permitir a publicadores crear oportunidades.

### Reglas del negocio

* Solo publicadores pueden crear oportunidades.
* Toda oportunidad debe tener información básica obligatoria.
* Toda oportunidad utiliza un formulario.
* El formulario base es obligatorio.

### Requirements

* [F3.1-R1] La oportunidad debe crearse con estado "Disponible".
* [F3.1-R2] Toda oportunidad debe incluir título, descripción, tipo y fecha límite.
* [F3.1-R3] La fecha límite debe ser futura.
* [F3.1-R4] El sistema debe permitir seleccionar un tipo de formulario durante la creación.
* [F3.1-R5] Toda oportunidad debe incluir el formulario base.

### Examples

| ID         | Escenario                 | Resultado                   |
| ---------- | ------------------------- | --------------------------- |
| F3.1-R1-E1 | Nueva oportunidad         | Estado "Disponible"         |
| F3.1-R2-E1 | Oportunidad sin título    | Error                       |
| F3.1-R3-E1 | Fecha límite pasada       | Error                       |
| F3.1-R4-E1 | Selecciona tipo "Tutoría" | Se carga formulario tutoría |

---

## F3.2 Estados de oportunidad

### Objetivos del negocio

* Gestionar el ciclo de vida de las oportunidades.

### Estados

* Disponible
* En evaluación
* Finalizado
* Desierta
* En revisión

### Reglas del negocio

* El estado inicial es "Disponible".
* Una oportunidad cambia automáticamente a "En evaluación" al superar la fecha límite.
* Una oportunidad sin seleccionados puede declararse desierta.
* Una oportunidad finalizada no puede reabrirse.

### Requirements

* [F3.2-R1] El estado inicial de una oportunidad debe ser "Disponible".
* [F3.2-R2] El sistema debe cambiar automáticamente una oportunidad a estado "En evaluación" al alcanzar la fecha límite.
* [F3.2-R3] El sistema debe permitir finalizar una oportunidad luego del proceso de selección.
* [F3.2-R4] El sistema debe permitir declarar una oportunidad como desierta.
* [F3.2-R5] Una oportunidad finalizada no puede volver a estado disponible.

### Examples

| ID         | Estado actual | Evento                 | Resultado     |
| ---------- | ------------- | ---------------------- | ------------- |
| F3.2-R2-E1 | Disponible    | Fecha límite alcanzada | En evaluación |
| F3.2-R3-E1 | En evaluación | Selección finalizada   | Finalizado    |
| F3.2-R4-E1 | En evaluación | Sin seleccionados      | Desierta      |

---

## F3.3 Formularios de oportunidad

### Objetivos del negocio

* Adaptar la información solicitada según el tipo de oportunidad.

### Reglas del negocio

* Existen siete formularios específicos.
* Toda oportunidad utiliza un formulario específico más el formulario base.
* Las preguntas dinámicas tienen tipos definidos.
* Las respuestas de postulantes se muestran como formulario renderizado no editable.

### Tipos de formularios

#### Tutorías

Campos sugeridos:

* Curso o tema
* Nivel académico
* Modalidad
* Horarios disponibles
* Duración esperada
* Preguntas dinámicas

#### Ayudantías

Campos sugeridos:

* Asignatura
* Carrera relacionada
* Experiencia previa
* Horario
* Promedio o requisito académico opcional
* Preguntas dinámicas

#### Grupos de estudio

Campos sugeridos:

* Curso
* Objetivo del grupo
* Cantidad máxima de integrantes
* Horarios
* Modalidad
* Preguntas dinámicas

#### Trabajos part-time

Campos sugeridos:

* Cargo
* Jornada
* Ubicación
* Pago o compensación
* Requisitos básicos
* Preguntas dinámicas

#### Prácticas

Campos sugeridos:

* Área profesional
* Carrera requerida
* Duración
* Modalidad
* Documentos requeridos
* Preguntas dinámicas

#### Voluntariados

Campos sugeridos:

* Organización
* Área de apoyo
* Horarios
* Requisitos
* Certificación opcional
* Preguntas dinámicas

#### Proyectos de investigación

Campos sugeridos:

* Línea de investigación
* Profesor responsable
* Conocimientos requeridos
* Duración
* Vacantes
* Preguntas dinámicas

### Tipos de preguntas dinámicas

* Texto corto
* Texto largo
* Selección única
* Selección múltiple
* Número
* Fecha

### Restricciones de publicación

| Perfil      | Formularios permitidos                       |
| ----------- | -------------------------------------------- |
| Estudiante  | Ayudantías, Grupos de estudio, Tutorías      |
| Docente     | Tutorías, Proyectos de investigación         |
| Institución | Prácticas, Voluntariados, Trabajos part-time |

### Requirements

* [F3.3-R1] El sistema debe incluir siete formularios específicos de oportunidad.
* [F3.3-R2] El sistema debe incluir un formulario base obligatorio.
* [F3.3-R3] El sistema debe permitir agregar preguntas dinámicas.
* [F3.3-R4] Las preguntas dinámicas deben tener un tipo definido.
* [F3.3-R5] El sistema debe restringir formularios según el perfil del publicador.
* [F3.3-R6] Una oportunidad con postulaciones no puede editarse.
* [F3.3-R7] El sistema debe permitir editar oportunidades sin postulaciones hasta 2 días antes de la fecha límite.
* [F3.3-R8] El sistema debe notificar a postulantes cuando una oportunidad es eliminada.
* [F3.3-R9] El sistema debe mostrar postulaciones como formularios renderizados no editables.
* [F3.3-R10] El sistema debe permitir copiar el formulario de una oportunidad previamente creada.

### Examples

| ID          | Escenario                                     | Resultado                   |
| ----------- | --------------------------------------------- | --------------------------- |
| F3.3-R3-E1  | Agrega pregunta tipo texto                    | Pregunta visible            |
| F3.3-R5-E1  | Institución intenta crear ayudantía           | Error                       |
| F3.3-R6-E1  | Oportunidad con postulaciones                 | No editable                 |
| F3.3-R7-E1  | Oportunidad sin postulaciones y faltan 5 días | Editable                    |
| F3.3-R7-E2  | Oportunidad sin postulaciones y falta 1 día   | No editable                 |
| F3.3-R8-E1  | Publicador elimina oportunidad                | Postulantes notificados     |
| F3.3-R9-E1  | Publicador revisa postulación                 | Formulario renderizado      |
| F3.3-R10-E1 | Copia oportunidad previa                      | Nuevo formulario precargado |

---

## F3.4 Historial del publicador y gestión de postulantes

### Objetivos del negocio

* Permitir gestionar oportunidades y postulantes.

### Reglas del negocio

* Un publicador solo puede gestionar sus oportunidades.
* El historial se ordena por fecha de creación descendente por defecto.
* El historial del publicador es independiente del historial de postulaciones.

### Requirements

* [F3.4-R1] El sistema debe mostrar un historial de oportunidades creadas por el publicador.
* [F3.4-R2] El historial debe mostrar resultados en bloques de 10.
* [F3.4-R3] El sistema debe permitir buscar oportunidades por nombre, tipo y estado.
* [F3.4-R4] El sistema debe permitir ordenar por fecha de creación, fecha límite y estado.
* [F3.4-R5] El sistema debe permitir editar y eliminar oportunidades únicamente desde el historial del publicador.
* [F3.4-R6] El sistema debe permitir visualizar postulantes en oportunidades en estado "En evaluación" y "Finalizado".
* [F3.4-R7] El sistema debe permitir seleccionar uno o varios postulantes únicamente durante el estado "En evaluación".
* [F3.4-R8] Los postulantes no seleccionados deben pasar automáticamente a estado "No seleccionado".
* [F3.4-R9] El sistema debe permitir registrar feedback textual individual.
* [F3.4-R10] El sistema debe permitir revisar postulaciones finalizadas incluso después del cierre.

### Examples

| ID         | Escenario                  | Resultado                         |
| ---------- | -------------------------- | --------------------------------- |
| F3.4-R2-E1 | 25 oportunidades           | Se muestran en bloques de 10      |
| F3.4-R3-E1 | Filtra por "Práctica"      | Lista filtrada                    |
| F3.4-R6-E1 | Oportunidad disponible     | No puede revisar postulantes      |
| F3.4-R6-E2 | Oportunidad en evaluación  | Puede revisar postulantes         |
| F3.4-R7-E1 | Selecciona dos postulantes | Ambos quedan aceptados            |
| F3.4-R8-E1 | Finaliza proceso           | Restantes quedan no seleccionados |

---

# F4: Postulaciones

## F4.1 Gestión de postulaciones

### Objetivos del negocio

* Permitir a estudiantes postular a oportunidades.

### Reglas del negocio

* Solo estudiantes pueden postular.
* Las postulaciones deben realizarse antes de la fecha límite.
* Las postulaciones se realizan desde el detalle de la oportunidad.

### Requirements

* [F4.1-R1] Una postulación solo puede realizarse antes de la fecha límite.
* [F4.1-R2] Una postulación nueva debe quedar en estado "Postulado".
* [F4.1-R3] Una postulación puede cancelarse antes de la fecha límite.
* [F4.1-R4] Una postulación debe pasar automáticamente a estado "En evaluación" al superar la fecha límite.
* [F4.1-R5] Una postulación debe pasar a estado "Aceptado" o "No seleccionado" según el resultado.
* [F4.1-R6] El sistema debe impedir postulaciones duplicadas.
* [F4.1-R7] El sistema debe mostrar el formulario completado como solo lectura durante la revisión.

### Examples

| ID         | Estado actual               | Evento                 | Resultado       |
| ---------- | --------------------------- | ---------------------- | --------------- |
| F4.1-R2-E1 | -                           | Postula                | Postulado       |
| F4.1-R4-E1 | Postulado                   | Fecha límite alcanzada | En evaluación   |
| F4.1-R5-E1 | En evaluación               | Seleccionado           | Aceptado        |
| F4.1-R5-E2 | En evaluación               | No seleccionado        | No seleccionado |
| F4.1-R6-E1 | Intenta postular nuevamente | Error                  |                 |

---

## F4.2 Historial de postulaciones

### Objetivos del negocio

* Permitir al postulante revisar sus postulaciones.

### Reglas del negocio

* El historial muestra oportunidades postuladas.
* El historial es distinto al historial del publicador.
* El estado sí es relevante dentro del historial.

### Requirements

* [F4.2-R1] El sistema debe mostrar un historial de postulaciones del usuario.
* [F4.2-R2] El sistema debe permitir filtrar por nombre, tipo y estado.
* [F4.2-R3] El sistema debe mostrar el estado de la oportunidad.
* [F4.2-R4] El sistema debe mostrar el resultado personal del postulante.
* [F4.2-R5] El historial debe permitir scroll de resultados.

### Examples

| ID         | Escenario                      | Resultado           |
| ---------- | ------------------------------ | ------------------- |
| F4.2-R1-E1 | Usuario con postulaciones      | Lista visible       |
| F4.2-R2-E1 | Filtra por estado "Finalizado" | Lista filtrada      |
| F4.2-R3-E1 | Oportunidad en evaluación      | Estado visible      |
| F4.2-R4-E1 | Usuario aceptado               | Muestra "Aceptado"  |
| F4.2-R4-E2 | Resultado pendiente            | Muestra "Pendiente" |

---

# F5: Búsqueda de oportunidades

## F5.1 Búsqueda para postulantes

### Objetivos del negocio

* Permitir descubrir oportunidades disponibles.

### Reglas del negocio

* Solo se muestran oportunidades disponibles.
* La búsqueda ignora mayúsculas, minúsculas y tildes.
* La búsqueda acepta texto parcial.
* Los resultados se ordenan por fecha de creación descendente.

### Requirements

* [F5.1-R1] El sistema debe permitir buscar oportunidades por nombre y tipo.
* [F5.1-R2] El sistema debe mostrar oportunidades disponibles recientes cuando no existen filtros.
* [F5.1-R3] El sistema debe cargar resultados en bloques de 20 mediante scroll.
* [F5.1-R4] El sistema debe permitir limpiar filtros de búsqueda.
* [F5.1-R5] El sistema debe permitir acceder al detalle de una oportunidad.
* [F5.1-R6] El sistema debe mostrar advertencia de cierre próximo con temporizador.
* [F5.1-R7] El sistema debe impedir postular cuando el tiempo expira.
* [F5.1-R8] Un publicador que también es postulante puede visualizar sus propias oportunidades en el buscador.
* [F5.1-R9] El buscador no debe permitir editar ni eliminar oportunidades.

### Examples

| ID         | Escenario                 | Resultado                        |
| ---------- | ------------------------- | -------------------------------- |
| F5.1-R1-E1 | Busca "progra"            | Encuentra "Programación"         |
| F5.1-R1-E2 | Busca "PRACTICA"          | Encuentra "práctica"             |
| F5.1-R2-E1 | Sin filtros               | Lista de oportunidades recientes |
| F5.1-R3-E1 | Scroll                    | Carga siguientes 20              |
| F5.1-R6-E1 | Falta poco para cierre    | Advertencia visible              |
| F5.1-R7-E1 | Temporizador llega a cero | No permite postular              |

---

# F6: Notificaciones

## F6.1 Bandeja de notificaciones

### Objetivos del negocio

* Informar cambios relevantes a los usuarios.

### Reglas del negocio

* Las notificaciones se gestionan dentro del sistema.
* No se consideran correos electrónicos.

### Requirements

* [F6.1-R1] El sistema debe notificar modificaciones de oportunidades a postulantes.
* [F6.1-R2] El sistema debe notificar eliminación de oportunidades a postulantes.
* [F6.1-R3] El sistema debe notificar resultados de postulaciones.
* [F6.1-R4] Las notificaciones deben visualizarse desde una bandeja interna.

### Examples

| ID         | Evento                          | Resultado                  |
| ---------- | ------------------------------- | -------------------------- |
| F6.1-R1-E1 | Publicador modifica oportunidad | Postulantes notificados    |
| F6.1-R2-E1 | Publicador elimina oportunidad  | Notificación visible       |
| F6.1-R3-E1 | Postulante aceptado             | Notificación de aceptación |

---

# F7: Administración

## F7.1 Gestión administrativa

### Objetivos del negocio

* Permitir supervisión y control del sistema.

### Reglas del negocio

* El administrador no publica oportunidades.
* El administrador no postula oportunidades.

### Requirements

* [F7.1-R1] El administrador puede visualizar usuarios.
* [F7.1-R2] El administrador puede visualizar oportunidades.
* [F7.1-R3] El administrador puede suspender usuarios.
* [F7.1-R4] El administrador puede bloquear oportunidades y enviarlas a revisión.

### Examples

| ID         | Escenario                     | Resultado              |
| ---------- | ----------------------------- | ---------------------- |
| F7.1-R1-E1 | Administrador revisa usuarios | Lista completa visible |
| F7.1-R3-E1 | Suspende usuario              | Usuario suspendido     |
| F7.1-R4-E1 | Bloquea oportunidad           | Estado "En revisión"   |

---

# Requerimientos no funcionales

* [NFR-1] El sistema debe ser responsive.
* [NFR-2] El sistema debe persistir la información.
* [NFR-3] El sistema debe mantener visibilidad clara de estados.
* [NFR-4] Las búsquedas deben responder ignorando diferencias de mayúsculas y tildes.
* [NFR-5] El sistema debe soportar scroll incremental en historiales y búsquedas.

