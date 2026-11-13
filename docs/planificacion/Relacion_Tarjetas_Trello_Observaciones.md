# Relación entre tarjetas Trello — campo Observación

**Fecha:** 2026-11-11  
**Equipo:** 03  
**Fuente Trello:** export `documentacion/eBn68vRC - programacion5 (2).json` (reunión de equipo)  
**Regla:** no eliminar tarjetas; en cada una agregar (descripción o comentario) el campo **Observación** con la tarjeta relacionada, para contrastar si piden lo mismo.

Estados Trello al exportar: `por hacer` · `tambien en desarrollo` · `en desarrollo` · `Blocked` · `finalizado`.

---

## Cómo usarlo en Trello

Al inicio de la descripción (o en un comentario fijo), pegar:

```text
Observación: relacionada con <ID> — <texto corto>.
```

Excel hermano (mismas filas + columna Observación):  
[`Plan_Cierre_y_Solapes_Trello_Observaciones.xlsx`](./Plan_Cierre_y_Solapes_Trello_Observaciones.xlsx)

---

## 1. Frontend — misma intención (demo UI)

| ID | Título (Trello) | Estado Trello | Observación (pegar) | ¿Piden lo mismo? |
|----|-----------------|---------------|---------------------|------------------|
| **C-01** | Pantalla Canchas real (S4-T13) | finalizado | Relacionada con **S6-T07** y **S4-T13**. Alcance de cierre: grilla API + reservar + pagar. El prototipo estático es **S4-T03** (no alcanza). | Sí con S6-T07 / S4-T13. Parcial con S4-T03 (solo mock). |
| **S6-T07** | Pantalla Canchas real | finalizado | Relacionada con **C-01** (plan de cierre). Mismo trabajo front; priorizar C-01 y cerrar juntas. | Sí → C-01 |
| **S4-T13** | *(sin tarjeta propia; solo en título C-01)* | finalizado (vía C-01) | Relacionada con **C-01** / **S6-T07**. ID histórico del plan de 2 semanas. | Sí → C-01 |
| **S4-T03** | React: pantalla de Canchas | finalizado | Relacionada con **C-01**. Esta tarjeta es el **prototipo con datos fijos**; C-01 es conectar API + pago. No cerrar C-01 solo por tener S4-T03. | No (precursora). Cerrar S4-T03 cuando el mock ya no se use. |
| **C-02** | Membresía en UI | tambien en desarrollo | Relacionada con **S7-T07**. Mismo: mostrar plan/estado/vigencia (`GET /membresias/mia`). | Sí → S7-T07 |
| **S7-T07** | Membresía en UI | por hacer | Relacionada con **C-02**. Mismo trabajo; priorizar C-02. | Sí → C-02 |
| **C-03** | Responsive Login / Canchas / Mi QR | finalizado | Relacionada con **S7-T08** (pulido demo). C-03 = viewport móvil; S7-T08 = menú/errores/flujo sin mock. Solapan en pulido, no son idénticas. | Parcial → S7-T08 |
| **S7-T08** | Pulido del flujo demo | finalizado | Relacionada con **C-03**. Cerrada 2026-11-13 por **Patricio** (tomó la de Lucas): menú/roles, Acceso humanizado, Presencias con nombre; Dashboard solo `admin_sede`\|`gerente`. Más amplia que solo responsive. | Parcial → C-03 |
| **C-11** | Pantalla Clases mínima | finalizado | Relacionada con **S7-T06**. Cerrada 2026-11-13 por **Patricio** (tomó la tarjeta de Lucas): UI `/clases` con listar + inscribir; alcance real = S7-T06 completo (cancelar + lista de espera UI). | Sí → S7-T06 |
| **S7-T06** | Pantalla Clases | finalizado | Relacionada con **C-11**. Cerrada 2026-11-13 por **Patricio** (tomó la de Lucas): listar con cupo, inscribir, cancelar y lista de espera en UI (`services/clases.ts` + `Clases.tsx`). | Sí → C-11 |
| **C-12** | Notificaciones in-app (stretch) | por hacer | Relacionada con **S6-T09**. Mismo: listar + marcar leída. Stretch del cierre. | Sí → S6-T09 |
| **S6-T09** | Notificaciones in-app | tambien en desarrollo | Relacionada con **C-12**. Mismo trabajo; priorizar C-12 si se hace. | Sí → C-12 |
| **S5-T08** | Layout post-login y rutas protegidas | finalizado | Relacionada con **S5-T06**/**S5-T07** (finalizadas). En repo ya hay Layout + ProtectedRoute/RoleRoute. Contrastar y, si aplica, pasar a finalizado. | Cubierta por login/sesión hechos |
| **S5-T09** | Átomos de UI | finalizado | Relacionada con **S7-T09** (componentes documentados). Átomos vs catálogo Unidad IV; no son la misma entrega. | Parcial → S7-T09 |
| **S7-T09** | Componentes documentados (Unidad IV) | por hacer | Relacionada con **S5-T09** y con evidencia en manual/README. Más amplia que tres átomos. | Parcial → S5-T09 |
| **S6-T06** | Cliente API completo | finalizado | Relacionada con **S5-T07** (finalizada). Base api/sesión ya está; revisar si falta tipado/401 sedes y cerrar. | Casi cubierta por S5-T07 |
| **S7-T03** | Ensayo demo + checklist del guion | finalizado | Relacionada con **C-06** / **C-24** y bloqueada por **C-01**. Smoke API **S7-T11** ya finalizado ≠ ensayo UI. | Parcial → C-06/C-24 |
| **C-06** | Ensayo corto guion API+UI | finalizado | Relacionada con **S7-T03** y con **C-01**. Ensayo del 2026-11-08 sin errores de flujo; el pulido visual queda fuera de esta tarjeta. | Sí (versión T1 de S7-T03) |
| **C-24** | Ensayo demo 5 min + plan B | por hacer | Relacionada con **S7-T03** / **C-06**. Versión final cronometrada (T3). | Sí (cierre de S7-T03) |

---

## 2. Backend — misma intención (API / reglas)

| ID | Título (Trello) | Estado Trello | Observación (pegar) | ¿Piden lo mismo? |
|----|-----------------|---------------|---------------------|------------------|
| **S4-T06** | API REST módulo Canchas | finalizado | Relacionada con **S6-T04** (lectura/grilla) y **S6-T05** (reserva). S4-T06 en código cubre catálogo+grilla; la reserva quedó en **S7-T01**. | Lectura: sí con S6-T04. Reserva: ver S7-T01/S6-T05 |
| **S6-T04** | API Canchas lectura | finalizado | Relacionada con **S4-T06** (finalizada). Mismo: listar + disponibilidad. Contrastar repo y cerrar si coincide. | Sí → S4-T06 (hecho) |
| **S6-T05** | API Canchas reserva | finalizado | Relacionada con **S7-T01** (finalizada) y con alcance original de S4-T06. Mismo: POST reserva/RPC + Strategy. | Sí → S7-T01 (hecho) |
| **S7-T01** | Patrones en la reserva | finalizado | Relacionada con **S6-T05**. Facade/State + POST reservas; es la implementación de la reserva. | Sí → S6-T05 |
| **S7-T02** | Pago mock mínimo | finalizado | Relacionada con **C-04**. S7-T02 = checkout/token; C-04 = **PDF comprobante** encima del pago. | No (C-04 es extra RF-14) |
| **C-04** | RF-14 PDF comprobante FitZone | por hacer | Relacionada con **S7-T02** (pago ya hecho). No reemplaza el pago: agrega PDF post-pago. | Extiende S7-T02 |
| **S5-T04** | Guards Clases y Membresías | finalizado | Relacionada con **S4-T10** (mergeada en desarrollo, sin tarjeta S4-T10). Guards/JWT/roles ya en código. | Sí → S4-T10 (hecho) |
| **S5-T05** | Ventana 48 h en inscribir (D5) | finalizado | Relacionada con **S4-T10** / cierre de guards. Ventana 48 h ya en `ClasesService`. | Sí → hecha con S4-T10 |
| **S7-T04** | Lista de espera + Observer | finalizado | Relacionada con **S4-T14** (hecha en desarrollo, sin tarjeta S4-T14). Mismo flujo lista espera. | Sí → S4-T14 (hecho) |
| **S7-T05** | Swagger al día | finalizado | Relacionada con **C-09** (export `swagger.json`). Documentar endpoints ≠ exportar archivo OpenAPI. | Parcial → C-09 |
| **C-09** | Exportar backend/swagger.json | tambien en desarrollo | Relacionada con **S7-T05**. S7-T05 = anotaciones Swagger; C-09 = archivo en repo. | Parcial → S7-T05 |
| **S4-T15** | *(PR mergeado; puede no estar en tablero)* | — | Relacionada con precios Strategy / **S4-T01**/**S4-T09**. Redondeo `Math.ceil`. Si no hay tarjeta, no crear duplicado de trabajo. | Hecho en código |

