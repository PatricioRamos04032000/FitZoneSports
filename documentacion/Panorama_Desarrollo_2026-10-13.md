# Panorama del desarrollo — FitZone Sports

**Corte:** 2026-11-15 · **Autor de esta lectura:** Patricio Ramos (P1)  
**Archivo:** se mantiene el nombre del 2026-10-13 para no romper enlaces. El contenido de esa fecha quedó reemplazado por esta lectura.  
**Cómo se armó:** migraciones en `supabase/migrations/`, controllers y `*.spec.ts` / `backend/test/*.e2e-spec.ts`, pantallas en `frontend/src/`, y la documentación vigente en `docs/` (ADR, diagramas, manual técnico). El enunciado sigue en [Trabajo integrador](./Trabajo_Integrador_FitZone_Sports.md).

Leyenda: **✅** la capa cubre la regla · **🟡** existe, pero le falta un pedazo concreto · **❌** no está · **—** esa capa no interviene.

Un ✅ de testing significa que hay un unitario (y, si la regla vive en SQL, un script en `supabase/tests/`) que afirma el comportamiento. Esos scripts SQL se corren a mano contra un Postgres local: no entran en el CI. Un ✅ de documentación significa que un ADR, un diagrama o el manual técnico describen el comportamiento que está en el código, no solo el enunciado.

---

## 1. Resumen

Los porcentajes del 13 de octubre (base ~40 %, backend ~35 %, frontend ~5 %) ya no describen el repo. Esta lectura no los reemplaza por otro número: dice qué se puede demostrar y qué no.

| Capa | Lectura al 14/11 |
|------|------------------|
| Base de datos | Tablas y funciones de M1 a M5 están migradas, incluida la garantía de no sobreventa. No hay Storage para la foto ni tabla o archivo de comprobante PDF. |
| Backend | El guion del socio y el de recepción responden por API: registro de externo, perfil, membresía, clases con lista de espera, reserva y pago simulado de cancha, QR, check-in con cola offline, alta o edición de sedes y la agenda de clases del gerente, y la renovación cobrada de la membresía. No hay PDF. |
| Testing | Las reglas críticas tienen unitario (RN-01, RN-02, RN-03, D5, D6, Decorator, pasarela, sync). El e2e cubre auth, roles y una parte de canchas; no recorre el checkout HTML ni el acceso. No hay tests de frontend. |
| Frontend | Login, registro, perfil con membresía, canchas (grilla, reserva, pago, cancelar y administración de alta, precio, pico y mantenimiento), clases (inscribir, cancelar, lista de espera), notificaciones, Mi QR, Acceso (check-in, aforo, sync), Sedes y la agenda de clases para el gerente. El dashboard es un placeholder. No hay descarga de PDF. |
| Documentación de la regla | ADR ×10, 14 diagramas, manual técnico y justificación de patrones están alineados al código. Faltan el manual de usuario y el de instalación. El enunciado de RF-11 sigue diciendo Strategy; el código es Decorator. |

El guion de Demo Day (login → ver membresía → reservar paddle y pagar → QR → check-in) se puede recorrer en la UI. Quedan fuera de ese recorrido de cinco minutos: la agenda de clases, la administración de canchas, el comprobante PDF y los reportes. La agenda y la administración ya tienen pantalla.

**Los 14 requisitos, al 15/11.** Demostrable: se recorre en la UI, sin Swagger ni SQL. Parcial: la API cubre la regla y la pantalla no. Falta: no hay implementación. Son 13 demostrables y 1 que falta. La foto queda fuera de este corte. Socio o externo no es un alta distinta: lo define la membresía vigente.

