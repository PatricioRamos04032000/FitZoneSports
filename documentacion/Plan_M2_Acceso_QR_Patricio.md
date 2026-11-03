# Plan M2 — Check-in en sede + QR regenerativo (TOTP)

**Responsable:** Patricio Ramos (P1)  
**Fecha:** 2026-11-01  
**Estado:** Fase 5 hecha · plan M2 cerrado (MVP)  
**Continuación UX:** [Plan_M2_Acceso_UX_V2.md](./Plan_M2_Acceso_UX_V2.md) (cámara, DNI, sedes asignadas — otra rama)  
**Base documental:** [Decisiones §8](./Decisiones_Pendientes_y_Cosas_a_Definir.md) · [Propuesta ER](./Propuesta_ER_FitZone.md) · [Propuesta RN-01](./Propuesta_RN01_Presencia_Una_Sede.md) · [C4 §5 offline](./C4_Arquitectura_FitZone.md) · [Funcionalidades por actor](./Funcionalidades_por_Actor.md)

---

## 1. Objetivo

Entregar el camino mínimo de **acceso en sede**:

1. **QR regenerativo** del socio (RF-04) con TOTP.
2. **Check-in en recepción** (A3 `admin_sede`) online contra Nest.
3. **Offline de sede acotado:** si no hay red, la recepción **solo acumula** check-ins locales; al volver la conexión **intenta registrarlos** en la API y **anota errores** (sin resolución automática de conflictos).

Fuera de este plan (salvo stretch): tornos físicos, aforo en tiempo real completo (RF-05), app React Native instalable, Circuit Breaker.

---

## 2. Decisiones que este plan fija (para avanzar)

| Tema | Elección de trabajo | Nota |
|------|---------------------|------|
| Mecanismo QR | **TOTP** por socio (`totp_seeds`) | Alineado a Decisiones §8.3 |
| Período | **60 s** · ventana de aceptación **±1 período** | Ajustable; documentar en ADR al cerrar |
| Payload del QR | JSON compacto: `{ v:1, perfilId, code }` | Nombre solo en UI, no en el QR |
| Emisión del seed | Al **activar membresía** (`MembresiasService.crear` → `ensureTotpSeed` cifrado) + seed demo + `POST /acceso/totp/emitir` | Endpoint socio para leer seed/secret de su dispositivo |
| Dónde se muestra el QR | **Web socio** primero (demo); móvil RN después | No bloquea M2 sede |
| Validación online | Nest: membresía + TOTP; RN-01 lo impone la BD al insertar presencia | Fuente de verdad = API + unique |
| Offline sede | **Cola local + sync** · sin validar membresía/TOTP en el servidor hasta el sync | La sede puede “aceptar” localmente el escaneo y encolar; el veredicto definitivo es al sincronizar |
| Sync con error | Cada ítem: `pendiente` → `ok` \| `error` + `mensaje` / `codigo` | No reintenta infinito sin tope; UI de recepción muestra fallidos |
| RN-01 | **Misma idea que RN-02:** `presencias` UNIQUE(`perfil_id`); Nest **no** decide con `if` — hace `INSERT` y mapea `unique_violation` → `YA_EN_OTRA_SEDE` / `YA_DENTRO` (como `TURNO_OCUPADO` en canchas). Lectura previa solo si hace falta para mensaje más rico (sede actual), no como garantía | Offline: consistencia eventual; conflicto al sync → mismo error de BD anotado |
| Checkout presencia | **Timeout** (p. ej. 3 h) + salida explícita opcional | Si el docente pide otro criterio, se ajusta |
| Aforo (RF-05) | Solo lectura `COUNT(presencias por sede)` vs `aforo_max` | Soft: avisa, no bloquea en MVP |

**Offline — alcance explícito (pedido 2026-11-01):**  
no hay motor de reglas offline sofisticado. Offline = **acumular** eventos de check-in → **flush** a `POST /acceso/check-ins` (o batch) → **anotar** rechazos (membresía vencida, TOTP inválido al momento del sync, RN-01, sede distinta, etc.).

---

## 3. Alcance por capas

### 3.1 Base de datos (migración Fase B / M2)

Tablas según ER:

| Tabla | Rol |
|-------|-----|
| `totp_seeds` | `perfil_id` UK, `seed_cifrado`, `activo`, `rotado_en` |
| `presencias` | PK/UK `perfil_id`, `sede_id`, `desde` → RN-01 |
| `check_ins` | Historial: `perfil_id`, `sede_id`, `tipo` (`entrada`\|`salida`), `origen` (`online`\|`offline_sync`), `ocurrio_en`, `client_event_id` UK (idempotencia sync), `sync_ok` |

