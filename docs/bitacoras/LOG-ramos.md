# Bitácora — Ramos Patricio — Rol P1

Registro individual de Patricio Ramos (P1, arquitectura, documentación y backend crítico). Cada entrada es una sesión de trabajo. En **Commits** van los commits de esa sesión y el merge del pull request que los integró a la rama. Un merge de sincronización se cita solo cuando trajo un cambio concreto.

Las horas anteriores al 6/11 son una estimación reconstruida por el tamaño de la sesión. Las del 9 y el 11/11 salen del plan de cierre: C-13 3 h, C-14 6 h, C-15 6 h (parte propia del estimado de 8–10 h compartido con Bruno) y C-18 4 h.

---

## Sprint 1 — Unidad I — Semana del 2026-08-24

### 2026-08-27  ·  6 h

**Actividad**

Entre el 22 y el 27/08 dejé el repositorio en marcha y la base de arquitectura de Unidad I. El 22 subí el enunciado del trabajo integrador (`815179a`) y moví la documentación a `documentacion/`, con los permisos por actor (`e96a34d`). El 25 cerré el stack, el C4, los primeros ADR y el documento de decisiones pendientes (`c8836ba`). El 26 registré la reunión de equipo en la bitácora grupal (`466901e`). El 27 escribí la propuesta de acceso con TOTP y cola offline (`9ba5276`).

**Decisión**

El ingreso a sede se resuelve con un código rotativo (TOTP) y una cola que la sede drena cuando vuelve la red. Esa propuesta es el origen de la estrategia offline vigente en [ADR-003](../adr/ADR-003-estrategia-offline-acceso.md) y del detalle de sincronización en [ADR-007](../adr/ADR-007-acceso-totp-cola-offline.md).

**Problema o bloqueo**

En el C4 de esa semana el offline del socio (mostrar el QR en el teléfono) y el offline de la sede (validar el check-in sin la conexión principal) quedaron en el mismo recuadro. El alcance correcto lo separé el 4/09, en `92c3705`.

**Commits**

- `815179a` Initial commit: add FitZone Sports integrator work document.
- `e96a34d` Add actor permissions docs and move docs into documentacion/.
- `c8836ba` Add stack, C4, ADRs and pending decisions docs.
- `466901e` Add team log entry for Aug 26 sync meeting.
- `9ba5276` Document offline access and TOTP check-in proposal.

---

## Sprint 1 — Unidad I — Semana del 2026-08-31

### 2026-08-31  ·  5 h

**Actividad**

El 28/08 bajé a documentos el feedback del docente y armé el plan de trabajo de dos semanas (`789657b`). El 31 escribí los ADR de la pasarela de auth y del acceso a datos sin ORM, y unifiqué el formato de los ADR que ya existían (`09eff84`). El mismo día generé el Excel de importación a Trello (`a063feb`).

**Decisión**

NestJS queda como BFF: el frontend solo habla con la API Nest, y Nest delega la identidad en Supabase Auth. Los datos se leen por la API de Supabase, sin ORM. Hoy eso está en [ADR-011](../adr/ADR-011-bff-supabase-auth.md) y en [ADR-005](../adr/ADR-005-backend-nestjs-ioc-datos.md). En la numeración de agosto eran ADR-005 y ADR-006.

**Problema o bloqueo**

En una lectura previa anoté que el docente pedía la autenticación armada por completo dentro de Nest. El 28/08 corrigió el alcance: la identidad es Supabase Auth, y lo que no se puede saltear es el BFF. Reescribí los ADR ese día para que el texto coincidiera con esa corrección.

**Commits**

- `789657b` Add 2-week work plan and doc updates from professor feedback.
- `09eff84` Document BFF/Auth and Supabase API as ADR-005/006 and unify ADR format.
- `a063feb` Create Plan_Trabajo_Trello_Import.xlsx

---

## Sprint 2 — Unidad I — Semana del 2026-08-31

### 2026-09-04  ·  3 h

**Actividad**

