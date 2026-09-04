# Plan de trabajo — Próximas 2 semanas

**Proyecto:** FitZone Sports · Programación V · UNER  
**Equipo:** 4 integrantes  
**Dedicación mínima:** 4 h/semana por integrante → **16 h/semana de equipo** (~32 h en 2 semanas)  
**Fecha de elaboración:** 2026-08-28  
**Última actualización de estados:** 2026-09-04  
**Unidad en curso:** I (Arquitectura) → transición a II (Frameworks)

**Referencias:** [Trabajo Integrador](./Trabajo_Integrador_FitZone_Sports.md) · [Decisiones pendientes](./Decisiones_Pendientes_y_Cosas_a_Definir.md) · [LOG](./LOG.md) · [Acta 2026-09-02](./Acta_Reunion_2026-09-02_Semana1.md)

**Cómo leer este documento**

- Cada **objetivo general** agrupa varias **tareas concretas** (ID `S1-Txx` / `S2-Txx`).
- Cada tarea tiene **asignado**, **duración** y **estado**.
- **Estado** (obligatorio, no usar solo checkbox):
  - **Por hacer** — asignada, aún no empezada
  - **En desarrollo** — el integrante la está trabajando **ahora**
  - **Finalizado** — completada
- La sección **Trabajo en curso (ahora)** resume qué hace cada uno hoy (puede diferir de “todas las asignadas”).
- Al pie de cada semana: **resumen de carga** por integrante (debe rondar **4 h** c/u).

---

## Integrantes

| Rol | Código | Nombre | GitHub / contacto |
|-----|--------|--------|-------------------|
| Arquitecto / Backend Lead | **P1** | Patricio Ramos | |
| Backend Developer | **P2** | Bruno Conti | |
| Frontend Developer | **P3** | Lucas Coquet | |
| QA / DevOps / Mobile | **P4** | Matias Goncevat | |

---

## Trabajo en curso (ahora)

Actualizado tras la reunión del **2026-09-02**. Refleja lo que cada integrante **está trabajando**, no solo el backlog asignado.

| Integrante | Rol | Tarea en curso (ID) | Qué está haciendo | Estado |
|------------|-----|---------------------|-------------------|--------|
| Patricio Ramos | P1 | S1-T09 (+ S1-T01) | Actualizar C4 (BFF, Supabase Auth/API, nota offline) y preparar base del PDF Unidad I | En desarrollo |
| Bruno Conti | P2 | S1-T02 | Revisar ADR existentes (formato cátedra + coherencia) y anotar hallazgos | En desarrollo |
| Lucas Coquet | P3 | S1-T03 | Revisar `Funcionalidades_por_Actor.md` y stack; crear cuenta Supabase (S2-T01) en paralelo cuando pueda | En desarrollo |
| Matias Goncevat | P4 | S1-T04 | Revisar `Decisiones_Pendientes_y_Cosas_a_Definir.md` (§1–§3) y anotar hallazgos | En desarrollo |

**Recién finalizado (reunión / post-reunión):**

| ID | Tarea | Quién | Estado |
|----|-------|-------|--------|
| S1-T05 | Reunión grupal cierre de decisiones | Equipo | Finalizado |
| S1-T06 | Registrar acuerdos (LOG + acta) | Patricio (P1) | Finalizado |
| S1-T07 | Nombres P1–P4 en el plan | Patricio / Matias | Finalizado |

---

## Capacidad y contexto

| Dato | Valor |
|------|-------|
| Horas mínimas por persona / semana | 4 h |
| Horas mínimas de equipo / semana | 16 h |
| Entregable Unidad I (10%) | PDF C4 + ADR |
| Estado previo | Docs avanzados; feedback docente 28/08 (BFF, Supabase Auth, API Supabase) |

### Resumen ejecutivo (para el docente)

> **Semana 1:** Cierre Unidad I — revisión grupal, PDF C4+ADR, roles, monorepo y decisiones de arquitectura.  
> **Semana 2:** Scaffolding Nest (BFF + Auth) y React, Supabase con esquema mínimo, Swagger y login de prueba.  
> **Fuera de alcance:** M1–M5 completos, offline/TOTP en código, deploy productivo, React Native.

### Arquitectura de referencia

```
React → Nest (BFF) → Supabase Auth
                 ↘ Supabase API
```

---

## Semana 1 — Cerrar Unidad I y alinear al equipo

**Objetivo general:** entregable de arquitectura listo para presentar y equipo operativo.

**Entregables de la semana**

