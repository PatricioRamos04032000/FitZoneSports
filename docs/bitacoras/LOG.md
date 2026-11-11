# Bitácora del equipo — FitZone Sports

Registro de actividades, decisiones y estado del proyecto.  
Cada entrada puede vincular commits del repositorio cuando corresponda.

**Estados de tarea (alineados al plan):** `Por hacer` · `En desarrollo` · `Finalizado`  
**Plan vivo:** [Plan_Trabajo_2_Semanas.md](../planificacion/Plan_Trabajo_2_Semanas.md) → sección *Trabajo en curso (ahora)*


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
| Documentación C4 | El equipo considera que [`C4_Arquitectura_FitZone.md`](../../documentacion/diagramas%20desarrollo/C4_Arquitectura_FitZone.md) está **bien elaborada** como base del entregable de Unidad I. |
| Documentación ADR | Los ADR en [`adr/`](./adr/) y el `ADR_Indice.md` fueron evaluados de forma **positiva** en conjunto. |
| Revisión anti-alucinaciones | **Cada integrante** debe revisar la documentación C4 y ADR para detectar posibles **alucinaciones o imprecisiones de la IA** (datos inventados, supuestos no acordados, inconsistencias con el enunciado). |
| Stack móvil | Se define **React Native** como tecnología de la aplicación móvil (Unidad VI). Cierra la alternativa Flutter que figuraba como TBD en la documentación previa. |

### Pendientes derivados

- [ ] Revisión individual de C4 y ADR por cada integrante; reportar hallazgos al grupo.
- [ ] Actualizar documentación de stack y ADR-003 cuando se formalice el cierre de React Native en los docs técnicos.
- [ ] Continuar con el plan de Unidad I (modelado C4 + ADR para entrega).

### Documentos relacionados

- [`C4_Arquitectura_FitZone.md`](../../documentacion/diagramas%20desarrollo/C4_Arquitectura_FitZone.md)
- `ADR_Indice.md`
- `Stack_Tecnologico_y_Herramientas.md`
- `Trabajo_Integrador_FitZone_Sports.md`

### Commits vinculados

_Sin commits asociados a esta entrada._

---

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

- `Decisiones_Pendientes_y_Cosas_a_Definir.md` (§3.1, §3.2)
- [`adr/ADR-005-bff-supabase-auth.md`](../adr/ADR-005-bff-supabase-auth.md)
- [`adr/ADR-006-supabase-api-sin-orm.md`](../adr/ADR-006-supabase-api-sin-orm.md)
- [`adr/ADR-004-hosting-vercel-render-supabase.md`](../adr/ADR-004-hosting-vercel-render-supabase.md)
- `Stack_Tecnologico_y_Herramientas.md`

### Commits vinculados

_Pendiente de commit al cerrar la documentación de esta sesión._

---

## 2026-08-31 — ADR dedicados: auth BFF y API Supabase sin ORM

**Tipo:** documentación / ADR  
**Participantes:** equipo (vía asistente de documentación)

### Cambios

- Creado [ADR-005](../adr/ADR-005-bff-supabase-auth.md) — BFF en NestJS + Supabase Auth (pasarela; roles A1–A4 en Nest).
- Creado [ADR-006](../adr/ADR-006-supabase-api-sin-orm.md) — acceso a datos vía API de Supabase; ORM descartado.
- Corregido [ADR-003](../adr/ADR-003-stack-nestjs-react.md): auth/datos referenciados a ADR-005/006; eliminado “acceso a datos” de decisiones hijas abiertas.
- Actualizados ADR_Indice, [ADR-002](../adr/ADR-002-postgresql.md), [ADR-004](../adr/ADR-004-hosting-vercel-render-supabase.md) y Decisiones pendientes con enlaces cruzados.
- Reformateados [ADR-001](../adr/ADR-001-monolito-modular.md) a [ADR-004](../adr/ADR-004-hosting-vercel-render-supabase.md) con la plantilla de cátedra (Contexto → Decisión → Consecuencias → Alternativas).
- Actualizado ADR_Indice: plantilla genérica de cátedra + ejemplo TiendaYa (pasarela de pago); ADR-001 a ADR-006 alineados al formato (Contexto neutral, `Estado:` / `Fecha:` sin negrita).

---

## 2026-09-02 — Reunión Semana 1 (puntos 1 → 2.E)

**Tipo:** reunión de equipo  
**Participantes:** Patricio Ramos, Bruno Conti, Lucas Coquet, Matias Goncevat  
**Unidad / semana:** Unidad I · Semana 1 (S1-T05)

### Contexto

Reunión grupal siguiendo la agenda de cierre de decisiones (ratificación §1 y puntos 2.A–2.E). Fuentes: notas Gemini y la transcripción de la reunión.

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

- [`Acta_Reunion_2026-09-02_Semana1.md`](../planificacion/Acta_Reunion_2026-09-02_Semana1.md)
- `Decisiones_Pendientes_y_Cosas_a_Definir.md`
- [`Plan_Trabajo_2_Semanas.md`](../planificacion/Plan_Trabajo_2_Semanas.md)

### Commits vinculados

_Pendiente de commit al cerrar la documentación de esta sesión._

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

- El [Plan de trabajo 2 semanas](../planificacion/Plan_Trabajo_2_Semanas.md) **no se modifica** por esta aclaración (queda como estuvo).
- De ahora en más, en **nuevos planes** y en el trabajo diario: **desarrollar en paralelo** a la documentación de arquitectura; no bloquear código por un PDF temprano de C4+ADR.
- C4 y ADR se tratan como **documentación viva** hasta el cierre; ER y clases se agregan cuando el código los justifique.
- Para revisiones parciales del docente: mostrar avance (repo + docs actualizados), no un entregable PDF cerrado de Unidad I.

### Relacionado

- Pregunta abierta en reunión 2026-09-02 (¿PDF Unidad I incluye ER/clases?) → queda respondida en el sentido de que **van entrando al paquete de arquitectura a lo largo del curso**, con entrega formal al final.
- [Acta_Reunion_2026-09-02_Semana1.md](../planificacion/Acta_Reunion_2026-09-02_Semana1.md) · [Propuesta_Inventario_Diagramas.md](../../documentacion/diagramas%20desarrollo/Propuesta_Inventario_Diagramas.md) · [Propuesta_ER_FitZone.md](../../documentacion/diagramas%20desarrollo/Propuesta_ER_FitZone.md) (borrador ER Fase A + visión completa, 2026-09-04)

---

## Trabajo en curso (snapshot 2026-09-04)

Lo que cada integrante **está trabajando ahora** (post reunión 2026-09-02), no el backlog completo.

| Integrante | Rol | ID | Trabajo actual | Estado |
|------------|-----|----|----------------|--------|
| Patricio Ramos | P1 | S1-T01 / S1-T11 | Revisión C4 residual + PDF cuando corresponda (S1-T09 Finalizado 2026-09-04) | En desarrollo |
| Bruno Conti | P2 | S1-T02 | Revisar ADR-001…006 (formato cátedra + hallazgos) | En desarrollo |
| Lucas Coquet | P3 | S1-T03 (+ S2-T01) | Revisar funcionalidades por actor / stack; crear cuenta Supabase | En desarrollo |
| Matias Goncevat | P4 | S1-T04 | Revisar decisiones pendientes (§1–§3) y anotar hallazgos | En desarrollo |

