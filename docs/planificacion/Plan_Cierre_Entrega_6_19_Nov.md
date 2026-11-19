# Plan de cierre — entrega TIF (6 al 19 de noviembre 2026)

**Fecha del plan:** 2026-11-06  
**Última alineación con Trello:** 2026-11-11 (reunión de equipo; export `documentacion/eBn68vRC - programacion5 (2).json`)  
**Congelamiento / tag:** jueves **19/11/2026, 18:00** → `v1.0-entrega`  
**Demo Day:** semana 23–29/11 (sin desarrollo)  
**Fuente de orden:** [Lineamientos de Entrega](./Lineamientos_Entrega_TIF_FitZone_Sports_2do_Cuatrimestre_2026.pdf) · **Anexo G**  
**Estado de partida:** relevado el 2026-11-06 sobre `desarrollo` (API canchas/clases/acceso fuertes; entonces UI canchas mock; docs de entrega incompletas). **Actualización 2026-11-13:** C-01 y S7-T08 cerrados — canchas en UI y pase demo solo UI; C-24 (ensayo 5 min cronometrado) sigue sobre el guion ya pulido. **Misma fecha:** se agregó **C-28** (Strategy → Decorator + UML Nest), no listada en el plan original; entra en T2 antes del congelamiento T3. **2026-11-14:** se agregó **C-29** (alta y edición de sedes, A4 / RNF-04), rama `C-29`, Patricio. **Misma fecha:** se agregó **C-30** (catálogo, alta atómica y renovación cobrada de membresía, RF-02), rama `C-30`, Patricio. **Misma fecha:** se agregó **C-31** (crear y editar la agenda de clases, RF-06), rama `C-31`, Patricio. **2026-11-15:** se agregó **C-32** (canchas en pantalla: alta, precio, cancelar, pico, descuento y mantenimiento), rama `C-32`, Patricio. **Misma fecha:** se agregó **C-33** (check-out desde `/acceso`, RN-01), rama `C-33`, Patricio. **2026-11-16:** se agregó **C-34** (el título del aviso de lugar liberado se lee sobre la tarjeta), rama `C-34`, Patricio. **2026-11-17:** se agregó el lote **C-35…C-41** (medir la suite, `LICENSE`, ordenar `docs/planificacion/`, reescribir la planificación de cierre, dashboard del gerente, E2E de frontend y RN-02 contra Postgres). Import a Trello: [`Plan_Cierre_C35-C41_Trello_Import.xlsx`](./Plan_Cierre_C35-C41_Trello_Import.xlsx).

**Estados** (lista Trello → este plan): `por hacer` → **Por hacer** · `tambien en desarrollo` → **En desarrollo** · `finalizado` → **Finalizado**. El 2026-11-11 las listas `en desarrollo` y `Blocked` estaban vacías.

Este plan **no reemplaza** S5–S7 ni el track M2. Es el plan de las **dos semanas finales** hasta el tag. Si algo no entra, se corta lo de la sección 7, no lo de admisibilidad (§6.1).

**Solapes con tarjetas S5–S7:** no se borran del tablero. Cada par tiene campo **Observación** (relacionada con…) en  
[`Relacion_Tarjetas_Trello_Observaciones.md`](./Relacion_Tarjetas_Trello_Observaciones.md) y  
[`Plan_Cierre_y_Solapes_Trello_Observaciones.xlsx`](./Plan_Cierre_y_Solapes_Trello_Observaciones.xlsx).

---

## 1. Objetivo

Un repositorio etiquetable el 19/11 que:

1. Levante (idealmente con Docker; si no, con README de 5 pasos a prueba de máquina limpia).
2. Demuestre en UI el guion de 5 min: login → membresía → reservar paddle + pagar → QR → check-in sede.
3. Cumpla la **admisibilidad formal**: 4 bitácoras, 10 ADR obligatorios, 14 diagramas, 3 manuales, planificación + tablero.
4. Tenga dossier PDF + nomenclatura Moodle listos.

---

## 2. Capacidad (techo)