Índices útiles: `(sede_id, ocurrio_en DESC)` en `check_ins`; unique `client_event_id` para no duplicar al reintentar sync.

### 3.2 Backend Nest (`acceso/`)

| Pieza | Responsabilidad |
|-------|-----------------|
| `TotpService` | Generar seed, cifrar/descifrar, verificar código (ventana ±1) |
| `AccesoService` | Orquestar check-in/out: membresía → TOTP → presencia → insert historial |
| `PresenciasRepository` / `CheckInsRepository` | Supabase API |
| Controllers | Endpoints abajo |
| Guards | Socio: su seed/QR; `admin_sede`/`gerente`: check-in de su sede |

**Endpoints MVP**

| Método | Ruta | Quién | Qué |
|--------|------|-------|-----|
| `POST` | `/acceso/totp/emitir` | sistema / tras membresía | Crea o rota seed (interno o admin) |
| `GET` | `/acceso/totp/me` | socio | Devuelve material para armar QR (seed o provisioning URI) |
| `GET` | `/acceso/totp/me/codigo` | socio (opcional) | Código actual (debug/demo web) |
| `POST` | `/acceso/check-ins` | admin_sede | Check-in online: body `{ perfilId, code, tipo?, ocurrioEn?, clientEventId? }` |
| `POST` | `/acceso/check-ins/sync` | admin_sede | Batch offline: array de eventos; respuesta por ítem `ok`/`error` |
| `POST` | `/acceso/check-outs` | admin_sede | Sale de `presencias` + historial |
| `GET` | `/acceso/presencias?sedeId=` | admin_sede | Quién está dentro + hint aforo |
| `GET` | `/acceso/check-ins?sedeId=` | admin_sede | Últimos eventos (auditoría corta) |

Errores de negocio tipados (para anotar en sync): `MEMBRESIA_INACTIVA`, `TOTP_INVALIDO`, `YA_EN_OTRA_SEDE`, `YA_DENTRO`, `EVENTO_DUPLICADO`, etc.

### 3.3 Frontend

| Pantalla | Rol | Alcance |
|----------|-----|---------|
| **Mi QR** (`/mi-qr`) | Socio | Muestra QR regenerativo (re-render cada 60 s) |
| **Recepción / Acceso** (`/acceso`) | admin_sede | Input/cámara QR → check-in; lista presencia; panel **cola offline** |
| Cola offline (cliente) | admin_sede | `localStorage` / IndexedDB: encolar si `navigator.onLine === false` o si falla red; botón “Sincronizar”; tabla de errores |

Sync: al `online` o manual → `POST /acceso/check-ins/sync` → marcar cada `clientEventId` como `ok` o `error` + mensaje.

---

## 4. Fases de implementación (orden)

Estimación orientativa ~**12–16 h** (reparte en varias sesiones). No bloquea el guion canchas del Demo Day; se puede demoear en paralelo.

### Fase 0 — Cierre liviano de docs (0.5–1 h) — hecha 2026-11-01

- [x] Apuntar este plan desde Decisiones §8 y LOG.
- [x] Marcar en Decisiones: offline sede = cola + sync con anotación de errores (esta versión).
- [x] Borrador [ADR-007](./adr/ADR-007-acceso-totp-cola-offline.md) “Acceso TOTP + cola offline” (Propuesto; Aceptado al cerrar Fases 1–3 / 5).

### Fase 1 — Migración + seed TOTP (2–3 h) — hecha 2026-11-01

- [x] SQL `totp_seeds`, `presencias`, `check_ins` (+ RLS; RPC `registrar_check_in` / `registrar_check_out`) — [`20261101210000_acceso_m2.sql`](../supabase/migrations/20261101210000_acceso_m2.sql).
- [x] Seed demo: socio con seed `JBSWY3DPEHPK3PXP`; documentado en [Seed_Demo_S5](./Seed_Demo_S5.md).
- [x] Aplicar en Supabase de desarrollo (SQL Editor + `npm run seed` OK 2026-11-01).

**Cierra cuando:** tablas visibles y socio seed tiene fila en `totp_seeds`.  
**Nota:** ADR-007 sigue **Propuesto** hasta la API Nest (Fase 2). `seed_cifrado` en demo = base32 en claro; cifrado AES en Nest = Fase 2.

### Fase 2 — Backend online (4–5 h) — hecha 2026-11-02

- [x] Módulo `acceso/` + `TotpService` (tests unitarios de ventana ±1).
- [x] `POST /acceso/check-ins` online completo (membresía + TOTP + presencia).
- [x] `GET /acceso/totp/me` + `GET /acceso/totp/me/codigo` para el QR del socio.
- [x] `POST /acceso/check-outs` + listado de presencias / check-ins.
- [x] Swagger + Postman mínimo ([`FitZoneSports_Acceso.postman_collection.json`](../postman/FitZoneSports_Acceso.postman_collection.json)).
- [x] Tests de RN-01 (`YA_EN_OTRA_SEDE` / `YA_DENTRO` vía RPC → 409).

