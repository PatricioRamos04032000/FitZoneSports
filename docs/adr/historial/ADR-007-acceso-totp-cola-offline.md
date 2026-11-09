> **Histórico, congelado el 2026-11-09 (C-14).** No es la decisión vigente. Índice: [docs/adr/README.md](../README.md).

# ADR-007: Acceso en sede con QR TOTP y cola offline

Estado: Aceptado  
Fecha: 2026-11-01 · **Aceptado:** 2026-11-03

## Contexto

FitZone Sports debe cubrir el ingreso a gimnasio con **QR dinámico** (RF-04) y el **acceso en sede aunque falle internet** (RNF-01). Hay dos offlines distintos: el de **recepción/sede** (validar y registrar check-in) y el del **socio** (mostrar su QR; entregable Unidad VI).

El plan de tres semanas dejó M2 fuera del camino crítico de Demo Day (canchas). Aun así hace falta un diseño implementable para Acceso. El enfoque “fuerte” (nodo por sede + paquete de seeds TOTP en el dispositivo de recepción) sigue pendiente de validación docente y es costoso para el MVP.

También aplica **RN-01** (un socio no puede figurar “dentro” de dos sedes a la vez). Online se puede garantizar con integridad en BD; offline solo se consolida al sincronizar.

Referencias: Decisiones §8 · Plan M2 Acceso · [Propuesta RN-01](../rnf/Propuesta_RN01_Presencia_Una_Sede.md) · [C4 §5](../diagramas/C4_Arquitectura_FitZone.md).

## Decisión

Vamos a implementar el acceso MVP así:

1. **QR regenerativo con TOTP** por socio (tabla `totp_seeds`): período **60 s**, ventana de aceptación **±1 período**. Payload del QR: `{ v:1, perfilId, code }` (sin nombre en el código).
2. **Check-in online en Nest** (módulo Acceso): membresía activa → verificar TOTP → aplicar presencia → historial en `check_ins`. Fuente de verdad = API.
3. **Offline de sede acotado:** la UI de recepción **acumula** eventos en cola local (`localStorage` / IndexedDB). Al volver la red, **flush** a Nest (`POST /acceso/check-ins/sync`); cada ítem responde `ok` o `error` tipado. Sin resolución automática de conflictos.
4. **RN-01 como RN-02:** la unicidad la impone PostgreSQL (`presencias` con `UNIQUE(perfil_id)` o PK). Nest **no** garantiza la regla con un `if` previo: intenta el `INSERT` (idealmente vía RPC que traduzca `unique_violation` a un código de negocio, igual que `reservar_cancha` → `TURNO_OCUPADO`) y mapea el error a `YA_EN_OTRA_SEDE` / `YA_DENTRO`. Offline: consistencia eventual; conflicto al sync → mismo error anotado, sin auto-cerrar la presencia previa.
5. **Checkout de presencia:** timeout (p. ej. 3 h) + salida explícita opcional. **Aforo (RF-05):** soft (aviso), no bloqueo duro.
6. **Emisión del seed** al activar/renovar membresía; demo web del socio (`/mi-qr`) antes que React Native.

Queda **fuera del MVP:** paquete de seeds en sede, nodo/servicio local por sede, tornos físicos, aforo duro, app móvil instalable.

Estado de este ADR: **Aceptado** (2026-11-03). Entregado: migración `20261101210000_acceso_m2.sql`; Nest `acceso/` (TOTP, check-in/out, `POST /acceso/check-ins/sync`); UI `/mi-qr` y `/acceso` con cola `localStorage` (Plan M2 Fases 0–4). Stretch fuera del ADR: cámara, check-out rico en UI, nodo por sede, app móvil.

## Consecuencias

Positivas: desbloquea RF-04 y un RNF-01 demostrable sin infraestructura por sede; reutiliza el BFF Nest y Supabase (ADR-005/006); RN-01 online queda fuerte como RN-02; errores de sync visibles para defensa y operación.

Negativas: offline no valida membresía/TOTP/RN-01 hasta el sync (un ingreso “local” puede rechazarse después); no hay cache de seeds en recepción (revocación offline “fuerte” diferida); el timeout de presencia es una convención de equipo, no aún feedback docente; hay que cifrar el seed en BD y definir idempotencia (`client_event_id`).

## Alternativas consideradas

(a) Solo check-in online, sin cola: descartada porque no cubre RNF-01 en sede.

(b) Nodo/servicio local por sede + paquete de seeds (validación TOTP offline fuerte): diferida; plausible a largo plazo, fuera del MVP.

(c) RN-01 solo en lógica Nest con `if` (sin unique en `presencias`): descartada; no aguanta concurrencia (mismo motivo que no resolver RN-02 solo en Nest).

(d) Unique en BD sin mapear el error en Nest: descartada como única entrega al cliente; Nest debe traducir `unique_violation` a códigos claros (`YA_EN_OTRA_SEDE`, etc.), igual que `TURNO_OCUPADO` en canchas. Eso no es un segundo juez de unicidad.

(e) Aforo duro bloqueando ingreso: descartado en MVP (soft).