**Finalizado reciente:** S1-T05 (reunión), S1-T06 (acta + LOG), S1-T07 (nombres P1–P4 en el plan).

Al cambiar de tarea: actualizar esta tabla **y** el estado en el plan (`Por hacer` → `En desarrollo` → `Finalizado`).

---

## 2026-10-15 — Prueba manual E2E: Login + Listar Sedes

**Tipo:** prueba manual E2E  
**Registrado por:** Cline (agente IA)  
**Entorno:** Backend en `http://localhost:3000` (NestJS + Supabase)

### Resumen

Se ejecutó una prueba manual E2E completa sobre la API del backend:

| Paso | Endpoint | Método | Código | Resultado |
|------|----------|--------|--------|-----------|
| 1 | `/auth/login` | POST | 200 OK | ✅ Login exitoso con `prueba@fitzone.com` |
| 2 | `/sedes` | GET | 200 OK | ✅ Respuesta `[]` (sin sedes registradas) |

### Detalle — Paso 1: Login

**Request:** `POST /auth/login`  
**Body:** `{ "email": "prueba@fitzone.com", "password": "pruebafitzone" }`  

**Respuesta (200 OK):**
- `access_token`: JWT ES256 válido emitido por Supabase Auth
- `user.id`: `bd4e7632-ab28-4ed0-9034-dc8f3307e544`
- `user.email`: `prueba@fitzone.com`
- `user.role`: `authenticated`

### Detalle — Paso 2: Listar sedes

**Request:** `GET /sedes` (público, sin autenticación)  

**Respuesta (200 OK):**
- Body: `[]` (array vacío)

### Observaciones

- El backend está operativo y respondiendo correctamente.
- El endpoint de login funciona y emite un JWT válido de Supabase Auth.
- El endpoint `/sedes` responde 200 pero devuelve un array vacío, lo que indica que no hay sedes registradas en la base de datos de Supabase conectada.
- El usuario de prueba existe en Supabase Authentication con email verificado.

### Archivos relacionados

- `backend/src/auth/auth.controller.ts` — Endpoint POST /auth/login
- `backend/src/sedes/sedes.controller.ts` — Endpoint GET /sedes
- `backend/.env` — Variables de entorno (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)


### Trabajo en curso — snapshot 2026-10-08

Estado actual de las tareas de cada integrante, considerando el avance de la Semana 3 y la preparación de las tareas siguientes.

Integrante	Rol	Trabajo actual	Estado
Patricio Ramos (P1)	Arquitecto / Backend Lead	Seguimiento y coordinación del avance del backend, revisión de las tareas de la semana y organización de los próximos trabajos.	En desarrollo
Bruno Conti (P2)	Backend Developer	Trabajo sobre autenticación en NestJS, separación del cliente de Supabase para Auth y ajustes del endpoint POST /login y sus pruebas.	En desarrollo
Lucas Coquet (P3)	Frontend Developer	Desarrollo e integración del frontend con el backend. React ya cuenta con pantallas y rutas funcionando; se continúa preparando la conexión con los endpoints de NestJS, especialmente para Login y las próximas vistas.	En desarrollo
Matias Goncevat (P4)	QA / DevOps / Mobile	Preparación de pruebas de integración y E2E, revisión de los avances del backend/frontend y colaboración en la validación de las funcionalidades desarrolladas.	En desarrollo

### Objetivo conjunto inmediato
Consolidar la comunicación entre React → NestJS → Supabase, dejando operativos los endpoints necesarios del backend y avanzando en su consumo desde el frontend.

Una vez estabilizada esta integración, el equipo continúa con las funcionalidades previstas para la siguiente etapa, principalmente Canchas, estado global en React y patrones Strategy/Observer.

---

## 2026-10-21 — Reunión de seguimiento y reglas de Canchas

**Tipo:** reunión de equipo
**Participantes:** Patricio Ramos (P1), Bruno Conti (P2), Lucas Coquet (P3), Matias Goncevat (P4)
**Referencia:** [Acta_Reunion_2026-10-21_Seguimiento.md](../planificacion/Acta_Reunion_2026-10-21_Seguimiento.md)

### Avances y trabajo en curso

| Integrante | Finalizado / estado actual |
| --- | --- |
| **Bruno (P2)** | **Finalizado:** S4-T01, Strategy de precios. **En desarrollo:** S4-T06, API REST del módulo Canchas; la API sigue pendiente y las reglas acordadas en esta reunión sirven de guía. |
| **Lucas (P3)** | **Finalizado:** prototipos de Login, Mi Perfil y Canchas con datos fijos. **En desarrollo:** S3-T05, conectar Login con `POST /auth/login`. Mi Perfil aún muestra datos de prueba; Canchas espera la API. No se identificó una tarea de backend para el endpoint de perfil. |
| **Matias (P4)** | **Finalizado:** nombres y roles del equipo incorporados al README. **En desarrollo:** checklist de cuentas de GitHub, Supabase y Vercel; falta confirmar quién administra cada cuenta. Luego prepara el próximo plan y actualiza este LOG. |
| **Patricio (P1)** | **Finalizado:** S4-T05, justificación de patrones. **En desarrollo:** actualización del plan de dos semanas para compartir con el docente. |

### Decisiones de negocio: Canchas (S4-T09)

La propuesta de reglas quedó en la rama `S4-T09` (commit `9fb6aa7`), todavía **sin merge a `desarrollo`** al momento de la reunión. Se acordó:

- El precio base se guarda por cancha (`precio_hora`). Lo editan el gerente central y el administrador/recepcionista de la sede correspondiente.
- Los turnos duran 60 minutos y comienzan en hora en punto.
- Para evitar sobreventa, la reserva debe validarse e insertarse en una función SQL con bloqueo de la cancha y un índice único por cancha e inicio; Nest la invocará por RPC.
- El horario pico es configurable por sede (por defecto: 20 %, de 19:00 a 21:00, todos los días). Lo editan el administrador de esa sede y el gerente central.
- Recargo de pico y descuento de socio se acumulan sobre el precio anterior. El descuento se aplica si la membresía está vigente el día del turno; si no, se permite reservar a tarifa externa y se informa al usuario.
- El precio y su detalle se fijan al reservar. El horizonte máximo de reserva es de un mes calendario.
- El redondeo acordado es **hacia arriba al peso entero**; la propuesta todavía dice `Math.round` y debe alinearse.
- El descuento de socio es único para toda la cadena (15 % por defecto) y solo lo modifica el gerente central. El gerente central también asigna administradores de sede.

No se decidió crear una tabla de tipos de cancha con tarifas estándar. Tampoco se reabrieron en esta reunión las decisiones sobre plazo de lista de espera, penalidad de cancelación de clases, ventana de 48 horas ni precios de planes.

