# Acta — Reunión Semana 1 (puntos 1 → 2.E)

**Fecha:** 2026-09-02 · 22:15 GMT-03  
**Duración:** ~50 min  
**Participantes:** Patricio Ramos, Bruno Conti, Lucas Coquet, Matias Goncevat  
**Alcance de la agenda:** puntos 1 (cerrado/ratificar) hasta **2.E** (esquema mínimo Semana 2)  
**Fuentes:** notas Gemini + transcripción (`Reunión iniciada a las 2026_09_02 22_15 GMT-03_00 - Notas de Gemini*.md`)  
**Referencias:** [Plan 2 semanas](./Plan_Trabajo_2_Semanas.md) · [Decisiones pendientes](./Decisiones_Pendientes_y_Cosas_a_Definir.md) · [Propuesta RN-01](./Propuesta_RN01_Presencia_Una_Sede.md)

---

## 1. Temas hablados (recorrido de la agenda)

| Bloque | Temas tratados |
|--------|----------------|
| Organización / Trello | Tareas filtradas por vencimiento (05/09 y 12/09); el repo Git es la fuente de documentación y plan |
| §1 Ratificación | Monolito modular; Nest + React + TypeScript + Supabase; BFF Auth; API Supabase sin ORM; web multi-rol; móvil React Native (Unidad VI); hosting Vercel/Render/Supabase/GitHub |
| Offline / check-in | RNF-01 = acceso en **sede**, no solo QR en el celu; propuesta TOTP / secreto + reloj; cola local + sync; limitación RN-01 offline |
| §2.A Organización | Roles P1–P4; monorepo; ramas; dueños de cuentas; secrets |
| §2.B PDF Unidad I | Contenido del PDF (C4 + ADR); quién arma; revisión cruzada; duda ER / diagrama de clases |
| §2.C Offline (diseño) | Nodo por sede + cola + sync; TOTP; QR en móvil vs web |
| §2.D RN-01 | Lógica vs BD vs híbrido; checkout vs timeout; doble turno; aforo / espacio físico vs clases y canchas |
| §2.E Esquema mínimo | Tabla `perfiles` + campo de rol; cantidad de sedes demo; entornos Supabase; migraciones SQL |

---

## 2. Definido en equipo (acuerdos)

### 2.1 Arquitectura (ratificado)

| Tema | Acuerdo |
|------|---------|
| Estilo | Monolito modular |
| Stack | NestJS + React + TypeScript + Supabase |
| Auth | Módulo Auth Nest = **pasarela (BFF)** hacia **Supabase Auth** (no auth casera completa) |
| Datos | Acceso vía **API de Supabase** (sin ORM) |
| Canal | Web multi-rol A1–A4; app móvil **React Native** diferida a Unidad VI |
| Hosting | GitHub · Vercel · Render · Supabase |

### 2.2 Organización del repo y del equipo

| Tema | Acuerdo |
|------|---------|
| Repo | **Monorepo:** carpetas `frontend/` y `backend/` junto a `documentacion/` |
| Ramas | Mantener `master`/`main` para documentación; crear rama **`desarrollo`** para código; feature branches con código de tarea (ej. `S1-T03`) y descripción clara en el commit |
| Roles | Ver tabla abajo (completar GitHub en el plan) |
| GitHub | Patricio administra el repo por ahora |
| Supabase | **Lucas Coquet** crea la cuenta e inicializa el proyecto; da permisos al resto |
| Vercel / Render | Patricio se encarga de cuentas cuando haga falta (aún no hay app desplegable) |
| Secrets | **Nunca** en el repo; `.env` local; compartir por Discord / Drive (medios privados) |

### 2.3 Roles P1–P4 (nombres)

| Código | Rol | Nombre | Compromiso inmediato (reunión) |
|--------|-----|--------|--------------------------------|
| **P1** | Arquitecto / Backend Lead | Patricio Ramos | Registrar acuerdos; actualizar C4; PDF C4+ADR; completar tablas de integrantes |
| **P2** | Backend Developer | Bruno Conti | Revisar ADR-001… y anotar hallazgos (formato cátedra) |
| **P3** | Frontend Developer | Lucas Coquet | Revisar `Funcionalidades_por_Actor.md`; crear cuenta Supabase |
| **P4** | QA / DevOps / Mobile | Matias Goncevat | Revisar `Decisiones_Pendientes…`; (más adelante) prueba manual login |

### 2.4 Entregable Unidad I

| Tema | Acuerdo |
|------|---------|
| Contenido base del PDF | **Diagramas C4 + documento ADR** |
| Quién arma el PDF | **Patricio (P1)** |
| Revisión cruzada | **Bruno (P2)** y **Lucas (P3)** |
| Fecha de cátedra | Aún **no** fijada por el docente; preparar antes de la entrega oficial |
| Desarrollo de código | Estas semanas son de **documentación y decisiones**; scaffolding Semana 2 según plan |

### 2.5 Modelo de usuarios / Semana 2 (alineado)

