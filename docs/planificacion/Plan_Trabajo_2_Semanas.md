# Plan de trabajo — 3 semanas (S5–S7)

**Proyecto:** FitZone Sports · Programación V · UNER  
**Equipo:** 4 integrantes  
**Período de referencia:** 2026-10-27 al 2026-11-16  
**Última actualización:** 2026-11-11 (reunión de equipo; tablero Trello)  
**Unidad en curso:** cierre TIF (6–19/11). S5 está cerrada en el tablero. Sigue abierta S6-T09.

**Referencias:** Trabajo Integrador · [Acta 2026-10-21](./Acta_Reunion_2026-10-21_Seguimiento.md) · Decisiones pendientes · Correcciones de Membresías y Clases · [LOG](../bitacoras/LOG.md)

## Cómo leer este plan

- **Finalizado:** el trabajo indicado está implementado o la decisión/reunión ya ocurrió.
- **En desarrollo:** hay trabajo activo confirmado; puede estar bloqueado por otra tarea.
- **Por hacer:** no hay evidencia de que haya comenzado o falta terminarlo.
- Las tareas S4-T10 en adelante se agregan para registrar brechas que siguen visibles en el código, aunque algunos hitos relacionados ya se hayan dado por cerrados en la reunión.
- Las estimaciones y asignaciones de las tareas nuevas quedan sujetas a confirmación del equipo.

## Integrantes

| Rol | Código | Nombre |
| --- | --- | --- |
| Arquitecto / Backend Lead | **P1** | Patricio Ramos |
| Backend Developer | **P2** | Bruno Conti |
| Frontend Developer | **P3** | Lucas Coquet |
| QA / DevOps / Mobile | **P4** | Matias Goncevat |

## Estado general al 2026-10-22

> Relevamiento de esa fecha. El estado vigente de cada tarea está en las tablas de más abajo, alineadas al tablero del 2026-11-11.

| Área | Estado real observado |
| --- | --- |
| Arquitectura y decisiones | C4 y ADRs documentados. En la reunión del 21/10 se acordaron las reglas principales de canchas; falta asegurar que la propuesta y los cambios derivados queden integrados en la rama de trabajo. |
| Backend base | NestJS, BFF de autenticación, verificación JWT, guards de roles, Swagger, CORS, health y acceso a Supabase mediante Repository implementados. |
| Sedes y notificaciones | `GET /sedes` y endpoints de notificaciones implementados. El Observer y su publisher existen, pero Clases todavía no publica el evento al cancelar/procesar la lista de espera. |
| Membresías y clases | Hay módulos, repositorios y lógica inicial, además de migración SQL para membresías/clases. Los endpoints de Clases y Membresías aún no aplican los controles de autenticación, autorización y pertenencia previstos en Correcciones S3-T03 / S3-T04. |
| Canchas | Está implementado el cálculo de precios con Strategy. No existe todavía el módulo/API REST de canchas ni sus tablas y reservas en las migraciones del repositorio; por eso la integración de la pantalla está bloqueada. |
| Frontend | *(Snapshot 2026-10-22.)* Prototipos estáticos; login sin backend. **Actualización 2026-11-13:** login real, sesión, Perfil con membresía, Canchas/Clases/Mi QR/Acceso cableados; menú por rol (S7-T08). Quedan stub Notificaciones y Dashboard vacío. |
| Pruebas y entrega | Hay pruebas unitarias y e2e del backend, pruebas SQL de membresías/clases y colección Postman. No se observan tests de frontend, pipeline CI, Docker ni configuración de despliegue en el repositorio. |

> Fase A (`sedes`, `perfiles`, `membresias` y enums): versionada en `supabase/migrations/20260915000000_fase_a_nucleo.sql` (**S5-T01 Finalizado**, 2026-10-27). Encima siguen `20261005220000_membresias_clases.sql` y `20261006190000_notificaciones.sql`.

## Trabajo en curso (ahora — 2026-11-11)