**Cierra cuando:** smoke Postman/Swagger: socio con código válido entra; código viejo falla; segunda sede falla.

### Fase 3 — Sync offline + idempotencia (2–3 h) — hecha 2026-11-03

- [x] `POST /acceso/check-ins/sync` (batch, respuesta por ítem; HTTP 200).
- [x] `client_event_id` unique; short-circuit si ya existe (sin revalidar TOTP); reintento no duplica.
- [x] Errores tipados en la respuesta (no solo 4xx global del batch).
- [x] Tests: ítem ok + ítem `YA_EN_OTRA_SEDE` en el mismo batch; reintento idempotente.

**Cierra cuando:** se puede reenviar el mismo batch sin duplicar filas y los fallos quedan en el JSON de respuesta.

### Fase 4 — UI mínima (3–4 h) — hecha 2026-11-03

- [x] Página **Mi QR** (`/mi-qr`, socio): `GET /acceso/totp/me/codigo` + QR `{ v:1, perfilId, code }` (lib `qrcode`).
- [x] Página **Acceso** (`/acceso`, admin_sede/gerente): check-in online; offline o fallo de red → cola `localStorage`.
- [x] Panel cola: sincronizar (`POST /acceso/check-ins/sync`) + errores tipados; sync al evento `online`.
- [x] MVP sin cámara: pegar JSON del QR o perfilId + código a mano. `RoleRoute` + links en Layout.

**Cierra cuando:** un pase demo: mostrar QR → escanear/pegar en recepción → aparece en presencias; cortar red → encolar → volver red → sync con al menos un caso de error forzado visible.

### Fase 5 — Docs de cierre (1 h) — hecha 2026-11-03

- [x] Actualizar Panorama M2 (filas ✅/🟡).
- [x] Justificación de patrones: Acceso reutiliza Repository; sin patrón GoF nuevo obligatorio.
- [x] ADR-007 **Aceptado** + entrada LOG.
- [x] Guía demo README (§6) con pasos Acceso (UI + API).

---

## 5. Flujo resumido

### Online

```
Socio (Mi QR) ──TOTP──► QR { perfilId, code }
Admin sede escanea ──► POST /acceso/check-ins
Nest: membresía → verify TOTP → INSERT presencia + check_in
```

### Offline (esta versión)

```
Admin sede escanea ──► cola local { clientEventId, perfilId, code, sedeId, ocurrioEn, tipo }
…sin red…
Al volver: POST /acceso/check-ins/sync
Nest valida cada ítem → ok | error tipado
UI marca ítems y muestra mensajes (no borra errores hasta que el operador los descarte)
```

---

## 6. Criterios de aceptación (MVP)

- [ ] QR del socio cambia cada ~60 s (o al menos el código TOTP).
- [ ] Check-in online con membresía activa y código válido → presencia en esa sede.
- [ ] Código fuera de ventana → rechazo.
- [ ] Socio ya en otra sede → `YA_EN_OTRA_SEDE`.
- [ ] Sin red: eventos quedan en cola local; no se pierden al recargar (persistencia).
- [ ] Sync: éxitos persistidos una sola vez; fallos con código/mensaje visibles.
- [ ] Seed + Swagger/Postman documentados para el equipo.

---

## 7. Riesgos y no-hacer

| Riesgo | Mitigación |
|--------|------------|
| Offline acepta y luego sync falla (socio vencido / RN-01) | UI clara: “ingreso local pendiente de sync”; errores visibles |
| Seed en claro en el cliente | HTTPS; no loguear seed; cifrado en BD |
| Cámara QR complica el MVP | Empezar con pegado manual del payload |
| Solapa con Demo Day canchas | Priorizar Fases 1–3 (API); UI si sobra |

**No hacer ahora:** MercadoPago/PDF, aforo duro, nodo servidor por sede, PWA service-worker complejo (alcanza cola en `localStorage`/IndexedDB), RN-01 offline fuerte.

---

## 8. Relación con el plan de 3 semanas

Este plan **no reemplaza** S5–S7 de canchas/demo. Es un **track paralelo de Patricio** para M2 / rúbrica de acceso y demos de QR. Si el tiempo aprieta el Demo Day de canchas, cortar en **Fase 3** (API + sync) y diferir UI a Lucas o a una sesión extra.

---

*Plan M2 Acceso · 2026-11-01 · Patricio Ramos · FitZone Sports*