| RF | Veredicto | Se puede mostrar | Qué falta para cerrarlo |
|----|-----------|------------------|-------------------------|
| RF-01 Registro y perfil | Demostrable | `/signup` crea la persona (DNI y contacto) y `/perfil` la edita | La foto queda fuera de este corte. Socio o externo lo da la membresía vigente, no otro formulario |
| RF-02 Membresía | Demostrable | En `/perfil` el socio ve el catálogo, el estado y paga la renovación | `suspendido` está en el enum y esta entrega no lo asigna. No hay renovación por cron |
| RF-03 Acceso multi-sede | Demostrable | La membresía no tiene sede: el socio elige sede en clases y canchas, y el check-in no pide sede de origen | No hay un test que lo nombre |
| RF-04 QR de ingreso | Demostrable | `/mi-qr` muestra el código y `/acceso` lo valida contra la membresía activa | Recepción pega el código; no hay cámara |
| RF-05 Aforo | Demostrable | `/acceso` muestra ocupación y aforo máximo | No bloquea el ingreso al llegar al tope |
| RF-06 Agenda de clases | Demostrable | El gerente crea y edita en `/clases/gestionar` | La baja es `cancelada`, no un borrado |
| RF-07 Reserva de clases | Demostrable | En `/clases` el socio se inscribe (48 h, cupo, membresía vigente) y cancela | — |
| RF-08 Lista de espera | Demostrable | El socio se anota en `/clases` y el aviso llega a `/notificaciones` | El mail es un log |
| RF-09 Alta de canchas | Demostrable | En `/canchas/gestionar` se crea la cancha y se edita el precio por hora | La baja es `activa = false` |
| RF-10 Reserva de turnos | Demostrable | `/canchas` muestra la grilla, reserva, deja el turno bloqueado y cancela la reserva propia | — |
| RF-11 Precio | Demostrable | La grilla aplica descuento de socio y horario pico; en `/canchas/gestionar` se editan | El enunciado todavía dice Strategy |
| RF-12 Mantenimiento | Demostrable | En `/canchas/gestionar` se carga el período y la grilla marca esas horas | No cancela las reservas ya tomadas |
| RF-13 Pasarela simulada | Demostrable | La reserva de cancha y la renovación de membresía pagan en el checkout simulado | MercadoPago real queda fuera |
| RF-14 Comprobante PDF | Falta | — | No hay PDF |

---

## 2. Matriz por regla

### Transversal

| Regla | BD | Backend | Testing | Frontend | Documentación | Hueco |
|-------|----|---------|---------|----------|---------------|-------|
| Login BFF | ✅ `auth` + `perfiles` | ✅ `POST /auth/login` | ✅ `auth.service.spec` y e2e de `/auth/me` | ✅ `/login` | ✅ [ADR-011](../docs/adr/ADR-011-bff-supabase-auth.md), [ADR-006](../docs/adr/ADR-006-frontend-react-estado.md) | — |
| Rol del token y rutas por rol | ✅ `perfiles.rol` | ✅ `GET /auth/me`, `@RequiereRol` | ✅ `roles.e2e-spec` | ✅ `RoleRoute` y menú | ✅ ADR-006, manual técnico §1 | — |
| Listar sedes | ✅ `sedes` | ✅ `GET /sedes` | ✅ unitario y e2e | ✅ select en Perfil, Canchas y Clases | 🟡 enunciado | No hay manual de usuario |
| Alta y edición de sedes (A4, RNF-04) | ✅ checks de nombre y aforo; el trigger de pico corre al insertar | ✅ `POST /sedes` y `PATCH /sedes/:id` solo gerente | ✅ unitario del servicio y e2e 401/403/201/200 | ✅ `/sedes` | ✅ manual técnico M1; la decisión de RNF-04 sigue en ADR-001 y ADR-002 | La baja es `activa = false`. No asigna `admins_sede` |
| `admins_sede` | ✅ tabla | ✅ acota a `admin_sede` en acceso y canchas | ✅ `acceso.service.spec` (sin asignación → 403) | ❌ no hay ABM | 🟡 manual técnico, módulo M2 | El gerente no asigna admins desde la UI |
| Reportes consolidados (A4) | — | ❌ | ❌ | ❌ `/dashboard` es un texto fijo | 🟡 cortado en el plan de cierre | — |
| Preferencia de email | ✅ `perfiles.notificar_por_email` | ✅ `GET/PATCH /notificaciones/preferencias` | ✅ e2e de notificaciones | 🟡 el perfil guarda el flag | ✅ [diseño Observer](./Diseno_Observer_S4-T02_Notificaciones.md) | — |

### M1 — Usuarios y membresías