| Integrante | Rol | h / semana | Total ~2 semanas |
|------------|-----|------------|------------------|
| Patricio (P1) | Arquitectura / docs / backend crítico | 8–10 h | 16–20 h |
| Lucas (P3) | Frontend demo + responsive | 8–10 h | 16–20 h |
| Bruno (P2) | Backend gaps RF + tests | 4–6 h | 8–12 h |
| Matias (P4) | Planificación, CI, seed, Docker, cobertura | 4–6 h | 8–12 h |
| **Equipo** | | ~24–32 h | **~48–64 h** |

Regla: **docs de admisibilidad y demo UI primero**; polish y stretch después.

---

## 3. Tres tramos (alineados a la cátedra)

| Tramo | Fechas | Foco |
|-------|--------|------|
| **T1 — Demo operable** | vie 6 – dom 8/11 | Grilla/reserva/pago en UI; membresía visible; responsive básico; decidir RNF-01 |
| **T2 — Entregables formales** | lun 9 – dom 15/11 | ADR ×10, diagramas ×14, 3 manuales, bitácoras ×4, planificación, Docker/seed, estructura `docs/` |
| **T3 — Congelamiento** | lun 16 – jue 19/11 | Defectos críticos, Anexo G en verde, tag, dossier Moodle |

Después del tag: solo ensayo Demo Day.

---

## 4. Backlog por tramo (con dueño)

### T1 — 6 al 8/11 · Demo operable (~18–22 h)

| ID | Tarea | Quién | h | Estado | Cierra cuando | Anexo G |
|----|-------|-------|---|--------|---------------|---------|
| C-01 | **S4-T13** — `/canchas` real: sede → `GET /disponibilidad` → reservar → `POST .../pagar` → checkout | Lucas | 6–8 | **Finalizado** | Paddle del seed se reserva y confirma desde la UI | Funcionalidad / portal teléfono |
| C-02 | Membresía en UI (`GET /membresias/mia` en Perfil o bloque propio) | Lucas | 1–2 | **En desarrollo** | Se ve plan/estado/vigencia del socio seed | RF-02 demostrable |
| C-03 | Lectura responsive: Login, Canchas, Mi QR usables en viewport móvil | Lucas | 2 | **Finalizado** | QR legible; reserva posible en teléfono | Portal desde teléfono |
| C-04 | RF-14: PDF **comprobante FitZone** post-pago (cancha, horario, monto); no factura fiscal | Bruno | 3–4 | **Finalizado** | Tras pagar se descarga/abre PDF con esos datos | RF-14 |
| C-05 | Decisión escrita RNF-01: reforzar offline real **o** documentar MVP cola+sync + mail a cátedra (§7.2) | Patricio | 1 | **Finalizado** | ADR alineado + si hace falta aviso formal | RNF-01 |
| C-06 | Ensayo corto API+UI del guion (sin cronómetro aún) | Todos 30–45 min | 1 | **Finalizado** | Lista de bugs del flujo | Defensa |

**Salida T1:** el Demo Day se puede ensayar en local sin Swagger para el paso de cancha.

---

### T2 — 9 al 15/11 · Admisibilidad + integración (~28–36 h)

#### 4.1 Código / operación

