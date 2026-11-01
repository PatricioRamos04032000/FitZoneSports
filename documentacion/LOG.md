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
- [Acta_Reunion_2026-09-02_Semana1.md](./Acta_Reunion_2026-09-02_Semana1.md) · [Propuesta_Inventario_Diagramas.md](./Propuesta_Inventario_Diagramas.md) · [Propuesta_ER_FitZone.md](./Propuesta_ER_FitZone.md) (borrador ER Fase A + visión completa, 2026-09-04)

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
**Referencia:** [Acta_Reunion_2026-10-21_Seguimiento.md](./Acta_Reunion_2026-10-21_Seguimiento.md)

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

- [Plan_Trabajo_2_Semanas.md](./Plan_Trabajo_2_Semanas.md)
- [Propuesta_Reglas_Negocio_S4-T09.md](./Propuesta_Reglas_Negocio_S4-T09.md)
- [Decisiones_Pendientes_y_Cosas_a_Definir.md](./Decisiones_Pendientes_y_Cosas_a_Definir.md)

---

## 2026-10-27 — Frontend: ViewModel/hooks anotado como pendiente

**Tipo:** decisión pendiente / seguimiento  
**Registrado por:** Patricio Ramos  
**Unidad / semana:** Unidad III–IV (front aún en scaffolding)

### Qué se relevó

El frontend no usa capa ViewModel ni hooks por pantalla: solo `useState` en Login; sin cliente HTTP ni TanStack Query. Los tests del backend se dejan como están (unitarios en `src/` + e2e en `test/`) hasta tener la unidad de clase que precise el criterio e2e.

### Anotación

Quedó pendiente en [Decisiones §4.2](./Decisiones_Pendientes_y_Cosas_a_Definir.md): separar estado servidor/cliente y evaluar MVVM con hooks al implementar Login real y cliente/sesión. Tareas naturales: **S3-T05**, **S4-T12** (y luego **S4-T11** / **S4-T13**). Referencia cruzada en el plan y en [Notas Unidad II §3](./Notas_Correcciones_Unidad_II.md).

---

## 2026-10-27 — CQRS nivel 2 (reportes gerente) anotado como pendiente

**Tipo:** decisión pendiente / seguimiento  
**Registrado por:** Patricio Ramos  
**Unidad / semana:** Unidad III clase 2 (CQRS)

### Anotación