### Otros acuerdos y pendientes

- Mientras no exista una API, el frontend puede continuar con datos de prueba; después debe reemplazar esa fuente por el endpoint real.
- Lucas prioriza que las pantallas funcionen; responsive, Figma y librería de componentes quedan para una decisión del equipo.
- El plan actualizado se enviará al docente como seguimiento del grupo.
- Queda pendiente ordenar la documentación principal antes de presentarla; no se asignó responsable.
- Las tareas relacionadas con la reunión deben reflejar los estados reales: S4-T06 pendiente/en desarrollo, S4-T01 finalizada, S4-T05 finalizada, S4-T09 decidido pendiente de merge y S4-T02 ya implementada.

### Próximos pasos

1. Continuar S4-T06 tomando S4-T09 como especificación y verificar la integración de la rama de reglas.
2. Probar el login desde React y quitar el uso de datos de prueba cuando estén disponibles las APIs correspondientes.
3. Definir y asignar el endpoint de perfil necesario para conectar Mi Perfil.
4. Preparar el próximo plan de trabajo y registrar allí responsables, estados y bloqueos.
5. Corregir la propuesta de redondeo para que coincida con la decisión de redondear hacia arriba.

### Documentos relacionados

- [Plan_Trabajo_2_Semanas.md](../planificacion/Plan_Trabajo_2_Semanas.md)
- [Propuesta_Reglas_Negocio_S4-T09.md](../rnf/Propuesta_Reglas_Negocio_S4-T09.md)
- Decisiones_Pendientes_y_Cosas_a_Definir.md

---

## 2026-10-27 — CQRS nivel 2 (reportes gerente) anotado como pendiente

**Tipo:** decisión pendiente / seguimiento  
**Registrado por:** Patricio Ramos  
**Unidad / semana:** Unidad III clase 2 (CQRS)

### Anotación

Los reportes consolidados del gerente deben ir por **CQRS nivel 2**: consultas/vistas SQL y puerto de lectura aparte; no pasar por el repositorio de dominio de reservas. Nivel 3 fuera de alcance. Quedó en Justificación §16 y Decisiones §3.7. Implementar cuando existan M4 + alcance de reportes A4.

---

## 2026-10-27 — Frontend: ViewModel/hooks anotado como pendiente

**Tipo:** decisión pendiente / seguimiento  
**Registrado por:** Patricio Ramos  
**Unidad / semana:** Unidad III–IV (front aún en scaffolding)

### Qué se relevó

El frontend no usa capa ViewModel ni hooks por pantalla: solo `useState` en Login; sin cliente HTTP ni TanStack Query. Los tests del backend se dejan como están (unitarios en `src/` + e2e en `test/`) hasta tener la unidad de clase que precise el criterio e2e.

### Anotación

Quedó pendiente en Decisiones §4.2: separar estado servidor/cliente y evaluar MVVM con hooks al implementar Login real y cliente/sesión. Tareas naturales: **S3-T05**, **S4-T12** (y luego **S4-T11** / **S4-T13**). Referencia cruzada en el plan y en Notas Unidad II §3.

---

## 2026-10-27 — Guía SonarCloud para el equipo

**Tipo:** documentación / handoff  
**Registrado por:** Patricio Ramos

Org SonarCloud creada (P1). Compañeros aún sin cuenta: pasos en Guia_SonarCloud_FitZone.md. P1 invita cuando avisen; Matias cablea el scan con el CI (S6), sin adelantar su workflow ahora.

---

## 2026-10-27 — Lab Unidad III · consigna 1 (tests de caracterización de precios)

**Tipo:** laboratorio / entregable  
**Registrado por:** Patricio Ramos (P1)  
**Evidencia:** `backend/src/canchas/precios/precios.service.spec.ts` → bloque `Caracterización del cálculo actual (lab Unidad III · consigna 1)`  
**Producción:** no se modificó código de negocio (solo specs). Suite en verde (`npm test -- --testPathPatterns=precios.service.spec` → 21 passed).

| # | Tipo | Qué fija |
|---|------|----------|
| 1 | Caracterización | Externo fuera de pico: solo `StandardPricing`, `precioFinal = precioBase` |
| 2 | Caracterización | Socio en pico: orden Standard → Peak → Member y $20.400 (P4) |
| 3 | **Rareza** | ISO **sin** zona horaria (`2026-10-06T19:00:00`) se trata como Argentina (−03:00), igual que con `-03:00`; entra en pico. Comportamiento de `normalizarFecha` poco visible fuera del comentario en `peak-hour-pricing.strategy.ts` |

---

## 2026-10-27 — Lab Unidad III · consigna 3 (refactor 6 commits) — no aplica

**Tipo:** laboratorio / justificación  
**Registrado por:** Patricio Ramos (P1)

### Decisión

**No** se hace el replay de seis commits *Replace Conditional with Polymorphism* sobre precios.

### Motivo

Strategy en canchas se implementó **desde el inicio** (S4-T01, commit `71c993d`): el equipo ya esperaba usar el patrón (RF-11 + consignas de Unidad III). No existió un cálculo monolítico con `if`/`switch` en el repo del que refactorizar. El estado actual (lista de reglas + DI) es el diseño original, no el final de un lab de olores.

Reconstruir un “antes” falso solo para generar historial no aporta evidencia real y contradice el criterio de la clase (el patrón lo empujan olores o el requerimiento; no se finge el olor).

### Evidencia alternativa

- Código: `backend/src/canchas/precios/` (lista `PRICING_STRATEGIES`).
- Consigna 1: tests de caracterización en el spec + entrada de LOG anterior.
- Consigna 2: planilla de olores (sin olor de switch de precios).
- Texto formal: Justificación §3 — consigna 3 no aplica.

---

## 2026-10-27 — Planilla de olores (Unidad III · laboratorio)

**Tipo:** laboratorio / entregable  
**Registrado por:** Patricio Ramos (P1)  
**Referencia:** Unidad III clase 2 — consigna 2 (≥ 5 olores: archivo, línea, olor, evidencia, decisión).  
**Criterio de la cátedra:** un olor no obliga a refactorizar; anotar y decidir con razón también puntúa.

