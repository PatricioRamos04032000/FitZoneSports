# Panorama del desarrollo — FitZone Sports

**Corte:** 2026-11-14 · **Autor de esta lectura:** Patricio Ramos (P1)  
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
| Frontend | Login, registro, perfil con membresía, canchas (grilla, reserva, checkout), clases (inscribir, cancelar, lista de espera), notificaciones, Mi QR, Acceso (check-in, aforo, sync), Sedes y la agenda de clases para el gerente. El dashboard es un placeholder. No hay pantallas de administración de canchas ni descarga de PDF. |
| Documentación de la regla | ADR ×10, 14 diagramas, manual técnico y justificación de patrones están alineados al código. Faltan el manual de usuario y el de instalación. El enunciado de RF-11 sigue diciendo Strategy; el código es Decorator. |

El guion de Demo Day (login → ver membresía → reservar paddle y pagar → QR → check-in) se puede recorrer en la UI. Quedan fuera de ese recorrido: la agenda de clases, el mantenimiento de canchas, el comprobante PDF y los reportes.

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
| RF-01 Registro (DNI, contacto; externo) | ✅ `perfiles` | ✅ `POST /auth/register` crea rol `externo` y no devuelve token hasta confirmar el mail | ✅ `auth.service.spec` (`register`) | ✅ `/signup` | 🟡 ADR-011 (el BFF); el alta no tiene sección propia | No hay alta de socio por esta vía |
| RF-01 Foto | 🟡 columna `foto_url`; Storage sin configurar | 🟡 `PATCH /perfiles/me` acepta una URL de texto | ❌ | ❌ el formulario no la pide | ❌ | — |
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
| Validar el ingreso | ✅ `check_ins` | ✅ `POST /acceso/check-ins`, check-out y listados | ✅ unitario del check-in feliz y de TOTP inválido. Sin e2e | ✅ `/acceso` | ✅ secuencia [sec-acceso-offline](../docs/diagramas/fuentes/sec-acceso-offline.mmd) | Check-out solo por API |
| RN-01 Una sede a la vez | ✅ `presencias` | ✅ `registrar_check_in` devuelve `YA_DENTRO` / `YA_EN_OTRA_SEDE` | ✅ el unitario mapea `YA_EN_OTRA_SEDE` a 409 | 🟡 el error se ve; no hay salida guiada en la UI | ✅ ADR-007 y [propuesta RN-01](../docs/rnf/Propuesta_RN01_Presencia_Una_Sede.md) | Timeout de 3 h: está en el ADR, no en el código |
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
| RF-09 Alta y precio por hora | ✅ `canchas` | ✅ `POST /canchas` y `PATCH /canchas/:id` | 🟡 el e2e solo afirma 401 y 403, no el alta | ❌ | 🟡 manual técnico §7.1 (caso tenis), no una guía de alta | — |
| RF-10 Grilla | ✅ | ✅ `GET /canchas/disponibilidad` | 🟡 e2e del GET público | ✅ `/canchas`: sede, fecha y horario | ✅ [C4-3 canchas](../docs/diagramas/fuentes/c4-3-canchas.mmd), [secuencia de reserva](../docs/diagramas/fuentes/sec-reserva-pago.mmd) | — |
| RF-10 Reservar y cancelar | ✅ `reservar_cancha`, `cancelar_reserva_cancha`, hold | ✅ `POST /canchas/reservas`, `GET /canchas/reservas/me`, `POST /canchas/reservas/:id/cancelar` | ✅ `reservas-cancha.service.spec` (hold, pago, cancelar) | 🟡 reservar y pagar; no hay botón de cancelar | ✅ secuencia y [estados de la reserva](../docs/diagramas/fuentes/est-reserva.mmd) | — |
| RN-02 Sin sobreventa | ✅ índice único `reservas_cancha_sin_sobreventa` | ✅ el 23505 sale como 409 `TURNO_OCUPADO` | ✅ unitario del 409 y `supabase/tests/canchas_m4.test.sql` (manual) | — lo resuelve la API | ✅ [ADR-004](../docs/adr/ADR-004-concurrencia-reservas-canchas.md), secuencia concurrente, manual §5 | El SQL no corre en CI |
| RF-11 Precio (descuento socio + pico) | ✅ `configuracion_pico`, `configuracion_cadena` | ✅ Decorator (`Standard` → `MemberDiscount` → `PeakHour`); `GET/PUT` de pico y de descuento (el PUT de descuento es de gerente) | ✅ `precios.service.spec`, incluido el socio vencido que paga como externo | 🟡 la grilla muestra el precio que devuelve la API; no hay pantalla para editar pico ni descuento | ✅ justificación § Decorator, manual §4.1, [análisis Strategy → Decorator](./diagramas%20desarrollo/analisis-strategy-a-decorator.md), UML de clases. El enunciado todavía nombra Strategy | — |
| RF-12 Mantenimiento | ✅ `mantenimientos_cancha` (desde–hasta) | ✅ `GET/POST/DELETE .../mantenimientos`; la grilla marca esas horas | ✅ `canchas.service.spec` | ❌ | ✅ justificación: período en tabla, no un estado de la reserva | — |
| RNF-03 Disponibilidad rápida | ✅ índices de sede, rango de mantenimiento, cancha+inicio y perfil | — | ❌ no hay medición de latencia | — | 🟡 el enunciado y el índice de ADR-004 | — |

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
| `renovar_membresia` como función | M1 | ❌ el cierre de la anterior lo hace el servicio de Nest | — |
| Storage de la foto, archivo de PDF | M1 / M5 | ❌ | — |