| Tema | Acuerdo |
|------|---------|
| Roles A1–A4 | Tabla de **perfiles** (o equivalente) con un **campo de rol** simple; permisos aplicados en Nest/API |
| No adoptar (por ahora) | Tabla compleja de permisos muchos-a-muchos |
| Sedes de demo | **2 o 3** (no 25) |
| Proyecto Supabase | Trabajar con **un entorno de desarrollo/prueba** durante el cuatrimestre (prod separado queda como opción futura, no prioritaria) |

### 2.6 Orientación (favorables, no ADR formal aún)

| Tema | Orientación del equipo |
|------|------------------------|
| RN-01 (online) | Inclinación hacia enfoque **híbrido** (validación en Nest + apoyo en BD), según propuesta |
| Offline / TOTP | La idea de secreto + algoritmo temporal + cola + sync se ve **plausible**; se prefiere validar con el docente antes de cerrar ADR |
| QR del socio | Preferencia: **móvil** (Unidad VI); poco sentido mostrarlo en web para demos tempranas |

---

## 3. Dejado para más adelante o para consultar al profesor

### 3.1 Preguntar al docente

| # | Pregunta | Contexto |
|---|----------|----------|
| Q1 | ¿El PDF de Unidad I exige también **diagrama de clases** y/o **modelo relacional (ER)**, o alcanza C4 + ADR? | Otros grupos ya avanzan; el plan del equipo no incluye ER/clases en Semana 1–2 |
| Q2 | ¿Validan el enfoque de **check-in offline** (nodo por sede + cola local + sync + QR dinámico tipo TOTP)? | RNF-01; el equipo no quiere inventar de más sin feedback |
| Q3 | RN-01: ¿checkout explícito, **timeout** de presencia, o ambos? ¿Se permite **doble turno** el mismo día? | Evitar “hilar tan fino” vs casos reales |
| Q4 | Aforo (RF-05): ¿el máximo es **bloqueo duro** (no dejar entrar) o solo **indicador** en pantalla? | Enunciado habla de pantalla de aforo |
| Q5 | ¿Cómo modelar capacidad cuando **gimnasio / clases / canchas** comparten espacio físico? | Debate abierto en la reunión; riesgo de over-engineering |
| Q6 | ¿Cuándo exige la cátedra **migraciones SQL versionadas** en el repo vs solo SQL editor en Supabase? | Ítem 2.E; no quedó claro si es requisito temprano |
| Q7 | Calendario: ¿cuándo es la próxima reunión con representante de grupo? | Incertidumbre; Patricio actúa como contacto |

### 3.2 Definir más adelante (no bloquea PDF / Semana 2)

| Tema | Cuándo aproximado |
|------|-------------------|
| ADR formal de acceso offline (TOTP + nodo sede) | Tras feedback docente (Q2) |
| ADR-007 RN-01 (lógica / BD / híbrido) + política de conflicto offline | Tras Q3; al implementar M2 |
| Formato exacto de la cola de check-ins offline | Al diseñar M2 / RNF-01 |
| Período TOTP (30/60 s), ventana de reloj, distribución de seeds | Al cerrar offline |
| Checkout vs timeout definitivo | Tras Q3 |
| Límite aforo duro vs soft | Tras Q4 |
| Relación aforo gimnasio ↔ cupos de clases/canchas | Tras Q5 / al implementar M3–M4 |
| Estilos, Zustand, UI kit | Unidad IV |
| Circuit Breaker en código | Semanas 3–4+ |
| Deploy Vercel/Render productivo | Cuando haya app |
| React Native / seed en dispositivo | Unidad VI |

---

## 4. Próximos pasos acordados en la reunión

| Responsable | Acción |
|-------------|--------|
| Patricio (P1) | Registrar acuerdos (este acta + LOG); actualizar C4; completar integrantes; armar PDF C4+ADR |
| Bruno (P2) | Revisar ADRs existentes y anotar hallazgos de formato/contenido |
| Lucas (P3) | Revisar funcionalidades por actor; crear cuenta / proyecto Supabase |
| Matias (P4) | Revisar decisiones pendientes; más adelante prueba manual de login (Semana 2) |

---

## 5. Checklist post-reunión (documentación)

- [x] Acta de la reunión (este documento)
- [x] Actualizar [LOG.md](./LOG.md)
- [x] Marcar ítems cerrados en [Decisiones_Pendientes](./Decisiones_Pendientes_y_Cosas_a_Definir.md)
- [x] Completar nombres P1–P4 en [Plan_Trabajo_2_Semanas.md](./Plan_Trabajo_2_Semanas.md)
- [x] Estados de tareas: Por hacer / En desarrollo / Finalizado + sección *Trabajo en curso*
- [ ] Lista de preguntas al docente (sección 3.1) para la próxima exposición
- [ ] Actualizar C4 (BFF, API Supabase, nota offline pendiente de validación docente)

---

*Acta · Reunión 2026-09-02 · FitZone Sports · Programación V · UNER*