---

## 3. Sin solape fuerte (no marcar como “lo mismo”)

Estas C-xx / S* no compiten entre sí por el mismo entregable; la observación es solo de dependencia o contexto:

| ID | Observación breve |
|----|-------------------|
| **C-05** | Decisión RNF-01 / aviso cátedra. Relacionada con ADR acceso M2, no con S6-T07. (Trello: finalizado) |
| **C-07** | Docker. Nueva para entrega; no duplica S5–S7. |
| **C-08** | Seed 25 sedes. Extiende **S5-T03** (seed mínimo finalizado), no es lo mismo. |
| **C-10** | Cobertura/umbral ADR. Relacionada con **S7-T10** (reporte cobertura finalizado): C-10 actualiza umbral + suite. |
| **C-13, C-15, C-18** | Finalizadas en el tablero el 2026-11-11. Sin par S5–S7 equivalente. |
| **C-16, C-17, C-19b, C-19c, C-20, C-21, C-23, C-25…C-27** | Docs/admisibilidad del cierre, en por hacer. C-19a finalizada; C-19d en desarrollo. C-22 (Anexo G) en desarrollo, a cargo de Patricio. |
| **C-14** | Diez ADR obligatorios escritos el 2026-11-09 (rama `c-14`, `docs/adr/`, ninguno Propuesto). El 60 % lo hace cumplir **C-10**; el Compose, **C-07**. Trello: finalizado. |
| **S7-T12** | Stretch móvil. Distinto de **C-03** (web responsive). Trello: finalizado. |