| ID | Tarea | Quién | h | Estado | Cierra cuando | Anexo G |
|----|-------|-------|---|--------|---------------|---------|
| C-07 | `docker-compose.yml` (+ Dockerfiles) que levante API + front; BD Supabase documentada o Postgres local | Matias | 6–8 | **Por hacer** | `docker compose up --build` o README de 5 pasos en máquina limpia | Código Docker |
| C-08 | Seed ≥ **25 sedes** + canchas/clases mínimas + 4 roles (o script aparte `seed:entrega`) | Matias | 4–5 | **Por hacer** | Cumple §5.4.1 carga de prueba | Seed 25 sedes |
| C-09 | Exportar `backend/swagger.json`; link en README. **Cerrada 2026-11-13** (`5546109`) | Bruno | 0,5 | **Finalizado** | Archivo en repo + UI docs | swagger.json |
| C-10 | Suite verde: unit + e2e críticos; actualizar reporte cobertura; declarar umbral en ADR-008 (cátedra) | Matias | 3–4 | **Por hacer** | CI verde + reporte | Cobertura / tests |
| C-11 | Pantalla Clases mínima (listar + inscribir). **Cerrada 2026-11-13** por **Patricio** (tomó la tarjeta de Lucas; UI `/clases`; RF-07 + RF-08 lista espera) | Patricio (antes Lucas) | 3–4 | **Finalizado** | RF-07 demoable en UI | 14 RF |
| C-12 | Notificaciones in-app (lista + leída) stretch | Lucas | 1–2 | **Por hacer** | Si sobra | — |
| C-28 | Precios Strategy → Decorator GoF + UML Nest completo + docs (serie C-28.1…C-28.5) | Patricio | 5–7 | **Finalizado** | Suite precios verde; UML Nest (controllers/services/DTOs/repos + Decorator); secuencia + C4-3; manual §4.1/weekend; justificación Unidad III; defensa cita Decorator | Patrones / diagramas |
| C-29 | Alta y edición de sedes (A4, RNF-04): checks, `POST/PATCH /sedes` solo gerente, UI `/sedes`, tests y docs. Rama `C-29` | Patricio | 3–4 | **Finalizado** | El gerente crea y edita una sede sin SQL; la baja es `activa = false`; no hay ADR nuevo | RNF-04 |
| C-30 | Catálogo en el perfil, alta que cierra la anterior en una función SQL y renovación cobrada con la pasarela simulada. Rama `C-30` | Patricio | 4–6 | **Finalizado** | El socio elige un plan y paga; el rechazo no toca la membresía vigente; el alta de staff no cobra | RF-02 |
| C-31 | Crear y editar la agenda de clases (RF-06): checks de texto, `POST/PATCH /clases` solo gerente, UI `/clases/gestionar`, tests y docs. Rama `C-31` | Patricio | 4–6 | **Finalizado** | El gerente crea y edita una clase sin SQL; la baja es `estado = cancelada`; el `PATCH` no cambia la sede; no hay ADR nuevo | RF-06 |
| C-32 | Canchas en pantalla (RF-09, RF-10, RF-11, RF-12, RNF-03): `/canchas/gestionar`, cancelar la reserva propia y e2e del alta. Rama `C-32` | Patricio | 5–7 | **Finalizado** | El gerente y el admin de la sede administran cancha, pico y mantenimiento sin SQL; el descuento lo edita el gerente; cancelar no devuelve el pago | RF-09 a RF-12 |
| C-33 | Check-out desde `/acceso` (RN-01): botón Salir, `POST /acceso/check-outs` y la misma cola del ingreso si no hay red, servidor o base. Rama `C-33` | Patricio | 4–5 | **Finalizado** | Salir libera la presencia; un 400 o un 404 se muestran; sin red, sin servidor o sin base la salida queda en la cola y el sync no pide TOTP | RN-01 |
| C-34 | Contraste del aviso de lugar liberado en `/notificaciones`: el título queda en azul oscuro sobre la tarjeta blanca. Rama `C-34` | Patricio | 0,5 | **Finalizado** | «Se liberó un lugar en Aviso prueba» se lee en modo oscuro | — |

#### 4.2 Repositorio y docs (admisibilidad §6.1)

