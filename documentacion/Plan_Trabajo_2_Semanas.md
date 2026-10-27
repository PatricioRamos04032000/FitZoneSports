# Plan de trabajo — Próximas 2 semanas

**Proyecto:** FitZone Sports · Programación V · UNER  
**Equipo:** 4 integrantes  
**Período de referencia:** 2026-10-22 al 2026-11-05
**Última actualización:** 2026-10-27
**Unidad en curso:** III (Patrones), con integración del frontend y avance de módulos de negocio

**Referencias:** [Trabajo Integrador](./Trabajo_Integrador_FitZone_Sports.md) · [Acta 2026-10-21](./Acta_Reunion_2026-10-21_Seguimiento.md) · [Decisiones pendientes](./Decisiones_Pendientes_y_Cosas_a_Definir.md) · [Correcciones de Membresías y Clases](./Correcciones_S3-T03_S3-T04_Membresias_Clases.md) · [LOG](./LOG.md)

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

| Área | Estado real observado |
| --- | --- |
| Arquitectura y decisiones | C4 y ADRs documentados. En la reunión del 21/10 se acordaron las reglas principales de canchas; falta asegurar que la propuesta y los cambios derivados queden integrados en la rama de trabajo. |
| Backend base | NestJS, BFF de autenticación, verificación JWT, guards de roles, Swagger, CORS, health y acceso a Supabase mediante Repository implementados. |
| Sedes y notificaciones | `GET /sedes` y endpoints de notificaciones implementados. El Observer y su publisher existen, pero Clases todavía no publica el evento al cancelar/procesar la lista de espera. |
| Membresías y clases | Hay módulos, repositorios y lógica inicial, además de migración SQL para membresías/clases. Los endpoints de Clases y Membresías aún no aplican los controles de autenticación, autorización y pertenencia previstos en [Correcciones S3-T03 / S3-T04](./Correcciones_S3-T03_S3-T04_Membresias_Clases.md). |
| Canchas | Está implementado el cálculo de precios con Strategy. No existe todavía el módulo/API REST de canchas ni sus tablas y reservas en las migraciones del repositorio; por eso la integración de la pantalla está bloqueada. |
| Frontend | Existen prototipos estáticos para Inicio, Login, Perfil y Canchas. Login aún no llama al backend; Mi Perfil y Canchas muestran datos de prueba. No hay cliente API, sesión global ni rutas protegidas. |
| Pruebas y entrega | Hay pruebas unitarias y e2e del backend, pruebas SQL de membresías/clases y colección Postman. No se observan tests de frontend, pipeline CI, Docker ni configuración de despliegue en el repositorio. |

> Fase A (`sedes`, `perfiles`, `membresias` y enums): versionada en `supabase/migrations/20260915000000_fase_a_nucleo.sql` (**S5-T01 Finalizado**, 2026-10-27). Encima siguen `20261005220000_membresias_clases.sql` y `20261006190000_notificaciones.sql`.

## Trabajo en curso confirmado en la reunión del 2026-10-21

| Integrante | Tarea | Trabajo / estado |
| --- | --- | --- |
| Patricio Ramos (P1) | Actualización del plan y documentación de seguimiento | **En desarrollo** según el compromiso de actualizar el plan para el docente. La justificación de patrones ya se dio por finalizada. |
| Bruno Conti (P2) | S4-T06 — API REST de Canchas | **En desarrollo.** Es la tarea actual; la API todavía no está presente en el código. |
| Lucas Coquet (P3) | S3-T05 — Conectar Login con `POST /auth/login` | **En desarrollo.** La página existe, pero el formulario todavía no está integrado y actualmente imprime credenciales en consola; hay que quitar ese comportamiento. |
| Matias Goncevat (P4) | Checklist de cuentas (GitHub, Supabase y Vercel) | **En desarrollo**, según el acta. Después debe preparar el plan siguiente y actualizar el LOG. |

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
| S4-T06 | Implementar la API REST de Canchas: esquema/migración, repositorio, servicio y endpoints de disponibilidad y reserva; aplicar reglas acordadas para turnos, mantenimiento y concurrencia. | Bruno (P2) | **En desarrollo** | Reglas de S4-T09. Cierra cuando los endpoints y persistencia puedan probarse sin datos ficticios y sin sobreventa. |
| S4-T10 | Asegurar Membresías y Clases: guards y roles, identidad del socio tomada del JWT, control de pertenencia al cancelar, fecha de clase consultada desde la base y DTO/validación para altas de membresía. | Backend (P2; confirmar con el equipo) | **Por hacer** | No requiere esperar a S4-T06. Usar como guía los puntos de prioridad alta de [Correcciones S3-T03 / S3-T04](./Correcciones_S3-T03_S3-T04_Membresias_Clases.md). |
| S4-T11 | Crear endpoint de perfil propio (`GET /perfiles/me`) y conectar Mi Perfil a datos reales. | Backend P2 + Frontend P3 (asignación a confirmar) | **Por hacer** | El endpoint no existe; no exponer un perfil arbitrario indicado por el cliente. |
| S3-T05 | Conectar el formulario de Login con `POST /auth/login`, manejar errores y sesión, y eliminar cualquier impresión de contraseña/token en consola. | Lucas (P3) | **En desarrollo** | Backend de autenticación ya disponible. Cierra con prueba real de login y respuesta de credenciales inválidas. |

