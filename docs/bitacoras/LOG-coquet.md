# Bitácora — Coquet Lucas — Rol P3

Registro individual de Lucas Coquet (P3, frontend). Cada entrada es una sesión de trabajo. En **Commits** van los commits de esa sesión. Los de esta bitácora entraron directo a `desarrollo`, sin pull request propio.

Las horas anteriores a noviembre son una estimación reconstruida por el tamaño del diff y las reuniones del LOG de equipo. Las de noviembre salen del plan de cierre cuando la tarjeta tiene estimado (C-01, C-03 y C-19), sin contar dos veces la misma tarjeta. Patricio Ramos armó este archivo el 17/11 cruzando `git log --author=LucasCoquet` y [LOG.md](./LOG.md).

---

## Sprint 1 — Unidad I — Semana del 2026-08-31

### 2026-09-02  ·  2 h

**Actividad**

Participé de la reunión de Semana 1 (`S1-T05`, [Acta S1](../planificacion/S1_Acta_Reunion_2026-09-02.md), también en [LOG.md](./LOG.md)). Quedé como P3, frontend. Me llevé la cuenta de Supabase del equipo y la revisión cruzada del PDF de Unidad I, junto con Bruno. Al salir, lo que tenía en curso era S1-T03: revisar funcionalidades por actor, y S2-T01, la cuenta de Supabase.

**Decisión**

La cuenta de Supabase queda en mi usuario. Las claves no entran al repositorio: van por canal del equipo y a un `.env` local. El PDF de Unidad I lo escribe Patricio; Bruno y yo lo revisamos.

**Problema o bloqueo**

El proyecto de Supabase no lo puede levantar el resto si no lo invito yo. Hasta el 23/09 no dejé commit de esa revisión: S1-T03 siguió en desarrollo en el snapshot del 04/09.

**Commits**

- _Sin commits propios en el repositorio durante esta semana: los acuerdos quedaron en [LOG.md](./LOG.md) y en [Acta S1](../planificacion/S1_Acta_Reunion_2026-09-02.md)._

---

## Sprint 2 — Unidad II — Semana del 2026-09-21

### 2026-09-23  ·  4 h

**Actividad**

Cerré el pase de S1-T03 sobre el documento de actores y dejé el frontend creado. En `documentacion/Funcionalidades_por_Actor.md` saqué del socio la fila de validar el ingreso al gimnasio (eso es de recepción), dejé la mora bloqueando también la lista de espera, y reescribí la restricción del recepcionista: no puede saltear RN-01 ni RN-03. En el stack cambié el rótulo «Patrones GoF» por «Patrones de diseño», sin tocar la lista (Strategy, Observer, Repository). El mismo día agregué el proyecto React + Vite en `frontend/` (`f7c0fa3`): plantilla, TypeScript, ESLint y el script de Vite. Todavía no había pantallas del portal.

**Decisión**

El frontend vive en el monorepo, en `frontend/`, con Vite y TypeScript, y habla con Nest. Esta sesión solo deja el proyecto vacío. Las pantallas entran cuando haya rutas, no en el scaffold.

**Problema o bloqueo**

La corrección de actores es chica (siete líneas netas) y llegó tres semanas después de la reunión del 02/09. El `frontend/` de este commit es la plantilla de Vite: no llama a `POST /auth/login` ni tiene router.

**Commits**

- `9b914d9` docs: corrección de funcionalidades y restricciones por actor
- `da0e218` docs: corrección stack tecnológico
- `f7c0fa3` feat: agrega scaffolding React + Vite en frontend/

---

## Sprint 3 — Unidad II — Semana del 2026-10-05

### 2026-10-07  ·  5 h

**Actividad**

Armé el primer portal con datos fijos. `b8555e9` agrega el router, el layout y la pantalla de login. `f8b2562` agrega Mi Perfil. `94d6587` agrega Canchas con datos de prueba. Las tres pantallas quedaron en `frontend/src/pages/`. En la reunión del 21/10 el equipo las dio por cerradas como prototipos (S3-T07 y S4-T03).