| ID | Tarea | Quién | h | Estado | Cierra cuando | Anexo G |
|----|-------|-------|---|--------|---------------|---------|
| C-13 | Reorganizar a `docs/` según la estructura del punto 4 | Patricio | 2–3 | **Finalizado** | Cátedra encuentra ADR/diagramas/manuales/bitácoras/plan | Estructura carpetas |
| C-14 | **10 ADR obligatorios** (§5.2.1): mapear existentes + crear faltantes (concurrencia, offline, pruebas/umbral, despliegue/Docker, tokenización, FE/estado, …). **Cerrada 2026-11-09**, rama `c-14`, índice `docs/adr/README.md` | Patricio | 5–6 | **Finalizado** | 10 archivos, ninguno «Propuesto», con alternativas | ADR ×10 |
| C-15 | **14 diagramas** + fuente editable + PNG/SVG (C4×4, UML, DER, despliegue, pipeline) | Patricio | 8–10 | **Finalizado** | Carpeta `docs/diagramas/` completa | Diagramas ×14 |
| C-16 | Manual usuario (Anexo D) + capturas del sistema **entregado**. **Cerrada 2026-11-17** por **Patricio** (tomó la tarjeta de Lucas; `docs/manuales/manual-usuario.md`, rama `C-16`) | Patricio (antes Lucas) | 4–5 | **Finalizado** | Secciones socio / recepción / gerente, con las capturas en el texto | Manuales |
| C-17 | Manual instalación/operación (Anexo E) | Matias | 3–4 | **Por hacer** | Incluye Docker/env/seed/rollback | Manuales |
| C-18 | Manual técnico (Anexo F) + casos extensión tenis y Strategy | Patricio | 3–4 | **Finalizado** | Dos casos resueltos | Manual técnico |
| C-19 | Bitácoras individuales `docs/bitacoras/LOG-<apellido>.md` ×4 (≥8 entradas c/u, commits, decisión, problema). En el tablero está partida en C-19a…d | **Cada uno** | 3–4 c/u | **Parcial** | Cuatro archivos distintos | Bitácoras |
| C-20 | Planificación completa (§5.6 + Anexo H): plan, EDT, cronograma visual, trazabilidad RF/RN/RNF, seguimiento, riesgos, desvíos | Matias | 6–8 | **Por hacer** | Paquete en `docs/planificacion/` | Planificación |
| C-21 | Exportar tablero (Trello/GitHub/xlsx) con fechas de creación/cierre reales | Matias | 1–2 | **Por hacer** | Archivo `PROGV-2026-TIF-EquipoNN-Registro.xlsx` | Tablero |

**C-19 en el tablero (2026-11-11, actualizado 2026-11-17):** C-19a Patricio **Finalizado** · C-19b Bruno **Finalizado** (`LOG-conti.md`) · C-19c Patricio **Finalizado** (`LOG-coquet.md`, 2026-11-17) · C-19d Matias **En desarrollo**.

**Salida T2:** checklist Anexo G de Documentación + Bitácoras + Planificación casi todo marcado.

---

### T3 — 16 al 19/11 · Congelamiento (~8–12 h)

| ID | Tarea | Quién | h | Estado | Cierra cuando | Anexo G |
|----|-------|-------|---|--------|---------------|---------|
| C-22 | Recorrer Anexo G casilla por casilla; bugs solo críticos del guion. **Pase 2026-11-18:** RNF-03 medido en `/canchas` (786 ms hasta ver la grilla de FitZone Central). Sigue el residual en `documentacion/C-22_Anexo_G_Pendiente.md`: tag `v1.0-entrega`, dossier en Moodle, acceso de lectura de la cátedra, paquete de planificación (C-20, C-21, C-37, C-38), ensayo C-24 y el portal en el teléfono sobre Vercel. | Patricio | 3–4 | **En desarrollo** | Lista residual aceptada | Checklist |
| C-23 | README raíz según §4.1 (equipo, 5 pasos, seed users, links, cobertura). **Cerrada 2026-11-17** por **Patricio** (`README.md`: cinco pasos con Docker, usuarios del seed, enlaces y cobertura 65,15 % de sentencias) | Patricio | 2 | **Finalizado** | Máquina limpia sin preguntar | README |
| C-24 | Ensayo demo **5 min cronometrado** + plan B sin red | Patricio | 1–2 | **Por hacer** | Guion escrito + cronómetro OK | Defensa |
| C-25 | Dossier PDF (Anexo A) + hash `git rev-parse` | Patricio | 2 | **Por hacer** | `PROGV-2026-TIF-EquipoNN-Dossier.pdf` | Moodle |
| C-26 | Tag anotado y push **antes de las 18:00**. `master` queda en `v0.51.0`; el 1.0 se publica al terminar. | Patricio | 0,5 | **Por hacer** | `v1.0-entrega` en remoto | Tag |
| C-27 | Subida Moodle (dossier + URL + tag + hash + plan/xlsx) | Patricio | 0,5 | **Por hacer** | Constancia de fecha | Canal entrega |

