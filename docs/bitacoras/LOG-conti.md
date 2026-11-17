# Bitácora — Conti Bruno — Rol P2

Registro individual de Bruno Conti (P2, backend, reglas de negocio y patrones). Cada entrada es una sesión de trabajo. En **Commits** van los commits de esa sesión y el merge o pull request que los integró a la rama.

Las horas de las primeras semanas salen de los planes (`Plan_Trabajo_Semanas_1_y_2.md` y `Plan_Trabajo_2_Semanas.md`). Las de noviembre (`S4-T06`, `S4-T10`, `S4-T14`, `S4-T15`, `C-09` y `C-19b`) son una estimación basada en el alcance de cada entrega y las pruebas agregadas.

---

## Sprint 1 — Unidad I — Semana del 2026-08-31

### 2026-09-02  ·  4 h

**Actividad**

Participé de la puesta en común del 26/08 y de la reunión de Semana 1 del 02/09 (`S1-T05`, [Acta_Reunion_2026-09-02_Semana1.md](../planificacion/Acta_Reunion_2026-09-02_Semana1.md)). Revisé los primeros ADR (`ADR-001` a `ADR-006` en la numeración de agosto) para corregir inconsistencias y alinearlos al formato de la cátedra (`S1-T02`), preparé el borrador del esquema SQL inicial con `sedes`, `perfiles` y `membresias` (`S1-T12`) y quedé a cargo de la revisión cruzada del PDF de Unidad I (`S1-T17`, cerrada en Trello el 11/11).

**Decisión**

Acordamos con el grupo usar NestJS como monolito modular y pasarela BFF hacia Supabase Auth (hoy [ADR-011](../adr/ADR-011-bff-supabase-auth.md)), y leer datos con la API de Supabase sin ORM (hoy [ADR-005](../adr/ADR-005-backend-nestjs-ioc-datos.md)). Para roles dejamos la tabla `perfiles` con un campo simple A1–A4 en lugar de armar permisos muchos-a-muchos desde el inicio.

**Problema o bloqueo**

Al comienzo no estaba claro si el PDF de Unidad I debía incluir DER y diagrama de clases cerrados, ni cómo quería el docente la autenticación con Supabase. Con la devolución del 28/08 y la aclaración del 04/09 quedó definido que C4 y ADR quedan como documentación viva hasta el Demo Day y no frenan el arranque de código en Unidad II.

**Commits**

- _Sin commits propios en el repositorio durante esta semana: los acuerdos y tareas quedaron en [LOG.md](./LOG.md), [Acta_Reunion_2026-09-02_Semana1.md](../planificacion/Acta_Reunion_2026-09-02_Semana1.md) y [Plan_Trabajo_Semanas_1_y_2.md](../planificacion/Plan_Trabajo_Semanas_1_y_2.md)._

---

## Sprint 2 — Unidad II — Semana del 2026-09-21

### 2026-09-22  ·  4 h

**Actividad**

Dejé armada la base del backend en `backend/` y las tablas iniciales en Supabase. Ejecuté el SQL inicial de `sedes` y `perfiles` (`S2-T02`) y cargué un seed mínimo de prueba (`S2-T03`). En el repositorio creé el proyecto base de NestJS (`S2-T04`, `24698da`) e implementé `SupabaseModule` (`S2-T05`, `691d23e`) para exponer el cliente conectado con `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`. Todo entró con el PR #1 (`c785a94`, el 25/09).

**Decisión**

Centralizar el cliente de Supabase en `SupabaseModule` para inyectarlo en los demás módulos, usando la `service_role` key solo desde NestJS y sin subir credenciales al repositorio.

**Problema o bloqueo**

Como el proyecto de Supabase estaba en la cuenta administrada por Lucas, para probar en local hubo que compartir las variables del `.env` por canal privado y verificar que los nombres de tablas en el SQL Editor coincidieran con los esperados por el backend.

**Commits**

- `24698da` S2-T04: Scaffolding inicial de NestJS
- `691d23e` Modulo SupabaseModule
- `c785a94` Merge pull request #1

---

## Sprint 2 — Unidad II — Semana del 2026-09-28

### 2026-09-29  ·  5 h

**Actividad**