| # | Archivo | Línea(s) | Olor | Evidencia | Decisión |
|---|---------|----------|------|-----------|----------|
| 1 | `backend/src/membresias/membresias.service.ts` | 33–62 (`crear`) | **Método largo** + fuga de capa | > 20 líneas; el service hace `insert` con `(this.repository as any).client` en lugar de un método del repositorio. Rompe la regla Repository (S3-T11 / ADR-006). | **Corregir** al tocar membresías / consigna 4 del lab: `repository.insert` + `unwrap`; sacar el `as any`. |
| 2 | `backend/src/membresias/membresias.service.ts` | 39–41 | **Switch / if por discriminante** (`plan`) | `mensual` / `trimestral` / `anual` con duraciones hardcodeadas. Aparece **una sola vez** (no ≥ 3 sitios). | **No** llevar a Strategy/Factory: solo cambian datos (duración). **Corregir después** leyendo duración desde `planes_membresia` (o tabla equivalente), no con subclases. |
| 3 | `backend/src/clases/clases.service.ts` | 21–31 y 52–58 | **Código duplicado** | Dos `switch (e.message)` casi iguales (mapear `P0001` → HTTP). Misma plantilla S3-T11 repetida. | **Corregir cuando se toque clases** (p. ej. S4-T10): Extract Method `traducirErrorSql` compartido. No es Strategy/State. |
| 4 | `backend/src/clases/clases.controller.ts` + `clases.service.ts` | controller ~25–27; service 38–44 | **Envidia de funcionalidad / regla en el borde equivocado** | El cliente manda `inicioClase` y Nest decide si la cancelación es tardía (D6). Se puede falsear la fecha. Documentado en Correcciones S3-T03/T04. | **Corregir** (S4-T10): leer `inicio` (y dueño) desde la base; no confiar en el body. |
| 5 | `backend/src/clases/clases.service.ts` | 42, 47 | **Números mágicos / datos de configuración en código** | `2 * 60 * 60 * 1000` (ventana tardía) y `'30 minutes'` (plazo lista de espera) literales. | **Corregir** al estabilizar S4-T09: constantes de módulo o config; no inventar Strategy. |
| 6 | `backend/src/canchas/precios/precios.service.ts` | 36 | **Desacuerdo con regla de negocio (P7)** | `Math.round` tras la cadena de estrategias; el acta acordó **redondear hacia arriba** al peso. Tests actuales fijan `Math.round`. | **Corregir** (S4-T15): `Math.ceil` (o equivalente) + actualizar specs y docs. |
| 7 | `backend/src/canchas/precios/strategies/peak-hour-pricing.strategy.ts` | 36–68 (`extraerDiaYHoraArgentina`) | **Método largo** (> 20 líneas) | ~33 líneas; un solo tema (día/hora en zona AR con `Intl`). Ya está fuera de `aplica`/`calcular`. | **No corregir ahora.** No molesta el cambio frecuente ni mezcla abstracciones; partirlo no acerca un patrón. Revisar solo si Sonar/IDE lo marca y hay que tocar pico otra vez. |

### Lectura para la defensa

- Precios **ya** están en lista de reglas (Strategy); el olor histórico del `switch` de precios **no** está en el código actual.
- State de reserva y CQRS nivel 2 **aún no aplican** olores en código: el módulo de reservas/reportes no está; quedan diseñados/pendientes.
- Olores 1–6 tienen dueño de corrección en tareas existentes; el 7 queda como “detectado y deliberadamente no tocado”.

---

## 2026-11-05 — S5-T10: Adoptar el plan de 3 semanas

**Tipo:** planificación / seguimiento  
**Registrado por:** Matias Goncevat (P4)  
**Cierre:** el trabajo en curso se alinea con S5 y el plan activo queda actualizado con los IDs, responsables y estados de [Propuesta_Continuacion_Semanas.md](../planificacion/Propuesta_Continuacion_Semanas.md).

### Entregado

- Se adoptó la propuesta de 3 semanas como plan vigente del equipo.
- Se actualizó [Plan_Trabajo_2_Semanas.md](../planificacion/Plan_Trabajo_2_Semanas.md) con la sección de Trabajo en curso y los IDs S5-T02 a S5-T11.
- Se registraron responsables y estados alineados a la propuesta: Patricio en migración/seed, Bruno en guards y validaciones, Lucas en login y front shell, Matias en coordinación y checklist de accesos.
- La semana activa quedó sincronizada con S5, sin mezclar el backlog viejo de la reunión anterior con la nueva propuesta.

---

## 2026-11-05 — S5-T11: Checklist de cuentas

**Tipo:** planificación / accesos del equipo  
**Registrado por:** Matias Goncevat (P4)  
**Cierre:** el equipo sabe a quién pedir acceso a GitHub, Supabase y Vercel, y queda registrado el responsable de cada cuenta.

### Entregado

- **GitHub:** Patricio Ramos (P1) administra el repositorio y puede invitar al resto del equipo.
- **Supabase:** Lucas Coquet (P3) administra el proyecto y puede invitar a quienes necesiten acceso.
- **Vercel:** Patricio Ramos (P1) administra el proyecto y puede dar permisos de despliegue al equipo.
- Se dejó asentado el checklist en [Plan_Trabajo_2_Semanas.md](../planificacion/Plan_Trabajo_2_Semanas.md) para que quede visible y accesible durante S5.

---

## 2026-10-28 — S6-T01: GET/PATCH /perfiles/me

**Tipo:** backend / API  
**Registrado por:** Patricio Ramos (P1)  
**Cierre:** Lucas puede reemplazar el mock de Mi Perfil con `GET /perfiles/me` (Swagger en `/api/docs`).

### Entregado

- Módulo `backend/src/perfiles/`: `GET /perfiles/me` y `PATCH /perfiles/me` con `JwtAuthGuard`.
- El id sale solo del JWT (`sub`); no se acepta `perfilId` del cliente.
- PATCH whitelist: `dni`, `nombre`, `apellido`, `telefono`, `foto_url`, `sede_home_id`. No cambia `rol` ni `notificar_por_email` (sigue en `/notificaciones/preferencias`).
- DNI duplicado → 409; sede inexistente → 400; sin fila de perfil → 404.
- Tests unitarios + e2e verdes.

---

## 2026-10-28 — S6-T02: POST /auth/register

**Tipo:** backend / API  
**Registrado por:** Patricio Ramos (P1)  
**Cierre:** camino escrito para alta de usuario de la app (además del seed demo de S5).

### Entregado

- `POST /auth/register`: formato de email en Nest (`local@dominio.tld`) → 400 si falla; `signUp` con `SUPABASE_ANON_KEY` (mail de confirmación de Supabase Auth); fila en `perfiles` con rol `externo`.
- Respuesta 201 **sin** `access_token` hasta confirmar el email; luego `POST /auth/login`.
- Email o DNI duplicado → 409; si falla el perfil tras crear Auth, se hace rollback con `admin.deleteUser`.
- Variable nueva: `SUPABASE_ANON_KEY` (ver `.env.example`). En Supabase: **Confirm email = ON**.
- El seed de S5 sigue para usuarios demo ya confirmados (`socio@fitzone.com`, etc.).
- Tests unitarios verdes.
- Probe `npm run probe:signup-dup` y script TLS `with-system-ca` (Windows).

### Verificado 2026-10-31 — email duplicado en nuestro Supabase

- API Nest ante re-registro: **409** `Ya existe un usuario con ese email` (correcto).
- Probe: Supabase responde `error: null`, `session: false`, **`identitiesLen: 0`** (no mensaje “already registered”).
- Matcher de textos: un solo `includes('already')` como respaldo.

---

## 2026-10-28 — S6-T03: Esquema de pagos (M5)