#### Lote 17/11 · C-35 a C-41

Acordado el 17/11 sobre el plan ya armado. C-38 cierra C-20. El Excel para crear solo estas tarjetas, sin reimportar C-01…C-27, es [`Plan_Cierre_C35-C41_Trello_Import.xlsx`](./Plan_Cierre_C35-C41_Trello_Import.xlsx).

| ID | Tarea | Quién | h | Estado | Cierra cuando | Anexo G |
|----|-------|-------|---|--------|---------------|---------|
| C-35 | Medir build y cobertura: `npm ci`, `npm run build` y `npm run test:cov` en `backend/`. Anotar suites, tests y % de sentencias en `LOG-goncevat.md`. Si la instalación o el build fallan, el arreglo es de esta tarjeta | Matias | 1–2 | **Finalizado** | Medido el 2026-11-18: 32/32 suites, 184/184 tests y 65.77 % de sentencias. El porcentaje citado en C-38 es el de esta corrida. Umbral ADR-008: 60 % de sentencias | Cobertura / tests |
| C-36 | Archivo `LICENSE` (MIT, 2026, los cuatro integrantes) en la raíz, enlazado desde el README. **Cerrada 2026-11-17** por **Patricio** (`LICENSE` en la raíz; la sección 8 del README lo apunta) | Patricio | 0,5 | **Finalizado** | El archivo está en el repo y el README lo apunta | LICENSE |
| C-37 | Ordenar `docs/planificacion/`: renombrar planes y actas por sprint (S1…S8), índice `README.md`, xlsx/json a `exportaciones/`, enlaces actualizados. S3 no tiene plan propio | Matias | 2–3 | **Por hacer** | La carpeta se lee en orden de sprint | Planificación |
| C-38 | Reescribir la planificación de cierre (hoy `Planificacion_Completa_C20.md`): matriz única RF-01…14, RN-01…03 y RNF-01…04; ocho sprints; desvíos ya ocurridos. Depende de C-35 y C-37 | Matias | 4–6 | **Por hacer** | C-20 pasa a Finalizado. Sin riesgos escritos en futuro | Planificación |
| C-39 | Dashboard del gerente (A4), rama `C-39`: consulta de solo lectura (ocupación, reservas del día, clases del día, total de cadena), `GET /reportes/resumen` solo gerente, y `/dashboard` sin el texto fijo | Patricio | 4–6 | **Finalizado** | El gerente ve las cifras; otro rol no llama al endpoint | Reportes A4 |
| C-40 | E2E de frontend con Playwright contra Vite y Nest levantados (usuario del seed): un caso, de login de socio a reserva, pago, consulta en Mis reservas y comprobante PDF. Sin mock de página. **Cerrada 2026-11-18** por **Patricio** (`cd frontend && npm run test:e2e`, 1 passed) | Patricio | 4–6 | **Finalizado** | `cd frontend && npm run test:e2e` en verde en local. El 60 % de ADR-008 no cambia | Pruebas E2E |
| C-41 | Evidencia de RN-02: correr `supabase/tests/canchas_m4.test.sql` (caso `TURNO_OCUPADO`) contra Postgres local en CI. El unitario que simula el 409 se queda. **Cerrada 2026-11-18** por **Patricio** (job `sql-rn02`, rama `C-41`; la corrida local imprimió `OK 3`) | Patricio | 3–4 | **Finalizado** | El job imprime `OK 3` | RN-02 |

**En T3, además de este lote:** sin refactor cosmético y sin app móvil. El dashboard (C-39) y el E2E de navegador (C-40) son la excepción de funcionalidad acordada el 17/11.

---

## 5. Orden de prioridad (si el tiempo aprieta)

