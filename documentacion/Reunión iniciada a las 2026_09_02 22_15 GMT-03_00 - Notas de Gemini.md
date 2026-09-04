sept 3, 2026

## **Reunión del 2 sept 2026 a las 22:15 GMT-03:00**

Registros de la reunión [Transcripción](https://docs.google.com/document/d/1AzTKVaWYblPREwsnlnK-JLpDnoexnSB_RCJfvQACuH0/edit?usp=drive_web&tab=t.5fenfg9h2r0) 

### **Resumen**

Se establecieron la arquitectura técnica, las estrategias de desarrollo móvil y la estructura organizativa del proyecto.

**Arquitectura técnica y organización**  
Se seleccionó un modelo modular con Nest, React, TypeScript y Supabase. El repositorio de Git centralizará la documentación y la planificación de tareas.

**Estructura de proyecto y seguridad**  
El equipo adoptó una estructura de mono-repo con ramas de desarrollo separadas. Se acordó gestionar secretos localmente para proteger información confidencial fuera del código público.

**Lógica de usuario y concurrencia**  
Se definió una tabla de perfiles para gestionar roles mediante la API. Se evaluó implementar validaciones híbridas para controlar el acceso concurrente a las sedes.

### **Decisiones**

## Requiere más debate

* **Arquitectura de check-in offline** El enfoque de la arquitectura de check-in offline basado en un patrón de nodos por sede requiere validación adicional del profesor.

* **Lógica de control de acceso** La lógica de control de acceso para el ingreso a gimnasios (check-ins, límites diarios, doble turno) requiere consultar al profesor debido a la complejidad de los casos de uso.

## Acordada

* **Autenticación delegada a Supabase** El módulo de autenticación del backend funcionará como pasarela consumiendo directamente las funcionalidades provistas por Supabase.

* **Acceso a datos vía API** Se utilizará la API directa de Supabase para el acceso a datos en lugar de desarrollar una capa de ORM propia para agilizar el desarrollo.

* **Estructura de proyecto monorepo** El repositorio del proyecto tendrá una estructura de monorepo con carpetas separadas para 'frontend' y 'backend'.

* **Estrategia de ramas de desarrollo** Se implementará una rama de 'desarrollo' separada de la rama principal (destinada a documentación) para el manejo de código.

* **Gestión de roles y permisos** Se utilizará un campo de diferenciación simple por perfil de usuario para gestionar los roles y permisos en lugar de tablas complejas.

### **Próximos pasos**

- [ ] \[Patricio Ramos\] Registrar acuerdos: Registrar los acuerdos alcanzados durante la reunión.

- [ ] \[Patricio Ramos\] Actualizar C4: Realizar las actualizaciones correspondientes en el modelo C4.

- [ ] \[Patricio Ramos\] Completar tablas: Completar las tablas de integrantes incluyendo sus roles correspondientes.

- [ ] \[Patricio Ramos\] Armar PDF: Armar el documento PDF que contenga el modelo C4 y los ADR.

- [ ] \[Lucas Coquet\] Crear cuenta Supabase: Crear y configurar la cuenta inicial de la base de datos en Supabase.

- [ ] \[Lucas Coquet\] Revisar funcionalidades: Revisar las funcionalidades por actor descritas en la documentación.

- [ ] \[Matias Goncevat\] Prueba manual login: Realizar una prueba manual de inicio de sesión en la aplicación.

- [ ] \[Matias Goncevat\] Revisar decisiones: Revisar las decisiones pendientes y las tareas asignadas en el repositorio.

- [ ] \[Bruno Conti\] Revisar ADR: Analizar los ADR existentes y documentar los hallazgos.

### **Detalles**

* **Gestión de tareas y organización del repositorio**: Patricio Ramos introduce el uso de Trello para la organización de tareas, las cuales se encuentran filtradas por fechas específicas (5 y 12 de septiembre) para facilitar el seguimiento del progreso ([00:00:46](?tab=t.5fenfg9h2r0#heading=h.606g8a9hbx)). Se aclara que el repositorio de Git es el recurso principal donde se encuentra la documentación, incluyendo tareas pendientes como la revisión de funcionalidades por actor, el stack tecnológico y la actualización del C4 ([00:02:24](?tab=t.5fenfg9h2r0#heading=h.xta5r2tlbgc4)). Les integrantes confirman que el repositorio es el lugar para consultar el plan de trabajo y asignar roles ([00:00:46](?tab=t.5fenfg9h2r0#heading=h.606g8a9hbx)).

* **Arquitectura técnica y estrategia de autenticación**: El equipo ratifica la arquitectura basada en un modelo modular utilizando Nest, React, TypeScript y Supabase para la base de datos. Se define que el módulo de autenticación no implementará la lógica desde cero, sino que funcionará como una pasarela que consume las funcionalidades de autenticación de Supabase, relegando el manejo de tokens y vencimientos a la base de datos ([00:04:10](?tab=t.5fenfg9h2r0#heading=h.f3hxfk476o5a)). Respecto a la capa de acceso a datos, se acuerda consumir la API de Supabase directamente en lugar de desarrollar un ORM complejo para agilizar el desarrollo ([00:05:54](?tab=t.5fenfg9h2r0#heading=h.swknvjcrsbo8)).

* **Desarrollo móvil y funcionalidad offline**: Se define que la aplicación móvil se desarrollará con React Native, aunque su modelado se postergará hasta llegar a la unidad correspondiente del programa. Se discute la implementación del check-in en las sedes, considerando métodos como códigos QR generados mediante algoritmos temporales para permitir la validación offline ([00:07:38](?tab=t.5fenfg9h2r0#heading=h.5j1vgpm02v8b)). Les participantes debaten sobre la complejidad de manejar la sincronización de estos datos cuando se restablezca la conexión a internet y las limitaciones para detectar ingresos simultáneos en distintas sucursales ([00:09:32](?tab=t.5fenfg9h2r0#heading=h.e7dseko9bb0d)).

* **Convención de ramas y estructura del proyecto**: Se establece que el proyecto seguirá una estructura de "mono-repo" con carpetas diferenciadas para "frontend" y "backend" para simplificar la gestión ([00:14:10](?tab=t.5fenfg9h2r0#heading=h.rwv4bxb1dqjj)). Se acuerda implementar una rama de desarrollo separada de la rama principal (master) para gestionar los cambios de código, utilizando un sistema de nombrado trazable que incluya el código de la tarea (ejemplo: S1-03) para evitar conflictos y mejorar el seguimiento de las contribuciones ([00:15:30](?tab=t.5fenfg9h2r0#heading=h.5qr8hk3d33ui)).

* **Gestión de infraestructura y cuentas**: Se distribuyen responsabilidades sobre la creación y administración de cuentas en servicios como GitHub, Supabase, Vercel y Render. Lucas Coquet se compromete a crear la cuenta de Supabase e inicializar la base de datos, lo cual implica la responsabilidad de gestionar permisos para el resto del equipo ([00:19:19](?tab=t.5fenfg9h2r0#heading=h.h8vvve6cjwud)).

* **Seguridad y manejo de secretos**: Se aborda la necesidad de proteger las credenciales y configuraciones sensibles (como las direcciones de bases de datos y tokens), acordando no subir archivos con información confidencial al repositorio ([00:21:07](?tab=t.5fenfg9h2r0#heading=h.8lzigrw9ytno)). Como solución, se propone gestionar estas variables de entorno localmente o compartirlas a través de medios seguros, como el servidor de Discord del equipo, evitando exponerlas en el código público ([00:22:43](?tab=t.5fenfg9h2r0#heading=h.nantm79lt103)).

* **Entregables y documentación**: Patricio Ramos asume la responsabilidad de consolidar la documentación (modelo C4 y ADRs) en un archivo PDF, cuya fecha de entrega interna será antes de la fecha establecida por la cátedra. Se planea una revisión cruzada de la documentación donde Bruno Conti y Lucas Coquet participarán en la validación del C4 y los ADRs, mientras que Patricio Ramos actualizará el documento basándose en las nuevas decisiones sobre autenticación y acceso a datos ([00:24:32](?tab=t.5fenfg9h2r0#heading=h.exk37rjmilhg)).

* **Lógica de negocio para check-in y concurrencia**: El equipo discute los desafíos de implementar una lógica que impida el acceso simultáneo a múltiples sedes o el registro duplicado de usuarios ([00:30:10](?tab=t.5fenfg9h2r0#heading=h.caill4xoc8af)). Se evalúa la posibilidad de utilizar una estrategia híbrida, combinando validaciones en la base de datos y lógica en el backend para gestionar los ingresos, permitiendo bloqueos temporales (time-out) tras un check-in para evitar abusos o errores de sistema ([00:31:55](?tab=t.5fenfg9h2r0#heading=h.7zy9vqtqeix8)).

* **Gestión de capacidades y aforo**: Se reflexiona sobre la necesidad de gestionar límites de capacidad en los gimnasios, considerando casos donde existen clases específicas (como yoga o fútbol) que ocupan espacios físicos dentro de la misma sede ([00:35:53](?tab=t.5fenfg9h2r0#heading=h.yxkco7en302e)). Lucas Coquet sugiere la posibilidad de consultar al profesor sobre cómo abordar estas limitaciones físicas y el uso de listas de espera para clases, asegurando que la solución sea escalable para un "gimnasio de barrio" ([00:37:07](?tab=t.5fenfg9h2r0#heading=h.gequk6io7c1y)).

* **Estructura de usuarios y permisos**: Para la gestión de usuarios, el equipo decide implementar una tabla de perfiles que contenga una variable o campo para distinguir el rol (usuario, gerente, administrador, recepcionista) ([00:39:45](?tab=t.5fenfg9h2r0#heading=h.y66y0h9orwy0)). Se acuerda que la diferenciación de privilegios se manejará a nivel de backend mediante la API, lo cual es considerado suficiente dado el número limitado de tipos de usuarios ([00:41:53](?tab=t.5fenfg9h2r0#heading=h.efyrif1eotz2)).

* **Asignación de tareas individuales**: Patricio Ramos organiza las tareas finales para la semana, asignando a Matias Goncevat la realización de pruebas manuales de login, a Lucas Coquet la revisión de funcionalidades por actor y a Bruno Conti la verificación de los ADRs existentes para asegurar que cumplan con el formato solicitado por el profesor ([00:45:21](?tab=t.5fenfg9h2r0#heading=h.a3gkfazg3e8w)).

* **Coordinación de reuniones futuras**: Se aclara la incertidumbre sobre la frecuencia de las reuniones con el profesor, concluyendo que solo se requiere la asistencia de un representante del grupo en los momentos establecidos por la cátedra para presentar el progreso y las inquietudes. Patricio Ramos se encargará de actuar como el punto de contacto principal para la entrega de avances ([00:48:43](?tab=t.5fenfg9h2r0#heading=h.ft8zgyivytng)).

*Revisa las notas de Gemini para asegurarte de que sean precisas. [Obtén sugerencias y descubre cómo Gemini toma notas](https://support.google.com/meet/answer/14754931)*

*Cómo es la calidad de **estas notas específicas?** [Responde una breve encuesta](https://google.qualtrics.com/jfe/form/SV_5bXzKQfylMIhSXc?confid=xjLgg8G7zFpYOtXQhY5rDxISOBEBMgUIigIgABgFCA&detailLevel=standard&hasImages=False&entryPoint=footerMain&isGoogler=False) para darnos tu opinión; por ejemplo, cuán útiles te resultaron las notas.*