Los reportes consolidados del gerente deben ir por **CQRS nivel 2**: consultas/vistas SQL y puerto de lectura aparte; no pasar por el repositorio de dominio de reservas. Nivel 3 fuera de alcance. Quedó en [Justificación §16](./Justificacion_Patrones_Unidad_III.md#16-cqrs-nivel-2--reportes-del-gerente) y [Decisiones §3.7](./Decisiones_Pendientes_y_Cosas_a_Definir.md). Implementar cuando existan M4 + alcance de reportes A4.

---

## 2026-10-27 — Guía SonarCloud para el equipo

**Tipo:** documentación / handoff  
**Registrado por:** Patricio Ramos

Org SonarCloud creada (P1). Compañeros aún sin cuenta: pasos en [Guia_SonarCloud_FitZone.md](./Guia_SonarCloud_FitZone.md). P1 invita cuando avisen; Matias cablea el scan con el CI (S6), sin adelantar su workflow ahora.

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
| 4 | `backend/src/clases/clases.controller.ts` + `clases.service.ts` | controller ~25–27; service 38–44 | **Envidia de funcionalidad / regla en el borde equivocado** | El cliente manda `inicioClase` y Nest decide si la cancelación es tardía (D6). Se puede falsear la fecha. Documentado en [Correcciones S3-T03/T04](./Correcciones_S3-T03_S3-T04_Membresias_Clases.md). | **Corregir** (S4-T10): leer `inicio` (y dueño) desde la base; no confiar en el body. |
| 5 | `backend/src/clases/clases.service.ts` | 42, 47 | **Números mágicos / datos de configuración en código** | `2 * 60 * 60 * 1000` (ventana tardía) y `'30 minutes'` (plazo lista de espera) literales. | **Corregir** al estabilizar S4-T09: constantes de módulo o config; no inventar Strategy. |
| 6 | `backend/src/canchas/precios/precios.service.ts` | 36 | **Desacuerdo con regla de negocio (P7)** | `Math.round` tras la cadena de estrategias; el acta acordó **redondear hacia arriba** al peso. Tests actuales fijan `Math.round`. | **Corregir** (S4-T15): `Math.ceil` (o equivalente) + actualizar specs y docs. |
| 7 | `backend/src/canchas/precios/strategies/peak-hour-pricing.strategy.ts` | 36–68 (`extraerDiaYHoraArgentina`) | **Método largo** (> 20 líneas) | ~33 líneas; un solo tema (día/hora en zona AR con `Intl`). Ya está fuera de `aplica`/`calcular`. | **No corregir ahora.** No molesta el cambio frecuente ni mezcla abstracciones; partirlo no acerca un patrón. Revisar solo si Sonar/IDE lo marca y hay que tocar pico otra vez. |

### Lectura para la defensa

- Precios **ya** están en lista de reglas (Strategy); el olor histórico del `switch` de precios **no** está en el código actual.
- State de reserva y CQRS nivel 2 **aún no aplican** olores en código: el módulo de reservas/reportes no está; quedan diseñados/pendientes.
- Olores 1–6 tienen dueño de corrección en tareas existentes; el 7 queda como “detectado y deliberadamente no tocado”.

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
- Texto formal: [Justificación §3 — consigna 3 no aplica](./Justificacion_Patrones_Unidad_III.md#laboratorio-unidad-iii--consigna-3-seis-commits-de-refactor--no-aplica).

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

- Migración [`supabase/migrations/20261028210000_pagos_m5.sql`](../supabase/migrations/20261028210000_pagos_m5.sql): enums `concepto_pago` / `estado_pago`; columnas `monto`, `token_pasarela` (RNF-02), vínculo a `reservas_cancha` o `membresias` (`pagos_vinculo`); RLS sin policies de cliente.
- Nota Adapter en [Justificación §7](./Justificacion_Patrones_Unidad_III.md#7-adapter--pasarela-de-pago): tabla lista; código Nest / pasarela en S7.

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
- **Ventana de hold + limpieza de `pendiente`:** enfoque acordado (lazy + cron); receta en [Decisiones §3.4.1](./Decisiones_Pendientes_y_Cosas_a_Definir.md#341-hold-de-pendiente--ventana--limpieza-lazy--cron-s7). Solo lazy descartado: sin otro cliente en ese horario el turno se pierde.
- **Checkout retomable / redirect MP:** se mantiene el `POST` atómico con stub. Mejora (crear `pendiente` → pagar aparte → GET + webhook) anotada en [Decisiones §3.4.2](./Decisiones_Pendientes_y_Cosas_a_Definir.md#342-flujo-de-pago-de-cancha--mvp-actual-vs-mejora-mercadopago).
- **Revisar columnas lista/JSON:** `configuracion_pico.dias` y `notificaciones.datos` — [Decisiones §3.4.3](./Decisiones_Pendientes_y_Cosas_a_Definir.md#343-revisar-columnas-lista--json--configuracion_pico-y-notificaciones).
- **Desglose de precio como ítems de reserva** (cada regla con efecto en $ antes de pagar) — [Decisiones §3.4.4](./Decisiones_Pendientes_y_Cosas_a_Definir.md#344-desglose-de-precio-de-cancha-como-tems-de-la-reserva-mejora-ux--api).

---

## 2026-10-31 — S7-T11: Smoke del guion demo en LOG

**Tipo:** backend / smoke test / Unidad V  
**Registrado por:** Matias Goncevat (P4)  
**Cierre:** los 4 pasos del guion demo pasaron con OK; al menos 1 pase registrado en `reservas_cancha`.

### Entregado

- Script [`backend/scripts/smoke-demo.ts`](../backend/scripts/smoke-demo.ts): flujo login → membresía activa → reserva de cancha → verificación de persistencia.
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

## 2026-11-01 — S7-T02: Pasarela simulada (primera iteración)

**Tipo:** backend / M5 / patrones Unidad III (Adapter target + simulacro)  
**Registrado por:** Patricio Ramos (P1)  
**Cierre:** el Facade cobra con `PasarelaSimulada` y queda fila en `pagos` con token opaco (RNF-02); sin PDF ni MercadoPago real.

### Entregado

- Módulo Nest [`backend/src/pagos/`](../backend/src/pagos/): puerto `PasarelaPago`, `PasarelaSimulada`, `PagosRepository`, `PagosModule`.
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

- Migración [`supabase/migrations/20261101200000_hold_reserva_pendiente.sql`](../supabase/migrations/20261101200000_hold_reserva_pendiente.sql): `minutos_hold_reserva`, lazy en `reservar_cancha`, ventana en `confirmar_reserva_cancha`, `cancelar_reservas_pendientes_vencidas` + `pg_cron`.
- Facade partido: `reservar` solo hold; `iniciarPago`; `listarMias`; `aplicarResultadoPago`.
- `PasarelaSimulada.crearPreferencia` / `confirmarPago`; checkout en `/pasarela-simulada/...` (tarjetas `4111…` / `4000…`).
- `APP_PUBLIC_URL` en `.env.example`.
- Tests Facade/pasarela; smoke + Postman canchas; Decisiones §3.4.1/§3.4.2; Justificación §7/§8.

### Fuera de alcance

- MercadoPago real / IPN, PDF, Circuit Breaker, renovación membresía.