**Tipo:** base de datos / documentación  
**Registrado por:** Patricio Ramos (P1)  
**Cierre:** existe `pagos` para el pago mock de S7; Adapter documentado como esquema listo.

### Entregado

- Migración [`supabase/migrations/20261028210000_pagos_m5.sql`](../../supabase/migrations/20261028210000_pagos_m5.sql): enums `concepto_pago` / `estado_pago`; columnas `monto`, `token_pasarela` (RNF-02), vínculo a `reservas_cancha` o `membresias` (`pagos_vinculo`); RLS sin policies de cliente.
- Nota Adapter en Justificación §7: tabla lista; código Nest / pasarela en S7.

### Fuera de alcance (sigue pendiente)

- Endpoint / servicio de cobro mock (S7).

---

## 2026-10-31 — S7-T01: Facade + State en reserva de cancha

**Tipo:** backend / patrones Unidad III  
**Registrado por:** Patricio Ramos (P1)  
**Cierre:** Strategy en uso desde `reservar`; Facade y State con rutas de código; justificación al día.

### Entregado

- Facade `ReservasCanchaService.reservar()`: precio (Strategy) → RPC `reservar_cancha` en `pendiente` → `PasarelaStub` → State confirma o cancela.
- State: `Reserva` + `PendienteDePago` / `Confirmada` / `Cancelada` en `backend/src/canchas/reservas/estado/`.
- HTTP: `POST /canchas/reservas`, `POST /canchas/reservas/:id/cancelar` (JWT; `perfilId` solo del token).
- Migración `supabase/migrations/20261031200000_confirmar_reserva_cancha.sql`.
- Justificación §3/§5/§7/§8 y tabla resumen actualizadas.

### Fuera de alcance (S7-T02 u otras)

- Persistir cobro en `pagos` (Adapter Nest).
- Facade `renovar` membresía.
- Plazo de cancelación de confirmadas.
- API de grilla/listado de canchas.
- **Ventana de hold + limpieza de `pendiente`:** enfoque acordado (lazy + cron); receta en Decisiones §3.4.1. Solo lazy descartado: sin otro cliente en ese horario el turno se pierde.
- **Checkout retomable / redirect MP:** se mantiene el `POST` atómico con stub. Mejora (crear `pendiente` → pagar aparte → GET + webhook) anotada en Decisiones §3.4.2.
- **Revisar columnas lista/JSON:** `configuracion_pico.dias` y `notificaciones.datos` — Decisiones §3.4.3.
- **Desglose de precio como ítems de reserva** (cada regla con efecto en $ antes de pagar) — Decisiones §3.4.4.

---

## 2026-10-31 — S7-T11: Smoke del guion demo en LOG

**Tipo:** backend / smoke test / Unidad V  
**Registrado por:** Matias Goncevat (P4)  
**Cierre:** los 4 pasos del guion demo pasaron con OK; al menos 1 pase registrado en `reservas_cancha`.

### Entregado

- Script [`backend/scripts/smoke-demo.ts`](../../backend/scripts/smoke-demo.ts): flujo login → membresía activa → reserva de cancha → verificación de persistencia.
- Comando `npm run smoke:demo` en `backend/package.json`.
- Cada etapa imprime en consola `[SMOKE] Etapa N - Nombre: OK | FAIL (detalle)`.
- Resultado global impreso: `[SMOKE] Resultado global: OK (al menos 1 pase registrado)`.

### Resultado de la corrida (2026-10-31)

| Etapa | Resultado | Detalle |
|-------|-----------|---------|
| 1 — Login | OK | token obtenido para perfil `076bfb09-f718-4124-aaad-8e70accd3ea3` |
| 2 — Membresía activa | OK | vigente hasta `2026-12-01` |
| 3 — Reserva de cancha | OK | reserva `368d82fe-67cf-4044-9646-22e15b2bd9c8` confirmada ($20400) |
| 4 — Persistencia | OK | reserva confirmada en tabla `reservas_cancha` de Supabase |

**Resultado global:** OK — al menos 1 pase registrado en la base de datos.

### Prerrequisitos

- `backend/.env` con `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`, `SEED_PASSWORD`.
- Base de datos con seed ejecutado (`npm run seed`).
- Membresía del socio con `vigente_hasta` futura (actualizada manualmente en Supabase para esta corrida).

---

## 2026-11-01 — Plan M2: check-in en sede + QR regenerativo (Patricio)

**Tipo:** plan de trabajo / M2 acceso  
**Registrado por:** Patricio Ramos (P1)  
**Estado:** Fase 1 Finalizado · Fase 2 Por hacer  

### Qué se anotó

Quedó un plan personal/módulo para desarrollar **check-in en recepción** y **QR regenerativo (TOTP)**, track paralelo al Demo Day de canchas (que en S5–S7 había dejado M2 cortado).

Documento: Plan_M2_Acceso_QR_Patricio.md.  
Decisiones §8 actualizadas con el alcance offline del MVP.

### Alcance offline (decisión de implementación)

Sin red, la sede **solo acumula** check-ins en cola local. Al recuperar conexión **intenta registrarlos** en Nest (`/acceso/check-ins/sync`) y **anota errores** por ítem (membresía, TOTP, RN-01, etc.). No hay resolución automática de conflictos ni nodo servidor por sede.

### Fases resumidas

0. Docs · 1. Migración `totp_seeds` / `presencias` / `check_ins` · 2. API online · 3. Sync batch + idempotencia · 4. UI Mi QR + Recepción · 5. ADR Aceptado + README demo.

### Fase 0 cerrada (2026-11-01)

- Borrador [ADR-007](../adr/ADR-007-acceso-totp-cola-offline.md) (Propuesto) + fila en ADR_Indice.
- Alineados Stack (RNF-01 sede vs móvil), C4 §5 (MVP cola + sync) y [Propuesta RN-01](../rnf/Propuesta_RN01_Presencia_Una_Sede.md) (unique en BD + Nest mapea error, como RN-02).
- Siguiente: Fase 1 (migración + seed TOTP).

---

## 2026-11-01 — S7-T02: Pasarela simulada (primera iteración)

**Tipo:** backend / M5 / patrones Unidad III (Adapter target + simulacro)  
**Registrado por:** Patricio Ramos (P1)  
**Cierre:** el Facade cobra con `PasarelaSimulada` y queda fila en `pagos` con token opaco (RNF-02); sin PDF ni MercadoPago real.

### Entregado

- Módulo Nest [`backend/src/pagos/`](../../backend/src/pagos/): puerto `PasarelaPago`, `PasarelaSimulada`, `PagosRepository`, `PagosModule`.
- `CobroRequest` incluye `perfilId` y `tokenPrueba` opcional (`tok_ok` / `tok_fail`).
- Wiring: `PASARELA_PAGO` → `PasarelaSimulada`; el stub queda solo como doble de tests.
- Facade `reservar` pasa `perfilId` al cobro; flujo atómico sin cambios.
- Tests: `pasarela-simulada.spec.ts` + ajuste del Facade.
- Docs: Justificación §7/§8, Panorama M5 (RF-13 / RNF-02 backend).