Implementé los dos primeros módulos del backend y corregí los tests unitarios que habían quedado rotos. El 27/09 resolví conflictos de merge con el trabajo paralelo de Patricio (`7d98b4a`), agregué `SedesModule` con `GET /sedes` (`S2-T09`, `2e0dce8`) e implementé `AuthModule` conectado a Supabase Auth (`S2-T06`, `b9bd66a`, PR #4 `02fee4e`). El 29/09 agregué `POST /login` en `AuthController` (`b2cae85` / `576f589`) y corregí los `.spec.ts` de `Auth`, `Sedes` y `Supabase` (`95bec90`, `835736e`).

**Decisión**

`AuthService` delega directo en `supabase.auth.signInWithPassword` sin generar tokens propios en NestJS; la validación del JWT queda en el `JwtAuthGuard` que implementó Patricio ([ADR-011](../adr/ADR-011-bff-supabase-auth.md)). Para que pasen los tests unitarios agregué mocks de `SupabaseService` en cada `TestingModule`.

**Problema o bloqueo**

Hubo dos problemas concretos: primero, al mergear `JwtAuthGuard` y `HealthModule` de P1 surgieron conflictos en `app.module.ts` y `auth.module.ts` (`7d98b4a`); segundo, al inyectar `SupabaseService` en `AuthService` y `SedesService`, fallaron los specs generados por la CLI de Nest porque les faltaba el provider mockeado (`95bec90`).

**Commits**

- `7d98b4a` Resuelve conflictos de merge con P1
- `2e0dce8` S2-T09: Implementa endpoint GET /sedes con patrón Repository y Supabase API
- `b9bd66a` S2-T06: Implementa AuthModule con pasarela BFF hacia Supabase Auth
- `02fee4e` Merge pull request #4 from PatricioRamos04032000/desarrollo
- `b2cae85` S2-T06: Agrega el código POST /login al AuthController
- `576f589` S2-T06: Agrega el código POST /login al AuthController
- `317a602` Merge remote-tracking branch 'origin/master' into desarrollo
- `95bec90` Arregla dependencias y mocks de Supabase en los tests unitarios
- `835736e` Arregla test

---

## Sprint 3 — Unidad II — Semana del 2026-09-28

### 2026-10-01  ·  2 h

**Actividad**

Actualicé `documentacion/Plan_Trabajo_2_Semanas.md` para ordenar las semanas 3 y 4 (`b09a27c`, `5a03f67`, `47bc6bb`). Corregí fechas, marqué lo terminado de Semana 2 y dejé anotadas las dependencias de `S3-T10`, `S3-T03` (Membresías) y `S3-T04` (Clases) respecto al diseño SQL de Patricio (`S3-T06`) y la plantilla de Repository (`S3-T11`).

**Decisión**

Esperar a tener cerrado el esquema SQL de membresías/clases y el Repository base antes de implementar `S3-T03` y `S3-T04`, para evitar escribir consultas directas en los servicios que luego hubiera que reescribir.

**Problema o bloqueo**

Las fechas del plan habían quedado desactualizadas y el reparto original asignaba más de 6 h por semana a backend. Ajusté las estimaciones y dependencias para equilibrar la carga con P1 y P3.

**Commits**

- `b09a27c` Nuevo plan de Trabajo
- `5a03f67` Update dates in Plan_Trabajo_2_Semanas.md
- `47bc6bb` Update Plan_Trabajo_2_Semanas.md

---

## Sprint 3 — Unidad II — Semana del 2026-10-05

### 2026-10-07  ·  4 h

**Actividad**

Implementé la primera versión de Membresías (`S3-T03`) y Clases (`S3-T04`) en `backend/src/membresias/` y `backend/src/clases/` siguiendo [Guia_Patron_Repository.md](../../documentacion/Guia_Patron_Repository.md) (`9ba65f4`, PR #22 `6043fcd`). Quedaron operativos los endpoints iniciales para planes, altas/consultas de membresías, listado de clases, inscripción y cancelación.

**Decisión**

Separar ambos módulos en `controller → service → repository → model`, dejando las consultas a Supabase y los RPC dentro de `MembresiasRepository` y `ClasesRepository`.

**Problema o bloqueo**

Esa primera versión dejó pendientes de seguridad y validación: endpoints sin `JwtAuthGuard` ni roles, `perfilId` e `inicioClase` leídos del body, `(this.repository as any).client` en `MembresiasService.crear` y reglas D1–D6/RN-03 sin cubrir. Patricio registró esos puntos en [Correcciones_S3-T03_S3-T04_Membresias_Clases.md](../../documentacion/Correcciones_S3-T03_S3-T04_Membresias_Clases.md) y quedaron para resolver en `S4-T10`.

**Commits**

- `9ba65f4` implementa modulos de membresias y clases con patron Repository (S3-T03, S3-T04)
- `6043fcd` Merge pull request #22 from PatricioRamos04032000/S3-T03yT04-membresias-clases

---

## Sprint 4 — Unidad III — Semana del 2026-10-19

### 2026-10-21  ·  4 h

**Actividad**

Participé de las reuniones del 13/10 ([Acta_Reunion_2026-10-13_Seguimiento.md](../planificacion/Acta_Reunion_2026-10-13_Seguimiento.md)) y del 21/10 ([Acta_Reunion_2026-10-21_Seguimiento.md](../planificacion/Acta_Reunion_2026-10-21_Seguimiento.md)), donde revisamos los pendientes de Membresías/Clases y cerramos las reglas de Canchas (`S4-T09`). El 21/10 implementé `S4-T01`: el patrón **Strategy** para precios de canchas en `backend/src/canchas/precios/` (`PricingStrategy`, `StandardPricing`, `PeakHourPricing`, `MemberDiscountPricing`, `PreciosService`, `PreciosModule`, más `precios.service.spec.ts`) y actualicé [Justificacion_Patrones_Unidad_III.md](../../documentacion/Justificacion_Patrones_Unidad_III.md) y [Plan_Trabajo_2_Semanas.md](../planificacion/Plan_Trabajo_2_Semanas.md) (`71c993d`, merge `d4065a0`).

**Decisión**

En lugar de elegir una sola estrategia por turno, `PreciosService` encadena todas las que aplican (`filter` + `reduce`) para combinar el recargo de horario pico y el descuento de socio (`base × (1 + recargo) × (1 − descuento)`). Las fechas ISO sin zona horaria se normalizan a `America/Argentina/Buenos_Aires`.

**Problema o bloqueo**

La API de Canchas (`S4-T06`) siguió bloqueada hasta la reunión del 21/10 porque faltaban cerrar las reglas de negocio `S4-T09` y la migración M4 en el repositorio. Además, `PreciosService` había quedado con `Math.round` cuando en la reunión se acordó redondear hacia arriba (`Math.ceil`), ajuste que quedó anotado y luego se resolvió en `S4-T15`.

**Commits**

- `71c993d` S4-T01: implementa patron Strategy para calculo de precios de canchas y actualiza documentacion
- `d4065a0` Merge branch 'S3-T03yT04-membresias-clases' into desarrollo

---

## Sprint 5 y 6 — Unidades II, III y V — Semana del 2026-11-02

### 2026-11-04  ·  10 h

**Actividad**

Completé e integré tres tarjetas de backend junto con sus unit tests, e2e (Supertest), Swagger, colección Postman y entradas en [LOG.md](./LOG.md). En `S4-T06` (`593d9cc`, merge `857199d`) implementé la API REST de Canchas (`CanchasModule`, `ConfiguracionPreciosController`, `CanchasService`, `CanchasRepository`): listado por sede, grilla de disponibilidad de 60 minutos (`08:00`–`22:00` hora Argentina) cruzando reservas en hold/confirmadas y mantenimientos con `PreciosService`, alta/edición validando `admins_sede`, mantenimientos y configuración de horario pico y descuento socio.

En `S4-T10` (`10a64e2`, merge `b5e81e0`) protegí Membresías y Clases con `JwtAuthGuard` y `@RequiereRol`, lectura del usuario desde `@CurrentUser()`, `GET /membresias/mia`, ventana de 48 h (`D5`), vigencia en calendario argentino (`D3`), duración desde `planes_membresia` (`D1`/`D2`), control de titularidad (`403`), cancelación tardía desde BD (`D6`) y cerré los olores #1–#5. En `S4-T14` (`7957180`, merge `f384b11`) agregué los endpoints de lista de espera (`anotarse`, `mias`, `confirmar` con `confirmar_lugar_espera`, `retirarse`) conectados a `ListaEsperaPublisher` (Observer), vencimiento *lazy*, verificación de rutas Swagger en e2e y colección Postman.

**Decisión**

En `S4-T10` eliminé `(this.repository as any).client` moviendo el alta a `MembresiasRepository.crear` con `unwrap` (olor #1), unifiqué el mapeo de errores SQL (`P0001`, `23505` → `409`, `22P02` → `400`) en `traducirErrorRepositorio` (olor #3) y reemplacé los literales sueltos por constantes de módulo (olor #5). En `S4-T14`, al no tener un cron activo para expirar lugares notificados, decidí procesar vencidos de forma *lazy* antes de inscribir, al anotarse en espera o cuando `confirmar` devuelve `PLAZO_VENCIDO`.

**Problema o bloqueo**

Al modificar `MembresiasService.crear` hubo que preservar la llamada a `ensureTotpSeed` que Patricio había agregado el 2/11 para emitir el seed TOTP al activar una membresía. También fue necesario pasar todas las comparaciones de fechas a `America/Argentina/Buenos_Aires` porque cerca de la medianoche UTC los tests cambiaban de día respecto a la hora local.

**Commits**

- `593d9cc` S4-T06: implementa API REST de canchas, grilla de disponibilidad y configuracion de precios
- `857199d` S4-T06
- `10a64e2` feat(membresias,clases): asegurar endpoints con JWT/roles y aplicar reglas D1-D6 y RN-03 (S4-T10)
- `b5e81e0` S4-T10
- `7957180` feat(clases): agregar endpoints de lista de espera, flujo Observer y Swagger (S4-T14)
- `f384b11` S4-T14

---

## Sprint 6 — Unidad III — Semana del 2026-11-02

### 2026-11-06  ·  2 h

**Actividad**

Cerré `S4-T15` (`1e5ce18`, PR #49 `461a096` del 07/11) para alinear el redondeo de precios de canchas (punto P7 de la reunión del 21/10 y olor #6 de la planilla). Cambié `Math.round` por redondeo hacia arriba en `PreciosService`, actualicé `precios.service.spec.ts` y actualicé [Propuesta_Reglas_Negocio_S4-T09.md](../rnf/Propuesta_Reglas_Negocio_S4-T09.md) y [Justificacion_Patrones_Unidad_III.md](../../documentacion/Justificacion_Patrones_Unidad_III.md).

**Decisión**

Pasar el redondeo final a un método privado `redondearAlPesoSuperior(monto)` usando `Math.ceil(Number(monto.toFixed(8)))` en lugar de llamar directo a `Math.ceil(monto)`.

**Problema o bloqueo**

Al pasar los tests a `Math.ceil` apareció un error de punto flotante: multiplicaciones que debían dar enteras, como `20000 * 1.14`, resultaban en `22800.000000000004` y `Math.ceil` terminaba devolviendo `$22.801` en vez de `$22.800`. Redondear a 8 decimales con `toFixed(8)` antes de aplicar `Math.ceil` corrigió el problema.

**Commits**

- `1e5ce18` feat(canchas): alinear regla de redondeo hacia arriba en precios (S4-T15)
- `461a096` Merge pull request #49 S4-T15

---

## Sprint 8 — Cierre — Semana del 2026-11-09

### 2026-11-11  ·  1,5 h

**Actividad**

Participé de la reunión del 11/11 para actualizar el tablero Trello y los planes de cierre. Ese día también avancé con `C-09` (`07d06a2`): extraje `createSwaggerDocument` en `backend/src/swagger.ts`, agregué `backend/scripts/export-swagger.ts` y el script `npm run swagger:export` en `backend/package.json`, generé `backend/swagger.json` y actualicé el `README.md` con el enlace al archivo y la tabla de endpoints de Clases y Membresías ya con JWT.

**Decisión**

Generar `backend/swagger.json` levantando la app Nest con `NestFactory.create(AppModule, { logger: false })` desde un script propio y reutilizando `createSwaggerDocument`, para que el JSON exportado coincida con el que expone `/api/docs`.

**Problema o bloqueo**

El `README.md` todavía mostraba endpoints de Clases y Membresías sin autenticación (estado anterior a `S4-T10`), así que aproveché para corregir la tabla. La rama quedó abierta hasta integrar los cambios de documentación que el equipo cerraba esa semana (`C-13` a `C-19a`).

**Commits**

- `07d06a2` feat(swagger): exportar especificacion OpenAPI en backend/swagger.json y enlazar en README (C-09)

---

## Sprint 8 — Cierre — Semana del 2026-11-09

### 2026-11-13  ·  3 h

**Actividad**

Integré `C-09` en `desarrollo` (`5546109`) y escribí esta bitácora (`C-19b`) en `docs/bitacoras/LOG-conti.md` cruzando el historial de commits, las actas y los planes. También actualicé el índice [`docs/bitacoras/README.md`](./README.md) y los estados de `C-09` y `C-19b` en los documentos de planificación.

**Decisión**

Citar todas las sesiones con los hashes reales (juntando los commits hechos como `bruno` y los merges de PR como `Bruno Nicolás Conti`) sin reescribir citas previas de ADR, que ya cuentan con la tabla de equivalencias en [docs/adr/README.md](../adr/README.md).

**Problema o bloqueo**

Al cruzar mis commits contra los planes del 11/11 noté que `C-09` seguía figurando *En desarrollo* aunque ya estaba mergeada en `5546109`, y que mis commits aparecían bajo dos nombres de autor distintos en Git. Dejé ambos puntos alineados en esta sesión.

**Commits**

- `5546109` C-09

---

## Sprint 8 — Cierre — Semana del 2026-11-16

### 2026-11-17  ·  4 h

**Actividad**

Implementé y subí la tarea `C-04` (`64e84b1`, rama `c-04`) para cubrir RF-14 (comprobante PDF no fiscal post-pago). Agregué `pdfkit` en el backend, armé las consultas de lectura en `PagosRepository`, generé los PDF con Template Method en `backend/src/pagos/comprobantes/` (`ComprobantePdfTemplate` para `ComprobanteReservaPdf` y `ComprobanteMembresiaPdf`), expuse `GET /pagos/mios`, `GET /pagos/:id/comprobante` y `GET /canchas/reservas/:id/comprobante` con `JwtAuthGuard`, y sumé descarga firmada por HMAC en la pantalla de pago aprobado de la pasarela simulada (`/pasarela-simulada/comprobante/:pagoId`).

En el frontend agregué `frontend/src/services/pagos.ts` y conecté los botones de descarga en `Canchas.tsx` (reserva confirmada y Mis reservas) y en `Perfil.tsx` (Mi membresía). También sumé tests unitarios (`comprobantes.service.spec.ts`), e2e (`test/comprobantes.e2e-spec.ts`), regeneré `backend/swagger.json` y actualicé la nota de Template Method en [Justificacion_Patrones_Unidad_III.md](../../documentacion/Justificacion_Patrones_Unidad_III.md) y [LOG.md](./LOG.md).

**Decisión**

Aplicar **Template Method** (`ComprobantePdfTemplate`) para compartir encabezado, titular, monto y leyenda no fiscal entre el comprobante de reserva de cancha y el de membresía, tal como estaba planteado en la justificación de Unidad III desde que `C-30` incorporó el cobro de membresías en `pagos`. Para la descarga directa desde la pantalla de resultado de la pasarela simulada usé una firma HMAC-SHA256 verificada con `timingSafeEqual`, ya que esa ruta HTML pública no lleva el JWT de la SPA.

**Problema o bloqueo**

Al agregar `cargarPagos` en `Perfil.tsx`, ESLint (`react-hooks/immutability`) falló porque la función había quedado declarada después del `useEffect` que la invocaba; se resolvió moviéndola arriba del efecto. En las pruebas locales dentro del entorno restringido, los e2e con Supertest requerían abrir sockets locales en `127.0.0.1`, por lo que se validaron fuera del aislamiento obteniendo 12/12 suites y 49/49 tests en verde (además de 29/29 suites unitarias y > 65 % de cobertura de sentencias cumpliendo ADR-008).

**Commits**

- `64e84b1` C-04: Comprobante PDF Post-Pago (RF-14)
- _Cierre de `C-19b` registrado en la rama `c-19b`._
