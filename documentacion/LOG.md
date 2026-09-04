# Bitácora del equipo — FitZone Sports

Registro de actividades, decisiones y estado del proyecto.  
Cada entrada puede vincular commits del repositorio cuando corresponda.

**Estados de tarea (alineados al plan):** `Por hacer` · `En desarrollo` · `Finalizado`  
**Plan vivo:** [Plan_Trabajo_2_Semanas.md](./Plan_Trabajo_2_Semanas.md) → sección *Trabajo en curso (ahora)*

---

## 2026-09-04 — Aclaración docente: entrega C4 + ADR y desarrollo

**Tipo:** feedback / aclaración docente  
**Registrado por:** Patricio Ramos (tras consulta al profesor)  
**Unidad / semana:** Unidad I en curso · aplicable a planes futuros

### Aclaración

El **modelo C4** y el documento **ADR** se entregan **al final del curso**, junto con la **demostración (Demo Day)**.  
No es obligatorio terminar C4 + ADR **antes** de empezar a desarrollar. El avance se irá **revisando periódicamente**.

A medida que el equipo desarrolla, debe **seguir actualizando el modelo**, incorporando (entre otras cosas):

- diagrama **relacional / ER**
- diagrama de **clases**
- y demás vistas que surjan de la implementación

### Consecuencia para el equipo (planes futuros)

- El [Plan de trabajo 2 semanas](./Plan_Trabajo_2_Semanas.md) **no se modifica** por esta aclaración (queda como estuvo).
- De ahora en más, en **nuevos planes** y en el trabajo diario: **desarrollar en paralelo** a la documentación de arquitectura; no bloquear código por un PDF temprano de C4+ADR.
- C4 y ADR se tratan como **documentación viva** hasta el cierre; ER y clases se agregan cuando el código los justifique.
- Para revisiones parciales del docente: mostrar avance (repo + docs actualizados), no un entregable PDF cerrado de Unidad I.

### Relacionado

- Pregunta abierta en reunión 2026-09-02 (¿PDF Unidad I incluye ER/clases?) → queda respondida en el sentido de que **van entrando al paquete de arquitectura a lo largo del curso**, con entrega formal al final.
- [Acta_Reunion_2026-09-02_Semana1.md](./Acta_Reunion_2026-09-02_Semana1.md) · [Propuesta_Inventario_Diagramas.md](./Propuesta_Inventario_Diagramas.md)

---

## Trabajo en curso (snapshot 2026-09-04)

Lo que cada integrante **está trabajando ahora** (post reunión 2026-09-02), no el backlog completo.

| Integrante | Rol | ID | Trabajo actual | Estado |
|------------|-----|----|----------------|--------|
| Patricio Ramos | P1 | S1-T09 / S1-T01 | Actualizar C4 (BFF, Auth/API Supabase, offline) y base del PDF Unidad I | En desarrollo |
| Bruno Conti | P2 | S1-T02 | Revisar ADR-001…006 (formato cátedra + hallazgos) | En desarrollo |
| Lucas Coquet | P3 | S1-T03 (+ S2-T01) | Revisar funcionalidades por actor / stack; crear cuenta Supabase | En desarrollo |
| Matias Goncevat | P4 | S1-T04 | Revisar decisiones pendientes (§1–§3) y anotar hallazgos | En desarrollo |

**Finalizado reciente:** S1-T05 (reunión), S1-T06 (acta + LOG), S1-T07 (nombres P1–P4 en el plan).

Al cambiar de tarea: actualizar esta tabla **y** el estado en el plan (`Por hacer` → `En desarrollo` → `Finalizado`).

---

## 2026-09-02 — Reunión Semana 1 (puntos 1 → 2.E)

**Tipo:** reunión de equipo  
**Participantes:** Patricio Ramos, Bruno Conti, Lucas Coquet, Matias Goncevat  
**Unidad / semana:** Unidad I · Semana 1 (S1-T05)

### Contexto

Reunión grupal siguiendo la agenda de cierre de decisiones (ratificación §1 y puntos 2.A–2.E). Fuentes: notas Gemini + transcripción en `documentacion/`.

### Acuerdos principales