**Decisión**

Primero las pantallas que se pueden recorrer, con datos fijos. Responsive, Figma y la librería de componentes quedan para cuando el equipo lo decida. Ese criterio quedó escrito en el LOG del 21/10.

**Problema o bloqueo**

El login de ese día escribía el usuario y la contraseña en la consola. Mi Perfil no leía `/perfiles/me` y Canchas no llamaba a la API: la de canchas todavía no estaba. Esas tres cosas siguen abiertas al cierre de esta sesión.

**Commits**

- `b8555e9` feat: agrega router, layout y pantalla de login
- `f8b2562` feat: agrega pantalla Mi Perfil
- `94d6587` feat: agrega pantalla de Canchas (datos mock)

---

## Sprint 4 — Unidad III — Semana del 2026-10-05

### 2026-10-08  ·  1 h

**Actividad**

Actualicé el log de equipo con el snapshot del 08/10. En esa fecha el archivo era `documentacion/LOG.md`. Anoté el estado de los cuatro: el frontend ya tenía pantallas y rutas, y el paso siguiente era conectarlas a Nest, en particular el login. El objetivo que dejé escrito era React → Nest → Supabase, y después canchas, estado global y Strategy/Observer.

**Decisión**

Dejar el estado visible aunque el login siguiera con datos fijos. Esperar a la API para escribir el log hubiera escondido que las pantallas ya existían.

**Problema o bloqueo**

El log de equipo vivía en `documentacion/LOG.md`. Más adelante pasó a [LOG.md](./LOG.md), en `docs/bitacoras/`. El snapshot de esta sesión es el bloque «Trabajo en curso — snapshot 2026-10-08» de ese archivo.

**Commits**

- `09ef4cf` docs: actualizar log de trabajo

---

## Sprint 5 — Unidad III — Semana del 2026-10-19

### 2026-10-21  ·  1,5 h

**Actividad**

Participé de la reunión de seguimiento ([Acta S5](../planificacion/S5_Acta_Reunion_2026-10-21.md)). Informé los prototipos de Login, Mi Perfil y Canchas como finalizados, y S3-T05 (conectar el login a `POST /auth/login`) como lo que seguía en curso. Mi Perfil seguía con datos de prueba. Canchas esperaba la API de Bruno (S4-T06).

**Decisión**

Mientras no haya API, el frontend sigue con datos de prueba y después reemplaza esa fuente. Yo priorizo que las pantallas funcionen. El precio, el pico y el descuento de socio se acuerdan en esta reunión, pero los aplica el backend: no son un cambio de esta bitácora.

**Problema o bloqueo**

No había una tarea de backend asignada para el endpoint de perfil, así que Mi Perfil no se podía conectar ese día. Canchas tampoco: la API REST seguía en desarrollo. El login real no tiene commit hasta el 03/11.

**Commits**

- _Sin commit propio en esta reunión. El estado quedó en [LOG.md](./LOG.md) (entrada 2026-10-21) y en el acta._

---

## Sprint 6 — Unidad IV — Semana del 2026-11-02

### 2026-11-03  ·  6 h

**Actividad**

Conecté el portal al backend. El 03/11 cae en la ventana S6 del plan de tres semanas (3–9 nov). `3604833` saca el `console.log` del usuario y de la contraseña, manda el login a `POST /auth/login` con `VITE_API_URL` (`frontend/src/services/api.ts`) y deja `AuthProvider`. `0279fa0` guarda el access token en `sessionStorage`, lo valida con `GET /auth/me` y, si falla, lo borra. También toca `ProtectedRoute`. `f05a897` conecta el alta a `POST /auth/register` y Mi Perfil a `GET` y `PATCH /perfiles/me` (datos personales, sede habitual y preferencia de mail). En el backend ajusté el texto y la validación de ese PATCH: no cambia el rol.