Registré el cierre de la reunión de la semana 1 y la aclaración del docente sobre la entrega de C4 y ADR (`eb8150d`). Actualicé el C4 (`da9e335`) y separé el alcance offline: el RNF-01 de esta entrega es el check-in de sede, y el QR offline del teléfono queda para la app móvil (`92c3705`).

**Decisión**

C4 y ADR se entregan con el Demo Day y se actualizan mientras se desarrolla. No bloquean el código de Unidad II. El diagrama relacional y el de clases entran al paquete cuando el código los justifica.

**Problema o bloqueo**

El diagrama de contexto todavía describía el offline del teléfono del socio como parte del alcance inmediato. Lo alineé al check-in de sede en `92c3705`.

**Commits**

- `eb8150d` Record Semana 1 meeting outcomes and teacher guidance on C4/ADR delivery.
- `da9e335` Update C4_Arquitectura_FitZone.md
- `92c3705` Align C4 offline scope with sede check-in (RNF-01) vs mobile QR.

---

## Sprint 2 — Unidad I — Semana del 2026-09-14

### 2026-09-19  ·  4 h

**Actividad**

Escribí la propuesta de modelo entidad-relación (`documentacion/Propuesta_ER_FitZone.md`, 341 líneas en el diff) y ajusté el inventario de diagramas. El relacional queda como documento vivo, en la misma línea que la aclaración del 4/09: entra al paquete de arquitectura a medida que el código lo sostiene, y la entrega formal es al final del curso.

**Decisión**

El DER de esta fecha es una propuesta para seguir trabajando, no el PDF cerrado de Unidad I.

**Problema o bloqueo**

El commit quedó con mensaje `a`. El contenido está en el diff: la propuesta de ER y el retoque del inventario. El mensaje no describe ese trabajo.

**Commits**

- `8bb8586` a

---

## Sprint 2 — Unidad II — Semana del 2026-09-21

### 2026-09-26  ·  5 h

**Actividad**