- Ratificados: monolito modular; Nest + React + TS + Supabase; BFF Auth; API Supabase sin ORM; web multi-rol; móvil React Native (Unidad VI).
- **Monorepo** (`frontend/`, `backend/`); rama `desarrollo` para código; branches por tarea (ej. `S1-T03`).
- Roles: **P1** Patricio · **P2** Bruno · **P3** Lucas · **P4** Matias.
- Supabase: cuenta a cargo de **Lucas**; secrets fuera del repo (Discord/Drive + `.env` local).
- Usuarios: tabla **perfiles** con campo de **rol** simple; sedes demo **2–3**.
- PDF Unidad I: C4 + ADR (Patricio); revisión cruzada Bruno + Lucas.

### Compromisos inmediatos (trabajo en curso tras la reunión)

| Integrante | Empezar con | Estado al 2026-09-04 |
|------------|-------------|----------------------|
| Patricio | Registrar acuerdos → luego C4 / PDF | S1-T06 Finalizado; S1-T09 En desarrollo |
| Bruno | Revisar ADRs | S1-T02 En desarrollo |
| Lucas | Revisar funcionalidades por actor + Supabase | S1-T03 / S2-T01 En desarrollo |
| Matias | Revisar decisiones pendientes | S1-T04 En desarrollo |

### Pendiente / consultar al docente

- Offline (nodo sede + TOTP + cola): validar enfoque.
- RN-01: checkout vs timeout; doble turno; ADR-007 aún no cerrado.
- Aforo: hard limit vs indicador; interacción gimnasio/clases/canchas.
- ¿PDF Unidad I incluye ER y diagrama de clases?
- Migraciones SQL: ¿requisito temprano?
- Fecha de reunión con representante de grupo.

### Documentos relacionados

- [`Acta_Reunion_2026-09-02_Semana1.md`](./Acta_Reunion_2026-09-02_Semana1.md)
- [`Decisiones_Pendientes_y_Cosas_a_Definir.md`](./Decisiones_Pendientes_y_Cosas_a_Definir.md)
- [`Plan_Trabajo_2_Semanas.md`](./Plan_Trabajo_2_Semanas.md)

### Commits vinculados

_Pendiente de commit al cerrar la documentación de esta sesión._

---

## 2026-08-31 — ADR dedicados: auth BFF y API Supabase sin ORM

**Tipo:** documentación / ADR  
**Participantes:** equipo (vía asistente de documentación)

### Cambios

- Creado [ADR-005](./adr/ADR-005-bff-supabase-auth.md) — BFF en NestJS + Supabase Auth (pasarela; roles A1–A4 en Nest).
- Creado [ADR-006](./adr/ADR-006-supabase-api-sin-orm.md) — acceso a datos vía API de Supabase; ORM descartado.
- Corregido [ADR-003](./adr/ADR-003-stack-nestjs-react.md): auth/datos referenciados a ADR-005/006; eliminado “acceso a datos” de decisiones hijas abiertas.
- Actualizados [ADR_Indice](./ADR_Indice.md), [ADR-002](./adr/ADR-002-postgresql.md), [ADR-004](./adr/ADR-004-hosting-vercel-render-supabase.md) y [Decisiones pendientes](./Decisiones_Pendientes_y_Cosas_a_Definir.md) con enlaces cruzados.
- Reformateados [ADR-001](./adr/ADR-001-monolito-modular.md) a [ADR-004](./adr/ADR-004-hosting-vercel-render-supabase.md) con la plantilla de cátedra (Contexto → Decisión → Consecuencias → Alternativas).
- Actualizado [ADR_Indice](./ADR_Indice.md): plantilla genérica de cátedra + ejemplo TiendaYa (pasarela de pago); ADR-001 a ADR-006 alineados al formato (Contexto neutral, `Estado:` / `Fecha:` sin negrita).

---

## 2026-08-28 — Exposición de avance al docente

**Tipo:** revisión / feedback docente  
**Participantes:** equipo + Prof. Lic. Aguirre, Juan José  
**Unidad / semana:** Unidad I (avance de arquitectura / documentación)

### Contexto

Se expuso el avance del trabajo integrador (documentación C4, ADR, stack). El docente aportó definiciones/correcciones de diseño.

### Feedback y definiciones registradas