### Fuera de alcance (siguientes iteraciones)

- `AdaptadorMercadoPago`, webhook / redirect (§3.4.2).
- Hold + limpieza de `pendiente` (§3.4.1).
- RF-14 PDF, Circuit Breaker, renovación de membresía con cobro.

---

## 2026-11-01 — S7-T02b: Checkout simulado estilo MercadoPago

**Tipo:** backend / M5 / Facade partido + hold  
**Registrado por:** Patricio Ramos (P1)  
**Cierre:** crear `pendiente` → `POST .../pagar` (idempotente) → checkout HTML → confirmar; hold con lazy + `pg_cron`; sin guardar tarjeta.

### Entregado

- Migración [`supabase/migrations/20261101200000_hold_reserva_pendiente.sql`](../../supabase/migrations/20261101200000_hold_reserva_pendiente.sql): `minutos_hold_reserva`, lazy en `reservar_cancha`, ventana en `confirmar_reserva_cancha`, `cancelar_reservas_pendientes_vencidas` + `pg_cron`.
- Facade partido: `reservar` solo hold; `iniciarPago`; `listarMias`; `aplicarResultadoPago`.
- `PasarelaSimulada.crearPreferencia` / `confirmarPago`; checkout en `/pasarela-simulada/...` (tarjetas `4111…` / `4000…`).
- `APP_PUBLIC_URL` en `.env.example`.
- Tests Facade/pasarela; smoke + Postman canchas; Decisiones §3.4.1/§3.4.2; Justificación §7/§8.

### Fuera de alcance

- MercadoPago real / IPN, PDF, Circuit Breaker, renovación membresía.

---

## 2026-11-01 — S8-T1 Fase 1: migración Acceso M2 + seed TOTP

**Tipo:** backend / BD / M2 acceso  
**Registrado por:** Patricio Ramos (P1)  
**Cierre:** tablas `totp_seeds`, `presencias`, `check_ins` + RPC check-in/out; socio demo con seed TOTP.

### Entregado

- Migración [`supabase/migrations/20261101210000_acceso_m2.sql`](../../supabase/migrations/20261101210000_acceso_m2.sql): enums, RLS, `registrar_check_in` / `registrar_check_out` (RN-01 por PK en `presencias`; códigos `YA_DENTRO` / `YA_EN_OTRA_SEDE`).
- Seed: upsert TOTP del socio (`JBSWY3DPEHPK3PXP`, 60 s) en [`seed-demo.ts`](../../backend/scripts/seed-demo.ts); Seed_Demo_S5 actualizado.
- Plan M2: SQL + seed en repo. ADR-007 sigue Propuesto (API Nest = Fase 2). Seed en claro hasta cifrado Nest.
- Migración aplicada en Supabase; `npm run seed` OK (`totp_seeds` del socio).

---

## 2026-11-02 — ADR: reemplazo estricto 002/003/004 → 008/009/010

**Tipo:** documentación / arquitectura  
**Registrado por:** Patricio Ramos (P1)

### Qué se hizo

Los ADR-002, ADR-003 y ADR-004 se habían **reescrito in-place** (28–31/08) mezclando o cambiando decisiones (ORM→API, JWT→BFF, Supabase “solo PG”→Auth). Quedaron restaurados como **historial** con `Estado: Reemplazado`, sin sección “historial” aparte.

| Viejo (congelado) | Vigente |
|-------------------|---------|
| [ADR-002](../adr/ADR-002-postgresql.md) | [ADR-008](../adr/ADR-008-postgresql.md) (motor) + [ADR-006](../adr/ADR-006-supabase-api-sin-orm.md) (acceso) |
| [ADR-003](../adr/ADR-003-stack-nestjs-react.md) | [ADR-009](../adr/ADR-009-stack-nestjs-react.md) |
| [ADR-004](../adr/ADR-004-hosting-vercel-render-supabase.md) | [ADR-010](../adr/ADR-010-hosting-vercel-render-supabase.md) + [ADR-005](../adr/ADR-005-bff-supabase-auth.md) (Auth) |

Convención en ADR_Indice: un ADR aceptado no se reescribe; si cambia la decisión → `Reemplazado por ADR-YYY` + ADR nuevo. Un ADR = una decisión.

---

## 2026-11-02 — S8-T1 Fase 2: API Nest Acceso (TOTP + check-in online)

**Tipo:** backend / M2 acceso  
**Registrado por:** Patricio Ramos (P1)  
**Cierre:** módulo `acceso/` online; RN-01 por RPC (sin `if` de unicidad); Postman Acceso.

### Entregado

- Nest [`backend/src/acceso/`](../../backend/src/acceso/): `TotpService` (otplib, 60 s ±1), check-in/out, `totp/me`, presencias; mapeo `P0001` → HTTP.
- Seed demo en claro sigue válido; emisión cifrada requiere `TOTP_SEED_ENCRYPTION_KEY`.
- Alta de membresía (`MembresiasService.crear`) llama `ensureTotpSeed`: emite seed AES-GCM si no hay activo y hay key; no rota existentes.
- Tests unitarios Acceso/Totp; colección Postman Acceso.
- Plan M2 Fase 2 marcada hecha. ADR-007 sigue **Propuesto** (sync = Fase 3).

---

## 2026-11-03 — S8-T1 Fase 3: sync offline check-ins (batch + idempotencia)

**Tipo:** backend / M2 acceso  
**Registrado por:** Patricio Ramos (P1)  
**Cierre:** `POST /acceso/check-ins/sync`; respuesta por ítem; reintento por `clientEventId` sin re-TOTP.

### Entregado

- Batch (máx. 50): membresía + TOTP + RPC `origen=offline_sync`; fallos tipados (`YA_EN_OTRA_SEDE`, `TOTP_INVALIDO`, etc.) sin abortar el lote.
- Idempotencia: si `client_event_id` ya existe → `ok` sin revalidar TOTP.
- Tests unitarios sync; Postman request sync; Plan M2 Fase 3 marcada hecha. ADR-007 sigue **Propuesto** (UI = Fase 4; cierre ADR = Fase 5).

---

## 2026-11-03 — S8-T1 Fase 4: UI Mi QR + recepción / cola offline

**Tipo:** frontend / M2 acceso  
**Registrado por:** Patricio Ramos (P1)  
**Cierre:** `/mi-qr` (socio) y `/acceso` (admin_sede/gerente) con cola `localStorage` + sync.

### Entregado

- `RoleRoute` + links en Layout según `user.rol`.
- Mi QR: `GET /acceso/totp/me/codigo` + QR JSON `{ v:1, perfilId, code }` (`qrcode`).
- Acceso: pegar payload; check-in online; encolar si offline/fallo de red; panel cola + `POST /acceso/check-ins/sync`; sede default `sede_home_id`.
- `ApiError` en `api.ts` para códigos Nest. Plan M2 Fase 4 hecha.

---

## 2026-11-03 — S8-T1 Fase 5: cierre docs Acceso M2 (ADR-007 Aceptado)