Reunión de equipo. Fuente: tablero Trello, lista «tambien en desarrollo». Las listas «en desarrollo» y «Blocked» no tenían tarjetas. El detalle del cierre C-01…C-27 está en [Plan_Cierre_Entrega_6_19_Nov.md](./Plan_Cierre_Entrega_6_19_Nov.md).

| Integrante | ID | Tarea | Estado |
| --- | --- | --- | --- |
| Patricio Ramos (P1) | C-22 | Recorrer el Anexo G casilla por casilla | **En desarrollo** |
| Bruno Conti (P2) | C-09 | Exportar `backend/swagger.json` y enlazarlo en el README | **En desarrollo** |
| Lucas Coquet (P3) | C-02 | Membresía en UI (`GET /membresias/mia`) | **En desarrollo** |
| Lucas Coquet (P3) | S6-T09 | Notificaciones in-app (listar y marcar leída) | **En desarrollo** |
| Matias Goncevat (P4) | C-19d | Bitácora individual (`docs/bitacoras/LOG-goncevat.md`) | **En desarrollo** |

### Semana 5 — cerrada en el tablero

| Integrante | ID | Tarea | Estado |
| --- | --- | --- | --- |
| Patricio Ramos (P1) | S5-T02 | Migración M4: canchas, reservas, configuraciones y admin_sede | **Finalizado** |
| Patricio Ramos (P1) | S5-T03 | Seed mínimo de demo | **Finalizado** |
| Bruno Conti (P2) | S5-T04 | Guards en Clases y Membresías | **Finalizado** |
| Bruno Conti (P2) | S5-T05 | Ventana 48 h en inscripción | **Finalizado** |
| Lucas Coquet (P3) | S5-T06 | Login real con token y validación | **Finalizado** |
| Lucas Coquet (P3) | S5-T07 | Cliente HTTP base + sesión de usuario | **Finalizado** |
| Lucas Coquet (P3) | S5-T08 | Layout post-login y rutas protegidas | **Finalizado** |
| Lucas Coquet (P3) | S5-T09 | Átomos de UI para Login | **Finalizado** |
| Matias Goncevat (P4) | S5-T10 | Adoptar el plan de 3 semanas y actualizar el seguimiento | **Finalizado** |
| Matias Goncevat (P4) | S5-T11 | Checklist de cuentas GitHub / Supabase / Vercel | **Finalizado** |

> La propuesta de continuidad sigue como respaldo de S5–S7, con los mismos estados. El eje de estas dos semanas es el [plan de cierre](./Plan_Cierre_Entrega_6_19_Nov.md).

### Checklist de cuentas del equipo

| Servicio | Administrador | Contacto / acceso | Estado |
| --- | --- | --- | --- |
| GitHub | Patricio Ramos (P1) | Pedir acceso a la organización o repositorio `FitZoneSports` por usuario de GitHub | **Confirmado** |
| Supabase | Lucas Coquet (P3) | Pedir invitación al proyecto y permisos de desarrollo/demo desde la administración de Supabase | **Confirmado** |
| Vercel | Patricio Ramos (P1) | Pedir invitación al proyecto y permisos de despliegue desde la cuenta del equipo | **Confirmado** |

> Si falta acceso, el primer contacto es la persona responsable del servicio; los secretos y variables de entorno siguen en `.env` local y canales seguros del equipo, no en el repositorio.

## Hitos finalizados