---

## 4. Texto listo para pegar (copia rápida)

### Frontend

```
C-01 → Observación: relacionada con S6-T07 y S4-T13 (mismo: canchas UI real). Precursora S4-T03 = solo mock.
S6-T07 → Observación: relacionada con C-01 (mismo trabajo front; priorizar C-01).
S4-T03 → Observación: relacionada con C-01. Esta es prototipo mock; C-01 es API+pago.
C-02 → Observación: relacionada con S7-T07 (mismo: membresía en UI).
S7-T07 → Observación: relacionada con C-02 (mismo trabajo; priorizar C-02).
C-03 → Observación: relacionada parcialmente con S7-T08 (responsive vs pulido demo).
S7-T08 → Observación: relacionada parcialmente con C-03; finalizada 2026-11-13 por Patricio (antes Lucas). Dashboard restringido a staff; check-out UI y rediseño Canchas fuera de alcance.
C-11 → Observación: relacionada con S7-T06 (mismo: pantalla clases). Finalizada 2026-11-13 por Patricio (antes Lucas); alcance UI completo vía S7-T06.
S7-T06 → Observación: relacionada con C-11 (mismo trabajo). Finalizada 2026-11-13 por Patricio (antes Lucas): listar, inscribir, cancelar, lista espera.
C-12 → Observación: relacionada con S6-T09 (mismo: notificaciones in-app, stretch).
S6-T09 → Observación: relacionada con C-12 (mismo trabajo; priorizar C-12).
S5-T08 → Observación: relacionada con S5-T06/S5-T07; revisar si ya está hecha en repo.
S6-T06 → Observación: relacionada con S5-T07; revisar cierre (cliente API).
S7-T03 → Observación: relacionada con C-06/C-24. C-06 y S7-T03 están finalizadas; C-24 (ensayo 5 min) sigue en por hacer.
C-06 → Observación: relacionada con S7-T03 (ensayo T1). Finalizada en el tablero el 2026-11-09.
C-24 → Observación: relacionada con S7-T03/C-06 (ensayo final 5 min).
```

### Backend

```
S4-T06 → Observación: relacionada con S6-T04 (lectura hecha aquí) y S6-T05/S7-T01 (reserva).
S6-T04 → Observación: relacionada con S4-T06 finalizada (mismo: lectura/grilla). Contrastar y cerrar.
S6-T05 → Observación: relacionada con S7-T01 finalizada (mismo: reserva). Contrastar y cerrar.
S7-T01 → Observación: relacionada con S6-T05 (implementación de la reserva).
S7-T02 → Observación: relacionada con C-04 (pago hecho; C-04 agrega PDF RF-14).
C-04 → Observación: relacionada con S7-T02; no es el pago, es el comprobante PDF.
S5-T04 → Observación: relacionada con S4-T10 hecha en desarrollo (guards). Contrastar y cerrar.
S5-T05 → Observación: relacionada con S4-T10 (ventana 48 h ya en código). Contrastar y cerrar.
S7-T04 → Observación: relacionada con S4-T14 hecha en desarrollo (lista espera). Contrastar y cerrar.
S7-T05 → Observación: relacionada parcialmente con C-09 (Swagger UI vs export swagger.json).
C-09 → Observación: relacionada parcialmente con S7-T05 (export archivo OpenAPI).
C-08 → Observación: relacionada con S5-T03 (seed mínimo); C-08 pide >=25 sedes.
C-10 → Observación: relacionada con S7-T10 (amplía cobertura + umbral ADR). El umbral del 60 % ya está declarado en ADR-008 (C-14); C-10 lo mide y lo hace cumplir en CI.
C-14 → Observación: sin par S5–S7. Diez ADR en docs/adr/ (2026-11-09, rama c-14). Umbral: C-10. Compose: C-07. Trello: finalizado.
```

---

## 5. Criterio al contrastar “¿es lo mismo?”

1. Si la observación dice **Sí** y una de las dos está hecha en `desarrollo` → mover la abierta a **finalizado** (no borrar).  
2. Si dice **Sí** y ambas están `por hacer` → trabajar la **C-xx** (plan cierre) y al cerrar marcar también la S*.  
3. Si dice **Parcial / No / Extiende** → dejar ambas; completar la que falta de alcance.  
4. No archivar hasta que el equipo confirme el contraste en una pasada del tablero.

---

*Equipo 03 · FitZone Sports · apoyo al plan de cierre y a docs/actualizar-estado-planes*