| Regla | BD | Backend | Testing | Frontend | Documentación | Hueco |
|-------|----|---------|---------|----------|---------------|-------|
| RF-01 Registro (DNI, contacto) | ✅ `perfiles` | ✅ `POST /auth/register` crea la persona y no devuelve token hasta confirmar el mail | ✅ `auth.service.spec` (`register`) | ✅ `/signup` | 🟡 ADR-011 (el BFF); el alta no tiene sección propia | Socio o externo lo da la membresía vigente. El alta deja `rol = externo` y ese valor no cambia al contratar |
| RF-01 Foto | 🟡 columna `foto_url`; Storage sin configurar | 🟡 `PATCH /perfiles/me` acepta una URL de texto | ❌ | ❌ el formulario no la pide | ❌ | Fuera de este corte |
| Ver y editar mi perfil | ✅ | ✅ `GET/PATCH /perfiles/me` (identidad del JWT) | ✅ `perfiles.service.spec` y `perfiles.e2e-spec` | ✅ `/perfil` | 🟡 manual técnico nombra el módulo | Falta el manual de usuario |
| RF-02 Catálogo de planes | ✅ `planes_membresia` | ✅ `GET /membresias/planes` | ✅ el e2e comprueba los tres planes | ✅ el perfil del socio muestra plan, duración y precio | ✅ diagrama [est-membresia](../docs/diagramas/fuentes/est-membresia.mmd) | — |
| RF-02 Membresía activa / vencida | ✅ estados y vigencia | ✅ `GET /membresias/mia` | 🟡 unitario del servicio | ✅ el perfil del socio muestra plan, estado y vigencia | ✅ diagrama de estados, manual técnico §2 | — |
| RF-02 Alta que cierra la anterior | ✅ `renovar_membresia` cierra e inserta en la misma transacción | ✅ el `POST /membresias` del staff llama a esa función y no cobra | ✅ el unitario espera `renovar` | — el alta de staff no tiene pantalla | ✅ manual técnico M1 | — |
| RF-02 Renovación cobrada | ✅ `pagos.plan` y el check de un pago pendiente sin `membresia_id` | ✅ `POST /membresias/renovar` y el checkout; el rechazo no toca la vigente | ✅ unitario de rechazo y de aprobación, e2e 401/403 | ✅ botón Pagar en el perfil | ✅ manual técnico M5 | — |
| RF-03 Acceso multi-sede | ✅ la membresía no tiene sede | ✅ el check-in no exige `sede_home` | ❌ no hay un caso que lo afirme | — el socio elige sede en clases y canchas | ✅ enunciado y manual técnico M1 | La regla es de modelo, no de pantalla |

### M2 — Acceso

| Regla | BD | Backend | Testing | Frontend | Documentación | Hueco |
|-------|----|---------|---------|----------|---------------|-------|
| RF-04 QR dinámico (TOTP) | ✅ `totp_seeds` | ✅ `TotpService`, `GET /acceso/totp/me` y `/codigo`; se emite al crear la membresía | ✅ `totp.service.spec` y `acceso.service.spec`. Sin e2e | ✅ `/mi-qr` (solo socio) | ✅ [ADR-003](../docs/adr/ADR-003-estrategia-offline-acceso.md), [ADR-007](../docs/adr/ADR-007-acceso-totp-cola-offline.md), C4-3 acceso, manual §6 | Sin cámara: recepción pega el código |
| Validar el ingreso | ✅ `check_ins` | ✅ `POST /acceso/check-ins`, check-out y listados | ✅ unitario del check-in feliz, de TOTP inválido y de la salida. Sin e2e | ✅ `/acceso` con Salir | ✅ secuencia [sec-acceso-offline](../docs/diagramas/fuentes/sec-acceso-offline.mmd) | — |
| RN-01 Una sede a la vez | ✅ `presencias` | ✅ `registrar_check_in` devuelve `YA_DENTRO` / `YA_EN_OTRA_SEDE`; `registrar_check_out` libera la presencia | ✅ el unitario mapea `YA_EN_OTRA_SEDE` a 409 y `PRESENCIA_NO_EXISTE` a 404; el sync de una salida no pide TOTP | ✅ Salir en `/acceso`; sin red, sin servidor o sin base la salida entra en la misma cola del ingreso | ✅ ADR-007 y [propuesta RN-01](../docs/rnf/Propuesta_RN01_Presencia_Una_Sede.md) | Timeout de 3 h: está en el ADR, no en el código |
| RF-05 Aforo | ✅ `sedes.aforo_max` | ✅ `GET /acceso/presencias` informa ocupación y máximo; no bloquea | ❌ no hay un caso del aviso | 🟡 `/acceso` muestra `ocupación / máximo` | 🟡 [plan M2](./Plan_M2_Acceso_QR_Patricio.md): soft a propósito | — |
| RNF-01 Sin internet en recepción | — la cola es del navegador | ✅ `POST /acceso/check-ins/sync` (lote e idempotencia) | ✅ unitario de lote, tope de 50 e idempotencia | ✅ `localStorage` y botón de sync | ✅ ADR-003 y ADR-007. El nodo por sede quedó descartado por escrito | No mide el 99,5 % del enunciado. No hay tornos |