| ID | Tarea / resultado | Evidencia o alcance |
| --- | --- | --- |
| S2-T06 | AuthModule BFF hacia Supabase Auth | Login y validación de JWT implementados. |
| S2-T13 | Swagger para login, health y sedes | Configuración disponible en `/api/docs`. |
| S3-T01 | Swagger, CORS y pruebas manuales de endpoints | Configuración presente en el backend. |
| S3-T03 | Módulo inicial de Membresías | Controller, service y repository implementados; requiere completar seguridad y validaciones. |
| S3-T04 | Módulo inicial de Clases | Consulta de clases, inscripción y cancelación implementadas; requiere completar controles y el flujo Observer. |
| S3-T06 | Diseño SQL de Membresías y Clases | Migración disponible para planes, clases, inscripciones y lista de espera. |
| S5-T01 | Migración Fase A al repo | `20260915000000_fase_a_nucleo.sql`: sedes, perfiles, membresías y enums. Stub local solo arma `auth`. |
| S3-T08 | `.env.example` y documentación de arranque | Plantilla de entorno incluida en el backend. |
| S3-T10 | Separación del cliente Supabase de login | Cliente de autenticación separado del cliente compartido. |
| S3-T11 | Patrón Repository y refactor de Sedes | Repositorio base y repositorio de Sedes implementados. |
| S3-T07 | Prototipo de Mi Perfil | Pantalla creada con datos fijos; la conexión a datos reales queda pendiente en S4-T11/S4-T12. |
| S4-T01 | Strategy de precios | `StandardPricing`, `PeakHourPricing`, `MemberDiscountPricing` y `PreciosService` implementados. Falta usarlos desde la reserva real de cancha. |
| S4-T02 | Observer de notificaciones | Publisher, evento y observadores implementados. Falta conectar el publisher con los casos de uso de Clases (S4-T14). |
| S4-T03 | Prototipo de pantalla Canchas | Pantalla estática creada; conexión con API pendiente de S4-T13. |
| S4-T05 | Justificación de patrones | Patricio la dio por finalizada en la reunión del 21/10. |
| S4-T07 | Colección inicial de Postman | La colección y el entorno están versionados en `postman/`; habrá que ampliarlos para las nuevas APIs. |
| S4-T09 | Reglas de negocio de canchas | Decisiones principales tomadas en la reunión del 21/10 y registradas en el acta/propuesta. Revisar e integrar cualquier cambio documental o de código pendiente, incluido el redondeo hacia arriba. |
| S3-T09 | Reunión de seguimiento del equipo | Realizada el 21/10; acta disponible. |

## Plan de trabajo para las próximas dos semanas

### Prioridad 1 — desbloquear operaciones y corregir seguridad

| ID | Tarea | Responsable propuesto | Estado | Dependencias / criterio de cierre |
| --- | --- | --- | --- | --- |
| S4-T06 | Implementar la API REST de Canchas: esquema/migración, repositorio, servicio y endpoints de disponibilidad y reserva; aplicar reglas acordadas para turnos, mantenimiento y concurrencia. | Bruno (P2) | **Finalizado** | Tarjeta en finalizado. Lectura y reserva también cerradas como S6-T04 y S6-T05. |
| S4-T10 | Asegurar Membresías y Clases: guards y roles, identidad del socio tomada del JWT, control de pertenencia al cancelar, fecha de clase consultada desde la base y DTO/validación para altas de membresía. | Bruno (P2) | **Finalizado** | Sin tarjeta S4-T10. Cierre en S5-T04 (finalizado) y en el LOG del 2026-11-04. |
| S4-T11 | Crear endpoint de perfil propio (`GET /perfiles/me`) y conectar Mi Perfil a datos reales. | Patricio (P1) + Lucas (P3) | **Finalizado** | S6-T01 y S6-T08 en finalizado. |
| S3-T05 | Conectar el formulario de Login con `POST /auth/login`, manejar errores y sesión, y eliminar cualquier impresión de contraseña/token en consola. | Lucas (P3) | **Finalizado** | Tarjeta en finalizado. |

### Prioridad 2 — completar los flujos de usuario

| ID | Tarea | Responsable propuesto | Estado | Dependencias / criterio de cierre |
| --- | --- | --- | --- | --- |
| S4-T12 | Crear cliente de API del frontend y estado de sesión (token/usuario/rol); proteger las rutas que requieran autenticación. | Lucas (P3) | **Finalizado** | S6-T06, S5-T07 y S4-T04 en finalizado. La sesión quedó en React Context (LOG 2026-11-07). |
| S4-T13 | Conectar la pantalla de Canchas a disponibilidad y reserva reales; mostrar precio calculado, reglas aplicadas y resultado de reserva. | Lucas (P3) | **Finalizado** | C-01 y S6-T07 en finalizado. |
| S4-T14 | Integrar el Observer con la cancelación/procesamiento de lista de espera y probar el aviso in-app. Revisar también confirmación y expiración del lugar notificado. | Bruno (P2) | **Finalizado** | S7-T04 en finalizado. LOG 2026-11-04. |
| S4-T15 | Alinear regla de redondeo: la reunión acordó redondear hacia arriba. | Backend P2 + P1 | **Finalizado** | Sin tarjeta abierta. `PreciosService` usa `Math.ceil`. |