| Entregable | Estado |
|------------|--------|
| PDF Unidad I (C4 + ADR) | Por hacer |
| Repo con estructura monorepo acordada | Por hacer (decisión monorepo: Finalizado) |
| `LOG.md` actualizado | Finalizado (acta + acuerdos 2026-09-02) |
| Roles P1–P4 asignados por nombre | Finalizado |

### Objetivos generales → tareas

| Objetivo | Tareas vinculadas |
|----------|-------------------|
| O1 — Revisión anti-alucinaciones | S1-T01 a S1-T04 |
| O2 — Cerrar decisiones de arquitectura | S1-T05, S1-T06 |
| O3 — Asignar roles y organización | S1-T07, S1-T08 |
| O4 — Entregable Unidad I (PDF) | S1-T09 a S1-T12 |

### Tabla de tareas — Semana 1

| ID | Tarea | Asignado | Rol | Duración | Estado |
|----|-------|----------|-----|----------|--------|
| S1-T01 | Revisar `C4_Arquitectura_FitZone.md` y anotar hallazgos / correcciones | Patricio Ramos | P1 | 1 h | En desarrollo |
| S1-T02 | Revisar ADR-001 a ADR-006 y anotar hallazgos | Bruno Conti | P2 | 1 h | En desarrollo |
| S1-T03 | Revisar `Funcionalidades_por_Actor.md` y `Stack_Tecnologico_y_Herramientas.md` | Lucas Coquet | P3 | 1 h | En desarrollo |
| S1-T04 | Revisar `Decisiones_Pendientes_y_Cosas_a_Definir.md` (§1–§3) | Matias Goncevat | P4 | 1 h | En desarrollo |
| S1-T05 | Reunión grupal: cerrar decisiones (BFF, Supabase Auth, API Supabase, offline/TOTP propuesta) | Equipo | Todos | 0,5 h c/u | Finalizado |
| S1-T06 | Registrar acuerdos de la reunión en `LOG.md` (+ acta) | Patricio Ramos | P1 | 0,5 h | Finalizado |
| S1-T07 | Completar tabla de integrantes (nombres + roles P1–P4) en este plan y en README | Matias Goncevat | P4 | 0,5 h | Finalizado |
| S1-T08 | Decidir monorepo, convención de ramas/PRs; crear carpetas `frontend/`, `backend/` | Matias Goncevat | P4 | 1 h | Por hacer |
| S1-T09 | Actualizar C4: BFF, Supabase Auth, Supabase API, offline sede (si falta algo) | Patricio Ramos | P1 | 1,5 h | En desarrollo |
| S1-T10 | Redactar o actualizar ADR pendiente (ej. acceso offline TOTP) si el equipo lo requiere | Patricio Ramos | P1 | 1 h | Por hacer |
| S1-T11 | Exportar diagramas C4 y compilar **PDF Unidad I** (C4 + índice ADR) | Patricio Ramos | P1 | 1,5 h | Por hacer |
| S1-T12 | Borrador esquema SQL inicial: `sedes`, usuarios/perfiles, membresías (para Semana 2) | Bruno Conti | P2 | 2 h | Por hacer |
| S1-T13 | Lista de pantallas mínimas por rol (A1–A4) — documento o issue, sin código | Lucas Coquet | P3 | 1,5 h | Por hacer |
| S1-T14 | Checklist de cuentas: GitHub, Supabase, Vercel, Render (quién administra cada una) | Matias Goncevat | P4 | 1 h | Por hacer |
| S1-T15 | Redactar `.env.example` con nombres de variables (sin valores secretos) | Matias Goncevat | P4 | 1 h | Por hacer |
| S1-T16 | Revisión cruzada del PDF antes de entregar (lectura de otro integrante) | Lucas Coquet | P3 | 0,5 h | Por hacer |
| S1-T17 | Revisión cruzada del PDF antes de entregar (lectura de otro integrante) | Bruno Conti | P2 | 0,5 h | Por hacer |

### Carga por integrante — Semana 1

| Integrante | Tareas | En desarrollo ahora | Total estimado | ¿≤ 4 h? |
|------------|--------|---------------------|----------------|---------|
| **P1** Patricio | S1-T01, S1-T05, S1-T06, S1-T09, S1-T10, S1-T11 | S1-T01, S1-T09 | **5,5 h** | Ajustar¹ |
| **P2** Bruno | S1-T02, S1-T12, S1-T17, S1-T05 | S1-T02 | **4 h** | ✓ |
| **P3** Lucas | S1-T03, S1-T13, S1-T16, S1-T05 | S1-T03 | **4 h** | ✓ |
| **P4** Matias | S1-T04, S1-T07, S1-T08, S1-T14, S1-T15, S1-T05 | S1-T04 | **5 h** | Ajustar¹ |

