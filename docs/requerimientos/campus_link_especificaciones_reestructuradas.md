CampusLink — Especificación estructurada

Contexto del negocio

Objetivos del negocio

Facilitar el encuentro de oportunidades entre estudiantes y publicadores.

Centralizar la gestión de oportunidades académicas y laborales.

F1: Gestión de usuarios

F1.1 Registro de usuarios

Objetivos del negocio

Permitir el acceso y uso del sistema a distintos tipos de usuarios.

Reglas del negocio

El usuario debe estar registrado para interactuar con el sistema.

El email del usuario debe ser único.

Requirements

[F1.1-R1] El sistema debe permitir registrar usuarios con nombre, email, contraseña y rol.

[F1.1-R2] El email debe ser único.

[F1.1-R3] El usuario debe estar registrado para interactuar con oportunidades.

F2: Autenticación y validaciones

F2.1 Validación de email

Objetivos del negocio

Asegurar la integridad y unicidad de las cuentas de usuario.

Reglas del negocio

El email debe tener formato válido.

El email debe ser único.

Requirements

[F2.1-R1] El email debe tener formato válido.

[F2.1-R2] El email debe ser único.

[F2.1-R3] La comparación de unicidad es case-insensitive.

Examples

ID

Input

Existe

Resultado

Motivo

F2.1-R1-E1

aaron_uziel@live.com

No

Éxito

-

F2.1-R1-E2

marcelo_agachateyconocelo.com

No

Error

Formato inválido

F2.1-R2-E1

Aaron_uziel@live.com

Sí

Error

Email duplicado

F2.1-R1-E3

aaron_uziel@livecom

No

Error

Formato inválido

F2.2 Validación de contraseña

Objetivos del negocio

Garantizar seguridad en las credenciales de acceso.

Reglas del negocio

La contraseña debe cumplir criterios mínimos de seguridad.

Requirements

[F2.2-R1] La contraseña debe tener entre 8 y 16 caracteres.

[F2.2-R2] Debe contener al menos una mayúscula.

[F2.2-R3] Debe contener al menos un número.

[F2.2-R4] Debe contener al menos un símbolo.

Examples

ID

Input

Resultado

Motivo

F2.2-R2-E1

asvr@567

Error

Falta mayúscula

F2.2-R1-E1

aB12@

Error

Longitud insuficiente

F2.2-R4-E1

12345asD

Error

Falta símbolo

F2.2-R3-E1

aservA@t

Error

Falta número

F2.2-R3-E2

12312434@

Error

Falta letra

F2.2-R1-E2

1234Av@n

Éxito

-

F3: Gestión de oportunidades

F3.1 Creación de oportunidad

Objetivos del negocio

Permitir a los publicadores ingresar oportunidades.

Reglas del negocio

Solo los publicadores pueden crear oportunidades.

La oportunidad debe tener fecha límite válida.

La oportunidad debe tener información básica obligatoria.

Requirements

[F3.1-R1] La oportunidad debe crearse con estado inicial "Disponible".

[F3.1-R2] Todos los campos básicos son obligatorios: Tipo, Título, Descripción, Requisitos y Fecha límite.

[F3.1-R3] La fecha límite debe ser al menos 5 días en el futuro.

Examples

ID

Campo

Obligatorio

Condición

F3.1-R2-E1

Tipo

Sí

-

F3.1-R2-E2

Requisitos

Sí

Al menos uno

F3.1-R3-E1

Fecha límite

Sí

≥ hoy + 5 días

F3.2 Estados de oportunidad

Objetivos del negocio

Gestionar el ciclo de vida de las oportunidades.

Reglas del negocio

Toda oportunidad tiene un estado definido.

Las transiciones de estado siguen eventos específicos.

Requirements

[F3.2-R1] El estado inicial es "Disponible".

[F3.2-R2] Cambia a "Cerrado" al alcanzar la fecha límite.

[F3.2-R3] Cambia a "Finalizado" tras selección o si queda desierta.

Examples

ID

Estado actual

Evento

Siguiente estado

F3.2-R2-E1

Disponible

Fecha límite alcanzada

Cerrado

F3.2-R3-E1

Cerrado

Selección postulante

Finalizado

F3.2-R3-E2

Cerrado

Desierta

Finalizado

F4: Postulaciones

F4.1 Gestión de postulaciones

Objetivos del negocio

Permitir a los estudiantes postular a oportunidades.

Reglas del negocio

Solo los estudiantes pueden postular.

La postulación debe realizarse antes de la fecha límite.

Requirements

[F4.1-R1] Una postulación solo puede realizarse antes de la fecha límite.

[F4.1-R2] Una postulación realizada obtiene estado "Postulado".

[F4.1-R3] Puede cancelarse antes de la fecha límite.

[F4.1-R4] Pasa a "En revisión" tras superar la fecha límite.

[F4.1-R5] Pasa a "Aceptado" o "Rechazado" según selección.

Examples

ID

Estado actual

Evento

Siguiente estado

F4.1-R2-E1

-

Postula

Postulado

F4.1-R4-E1

Postulado

Fecha límite superada

En revisión

F4.1-R5-E1

En revisión

Seleccionado

Aceptado

F4.1-R5-E2

En revisión

No seleccionado

Rechazado

F5: Feedback

F5.1 Registro de feedback

Objetivos del negocio

Permitir evaluación del proceso de postulación.

Reglas del negocio

El feedback solo puede darse cuando la oportunidad está finalizada.

Requirements

[F5.1-R1] El publicador puede dejar feedback cuando la oportunidad está en estado "Finalizado".

Examples

ID

Estado oportunidad

Puede dejar feedback

F5.1-R1-E1

Finalizado

True

F5.1-R1-E2

Otro

False

F6: Administración

F6.1 Gestión administrativa

Objetivos del negocio

Permitir control y supervisión del sistema.

Reglas del negocio

El administrador no puede crear oportunidades.

El administrador no puede postular a oportunidades.

Requirements

[F6.1-R1] El administrador puede ver todos los usuarios.

[F6.1-R2] El administrador puede ver todas las oportunidades.

[F6.1-R3] El administrador puede suspender usuarios.

[F6.1-R4] El administrador puede bloquear oportunidades y enviarlas a revisión.

Requerimientos no funcionales

[NFR-1] Accesibilidad: diseño responsive.

[NFR-2] Seguridad: persistencia de datos.

[NFR-3] Transparencia: visibilidad de estados.