### M3 — Clases

| Regla | BD | Backend | Testing | Frontend | Documentación | Hueco |
|-------|----|---------|---------|----------|---------------|-------|
| RF-06 Crear y editar clases | ✅ `clases` y checks de tipo e instructor | ✅ `POST /clases` y `PATCH /clases/:id` solo gerente | ✅ unitario del servicio y e2e 401/403/201/200 | ✅ `/clases/gestionar` | ✅ manual técnico M3 y el diagrama de clases | La baja es `estado = cancelada`. No cambia la sede ni avisa a la lista de espera |
| Listar con cupo | ✅ vista `clases_con_cupo` | ✅ `GET /clases?sedeId` con JWT | 🟡 e2e de auth; el unitario se concentra en inscribir | ✅ `/clases` | 🟡 manual técnico §2 | Falta el manual de usuario (C-16) |
| RF-07 Inscribir, ventana de 48 h (D5) y RN-03 | ✅ `inscribir_en_clase` | ✅ el servicio exige membresía vigente y 48 h; el perfil sale del JWT | ✅ `clases.service.spec` | ✅ botón de inscribir | ✅ enunciado; D5 quedó cerrada en el servicio (ya no es decisión abierta) | — |
| RF-07 Cancelar; tardía si faltan menos de 2 h (D6) | ✅ `cancelar_inscripcion` | ✅ la hora se lee de la base, no del body | ✅ el spec cubre `esTardia` y el aviso | ✅ cancelar en `/clases` | ✅ | — |
| RF-08 Anotarse, confirmar y retirarse | ✅ `lista_espera`, `procesar_lista_espera`, `confirmar_lugar_espera` | ✅ `POST/DELETE /clases/lista-espera` y confirmar | ✅ unitario y e2e del flujo | ✅ en `/clases` | ✅ justificación Observer, [actividad](../docs/diagramas/fuentes/act-lista-espera.mmd), diseño S4-T02 | El mail sigue siendo simulado (log) |
| RF-08 Aviso al liberarse un lugar | ✅ `notificaciones` | ✅ `cancelar` llama a `ListaEsperaPublisher` | ✅ el spec de cancelar publica y hay spec de observers | ✅ `/notificaciones` lista y marca leída | ✅ diseño Observer | — |

### M4 — Canchas

| Regla | BD | Backend | Testing | Frontend | Documentación | Hueco |
|-------|----|---------|---------|----------|---------------|-------|
| RF-09 Alta y precio por hora | ✅ `canchas` | ✅ `POST /canchas` y `PATCH /canchas/:id` | ✅ e2e 401, 403 y 201 | ✅ `/canchas/gestionar` | ✅ manual técnico M4 | La baja es `activa = false` |
| RF-10 Grilla | ✅ | ✅ `GET /canchas/disponibilidad` | 🟡 e2e del GET público | ✅ `/canchas`: sede, fecha y horario | ✅ [C4-3 canchas](../docs/diagramas/fuentes/c4-3-canchas.mmd), [secuencia de reserva](../docs/diagramas/fuentes/sec-reserva-pago.mmd) | — |
| RF-10 Reservar y cancelar | ✅ `reservar_cancha`, `cancelar_reserva_cancha`, hold | ✅ `POST /canchas/reservas`, `GET /canchas/reservas/me`, `POST /canchas/reservas/:id/cancelar` | ✅ `reservas-cancha.service.spec` (hold, pago, cancelar) | ✅ reservar, pagar y cancelar en `/canchas` | ✅ secuencia y [estados de la reserva](../docs/diagramas/fuentes/est-reserva.mmd) | Cancelar no devuelve el pago |
| RN-02 Sin sobreventa | ✅ índice único `reservas_cancha_sin_sobreventa` | ✅ el 23505 sale como 409 `TURNO_OCUPADO` | ✅ unitario del 409 y `supabase/tests/canchas_m4.test.sql` (manual) | — lo resuelve la API | ✅ [ADR-004](../docs/adr/ADR-004-concurrencia-reservas-canchas.md), secuencia concurrente, manual §5 | El SQL no corre en CI |
| RF-11 Precio (descuento socio + pico) | ✅ `configuracion_pico`, `configuracion_cadena` | ✅ Decorator (`Standard` → `MemberDiscount` → `PeakHour`); `GET/PUT` de pico y de descuento (el PUT de descuento es de gerente) | ✅ `precios.service.spec`, incluido el socio vencido que paga como externo | ✅ la grilla muestra el precio; `/canchas/gestionar` edita pico y, si el rol es gerente, el descuento | ✅ justificación § Decorator, manual §4.1, [análisis Strategy → Decorator](./diagramas%20desarrollo/analisis-strategy-a-decorator.md), UML de clases. El enunciado todavía nombra Strategy | — |
| RF-12 Mantenimiento | ✅ `mantenimientos_cancha` (desde–hasta) | ✅ `GET/POST/DELETE .../mantenimientos`; la grilla marca esas horas | ✅ `canchas.service.spec` y e2e de rol | ✅ `/canchas/gestionar` | ✅ justificación: período en tabla, no un estado de la reserva. Manual técnico M4 | No cancela reservas ya tomadas |
| RNF-03 Disponibilidad rápida | ✅ índices de sede, rango de mantenimiento, cancha+inicio y perfil | — la consulta ya los usa | — no se mide latencia | — | ✅ manual técnico §5 nombra los cuatro índices | El requisito pide índices, no una medición |