¹ **Ajuste sugerido:** P1 delega S1-T10 a P2 (1 h) si la semana se complica → P1 queda en 4,5 h; P2 en 5 h. O P4 toma S1-T06 (registro LOG) y P1 baja a 5 h.

---

## Semana 2 — Scaffolding Unidad II (sin features de negocio)

**Objetivo general:** proyecto levantado en local; login de prueba y un endpoint de lectura.

**Entregables de la semana**

| Entregable | Estado |
|------------|--------|
| `backend/` corre en local con Swagger | Por hacer |
| `frontend/` con pantalla login → Nest → Supabase Auth | Por hacer |
| Proyecto Supabase con tablas mínimas y Auth habilitado | Por hacer (cuenta: Lucas) |
| `GET /health` y `GET /sedes` (o equivalente) funcionando | Por hacer |
| `README.md` de desarrollo en la raíz del repo | Por hacer |

### Objetivos generales → tareas

| Objetivo | Tareas vinculadas |
|----------|-------------------|
| O5 — Proyecto Supabase listo | S2-T01 a S2-T03 |
| O6 — Scaffolding Nest (BFF) | S2-T04 a S2-T09 |
| O7 — Scaffolding React | S2-T10 a S2-T12 |
| O8 — Documentación y cierre | S2-T13 a S2-T15 |

### Tabla de tareas — Semana 2

| ID | Tarea | Asignado | Rol | Duración | Estado |
|----|-------|----------|-----|----------|--------|
| S2-T01 | Crear proyecto en Supabase; habilitar Auth | Lucas Coquet | P3 | 0,5 h | En desarrollo |
| S2-T02 | Ejecutar SQL inicial: tablas `sedes`, `perfiles` (según borrador S1-T12) | Bruno Conti | P2 | 1,5 h | Por hacer |
| S2-T03 | Cargar seed mínimo: 1–2 sedes, 1 usuario gerente de prueba | Bruno Conti | P2 | 1 h | Por hacer |
| S2-T04 | Scaffolding NestJS en `backend/` (CLI, estructura base, `main.ts`) | Bruno Conti | P2 | 1 h | Por hacer |
| S2-T05 | Módulo `SupabaseModule`: cliente con `SUPABASE_URL` + service role (solo backend) | Bruno Conti | P2 | 1 h | Por hacer |
| S2-T06 | Módulo `AuthModule`: endpoint login que delega en Supabase Auth (pasarela BFF) | Bruno Conti | P2 | 1,5 h | Por hacer |
| S2-T07 | Guard JWT: validar token Supabase en requests protegidos | Patricio Ramos | P1 | 1,5 h | Por hacer |
| S2-T08 | Endpoint `GET /health` + documentación Swagger | Patricio Ramos | P1 | 0,5 h | Por hacer |
| S2-T09 | Módulo `SedesModule`: `GET /sedes` vía Supabase API (primer Repository) | Bruno Conti | P2 | 1 h | Por hacer |
| S2-T10 | Scaffolding React + Vite en `frontend/` | Lucas Coquet | P3 | 1 h | Por hacer |
| S2-T11 | Pantalla login (formulario) + cliente HTTP hacia Nest (no Supabase directo) | Lucas Coquet | P3 | 1,5 h | Por hacer |
| S2-T12 | Router base y layout mínimo post-login (placeholder) | Lucas Coquet | P3 | 1 h | Por hacer |
| S2-T13 | Integrar Swagger: documentar login + health + sedes | Patricio Ramos | P1 | 0,5 h | Por hacer |
| S2-T14 | `README.md`: clonar repo, `.env`, levantar back y front en local | Matias Goncevat | P4 | 1 h | Por hacer |
| S2-T15 | Prueba manual E2E: login + listar sedes; anotar resultado en `LOG.md` | Matias Goncevat | P4 | 0,5 h | Por hacer |
| S2-T16 | Reunión de cierre Semana 2: demo local y plan Semana 3 | Equipo | Todos | 0,5 h c/u | Por hacer |

> **Nota 2026-09-02:** S2-T01 pasó de P4 a **Lucas (P3)** porque en la reunión se acordó que él crea e inicializa Supabase.

### Carga por integrante — Semana 2