Dejé el backend con un primer contrato verificable. `GET /health` y Swagger en `/api/docs` (`ae98766`, integrado en el PR #2). El guard JWT valida el access token de Supabase Auth y protege las rutas que lo declaran (`1e69752`, PR #3). El guard no emite sesión propia: acepta o rechaza el token que ya emitió Supabase.

**Decisión**

La sesión de identidad sale de Supabase Auth. Nest solo verifica el JWT y, más adelante, el rol de negocio. Quedó registrado en [ADR-011](../adr/ADR-011-bff-supabase-auth.md).

**Problema o bloqueo**

Entre el C4 del 4/09 y este primer endpoint pasaron tres semanas. La documentación de arquitectura avanzó sola y el monolito todavía no levantaba un módulo. A partir de esta sesión el criterio fue tener un endpoint mergeado por cada bloque de docs.

**Commits**

- `ae98766` S2-T08: endpoint GET /health y Swagger en /api/docs
- `b8507eb` Merge pull request #2 from PatricioRamos04032000/S2-T08
- `1e69752` S2-T07: Guard JWT que valida tokens de Supabase Auth
- `fdf5df6` Merge pull request #3 from PatricioRamos04032000/S2-T07

---

## Sprint 3 — Unidad II — Semana del 2026-10-05

### 2026-10-05  ·  8 h

**Actividad**

El 1/10 actualicé el plan de dos semanas contra el tablero (`c544f93`, PR #7), archivé el plan de las semanas 1 y 2 con los estados de Trello (`fef3dbf`, PR #8) y mergeé `master` en `desarrollo` para adoptar el plan de las semanas 3 y 4 (`2c2a542`).

El 5/10 documenté login, health y sedes en Swagger (`6138a83`, PR #9). Diseñé el SQL de membresías y clases (`975e367`) y registré la ejecución de esa migración y el seed en Supabase (`7344be3`, PR #10). Pasé `GET /sedes` por una plantilla de Repository (`a431a94`, PR #11), marqué S3-T06, S3-T11, S3-T01 y S2-T13 como finalizadas (`f97e484`, PR #12) y configuré CORS con `CORS_ORIGIN` (`f0b847b`, PR #13).

**Decisión**

`GET /sedes` deja de armar la consulta en el controlador y pasa por Repository. Esa plantilla es la que después usaron los otros módulos. El acceso sigue siendo la API de Supabase, como en [ADR-005](../adr/ADR-005-backend-nestjs-ioc-datos.md).

**Problema o bloqueo**

El SQL de membresías y clases no alcanzaba con commitear el archivo. La cuenta de Supabase estaba a cargo de Lucas, y la migración seguía sin ejecutarse en el proyecto remoto. La cerré el mismo día, cuando registré la corrida y el seed en `7344be3`.

**Commits**

- `c544f93` Actualiza estado del plan de 2 semanas segun tablero Trello (2026-10-01)
- `059c2ea` Merge pull request #7 from PatricioRamos04032000/actualiza-estado-plan
- `fef3dbf` Agrega plan historico de semanas 1 y 2 con estados de Trello (2026-10-01)
- `2bf612d` Merge pull request #8 from PatricioRamos04032000/plan-estado-a-master
- `2c2a542` Merge master en desarrollo: adopta plan de semanas 3 y 4
- `6138a83` S2-T13: documenta login, health y sedes en Swagger
- `741cb1a` Merge pull request #9 from PatricioRamos04032000/S2-T13
- `975e367` S3-T06: diseno de BD para membresias y clases con migracion SQL
- `7344be3` S3-T06: registra ejecucion de la migracion y seed en Supabase
- `bab924c` Merge pull request #10 from PatricioRamos04032000/S3-T06
- `a431a94` S3-T11: plantilla del patron Repository y refactor de GET /sedes
- `aea840f` Merge pull request #11 from PatricioRamos04032000/S3-T11
- `f97e484` Actualiza estados del plan: S3-T06, S3-T11, S3-T01 y S2-T13 finalizadas (2026-10-05)
- `7236b8c` Merge pull request #12 from PatricioRamos04032000/actualiza-plan-s3
- `f0b847b` S3-T01: configura CORS con CORS_ORIGIN
- `0bbeb6f` Merge pull request #13 from PatricioRamos04032000/S3-T01

---

## Sprint 4 — Unidad III — Semana del 2026-10-05

### 2026-10-06  ·  8 h

**Actividad**

Día de patrones y de reglas de precio. Implementé el Observer de la lista de espera para avisar lugares liberados (`7510143`, PR #14) y, en un commit aparte, lo pasé a `@nestjs/event-emitter` (`762a14c`, PR #19). Justifiqué esa elección contra la diapositiva 37 (`eb6e82c`, PR #21) y dejé la justificación general de patrones de la unidad (`71b869c`) más las notas de la clase 1 (`34ae6d1`, PR #20).

En precios dejé la propuesta de reglas (`e6bd7ae`), el horario pico por sede (`0cfa7c7`), el descuento de socio para toda la cadena (`3334fa0`), el límite de que el gerente edita el pico solo de sus sedes (`2f543d3`) y el alta del descuento por el administrador (`2e4085a`, PR #16). Alineé los roles con la consigna: A3 `admin_sede` y A4 gerente (`f471790`, PR #17). El guard `@RequiereRol` valida `perfiles.rol` y `/auth/me` devuelve ese rol (`3cab665`, PR #18).

El login dejó de usar el cliente Supabase compartido (`50de31c`, PR #15).

**Decisión**

La lista de espera publica el evento con `@nestjs/event-emitter` y los suscriptores viven en el módulo de notificaciones. Descarté un `Subject` propio: el emisor de Nest ya da el desacople y se testea con el módulo de testing del framework.

**Problema o bloqueo**

El login escribía la sesión sobre el mismo cliente Supabase que usaban el resto de las consultas. Una sesión de socio contaminaba la llamada siguiente. Lo separé con un cliente dedicado al login en `50de31c`.

**Commits**

- `7510143` S4-T02: patron Observer para notificar lugares liberados de la lista de espera
- `70e8c4b` Merge pull request #14 from PatricioRamos04032000/S4-T02
- `50de31c` Fix: el login usa un cliente Supabase propio y no contamina el cliente compartido
- `7bd0918` Merge pull request #15 from PatricioRamos04032000/fix-login-cliente-compartido
- `e6bd7ae` S4-T09: propuesta de reglas de precio de canchas y decisiones pendientes
- `0cfa7c7` S4-T09: horario pico configurable por sede (recargo, horario y dias)
- `3334fa0` S4-T09: descuento de socio configurable para toda la cadena
- `2f543d3` S4-T09: el gerente edita la configuracion pico solo de sus sedes
- `2e4085a` S4-T09: rol administrador edita el descuento de socio de la cadena
- `07a480a` Merge pull request #16 from PatricioRamos04032000/S4-T09
- `f471790` S4-T09: alinea roles con la consigna (A3 admin_sede, A4 gerente)
- `4956de5` Merge pull request #17 from PatricioRamos04032000/S4-T09
- `3cab665` Guard de roles: @RequiereRol valida perfiles.rol y /auth/me devuelve el rol
- `b45297f` Merge pull request #18 from PatricioRamos04032000/guard-roles
- `71b869c` S4-T05: justificacion de patrones de la Unidad III
- `762a14c` Observer de lista de espera con @nestjs/event-emitter en lugar del Subject propio
- `63984cd` Merge pull request #19 from PatricioRamos04032000/S4-T02-event-emitter
- `34ae6d1` Agrega la clase 1 de patrones (Unidad III) y notas frente a FitZone
- `cf361fb` Merge pull request #20 from PatricioRamos04032000/S4-T05
- `eb6e82c` S4-T05: justificacion del Observer con @nestjs/event-emitter y decisiones de la diapositiva 37
- `379fd62` Merge pull request #21 from PatricioRamos04032000/S4-T05-observer-event-emitter

---

## Sprint 4 — Unidad III — Semana del 2026-10-12

### 2026-10-15  ·  4 h

**Actividad**

El 13/10 escribí el panorama del desarrollo, la estructura del backend y las correcciones de Membresías y Clases (`7745601`, PR #23), y el acta de la reunión de seguimiento (`8eef901`, PR #24). El 15 cerré la confección final de la justificación de patrones (`7cf3115`, PR #25), con el Observer ya apoyado en la diapositiva 37 desde el 6/10.

**Decisión**

La justificación de Unidad III queda cerrada en el documento de patrones, con el Observer sobre `@nestjs/event-emitter` y la referencia a la diapositiva 37. No reabro el Subject propio.

**Problema o bloqueo**

El backend ya tenía Repository, Observer y las reglas de precio, y el frontend seguía en scaffolding. El panorama del 13/10 lo deja asentado: la demo de patrones se podía mostrar por API, y la pantalla todavía no.

**Commits**

- `7745601` Docs: panorama del desarrollo, estructura del backend y correcciones de Membresias y Clases
- `53a912b` Merge pull request #23 from PatricioRamos04032000/docs-panorama-y-correcciones
- `8eef901` Acta de la reunion de seguimiento del 2026-10-13
- `67ab971` Merge pull request #24 from PatricioRamos04032000/acta-reunion-2026-10-13
- `7cf3115` S4-T05: confeccion final de la justificacion de patrones
- `1f25a41` Merge pull request #25 from PatricioRamos04032000/S4-T05-confeccion-final

---

## Sprint 5 — Unidad III — Semana del 2026-10-19

### 2026-10-21  ·  4 h

**Actividad**

Extendí la edición de precios: gerente y recepcionista editan la configuración, y una reserva de cancha se puede tomar hasta un mes hacia adelante (`9fb6aa7`, PR #26). Dejé el acta de la reunión de seguimiento de ese día (`3cf3658`, PR #27).

**Decisión**

El pico se configura por sede y lo edita el gerente de esas sedes. El descuento de socio es uno solo para la cadena. La ventana de reserva de cancha queda en un mes.

**Problema o bloqueo**

La ventana de reserva que había quedado implementada era corta para el ensayo del guion: no alcanzaba para mostrar una reserva hacia adelante sin chocar con el cierre del día. La llevé a un mes en `9fb6aa7`.

**Commits**

- `9fb6aa7` S4-T09: gerente y recepcionista editan precios, y las reservas de cancha llegan hasta un mes.
- `0256a64` Merge pull request #26 from PatricioRamos04032000/S4-T09
- `3cf3658` Acta de la reunion de seguimiento del 2026-10-21.
- `6a026e8` Merge pull request #27 from PatricioRamos04032000/acta-reunion-2026-10-21

---

## Sprint 5 — Unidad III — Semana del 2026-10-26

### 2026-10-27  ·  7 h

**Actividad**

El 26 dejé la propuesta de plan de tres semanas para llegar al demo y a la rúbrica (`ca0c3d6`, PR #28). El 27 versioné en el repo la migración Fase A de sedes, perfiles y membresías (`bac116f`, PR #29) y la de canchas, reservas y config de precios (`482d5ae`, PR #30), y agregué el seed mínimo de demo con `npm run seed` (`2d8b4f8`, PR #31).

El mismo día cerré el laboratorio de Unidad III: caracterización de precios, planilla de olores y la nota de que la consigna de refactor en seis commits no aplica (`a1b5223`, PR #32). Los tests de caracterización quedaron en `backend/src/canchas/precios/precios.service.spec.ts`.

**Decisión**

El SQL de sedes, perfiles, membresías, canchas y precios vive en migraciones del repositorio, no solo en el historial de Supabase. El laboratorio de olores no reescribe el cálculo de precio: Strategy ya era el diseño.

**Problema o bloqueo**

La consigna 3 pedía un replay de seis commits para reemplazar un condicional por polimorfismo. En el repo no había un `if`/`switch` de precios del cual partir. Bruno ya había dejado el patrón en `71c993d` (S4-T01). Reconstruir un «antes» falso para cumplir la consigna hubiera inventado historia. Lo documenté en `a1b5223` y la evidencia del cálculo quedó en los tests de caracterización.

**Commits**

- `ca0c3d6` Propuesta de plan de 3 semanas para llegar al demo y a la rubrica.
- `97e4056` Merge pull request #28 from PatricioRamos04032000/propuesta-3-semanas
- `bac116f` S5-T01: versiona la migracion Fase A (sedes, perfiles, membresias).
- `10fa5a2` Merge pull request #29 from PatricioRamos04032000/S5-T01
- `482d5ae` S5-T02: migracion M4 de canchas, reservas y config de precios.
- `6a4050b` Merge pull request #30 from PatricioRamos04032000/S5-T02
- `2d8b4f8` S5: seed mínimo de demo con npm run seed.
- `c92eb30` Merge pull request #31 from PatricioRamos04032000/S3-T03
- `a1b5223` Lab Unidad III: olores, caracterizacion de precios y docs pendientes.
- `482e8c8` Merge pull request #32 from PatricioRamos04032000/lab-iii-olores-caracterizacion-docs

---

## Sprint 6 — Unidad IV — Semana del 2026-10-26

### 2026-10-29  ·  6 h

**Actividad**

El 28 expuse `GET /perfiles/me` y `PATCH /perfiles/me` leyendo la identidad del JWT (`599e207`, PR #33) y versioné la migración del módulo de pagos, con la nota del Adapter (`0622c52`, PR #34). El 29 escribí la guía de tests, la sección de demo del README y las exclusiones de Jest para el reporte de cobertura (`49cacd8`, PR #35).

**Decisión**

El perfil del socio no recibe el id por query ni por body. Sale del token que ya validó el guard. El pago simulado entra como módulo propio (M5), con la migración en el repo.

**Problema o bloqueo**

El estado global de sesión del frontend seguía sin un dueño cerrado: el perfil ya se podía leer desde el JWT en la API, y el cliente todavía no tenía un lugar único para guardarlo ni para reaccionar a un 401. Ese hueco lo tomé el 7/11 (`06c0287`).

**Commits**

- `599e207` S6-T01: GET/PATCH /perfiles/me desde el JWT.
- `843c668` Merge pull request #33 from PatricioRamos04032000/S6-T01
- `0622c52` S6-T03: migracion M5 de pagos y nota Adapter.
- `bcc20f1` Merge pull request #34 from PatricioRamos04032000/S6-T03
- `49cacd8` Docs y coverage: guía de tests, demo en README y exclusiones de Jest.
- `bef300b` Merge pull request #35 from PatricioRamos04032000/docs-guia-tests-readme

---

## Sprint 6 — Unidad V — Semana del 2026-10-26

### 2026-11-01  ·  8 h

**Actividad**

El 31/10 cerré el alta de socio con `POST /auth/register` y confirmación de email (`1c76b98`, PR #36). Saqué el probe de signup duplicado que Sonar marcaba (`87329f6`, PR #37). La reserva de cancha pasó a Facade y State, con Strategy ya en uso para el precio (`7d1a4c0`); después bajé la duplicación de los tests de State y alineé el HTTP y el Swagger de cancelar (`9c8df29`, PR #38).

El 1/11 dejé la pasarela simulada: checkout con forma de Mercado Pago y la reserva en hold mientras el pago está pendiente (`d3f1985`). La CI pasó a Node 24 (`5ee4c9d`). Los dos entran en el PR #40. El token de la pasarela no guarda la tarjeta; el criterio vigente está en [ADR-010](../adr/ADR-010-tokenizacion-medios-de-pago.md).

**Decisión**

Reservar cancha entra por un Facade y el estado de la reserva lo maneja State. El precio lo sigue calculando Strategy. La CI corre en Node 24 porque Jest con los módulos ESM de Nest no levantaba la suite en la versión anterior.

**Problema o bloqueo**

Sonar marcaba un probe de signup duplicado en los tests de registro. Lo eliminé en `87329f6` para que el análisis dejara de señalar el mismo alta dos veces. El otro freno fue la CI: la suite fallaba por la combinación Jest y ESM, y se resolvió fijando Node 24 en `5ee4c9d`.

**Commits**

- `1c76b98` S6-T02: POST /auth/register con confirmación de email.
- `3ecfb06` Merge pull request #36 from PatricioRamos04032000/S6-T02
- `87329f6` Remove probe de signup duplicado marcado por Sonar.
- `b8366ea` Merge pull request #37 from PatricioRamos04032000/s6t2-sonarfix
- `7d1a4c0` S7-T01: Facade y State para reservar cancha; Strategy en uso.
- `9c8df29` S7-T01: baja duplicacion en tests de State y alinea HTTP/Swagger de cancelar.
- `5bfad14` Merge pull request #38 from PatricioRamos04032000/S7-T01
- `d3f1985` S7-T02: pasarela simulada con checkout estilo MercadoPago y hold de pendiente.
- `5ee4c9d` fix(ci): usar Node 24 para tests Jest con Nest ESM.
- `132ee73` Merge pull request #40 from PatricioRamos04032000/S7-T02

---

## Sprint 7 — Unidad V y VI — Semana del 2026-11-02

### 2026-11-03  ·  5 h

**Actividad**

El 2/11 restauré los ADR 002 a 004 como reemplazados y sumé 008 a 010 en la numeración que el equipo usaba hasta entonces (`e8ff826`, PR #41). El 3 documenté la Fase 0 de acceso M2: TOTP, cola offline y RN-01 (`0446367`, PR #42), publiqué el changelog en la versión 0.23.0 (`9d4b977`) y cerré los avisos de Sonar de registro, perfil y sesión (`8d51afa`).

**Decisión**

La app nativa no entra en el tag del 19/11. El offline que esta entrega demuestra es la cola del terminal de sede, documentada en [ADR-003](../adr/ADR-003-estrategia-offline-acceso.md) y [ADR-007](../adr/ADR-007-acceso-totp-cola-offline.md). El QR del teléfono queda en la web responsive.

**Problema o bloqueo**

RNF-01, leído como «el socio muestra un QR válido sin señal», pide la app de Unidad VI. Esa app no está construida y no entra en los días que quedan hasta el tag. Lo que sí se puede mostrar es la sede validando con la cola local. Lo dejé escrito en la Fase 0 (`0446367`) para no prometer el teléfono offline en la defensa.

**Commits**

- `e8ff826` docs(adr): restaurar 002-004 como reemplazados y agregar 008-010
- `9048208` Merge pull request #41 from PatricioRamos04032000/fix-adrs
- `0446367` S8-T1: documenta Fase 0 de acceso M2 (TOTP, cola offline y RN-01).
- `f4d2012` Merge pull request #42 from PatricioRamos04032000/s8t1
- `9d4b977` chore: publica el changelog y fija la version 0.23.0
- `8d51afa` fix: cierra los avisos de Sonar del registro, el perfil y la sesion

---

## Sprint 7 — Cierre — Semana del 2026-11-02

### 2026-11-06  ·  4 h

**Actividad**

Escribí el plan de cierre del Equipo 03, del 6 al 19/11, con los tres tramos, el backlog C-01 a C-27 y el corte explícito de lo que no entra (`4ffb99b`, PR #48). El criterio de orden quedó en el propio plan: primero la admisibilidad del §6.1 y la demo de canchas en la UI.

**Decisión**

Si el tiempo no alcanza, se corta lo de la sección 7 del plan (app nativa, Mercado Pago real, reportes de gerente) y se sostiene lo que bloquea la devolución: bitácoras, ADR, diagramas, manuales, planificación y el tag.

**Problema o bloqueo**

El tablero ya tenía tarjetas S5–S7 que nombraban el mismo trabajo que las tarjetas C del cierre. Borrarlas perdía la historia del cuatrimestre. Las dejé y las crucé en el documento de observaciones, que commiteé al día siguiente (`ecb45cd`).

**Commits**

- `4ffb99b` docs: plan de cierre Equipo 03 para la entrega del 19/11.
- `4a6247b` Merge pull request #48 from PatricioRamos04032000/docs/plan-cierre-entrega-6-19-nov

---

## Sprint 8 — Unidad IV y Cierre — Semana del 2026-11-02

### 2026-11-08  ·  6 h

**Actividad**

El 7/11 crucé las tarjetas de Trello que se solapan con el plan de cierre (`ecb45cd`, PR #50). Tomé el estado global de sesión que estaba a cargo de Lucas (`06c0287`) y, en el commit siguiente, tipé el rol de FitZone y cerré la sesión cuando una llamada autenticada responde 401 (`d0b9cd4`, PR #51). Protegí las pantallas básicas de Clases y Notificaciones (`a843b33`, PR #52) y extraje Botón, Input y Spinner para reutilizarlos en el login (`618d48e`, PR #53).

El 8/11 cerré el ensayo corto del guion de demo (`073be5a`, PR #54). El flujo API más UI recorrió login, membresía, reserva y acceso sin un error que cortara el relato.

**Decisión**

El estado global de sesión pasa a mi cargo. El rol viaja tipado desde `/auth/me`, y un 401 limpia la sesión en el cliente. El criterio de estado del frontend queda en [ADR-006](../adr/ADR-006-frontend-react-estado.md).

**Problema o bloqueo**

El ensayo del 8/11 no encontró un corte de flujo, y sí dejó pulido visual pendiente (espaciados, estados vacíos, lectura en teléfono). Lo anoté fuera de C-06 para no reabrir el guion por css. El responsive de Login, Canchas y Mi QR sigue en C-03.

**Commits**

- `ecb45cd` docs: relaciona tarjetas Trello solapadas con el plan de cierre.
- `88a9a89` Merge pull request #50 from PatricioRamos04032000/docs/actualizar-estado-planes
- `06c0287` S4-T04: deja constancia de que Patricio toma el estado global, antes a cargo de Lucas.
- `d0b9cd4` S4-T04: tipa el rol de FitZone y cierra la sesión cuando una llamada autenticada responde 401.
- `0002fe3` Merge pull request #51 from PatricioRamos04032000/S4-T04
- `a843b33` S5-T08: protege las pantallas básicas de Clases y Notificaciones.
- `a897b09` Merge pull request #52 from PatricioRamos04032000/S5-T08
- `618d48e` S5-T09: extrae Botón, Input y Spinner para reutilizarlos en el login.
- `f7c9ca1` Merge pull request #53 from PatricioRamos04032000/S5-T09
- `073be5a` C-06: cierra el ensayo del guion de demo y deja el pulido visual anotado.
- `118b591` Merge pull request #54 from PatricioRamos04032000/c-06

---

## Sprint 8 — Cierre — Semana del 2026-11-09

### 2026-11-11  ·  19 h

**Actividad**

El 9/11 reorganicé el repositorio a la estructura del punto 4 de los lineamientos (`6f5d1c1`, PR #55, C-13, 3 h) y reescribí los diez ADR obligatorios con la numeración de la cátedra (`d6f2945`, PR #56, C-14, 6 h). El texto anterior no se reescribió: quedó en `docs/adr/historial/`, y el mapa de números viejos a números nuevos está en [docs/adr/README.md](../adr/README.md).

El 11/11 agregué los diagramas de la entrega, con fuente editable y exportación (`886c66a`, PR #57, C-15, 6 h de mi parte) y el manual técnico, con los dos casos de extensión: canchas de tenis y una estrategia de precio nueva (`6c0b540`, PR #58, C-18, 4 h).

**Decisión**

Los ADR pasan a la lista obligatoria del §5.2.1. Un número viejo no se recicla encima del texto anterior: el histórico queda congelado y la decisión vigente es la del índice nuevo. El puente para las citas de las bitácoras y las notas de unidad es [documentacion/ADR_Indice.md](../../documentacion/ADR_Indice.md).

**Problema o bloqueo**

Bitácora de equipo, C4 y notas de unidad citan ADR-005 como BFF y ADR-006 como API sin ORM. Desde el 9/11 esos temas son ADR-011 y ADR-005. Borrar las citas viejas hubiera falsificado lo que el equipo escribió en agosto. Las dejé y publiqué la tabla de equivalencias en el índice de ADR.

**Commits**

- `6f5d1c1` C-13: alinea docs, backend y frontend con la estructura del punto 4.
- `1436c8a` Merge pull request #55 from PatricioRamos04032000/c-13
- `d6f2945` C-14: registra los diez ADR obligatorios con la numeración de la cátedra.
- `7789c40` Merge pull request #56 from PatricioRamos04032000/c-14
- `886c66a` C-15: agrega los diagramas de la entrega.
- `601b986` Merge pull request #57 from PatricioRamos04032000/c-15
- `6c0b540` C-18: escribe el manual técnico con los casos de tenis y de una estrategia de precio.
- `e84e226` Merge pull request #58 from PatricioRamos04032000/c-18

---

## Sprint 8 — Cierre — Semana del 2026-11-09

### 2026-11-13  ·  3 h

**Actividad**

Tomé y cerré la pantalla Clases que estaba a cargo de Lucas (S7-T06 / C-11). Cableé el cliente API y la UI `/clases`: listar con cupo por sede, inscribir, cancelar, y lista de espera (anotarse, confirmar lugar notificado, retirar). Corregí el contraste del desplegable de sedes (letra invisible en modo oscuro del SO). Dejé constancia del cierre en el LOG de equipo, Relacion_Trello, Plan_Cierre, Propuesta_Continuacion y el guion C-06 (Clases disponible, fuera del recorrido de 5 min).

**Decisión**

La tarjeta sigue cruzada con C-11/S7-T06, pero el responsable de cierre pasa a ser Patricio. El alcance no se cortó al mínimo de C-11: se entregó S7-T06 completo (cancelar + lista de espera en UI) porque la API ya estaba lista.

**Problema o bloqueo**

Las clases del seed tenían fechas viejas y fallaban la ventana D5 de 48 h al inscribir. Para el smoke usé clases futuras temporales en Supabase; el listado por sede ya respondía bien con el usuario seed.

**Commits**

- `2610431` S7-T06/C-11: pantalla Clases real; Patricio toma y cierra la tarjeta de Lucas.