### M5 — Pagos

| Regla | BD | Backend | Testing | Frontend | Documentación | Hueco |
|-------|----|---------|---------|----------|---------------|-------|
| RF-13 Pasarela simulada | ✅ `pagos` | ✅ `PasarelaSimulada`, preferencia y checkout HTML (`/pasarela-simulada/checkout/:pagoId`) | ✅ `pasarela-simulada.spec` y el spec del Facade (aprueba, rechaza, hold vencido). Sin e2e del HTML | ✅ `/canchas` redirige a `checkoutUrl` | ✅ [ADR-010](../docs/adr/ADR-010-tokenizacion-medios-de-pago.md), secuencia de reserva y pago | MercadoPago real y Circuit Breaker quedan fuera |
| RNF-02 Solo el token | ✅ `token_pasarela` | ✅ el insert guarda el token opaco | ✅ `confirmarPago` afirma que se persiste el token | — | ✅ ADR-010 | No hay un test que lea la fila y niegue un PAN |
| RF-14 Comprobante PDF | ❌ | ❌ | ❌ | ❌ | 🟡 [plan de cierre, C-04](../docs/planificacion/Plan_Cierre_Entrega_6_19_Nov.md): PDF de la app, no factura. La justificación deja Template Method para cuando exista | Sigue por hacer |

---

## 3. Base de datos

| Objeto | Módulo | Estado | Migración |
|--------|--------|--------|-----------|
| `sedes`, `perfiles`, `membresias` | Núcleo / M1 | ✅ | `20260915000000_fase_a_nucleo.sql` |
| `planes_membresia`, `clases`, `inscripciones_clase`, `lista_espera`, vista y funciones | M1 / M3 | ✅ | `20261005220000_membresias_clases.sql` |
| `notificaciones` | M3 | ✅ | `20261006190000_notificaciones.sql` |
| `canchas`, `mantenimientos_cancha`, `reservas_cancha`, `configuracion_pico`, `configuracion_cadena`, `admins_sede`, `reservar_cancha` | M4 | ✅ | `20261027200000_canchas_m4.sql` |
| `pagos` | M5 | ✅ | `20261028210000_pagos_m5.sql` |
| Hold, vencimiento y `confirmar_reserva_cancha` | M4 / M5 | ✅ | `20261101200000_hold_reserva_pendiente.sql`, `20261031200000_confirmar_reserva_cancha.sql` |
| `totp_seeds`, `presencias`, `check_ins`, `registrar_check_in` / `out` | M2 | ✅ | `20261101210000_acceso_m2.sql` |
| Checks de `sedes` (nombre y aforo) | Transversal / RNF-04 | ✅ | `20261114203000_sedes_checks.sql` |
| Checks de tipo e instructor en `clases` | M3 / RF-06 | ✅ | `20261114230000_clases_checks.sql` |
| `renovar_membresia` y `pagos.plan` | M1 / RF-02 | ✅ | `20261114220000_renovar_membresia.sql` |
| Storage de la foto, archivo de PDF | M1 / M5 | ❌ | — |

Scripts SQL de reglas, solo en local: `supabase/tests/membresias_clases.test.sql` y `supabase/tests/canchas_m4.test.sql`. No hay script de acceso ni de pagos.