### Prioridad 2 — completar los flujos de usuario

| ID | Tarea | Responsable propuesto | Estado | Dependencias / criterio de cierre |
| --- | --- | --- | --- | --- |
| S4-T12 | Crear cliente de API del frontend y estado de sesión (token/usuario/rol); proteger las rutas que requieran autenticación. | Lucas (P3) | **Por hacer** | S3-T05. Mantener al frontend comunicándose con Nest, no directamente con Supabase Auth. |
| S4-T13 | Conectar la pantalla de Canchas a disponibilidad y reserva reales; mostrar precio calculado, reglas aplicadas y resultado de reserva. | Lucas (P3) | **Por hacer** | Bloqueada por S4-T06 y por el cliente API de S4-T12. |
| S4-T14 | Integrar el Observer con la cancelación/procesamiento de lista de espera y probar el aviso in-app. Revisar también confirmación y expiración del lugar notificado. | Backend (P2; confirmar con el equipo) | **Por hacer** | El publisher y los observers ya existen, pero el servicio de Clases todavía no los invoca. |
| S4-T15 | Alinear regla de redondeo: la reunión acordó redondear hacia arriba, mientras la propuesta y `PreciosService` actualmente indican/usan `Math.round`; actualizar implementación, pruebas y documentación. | Backend P2 + P1 | **Por hacer** | Regla acordada en el acta del 21/10. |

### Prioridad 3 — pruebas, documentación y seguimiento

| ID | Tarea | Responsable propuesto | Estado | Dependencias / criterio de cierre |
| --- | --- | --- | --- | --- |
| S4-T16 | Actualizar la propuesta de reglas S4-T09 y verificar que las decisiones acordadas estén integradas en la rama de desarrollo; registrar responsables de cuentas pendientes. | P1 + Matias (P4) | **Por hacer** | La propuesta se registró como pendiente de merge en el acta; revisar estado antes de cerrar. |
| S4-T17 | Ampliar Postman y las pruebas e2e para login, permisos, perfil, reservas de canchas y lista de espera; cubrir casos de acceso no autorizado y concurrencia. | Matias (P4) + responsables de módulo | **Por hacer** | Se pueden avanzar pruebas de auth/permisos en paralelo; pruebas de canchas dependen de S4-T06. |
| S4-T18 | Actualizar el LOG y realizar demo técnica de cierre con estado, bloqueos y próximos pasos. | Matias (P4) + equipo | **Por hacer** | Incluir lo completado desde el acta del 21/10. |

## Orden sugerido y bloqueos

1. Continuar S4-T06 y S3-T05 en paralelo.
2. Atender S4-T10 como prioridad de seguridad; hoy los controllers de Clases y Membresías todavía permiten operaciones sin los guards descritos en la guía de correcciones.
3. Implementar S4-T11 para desbloquear el perfil real.
4. Avanzar S4-T12; luego conectar Canchas en S4-T13 cuando S4-T06 esté disponible.
5. Integrar S4-T14 y corregir el redondeo en S4-T15.
6. Completar documentación, pruebas y demo (S4-T16 a S4-T18).

## Fuera del alcance inmediato

| Tema | Motivo |
| --- | --- |
| App móvil React Native y QR/TOTP offline | Diferidos a la Unidad VI; la validación offline de acceso todavía tiene decisiones pendientes. |
| Pagos reales o pasarela de pago | Módulo M5; no hay integración implementada. |
| Membresías con pago/renovación completa | Requiere cerrar seguridad, lógica de renovación y módulo de pagos. |
| Pipeline CI/CD, Docker y despliegue | No están configurados en el repositorio; planificar como trabajo específico de Unidad V. |
| Gestión integral de sedes, clases, reportes y acceso/aforo | Son funcionalidades pendientes de los módulos M1–M5; no se presentan como terminadas en este plan. |

## Control de avance

En la próxima reunión:

1. Confirmar responsables y estimaciones de S4-T10 a S4-T18.
2. Actualizar estados con evidencia del código, pruebas o documentación.
3. Verificar si S4-T09 quedó integrado en la rama de desarrollo.
4. Probar primero los endpoints y después los flujos del frontend.
5. Registrar bloqueos y cambios en [LOG.md](./LOG.md).

---

*Plan de trabajo · FitZone Sports · Programación V · UNER*