**Decisión**

La sesión de esta fecha queda en `AuthProvider` y en `sessionStorage`, no en un store aparte. El cliente HTTP es uno solo, `api.ts`, y el token viaja en `Authorization`.

**Problema o bloqueo**

`ProtectedRoute` y el layout ya están en estos commits, pero el cierre de la tarjeta S5-T08 lo tomó Patricio el 07/11. Lo mismo S4-T04, el estado global. Esas dos no se cierran en esta entrada: la evidencia del cierre está en [LOG-ramos.md](./LOG-ramos.md). Mi Perfil de este día todavía no muestra la membresía.

**Commits**

- `3604833` feat: conecta login de React con NestJS y Supabase
- `0279fa0` feat: agrega validacion y persistencia de sesion
- `f05a897` feat: implementa registro de usuarios y perfil con datos reales

---

## Sprint 7 — Cierre — Semana del 2026-11-09

### 2026-11-10  ·  8 h

**Actividad**

Entre el 10 y el 13 dejé canchas, la membresía en el perfil, el responsive y las notificaciones. El 10, `0c578b9` reemplaza el mock de Canchas por `frontend/src/services/canchas.ts`: sedes, `GET /canchas/disponibilidad`, `POST /canchas/reservas`, `GET /canchas/reservas/me` y `POST /canchas/reservas/:id/pagar`. El mismo día, `1a20cfd` muestra en Perfil el plan y el estado que devuelve `GET /membresias/mia` (mensual, trimestral o anual; activo, vencido o suspendido) y ajusta el CSS de Login, Canchas y Perfil (cortes en 600 px, 480 px y 350 px). El 13, `5356154` lista `GET /notificaciones` y marca leída con `PATCH /notificaciones/:id/leida`.

**Decisión**

La membresía se lee en el perfil, no en una pantalla nueva. El cliente de canchas queda en `services/canchas.ts`, separado de la pantalla. Las notificaciones se marcan de a una, con el id de la fila.

**Problema o bloqueo**

`1a20cfd` no trae el campo vigencia: el bloque muestra plan y estado. En el plan de cierre, C-02 sigue **En desarrollo** y C-12 **Por hacer**, aunque estos commits ya están en `desarrollo`. Esta entrada no les cambia el estado. Clases (S7-T06 / C-11), el pulido del flujo (S7-T08) y los componentes documentados (S7-T09) los cerró Patricio; no van acá.

**Commits**

- `0c578b9` feat: implementacion de pantalla de canchas
- `1a20cfd` feat: agrega membresia al perfil y mejoras responsive
- `5356154` feat: implementacion de notificaciones in-app

---

## Sprint 8 — Cierre — Semana del 2026-11-16

### 2026-11-17  ·  3 h

**Actividad**

Quedó escrita esta bitácora (C-19c). Las ocho entradas salen de los trece commits de `LucasCoquet` en `desarrollo` y de las reuniones del 02/09 y del 21/10, que ya estaban en el LOG de equipo. También actualicé el índice de bitácoras, la entrada del LOG de equipo y el estado de C-19c en el plan de cierre, el plan de dos semanas y la relación con Trello. La redacción la hizo Patricio Ramos el 17/11, a partir de ese historial.

**Decisión**

No pasar a esta bitácora las tarjetas que Patricio cerró después: S4-T04, S5-T08, S7-T06 / C-11, S7-T08 y S7-T09. Esas quedan en [LOG-ramos.md](./LOG-ramos.md). C-02, C-12 y C-16 no se marcan finalizadas acá.

**Problema o bloqueo**

Entre el 21/10 y el 03/11 no hay commit mío: el login real esperaba el `POST /auth/login` ya estable. El hueco no se rellena con una sesión inventada. El tablero del 11/11 todavía listaba C-19c en por hacer.

**Commits**

- _Cierre de `C-19c` registrado en la rama `c-19c`._
