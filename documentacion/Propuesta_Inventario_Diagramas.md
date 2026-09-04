# Propuesta — Inventario de diagramas FitZone Sports

**Para:** reunión de equipo / armado del PDF Unidad I  
**Estado:** propuesta  
**Fecha:** 2026-09-01  
**Referencias:** [Trabajo Integrador](./Trabajo_Integrador_FitZone_Sports.md) · [C4](./C4_Arquitectura_FitZone.md) · [Plan 2 semanas](./Plan_Trabajo_2_Semanas.md) · [ADR índice](./ADR_Indice.md)

---

## 1. Respuesta corta a la duda

| Tipo de diagrama | ¿Va en el PDF de Unidad I (C4 + ADR)? |
|------------------|----------------------------------------|
| **C4** (Context, Containers, Components) | **Sí** — es el entregable principal (10%) |
| **ADR** | **Sí** — documento de decisiones, no es un “diagrama” pero va en el mismo PDF |
| **Diagrama de clases (UML)** | **No** — no lo pide el enunciado para Unidad I |
| **Diagrama relacional / ER** | **No** — no lo pide el enunciado para Unidad I |

El enunciado de la Unidad I dice explícitamente: **“PDF con diagramas C4 y documento ADR”** (10%). No menciona modelo de clases ni modelo relacional en ese entregable.

Eso **no significa** que nunca los hagan: el relacional conviene en **Unidad II** (esquema en Supabase) y diagramas de clases/patrones en **Unidad III** (justificación de GoF en código).

---

## 2. Cuántos diagramas desarrollar (visión global)

### Resumen por cantidad

| Fase | Obligatorios | Recomendados | Opcionales |
|------|--------------|--------------|------------|
| **Unidad I — PDF C4 + ADR** | **3–4** diagramas C4 | **1** despliegue + **1** offline (si se cierra RNF-01) | Duplicado flowchart si C4Context no renderiza |
| **Unidad II — Backend** | **0** diagramas formales en el entregable | **1** ER / relacional | Secuencia login o reserva |
| **Unidad III — Patrones** | **0** en PDF | **2–3** diagramas de clases (Strategy, Observer, Repository) | — |
| **Unidad IV — Frontend** | Catálogo Atomic Design (no UML clásico) | Mapa de pantallas por rol | — |
| **Demo Day / cierre** | — | **1** diagrama de secuencia E2E | — |

**Total razonable en el cuatrimestre:** unos **8–12** diagramas/distintas vistas, según profundidad.  
**Para la fecha de Unidad I:** concentrarse en **4–6** como máximo.

---

## 3. Unidad I — Lo que sí va en el PDF (prioridad alta)

Entregable: **PDF con diagramas C4 + documento ADR** ([Trabajo Integrador § Entregables](./Trabajo_Integrador_FitZone_Sports.md)).

### 3.1 Diagramas C4 obligatorios (3)

| # | Diagrama | Nivel C4 | Estado en repo | Acción |
|---|----------|----------|----------------|--------|
| **D1** | **Contexto** | 1 — Context | Borrador en `C4_Arquitectura_FitZone.md` §1 | Exportar **uno** (C4Context o flowchart compatible) |
| **D2** | **Contenedores** | 2 — Containers | Borrador §2 | Revisar BFF, Supabase Auth, Supabase API, móvil diferido |
| **D3** | **Componentes (backend Nest)** | 3 — Components | Borrador §3 | Mantener módulos M1–M5 + Auth + Repository |

> El nivel **4 — Code** (clases UML detalladas) **no** forma parte del C4 de Unidad I. Ya está anotado en el propio C4: *“Code: No (queda para implementación)”*.

### 3.2 Diagrama complementario recomendado (1)

| # | Diagrama | Tipo | Estado | Acción |
|---|----------|------|--------|--------|
| **D4** | **Despliegue** | Vista complementaria (no es nivel C4 formal) | Borrador §4 | Incluir en PDF: Vercel + Render + Supabase + GitHub |

### 3.3 Diagrama pendiente de arquitectura (0–1)

| # | Diagrama | Motivo | Estado | Acción |
|---|----------|--------|--------|--------|
| **D5** | **Acceso offline en sede** (nodo + TOTP + cola + sync) | RNF-01 corregido: offline es en **sede**, no solo móvil | **No dibujado** | Agregar si el equipo **cierra** el enfoque TOTP antes del PDF; si no, una nota en texto en §5 del C4 alcanza para Unidad I |

### 3.4 Documento ADR (no es diagrama, pero va en el mismo PDF)

| # | Contenido | Cantidad |
|---|-----------|----------|
| **D-doc** | Índice ADR + ADR-001 … ADR-006 | 1 documento (varias páginas) |

---

## 4. Lo que NO va en Unidad I (pero sí más adelante)

### 4.1 Diagrama relacional / ER