**Tipo:** documentación / M2 acceso  
**Registrado por:** Patricio Ramos (P1)  
**Cierre:** plan M2 Fases 0–5; ADR-007 Aceptado; demo Acceso en README.

### Entregado

- [ADR-007](../adr/ADR-007-acceso-totp-cola-offline.md) → **Aceptado**; índice ADR actualizado.
- Panorama §M2 y fila BD `totp_seeds`/`presencias`/`check_ins` al día.
- README §6: recorrido UI Mi QR + Acceso / cola offline; Postman Acceso.
- Justificación patrones: nota de que Acceso usa Repository (sin patrón nuevo).
- Plan M2 marcado cerrado (MVP). Stretch UX (cámara, check-out UI, nombres en presencias) queda fuera del plan.

---

## 2026-11-03 — Acceso UX v2 documentado (continuación en otra rama)

**Tipo:** documentación / M2 acceso  
**Registrado por:** Patricio Ramos (P1)

Quedó Plan_M2_Acceso_UX_V2.md: sede(s) asignadas + `sedeId` en cada check-in, cámara QR, form DNI+código. Estimación ~5–7 h. Rama sugerida `s8t1-acceso-ux-v2`. No implementado en esta sesión.

---

## 2026-11-04 — S4-T06: API REST de Canchas (catálogo, grilla de disponibilidad, mantenimientos y configuración de precios)

**Tipo:** backend / M4 canchas / Unidad II y III  
**Registrado por:** Bruno Conti (P2)  
**Cierre:** endpoints de listado, grilla horaria con precios Strategy, mantenimiento y configuración pico/descuento socio operativos con Swagger, tests unitarios y Supertest e2e.

### Entregado

- Módulo [`backend/src/canchas/`](../../backend/src/canchas/) (`CanchasModule`, `CanchasController`, `ConfiguracionPreciosController`, `CanchasService`, `CanchasRepository`, DTOs y modelos).
- **Lectura y grilla (RF-10, RF-11, RNF-03):**
  - `GET /canchas?sedeId=...&incluirInactivas=...` (canchas de la sede con tipo y `precioHora`).
  - `GET /canchas/disponibilidad?sedeId=...&fecha=YYYY-MM-DD`: turnos de 60 minutos en hora en punto (`08:00`–`22:00`, zona `America/Argentina/Buenos_Aires`), cruzando reservas (`confirmada` y `pendiente` con ventana de hold vigente) y períodos de `mantenimientos_cancha`, y calculando `precioExterno`, `precioSocio` y `esHorarioPico` mediante `PreciosService` (Strategy).
- **Gestión y mantenimiento (RF-09, RF-12, S4-T09 P1):**
  - `POST /canchas` y `PATCH /canchas/:id` (`gerente` en cualquier sede; `admin_sede` solo en sedes asignadas en `admins_sede`).
  - `GET /canchas/:id/mantenimientos`, `POST /canchas/:id/mantenimientos` y `DELETE /canchas/:id/mantenimientos/:mantenimientoId`.
- **Configuración de precios (S4-T09 P3 y P8):**
  - `GET /sedes/:id/configuracion-pico` (público) y `PUT /sedes/:id/configuracion-pico` (`gerente` o `admin_sede` de esa sede).
  - `GET /configuracion/descuento-socio` (público) y `PUT /configuracion/descuento-socio` (`gerente`).
- Tests unitarios (`canchas.service.spec.ts`), e2e (`test/canchas.e2e-spec.ts`) y ampliación de colección Postman de canchas.

---

## 2026-11-04 — S4-T10: Seguridad, reglas de negocio y refactor de olores en Membresías y Clases

**Tipo:** backend / M1 membresías y M3 clases / Unidad II y III  
**Registrado por:** Bruno Conti (P2)  
**Cierre:** endpoints protegidos con `JwtAuthGuard` y `@RequiereRol`, identidad tomada exclusivamente del JWT, ventana de 48 h (D5), RN-03, D1, D3, D6 desde BD, conexión Observer (RF-08) y cierre de los olores #1–#5 de la planilla de Unidad III.

### Entregado

- **Seguridad y autorización (ADR-005, Correcciones puntos 1–5):**
  - `GET /membresias/planes` (catálogo público), `GET /membresias/mia` (`@RequiereRol('socio')`, identidad desde `@CurrentUser()`), `GET /membresias`, `GET /membresias/activas/:perfilId` y `POST /membresias` (`@RequiereRol('admin_sede', 'gerente')`).
  - `GET /clases?sedeId=...` (`JwtAuthGuard`), `GET /clases/inscripciones/mias` (`@RequiereRol('socio')`), `POST /clases/inscripciones` (`@RequiereRol('socio')`, sin `perfilId` en el body) y `DELETE /clases/inscripciones/:id` (`@RequiereRol('socio', 'admin_sede', 'gerente')`, validando titularidad `403` si un socio intenta cancelar la inscripción de otro usuario).