| Tema | Definición |
|------|------------|
| Supabase Auth | **Sí** se usa **Supabase Auth** para identidad (login, tokens de sesión). |
| Patrón BFF | **NestJS como Backend for Frontend:** el frontend **no** habla directo con Supabase; solo consume la API Nest. |
| Módulo Auth en Nest | Actúa como **pasarela** hacia Supabase Auth: recibe login del cliente, delega en Supabase, expone un contrato unificado hacia el front. |
| Roles de negocio | Mapeo A1–A4 y guards de endpoints en Nest (sobre JWT de Supabase + datos vía Supabase API). |
| Lógica de negocio | Sigue en Nest (M1–M5); Supabase Auth no reemplaza el monolito. |
| Acceso a datos | **API de Supabase** (recomendado por el docente). **Decisión de equipo: mantener API**; ORM descartado. |

### Aclaración (misma fecha)

Se corrigió una interpretación errónea en docs previos: el docente **no** pidió auth 100 % casera en Nest; pidió **no saltarse el BFF** (el front no debe integrar Supabase Auth directo) y usar Nest como capa intermedia hacia Supabase Auth.

### Pendientes derivados

- [x] Decisión de equipo: **mantener API de Supabase** (no ORM).
- [ ] Terminar de alinear C4 residual / Demo Day con BFF + Supabase Auth + Supabase API.
- [ ] Al implementar Unidad II: módulo Auth Nest (pasarela Supabase Auth + guards de rol) y cliente Supabase para datos.
- [ ] Registrar más definiciones del docente en esta bitácora a medida que se anoten.

### Documentos relacionados

- [`Decisiones_Pendientes_y_Cosas_a_Definir.md`](./Decisiones_Pendientes_y_Cosas_a_Definir.md) (§3.1, §3.2)
- [`adr/ADR-005-bff-supabase-auth.md`](./adr/ADR-005-bff-supabase-auth.md)
- [`adr/ADR-006-supabase-api-sin-orm.md`](./adr/ADR-006-supabase-api-sin-orm.md)
- [`adr/ADR-004-hosting-vercel-render-supabase.md`](./adr/ADR-004-hosting-vercel-render-supabase.md)
- [`Stack_Tecnologico_y_Herramientas.md`](./Stack_Tecnologico_y_Herramientas.md)

### Commits vinculados

_Pendiente de commit al cerrar la documentación de esta sesión._

---

## 2026-08-26 — Reunión grupal: puesta en común

**Tipo:** reunión de equipo  
**Participantes:** grupo completo (4 integrantes)  
**Unidad / semana:** Unidad I (Semanas 1–2)

### Contexto

Reunión para alinear avances individuales y revisar el estado de la documentación de arquitectura generada hasta el momento.

### Acuerdos y decisiones

| Tema | Decisión |
|------|----------|
| Documentación C4 | El equipo considera que [`C4_Arquitectura_FitZone.md`](./C4_Arquitectura_FitZone.md) está **bien elaborada** como base del entregable de Unidad I. |
| Documentación ADR | Los ADR en [`adr/`](./adr/) y el [`ADR_Indice.md`](./ADR_Indice.md) fueron evaluados de forma **positiva** en conjunto. |
| Revisión anti-alucinaciones | **Cada integrante** debe revisar la documentación C4 y ADR para detectar posibles **alucinaciones o imprecisiones de la IA** (datos inventados, supuestos no acordados, inconsistencias con el enunciado). |
| Stack móvil | Se define **React Native** como tecnología de la aplicación móvil (Unidad VI). Cierra la alternativa Flutter que figuraba como TBD en la documentación previa. |

### Pendientes derivados

- [ ] Revisión individual de C4 y ADR por cada integrante; reportar hallazgos al grupo.
- [ ] Actualizar documentación de stack y ADR-003 cuando se formalice el cierre de React Native en los docs técnicos.
- [ ] Continuar con el plan de Unidad I (modelado C4 + ADR para entrega).

### Documentos relacionados

- [`C4_Arquitectura_FitZone.md`](./C4_Arquitectura_FitZone.md)
- [`ADR_Indice.md`](./ADR_Indice.md)
- [`Stack_Tecnologico_y_Herramientas.md`](./Stack_Tecnologico_y_Herramientas.md)
- [`Trabajo_Integrador_FitZone_Sports.md`](./Trabajo_Integrador_FitZone_Sports.md)

### Commits vinculados

_Sin commits asociados a esta entrada._

---

*FitZone Sports · Programación V · UNER*