| Pregunta | Respuesta |
|----------|-----------|
| ¿Obligatorio en PDF Unidad I? | **No** |
| ¿Conviene hacerlo? | **Sí**, pero en **Semanas 3–4** (Unidad II), cuando definan tablas en Supabase |
| Alcance sugerido | Tablas mínimas: `sedes`, `usuarios`/`perfiles`, `membresias`, `check_ins`/`presencias`, `canchas`, `reservas_cancha`, `clases`, `inscripciones_clase`, `pagos` |
| Dónde guardarlo | `documentacion/` o `backend/docs/` cuando exista el repo |
| Entregable asociado | Unidad II — backend + Swagger (25%); el ER **apoya** el diseño, no sustituye Swagger |

### 4.2 Diagrama de clases (UML)

| Pregunta | Respuesta |
|----------|-----------|
| ¿Obligatorio en PDF Unidad I? | **No** |
| ¿Cuándo? | **Unidad III** — Patrones GoF (Strategy, Observer, Repository) |
| Cantidad sugerida | **2–3** diagramas focalizados (no una clase por cada entidad del dominio) |
| Ejemplos | `PricingStrategy` + implementaciones; `WaitlistObserver`; `BookingRepository` + cliente Supabase |
| Relación con C4 | C4 Components **nombra** módulos y patrones; el diagrama de clases **detalla** las interfaces en código |

### 4.3 Otros diagramas útiles (no exigidos en I)

| Diagrama | Unidad | Para qué |
|----------|--------|----------|
| Secuencia — login BFF | II | `React → Nest Auth → Supabase Auth` |
| Secuencia — reserva cancha (RN-02) | II–III | Concurrencia / transacción |
| Secuencia — check-in offline | II (M2) | TOTP + cola + sync |
| Mapa de pantallas web por rol | IV | A1–A4, Atomic Design |
| Pipeline CI/CD | V | GitHub Actions → test → deploy |

---

## 5. Inventario actual en `C4_Arquitectura_FitZone.md`

| Sección | Diagrama Mermaid | ¿Cuenta para PDF? |
|---------|------------------|-------------------|
| §1 Context (C4Context) | Sí | D1 (opción A) |
| §1 Context (flowchart) | Sí | D1 (opción B — backup) |
| §2 Containers | Sí | D2 |
| §3 Components | Sí | D3 |
| §4 Despliegue | Sí | D4 |
| §5 Offline | Solo texto | Falta D5 si se adopta TOTP |
| §6 Trazabilidad | Tabla, no diagrama | No cuenta |

**Duplicado Context:** en el PDF usar **un solo** diagrama de contexto (no los dos).

---

## 6. Propuesta de paquete para el PDF Unidad I

Orden sugerido del documento final:

1. Portada / integrantes  
2. **D1 — C4 Context**  
3. **D2 — C4 Containers**  
4. **D3 — C4 Components (backend)**  
5. **D4 — Vista de despliegue**  
6. *(Opcional)* **D5 — Acceso offline sede**  
7. Tabla de trazabilidad requisitos ↔ arquitectura (puede ser texto, no diagrama)  
8. **Índice ADR** + ADR-001 … ADR-006  

**Páginas de diagramas:** **4** (mínimo) a **5** (con offline).  
**Diagramas de clases y ER:** **0** en este PDF.

---

## 7. Checklist por responsable (P1 — arquitectura)

### Antes de entregar Unidad I

- [ ] D1 Context — exportar PNG/SVG desde mermaid.live o visor elegido  
- [ ] D2 Containers — revisar flechas BFF / Auth / API  
- [ ] D3 Components — alinear con módulos M1–M5  
- [ ] D4 Despliegue — incluir en PDF  
- [ ] Decidir si D5 offline entra o queda como párrafo + decisión pendiente  
- [ ] Compilar ADR-001 … ADR-006 con plantilla de cátedra  
- [ ] **No bloquear** la entrega por falta de ER o diagrama de clases  

### Después de Unidad I (backlog)

- [ ] **ER relacional** — Semana 3–4 (esquema Supabase mínimo)  
- [ ] **Clases Strategy / Observer / Repository** — Semanas 5–7  
- [ ] **Secuencia check-in** — al implementar M2  
- [ ] Actualizar C4 §5 offline cuando se cierre TOTP (reunión + ADR-007 u offline)

---

## 8. Matriz decisión rápida (para la reunión)

| Si preguntan… | Respuesta del equipo |
|---------------|----------------------|
| “¿El C4 lleva diagrama de clases?” | **No** en Unidad I. C4 Components alcanza. Clases en Unidad III con patrones. |
| “¿El C4 lleva modelo relacional?” | **No** en Unidad I. ER en Unidad II al modelar tablas. |
| “¿Cuántos diagramas en el PDF?” | **4 obligatorios/recomendados** (Context, Containers, Components, Despliegue) + **0–1** offline. |
| “¿Qué es el entregable 10%?” | PDF = **diagramas C4 + ADR**, no ER ni UML de clases. |

---

## 9. Referencia — enunciado (cita)

> **Unidad I. Arquitectura** — Entregable principal: **PDF con diagramas C4 y documento ADR** (10%).

Fuente: [Trabajo_Integrador_FitZone_Sports.md](./Trabajo_Integrador_FitZone_Sports.md), sección *Entregables por unidad y ponderación*.

---

*Propuesta de inventario de diagramas · FitZone Sports · Programación V · UNER*