Scripts SQL de reglas, solo en local: `supabase/tests/membresias_clases.test.sql` y `supabase/tests/canchas_m4.test.sql`. No hay script de acceso ni de pagos.

---

## 4. Backend y frontend, en una frase cada uno

**API.** Módulos `usuarios`, `acceso`, `clases`, `canchas` y `pagos`. Identidad tomada del JWT. Swagger en el proceso de Nest. Lo que la matriz marca ❌ no tiene endpoint: reportes y PDF. El alta de sedes sí: `POST /sedes` y `PATCH /sedes/:id`. La agenda de clases sí: `POST /clases` y `PATCH /clases/:id`.

**Web.** React + Vite. Cliente en `frontend/src/services/api.ts` (token y 401). Estado de sesión en `AuthProvider`. Rutas: `/login`, `/signup`, `/perfil`, `/canchas`, `/clases`, `/clases/gestionar` (gerente), `/notificaciones`, `/mi-qr`, `/acceso`, `/sedes` (gerente), `/dashboard`. No hay tests de frontend. Atomic Design llega a átomos (`Button`, `Input`, `Spinner`) y al `Layout`.

---

## 5. Testing y entrega

| Ítem | Estado al 14/11 |
|------|------------------|
| Unitarios de backend | ✅ auth, perfiles, sedes, membresías, clases, observers, acceso, TOTP, canchas, precios, reservas, pasarela, guards |
| E2E de backend | 🟡 auth, perfiles, roles, sedes (GET y alta/edición por rol), notificaciones, membresías/clases (seguridad, lista de espera y agenda por rol), canchas (GET público y 401/403). No hay e2e de acceso ni del checkout |
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
| 2 | Pantallas de alta de cancha, mantenimiento, horario pico y descuento de socio | RF-09, RF-12, RF-11 |
| 3 | Cancelar una reserva de cancha desde `/canchas` y check-out desde `/acceso` | RF-10, RN-01 |
| 4 | Foto (Storage) y alta de socio, no solo de externo | RF-01 |
| 5 | Manual de usuario y manual de instalación | C-16, C-17 |
| 6 | Docker o un arranque de cinco pasos, y el seed de 25 sedes | ADR-009, carga de prueba |

Quedan fuera de esta entrega, ya escritos como corte: app móvil, MercadoPago real, Circuit Breaker y reportes del gerente. El offline de recepción es la cola del navegador más el sync, no un nodo por sede. El alta de sedes del gerente ya está en `/sedes`. La agenda de clases del gerente ya está en `/clases/gestionar`. La renovación cobrada de la membresía ya está en el perfil del socio.