---

## 4. Backend y frontend, en una frase cada uno

**API.** Módulos `usuarios`, `acceso`, `clases`, `canchas` y `pagos`. Identidad tomada del JWT. Swagger en el proceso de Nest. Lo que la matriz marca ❌ no tiene endpoint: reportes y PDF. El alta de sedes sí: `POST /sedes` y `PATCH /sedes/:id`. La agenda de clases sí: `POST /clases` y `PATCH /clases/:id`.

**Web.** React + Vite. Cliente en `frontend/src/services/api.ts` (token y 401). Estado de sesión en `AuthProvider`. Rutas: `/login`, `/signup`, `/perfil`, `/canchas`, `/canchas/gestionar` (gerente y admin de sede), `/clases`, `/clases/gestionar` (gerente), `/notificaciones`, `/mi-qr`, `/acceso`, `/sedes` (gerente), `/dashboard`. No hay tests de frontend. Atomic Design llega a átomos (`Button`, `Input`, `Spinner`) y al `Layout`.

---

## 5. Testing y entrega

| Ítem | Estado al 14/11 |
|------|------------------|
| Unitarios de backend | ✅ auth, perfiles, sedes, membresías, clases, observers, acceso, TOTP, canchas, precios, reservas, pasarela, guards |
| E2E de backend | 🟡 auth, perfiles, roles, sedes (GET y alta/edición por rol), notificaciones, membresías/clases (seguridad, lista de espera y agenda por rol), canchas (GET público, alta y mantenimiento por rol). No hay e2e de acceso ni del checkout |
| SQL de reglas | 🟡 M3 y M4, manuales |
| CI | 🟡 [`.github/workflows/ci-backend.yml`](../.github/workflows/ci-backend.yml) en pull requests a `desarrollo`. No corre el frontend |
| Cobertura | 🟡 umbral del 60 % de sentencias declarado en [ADR-008](../docs/adr/ADR-008-pruebas-cobertura.md). El reporte publicado hay que regenerarlo con `npm run test:cov` |
| Docker Compose | ❌ ADR-009 lo decide; no hay `docker-compose.yml` en el repo |
| Tests de frontend | ❌ |

---

## 6. Patrones, contra el código

| Patrón | Dónde | Estado |
|--------|-------|--------|
| Repository + Template Method | `SupabaseRepository<T>` | ✅ |
| Observer | Lista de espera; `ClasesService.cancelar` publica | ✅ |
| Decorator | Precio de cancha (C-28). Reemplaza al Strategy de S4-T01 | ✅ |
| State | Ciclo de la reserva (pendiente, confirmada, cancelada) | ✅ |
| Facade | `ReservasCanchaService.reservar` / pagar | ✅ |
| Adapter | `PasarelaSimulada` detrás de la interfaz de cobro | ✅ el simulacro. `AdaptadorMercadoPago` no se va a escribir para esta entrega |
| Template Method de PDF | Comprobante | ❌ no hay comprobante |
| Circuit Breaker | Pasarela real | ❌ diseñado en la justificación; fuera del alcance |

La justificación y el descarte del resto (Abstract Factory, Singleton escrito a mano, Factory de notificadores, Composite de regiones) están en [Justificación de patrones](./Justificacion_Patrones_Unidad_III.md).

---

## 7. Qué sigue abierto

Ordenado por lo que impide decir que la regla está cerrada de punta a punta.

| Prioridad | Hueco | Regla |
|-----------|-------|-------|
| 1 | PDF con cancha, horario y monto después del pago | RF-14 |
| 2 | Manual de usuario y manual de instalación | C-16, C-17 |
| 3 | Docker o un arranque de cinco pasos, y el seed de 25 sedes | ADR-009, carga de prueba |

Quedan fuera de esta entrega, ya escritos como corte: app móvil, MercadoPago real, Circuit Breaker, reportes del gerente y la foto de perfil. El tipo socio o externo lo da la membresía vigente, no un alta aparte. El offline de recepción es la cola del navegador más el sync, no un nodo por sede. El alta de sedes del gerente ya está en `/sedes`. La agenda de clases del gerente ya está en `/clases/gestionar`. La administración de canchas ya está en `/canchas/gestionar` y la cancelación de la reserva propia, en `/canchas`. La renovación cobrada de la membresía ya está en el perfil del socio. La salida de la sede ya está en `/acceso`: no pide QR y, sin red, sin servidor o sin base, entra en la misma cola del ingreso.