### Prioridad 3 — pruebas, documentación y seguimiento

| ID | Tarea | Responsable propuesto | Estado | Dependencias / criterio de cierre |
| --- | --- | --- | --- | --- |
| S4-T16 | Actualizar la propuesta de reglas S4-T09 y verificar que las decisiones acordadas estén integradas en la rama de desarrollo; registrar responsables de cuentas pendientes. | P1 + Matias (P4) | **Por hacer** | La propuesta se registró como pendiente de merge en el acta; revisar estado antes de cerrar. |
| S4-T17 | Ampliar Postman y las pruebas e2e para login, permisos, perfil, reservas de canchas y lista de espera; cubrir casos de acceso no autorizado y concurrencia. | Matias (P4) + responsables de módulo | **Por hacer** | Se pueden avanzar pruebas de auth/permisos en paralelo; pruebas de canchas dependen de S4-T06. |
| S4-T18 | Actualizar el LOG y realizar demo técnica de cierre con estado, bloqueos y próximos pasos. | Matias (P4) + equipo | **Por hacer** | Incluir lo completado desde el acta del 21/10. |

## Orden sugerido y bloqueos

Al 2026-11-11, S4-T06, S3-T05 y S4-T10 a S4-T15 están finalizadas. Siguen **Por hacer** en este plan S4-T16, S4-T17 y S4-T18: no tienen tarjeta propia.

Lo que el tablero deja en **Por hacer** para el cierre está en el plan del 6–19/11. Por persona, además de lo que ya está en desarrollo:

1. Patricio: C-23, C-24, C-25, C-26 y C-27, después de C-22.
2. Bruno: C-04 (PDF comprobante) y C-19b (bitácora), en paralelo con C-09.
3. Lucas: S7-T07 (hermana de C-02), S7-T09, C-12 (hermana de S6-T09), C-16 y C-19c. **S7-T06/C-11 y S7-T08** las cerró Patricio (2026-11-13).
4. Matias: C-07, C-08, C-10, C-17, C-20 y C-21, en paralelo con C-19d.

## Fuera del alcance inmediato

| Tema | Motivo |
| --- | --- |
| App móvil React Native | La app nativa sigue fuera de este plan. El stretch S7-T12 (QR/móvil) está finalizado en el tablero. |
| Pagos reales o pasarela de pago | Módulo M5; el pago mock (S7-T02) está finalizado. La pasarela real no. |
| Membresías con pago/renovación completa | Requiere lógica de renovación y módulo de pagos. La seguridad de altas ya está en S5-T04. |
| Docker y despliegue | El CI de backend (S6-T10) está finalizado. Docker sigue en C-07, por hacer. |
| Gestión integral de sedes, clases, reportes y acceso/aforo | Son funcionalidades pendientes de los módulos M1–M5; no se presentan como terminadas en este plan. |

## Control de avance

La reunión del 2026-11-11 dejó los estados de este archivo alineados al tablero. El seguimiento vivo está en la sección **Trabajo en curso** y en [LOG.md](../bitacoras/LOG.md) (entrada 2026-11-11).

1. S4-T10 a S4-T15 quedaron finalizadas. Siguen por hacer S4-T16, S4-T17 y S4-T18.
2. El próximo corte de estados es el del plan de cierre (C-01…C-27).
3. Registrar bloqueos y cambios en [LOG.md](../bitacoras/LOG.md).

---

*Plan de trabajo · FitZone Sports · Programación V · UNER*