- **Reglas de negocio y decisiones de diseño:**
  - **D1 y D2 (`MembresiasService.crear`):** duración leída desde `planes_membresia.duracion_meses` (cierra olor #2), cierre previo de membresías activas antes de insertar la renovación y preservación de `ensureTotpSeed` para Acceso M2.
  - **D3 y zona horaria Argentina (Correcciones punto 9):** comparación y alta en calendario `America/Argentina/Buenos_Aires` (`YYYY-MM-DD`), manteniendo vigencia durante todo el último día en Argentina y calculando `estado: 'vencido'` en `GET /membresias/mia`.
  - **RN-03 y D5 (`ClasesService.inscribir`):** verificación previa de membresía activa vigente (`403` si no tiene o venció) y rechazo con `400` cuando restan menos de 48 horas para `clase.inicio`.
  - **D6 y RF-08 Observer (`ClasesService.cancelar`):** eliminación de `inicioClase` del body (cierra olor #4), cálculo de cancelación tardía (`< 2 h`) desde la base de datos y emisión desacoplada mediante `ListaEsperaPublisher.notificarLugaresLiberados`.
- **Cierre de olores #1–#5 (Unidad III) y pruebas:**
  - `MembresiasRepository.crear` con `unwrap` eliminando `(this.repository as any).client` (olor #1), `traducirErrorRepositorio` unificado con mapeo `P0001`, `23505` → `409` y `22P02` → `400` (olor #3) y constantes de módulo documentadas (olor #5).
  - DTOs con `@ApiProperty` para Swagger, tests unitarios (`membresias.service.spec.ts`, `clases.service.spec.ts`) y e2e (`test/membresias-clases.e2e-spec.ts`).

---

## 2026-11-04 — S4-T14: Endpoints de Lista de Espera, flujo completo Observer y Swagger al día

**Tipo:** backend / M3 clases y notificaciones / Unidad III  
**Registrado por:** Bruno Conti (P2)  
**Cierre:** ciclo completo de lista de espera (`anotarse`, `mias`, `confirmar`, `retirarse` y resolución lazy de vencidos) integrado con `ListaEsperaPublisher` (Observer) y documentado en OpenAPI/Swagger y Postman.

### Entregado

- **API de Lista de Espera en [`backend/src/clases/`](../../backend/src/clases/) (D7 y RF-08):**
  - `GET /clases/lista-espera/mias` (`@RequiereRol('socio')`): lista las esperas del socio autenticado junto con el resumen de la clase.
  - `POST /clases/lista-espera` (`@RequiereRol('socio')`): valida membresía activa (`RN-03`), procesa vencidos previos, verifica que el socio no esté ya inscripto y que la clase no tenga cupos directos disponibles, e inserta en `lista_espera`.
  - `POST /clases/lista-espera/:id/confirmar` (`@RequiereRol('socio')`): valida titularidad (`403` si pertenece a otro usuario) e invoca el RPC `confirmar_lugar_espera`. Si el plazo expiró (`PLAZO_VENCIDO`), ejecuta inmediatamente `procesar_lista_espera` y publica al siguiente por Observer antes de responder `409`.
  - `DELETE /clases/lista-espera/:id` (`@RequiereRol('socio', 'admin_sede', 'gerente')`): pasa el registro a `'retirado'` y, si ocupaba un cupo reservado (`'notificado'`), promueve y notifica al siguiente en la cola mediante `ListaEsperaPublisher`.
  - Procesamiento lazy de vencidos (`procesar_lista_espera`) previo a `inscribir` y `anotarseEnListaEspera`.
- **Swagger y pruebas:**
  - DTOs OpenAPI completos y verificación automática de rutas en `/api/docs-json` (`test/membresias-clases.e2e-spec.ts`), más ampliación de `postman/FitZoneSports_API.postman_collection.json`.

---

## 2026-11-07 — S4-T04: Patricio toma el estado global (antes Lucas)

**Tipo:** asignación / frontend  
**Registrado por:** Patricio Ramos (P1)  
**Tarea:** S4-T04 — React: estado global básico (Zustand o Context). En Trello está en «por hacer».

Patricio Ramos (P1) toma la tarea que estaba a cargo de Lucas Coquet (P3).  
Rama de trabajo: `S4-T04`, creada desde `desarrollo` (`88a9a89`).

### Alcance

Configurar el estado global básico de usuario, token y rol. Todavía no hay implementación en esta rama: esta entrada solo deja constancia del cambio de responsable.

---

## 2026-11-07 — S4-T04: la sesión queda en React Context

**Tipo:** frontend / estado de sesión  
**Registrado por:** Patricio Ramos (P1)  
**Cierre:** token, usuario y rol siguen en el Context existente; el rol de FitZone queda tipado y un 401 con Bearer cierra la sesión en un solo lugar.

### Decisión

No se adopta Zustand. La sesión cambia poco (login, logout, 401) y ya alimenta `ProtectedRoute`, `RoleRoute` y el menú. Las respuestas de perfil, canchas, sedes y QR no entran a ese store. TanStack Query queda para S4-T12 / S4-T13.

### Entregado

- `RolUsuario` (`socio | externo | admin_sede | gerente`) en el front, alineado al enum del backend. Si `/auth/me` trae otro valor, `rol` queda `null`.
- `setUser` sale del contrato público: la identidad la escribe solo el provider.
- `apiRequest` llama a `logout` cuando la respuesta es 401 y el request llevaba `Authorization: Bearer`. Login y registro no mandan ese header.

---

## 2026-11-07 — S5-T08: Patricio toma el layout post-login (antes Lucas)

**Tipo:** frontend / rutas  
**Registrado por:** Patricio Ramos (P1)  
**Tarea:** S5-T08 — Layout post-login y rutas protegidas. En Trello está en «por hacer».

Patricio Ramos (P1) toma la tarea que estaba a cargo de Lucas Coquet (P3).  
Rama de trabajo: `S5-T08`, creada desde `desarrollo` (`0002fe3`).

### Entregado

- El menú suma **Clases** (`/clases`) y **Notificaciones** (`/notificaciones`).
- Ambas rutas quedan dentro de `ProtectedRoute`: sin sesión redirigen a `/login`.
- Cada pantalla muestra el título y un texto de que el listado llega después. Todavía no consultan la API.

---

## 2026-11-08 — C-06: ensayo corto del guion, sin errores de flujo

**Tipo:** defensa / ensayo  
**Registrado por:** Patricio Ramos (P1)  
**Cierre:** el recorrido API + UI se completó sin errores de flujo. C-06 se da por cerrada. El pulido visual no reabre la tarea.

### Resultado

- Login socio, perfil, membresía por `GET /membresias/mia`, reserva y checkout simulado, Mi QR y check-in en recepción (segundo ingreso `YA_DENTRO`).
- Guion y hoja: `Guion_Ensayo_C-06.md`.

### Fuera de este cierre

- Pulido visto en el ensayo: el inicio sin sesión no redirige al login y repite los botones del menú; Acceso muestra JSON, UUID, perfilId y el mensaje crudo `[YA_DENTRO] El socio ya figura dentro de esta sede.`; Presencias lista el UUID en lugar del nombre y el apellido. El resto (dashboard, canchas maqueta, clases, notificaciones, membresía invisible en perfil) sigue en C-01, C-02, C-03 y, si entran, C-11 y C-12.
- Ensayo de 5 minutos con plan B: C-24.

---

## 2026-11-09 — C-14: diez ADR obligatorios con la numeración de la cátedra

**Tipo:** documentación / arquitectura  
**Registrado por:** Patricio Ramos (P1)  
**Cierre:** ADR-001 a ADR-010 en `docs/adr/`, todos Aceptados, con alternativas. Índice en `docs/adr/README.md`. Rama `c-14`.

### Decisión

La numeración vigente pasa a ser la de §5.2.1. El texto anterior no se reescribe: queda en `docs/adr/historial/`. ADR-011 conserva el BFF, que antes era el ADR-005.

Siete registros reescriben decisiones que ya estaban aceptadas (monolito, PostgreSQL, offline, Nest y datos, sincronización del terminal, React, despliegue). Tres no tenían ADR de origen y se escribieron desde el código: concurrencia de la reserva (ADR-004), pirámide de pruebas con umbral del 60 % de sentencias (ADR-008) y token del pago simulado sin persistir la tarjeta (ADR-010).

### Problema

ADR-001 a ADR-010 ya estaban usados con otros temas, tres de ellos reemplazados. Renumerar para la entrega y a la vez no presentar como registro viejo un tema que nunca se había decidido por escrito.

### Fuera de este cierre

- El 60 % todavía no está en `jest.config.ts` ni en el CI. Lo hace cumplir C-10. Si la medición queda debajo, no se baja el número en el ADR: se agregan tests o se supera el registro.
- No hay `docker-compose.yml`. El ADR-009 fija Compose de API y frontend, con PostgreSQL en Supabase. El archivo es C-07.
- El checkout simulado recibe el número de prueba en el POST y no lo guarda. La pasarela real queda afuera.
- Falta mover la tarjeta C-14 a finalizada en Trello.

---

*FitZone Sports · Programación V · UNER*