```mermaid
flowchart TD
  a[Admisibilidad 6.1] --> b[Demo UI canchas]
  b --> c[Docker o README 5 pasos]
  c --> d[Seed 25 + swagger.json]
  d --> e[RF-14 PDF comprobante]
  e --> f[RNF-01 real o aviso formal]
  f --> g[Clases UI / polish]
```

1. **Bloquean nota / devolución:** bitácoras ×4, ADR ×10, diagramas ×14, 3 manuales, planificación + tablero, tag a tiempo.  
2. **Bloquean Demo Day:** C-01 + C-02 + ensayo.  
3. **Bloquean admisibilidad de código:** Docker **o** arranque impecable; seed 25; tests verdes; sin secretos.  
4. **Avisar antes del 19 si no entran:** RNF-01 offline “fuerte”, app móvil nativa (Equipo 03). RF-14 se entrega como PDF comprobante (no factura). Estructura `docs/` se reorganiza igual.

---

## 6. Guion Demo Day (5 min) — objetivo de producto

1. Login `socio@fitzone.com`.  
2. Mostrar membresía activa.  
3. Canchas → grilla → reservar paddle → checkout simulado → confirmada.  
4. Mi QR (código rotativo).  
5. Otra ventana: `admin.central@fitzone.com` → Acceso → check-in (y, si hay tiempo, cola offline).

Defensa técnica (5 min): Decorator precio, RN-02 lock, Facade/State, Observer lista espera, ADR offline.  
Situación (5 min): agregar canchas de tenis (manual técnico C-18).

---

## 7. Qué se corta (explícito)

| Tema | Motivo |
|------|--------|
| App móvil React Native / APK | Unidad VI; no entra en 13 días con docs |
| Acceso UX v2 (cámara, DNI) | Stretch; pegar JSON alcanza para demo |
| MercadoPago real / Circuit Breaker | Fuera de RF-13 simulado |
| Asignación de `admins_sede` | El alta y la edición de sedes entró en C-29. El ABM de admins de sede sigue fuera. Los reportes del gerente vuelven acotados en C-39 |
| Storybook completo | Sigue fuera. El E2E de navegador entra en C-40; no hay tests de componente |
| Reescritura total de historia del repo | Solo mapear estructura y limpiar README |

---

## 8. Mapa rápido: Anexo G → este plan

| Bloque Anexo G | IDs principales |
|----------------|-----------------|
| Repositorio y entrega | C-13, C-23, C-25, C-26, C-27, C-36 |
| Código | C-07, C-08, C-09, C-10, C-35, C-41 |
| Funcionalidad | C-01…C-05, C-11, C-04, C-29, C-30, C-31, C-32, C-33, C-34, C-39, C-40 |
| Documentación | C-14…C-18 |
| Bitácoras | C-19 |
| Planificación | C-20, C-21, C-37, C-38 |
| Defensa | C-06, C-24 |

---

## 9. Rituales de equipo

- **Lun 9/11 (30 min):** cierre T1; repartir C-14…C-21; confirmar nº de equipo NN y responsable Moodle.  
- **Vie 13/11 (30 min):** estado diagramas/manuales/bitácoras; C-11 ya cerrada (2026-11-13); cortar solo C-12 si atrasa docs.  
- **Mar 17/11:** primer pase Anexo G completo.  
- **Jue 19/11 mañana:** tag dry-run; **tarde antes de 18:00:** tag + Moodle.

Cada integrante dedica **sesión fija a C-19** (bitácora propia) en T2: no se deja para el 18/11.

---

## 10. Criterio de éxito el 19/11

- [ ] Tag `v1.0-entrega` en remoto antes de las 18:00.  
- [ ] Moodle con dossier + plan/xlsx + URL + hash.  
- [ ] Anexo G sin casillas críticas vacías (admisibilidad §6.1 en verde).  
- [ ] Guion de 5 min corrido al menos **dos veces** en local.  
- [x] README permite clonar → app sin preguntar al equipo. C-23, 2026-11-17.

---

*Plan de cierre · FitZone Sports · Programación V · UNER · estados de C-01…C-34 alineados al tablero; C-35…C-41 agregadas el 2026-11-17*
