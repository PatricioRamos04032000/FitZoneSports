# Plan M2 — Acceso UX v2 (continuación)

**Responsable:** Patricio Ramos (P1)  
**Fecha:** 2026-11-03  
**Estado:** Por hacer · **rama sugerida:** `s8t1-acceso-ux-v2` (desde `desarrollo` o desde `s8t1` con Fases 0–5 mergeadas)  
**Base:** [Plan M2 Acceso](./Plan_M2_Acceso_QR_Patricio.md) (MVP cerrado) · [ADR-007](./adr/ADR-007-acceso-totp-cola-offline.md) (Aceptado)

Este documento **no reemplaza** el plan M2 original. Es el backlog de **mejoras de recepción** acordadas tras probar la UI v1 (`/acceso` con pegar JSON + selector de todas las sedes).

---

## 1. Motivación

La v1 cumple el MVP (check-in online, cola offline, Mi QR), pero en recepción:

- Elegir sede entre **todas** las del club es confuso; el admin debe operar solo las **asignadas** (y puede tener **varias**).
- Pegar el payload JSON del QR es poco usable.
- Hace falta **cámara** para escanear y un **plan B** sin cámara (DNI + código TOTP).

---

## 2. Decisiones de diseño (cerradas)

| Tema | Decisión |
|------|----------|
| Sede en el request | El cliente **siempre envía `sedeId`**. Nest valida con `assertPuedeOperarSede` (admin solo `admins_sede`; gerente sin esa restricción). |
| Lista de sedes en UI | Solo sedes operables vía `GET /acceso/mis-sedes`. **No** usar el listado global `GET /sedes` en recepción. |
| Una vs varias sedes | 1 sede → fijarla (label). 2+ → `<select>` **solo** entre las asignadas. |
| Gerente | `mis-sedes` = sedes activas (MVP). |
| QR | Cámara como flujo principal (`html5-qrcode`). Payload `{ v:1, perfilId, code }`. |
| Alternativa sin cámara | Formulario **`dni` + código 6 dígitos** (+ `sedeId`). **Sin** nombre/apellido. |
| Lookup | `perfiles.dni` es UNIQUE → resuelve `perfilId`. |
| Offline | QR escaneado (ya tiene `perfilId`+`code`) → se puede encolar. Form DNI → **solo online** (hay que resolver DNI en servidor). |

---

## 3. Backend

### 3.1 `GET /acceso/mis-sedes`

- Roles: `admin_sede`, `gerente`.
- Response: `{ items: [{ sedeId, nombre }] }`.
- Admin: join `admins_sede` ↔ `sedes`.
- Gerente: sedes con `activa = true`.
- Admin sin filas en `admins_sede` → lista vacía (UI muestra error claro).

### 3.2 `POST /acceso/check-ins/por-identidad`

- Roles: `admin_sede`, `gerente`.
- Body: `{ dni, code, sedeId }` — **los tres obligatorios**.
- Flujo: `assertPuedeOperarSede(sedeId)` → `findPerfilPorDni(dni)` → misma lógica que `checkIn` (membresía + TOTP + RPC).
- Errores tipados: `SOCIO_NO_ENCONTRADO`, `SEDE_NO_ASIGNADA`, más los de check-in (`TOTP_INVALIDO`, `YA_DENTRO`, etc.).

### 3.3 Repository / tests

- `listSedesDeAdmin(perfilId)`, `findPerfilPorDni(dni)`.
- Tests: multi-sede; sede ajena → 403; DNI inexistente; check-in feliz por DNI.

Archivos tocados (orientativo):

- [`backend/src/acceso/acceso.controller.ts`](../backend/src/acceso/acceso.controller.ts)
- [`backend/src/acceso/acceso.service.ts`](../backend/src/acceso/acceso.service.ts)
- [`backend/src/acceso/acceso.repository.ts`](../backend/src/acceso/acceso.repository.ts)
- [`backend/src/acceso/acceso.dto.ts`](../backend/src/acceso/acceso.dto.ts)
- [`backend/src/acceso/acceso.service.spec.ts`](../backend/src/acceso/acceso.service.spec.ts)

---

## 4. Frontend

Archivo principal: [`frontend/src/pages/Acceso/Acceso.tsx`](../frontend/src/pages/Acceso/Acceso.tsx)

1. Al montar: `GET /acceso/mis-sedes` → fijar o seleccionar `sedeId`.
2. Quitar: textarea JSON, campos `perfilId` crudos, `GET /sedes` global.
3. **Escáner:** “Escanear QR” → permiso cámara → `Html5Qrcode` → `POST /acceso/check-ins` con `sedeId`; si falla cámara/permiso → mensaje y foco al form.
4. **Form:** DNI + código → `POST /acceso/check-ins/por-identidad`.
5. Cola offline: sin cambios de contrato; solo alimentar desde escaneo (perfilId+code+sedeId).
6. Dependencia: `html5-qrcode`.
7. Docs: actualizar README §6.4 (cámara + DNI; sin pegar JSON).

---

## 5. Fuera de alcance (v2)

- Check-out en la UI de recepción.
- Mostrar nombre del socio en la lista de presencias.
- Atomic Design / Storybook.
- App móvil nativa / service worker.
- Validación TOTP 100 % offline en recepción (sigue siendo cola + sync, ADR-007).

---

## 6. Estimación

~**5–7 h** efectivas (cámara es lo más variable: 1,5–2,5 h). Sin costo de infra extra.

| Pieza | Tiempo |
|-------|--------|
| `mis-sedes` + tests | 45–60 min |
| `por-identidad` + tests | 1–1,5 h |
| UI sede 1/N + form DNI | ~1 h |
| Cámara QR | 1,5–2,5 h |
| README / LOG / smoke | 30–45 min |

---

## 7. Criterios de cierre

- [ ] Admin con 1 sede: no elige; check-in usa esa sede y manda `sedeId`.
- [ ] Admin con 2+ sedes: selector solo entre asignadas; sede no asignada → 403 aunque se force el body.
- [ ] Escaneo QR → check-in online (y encola si offline/red).
- [ ] Form DNI + código → check-in online; sin red, mensaje claro (no encola identidad).
- [ ] README §6.4 y entrada LOG de la v2.

---

## 8. Cómo arrancar en otra rama

```bash
git checkout desarrollo   # o s8t1 si Acceso MVP aún no está mergeado
git pull
git checkout -b s8t1-acceso-ux-v2
```

Prerrequisito: API Acceso Fase 2–3 y UI Fase 4 ya en la base de la rama (módulo `acceso/`, `/mi-qr`, `/acceso`).

---

*Acceso UX v2 · 2026-11-03 · Patricio Ramos · FitZone Sports*