| Integrante | Tareas | En desarrollo ahora | Total estimado | ¿≤ 4 h? |
|------------|--------|---------------------|----------------|---------|
| **P1** Patricio | S2-T07, S2-T08, S2-T13, S2-T16 | — (foco Semana 1) | **3,5 h** | ✓ |
| **P2** Bruno | S2-T02 … S2-T06, S2-T09 | — (foco S1-T02) | **7 h** | Ajustar² |
| **P3** Lucas | S2-T01, S2-T10…S2-T12, S2-T16 | S2-T01 | **4,5 h** | ✓ |
| **P4** Matias | S2-T14, S2-T15, S2-T16 | — (foco S1-T04) | **2 h** | ✓ (puede ayudar a P2) |

² **Ajuste sugerido para P2 (muchas tareas backend):**  
- S2-T04 (scaffold Nest) → **P1** (1 h)  
- S2-T05 (SupabaseModule) → **P4** (1 h)  
Con eso P2 baja a **5 h** y P1/P4 suben — repartir en pair programming si hace falta.

---

## Vista por integrante (ambas semanas)

### P1 — Patricio Ramos (Arquitecto / Backend Lead)

| Semana | ID tareas | En desarrollo ahora | Total |
|--------|-----------|--------------------|-------|
| 1 | S1-T01, S1-T05✓, S1-T06✓, S1-T09, S1-T10, S1-T11 | S1-T01, S1-T09 | 5,5 h |
| 2 | S2-T07, S2-T08, S2-T13, S2-T16 | — | 3,5 h |
| **Total 2 semanas** | | | **9 h** |

### P2 — Bruno Conti (Backend Developer)

| Semana | ID tareas | En desarrollo ahora | Total |
|--------|-----------|--------------------|-------|
| 1 | S1-T02, S1-T12, S1-T17, S1-T05✓ | S1-T02 | 4 h |
| 2 | S2-T02, S2-T03, S2-T04, S2-T05, S2-T06, S2-T09 | — | 7 h |
| **Total 2 semanas** | | | **11 h** |

### P3 — Lucas Coquet (Frontend Developer)

| Semana | ID tareas | En desarrollo ahora | Total |
|--------|-----------|--------------------|-------|
| 1 | S1-T03, S1-T13, S1-T16, S1-T05✓ | S1-T03 | 4 h |
| 2 | S2-T01, S2-T10, S2-T11, S2-T12, S2-T16 | S2-T01 | 4,5 h |
| **Total 2 semanas** | | | **8,5 h** |

### P4 — Matias Goncevat (QA / DevOps / Mobile)

| Semana | ID tareas | En desarrollo ahora | Total |
|--------|-----------|--------------------|-------|
| 1 | S1-T04, S1-T07✓, S1-T08, S1-T14, S1-T15, S1-T05✓ | S1-T04 | 5 h |
| 2 | S2-T14, S2-T15, S2-T16 | — | 2 h |
| **Total 2 semanas** | | | **7 h** |

---

## Fuera de alcance (estas 2 semanas)

| Tema | Motivo |
|------|--------|
| Reservas de canchas (RN-02) | Semana 4+ |
| TOTP / offline en sede | Solo documentado |
| Circuit Breaker en código | Solo anotado |
| Deploy Vercel / Render | Semana 3+ |
| Front multi-rol completo | Unidad IV |
| React Native | Unidad VI |

---

## Control de avance

**Reunión semanal:** 30 min (viernes o día acordado).

1. Recorrer tabla de tareas y actualizar **Estado** (`Por hacer` / `En desarrollo` / `Finalizado`).
2. Actualizar la sección **Trabajo en curso (ahora)** — una tarea “en desarrollo” por persona como mínimo.
3. Verificar carga por integrante (¿alguien bloqueado o sobrecargado?).
4. Actualizar [`LOG.md`](./LOG.md).
5. Definir top 3 tareas de la semana siguiente.

### Plantilla LOG

```md
## YYYY-MM-DD — Seguimiento plan 2 semanas

**Semana:** 1 | 2  
**En desarrollo ahora:**
- P1 … (S1-Txx)
- P2 … (S1-Txx)
- P3 … (S1-Txx)
- P4 … (S1-Txx)
**Finalizado desde la última vez:** S1-T05, …  
**Por hacer / bloqueadas:**  
**Ajustes de asignación:**  
**Próxima semana (top 3):**  
```

---

## Trazabilidad cátedra

| Semana cátedra | Tema oficial | Este plan |
|----------------|--------------|-----------|
| 1 | Decisión arquitectónica | Docs + S1-T05 |
| 2 | C4 + ADR | Semana 1 (S1-T09 a S1-T11) |
| 3 | Scaffolding Nest | Semana 2 (S2-T04 en adelante) |
| 4 | API REST | Fuera de estas 2 semanas |

---

*Plan de trabajo · FitZone Sports · Programación V · UNER*
