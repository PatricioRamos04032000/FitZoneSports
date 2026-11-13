# Guion de ensayo C-06 — Demo Day, sin cronómetro

**Tarea:** C-06 · ensayo corto API + UI  
**Fecha del guion:** 2026-11-08  
**Estado:** cerrado el 2026-11-08. El recorrido se hizo sin errores de flujo. Lo que queda es pulido visual de la UI y no reabre esta tarea. El ensayo cronometrado sigue en **C-24**.  
**Para qué sirve:** dejar el recorrido y la hoja del ensayo. No es la muestra final cronometrada (eso es **C-24**, tramo T3).  
**Objetivo de producto** (plan de cierre, §6): en 5 minutos, login → membresía → reservar paddle y pagar → QR → check-in en sede.

Este ensayo acepta Swagger en el tramo de cancha. La salida de T1 (“sin Swagger para el paso de cancha”) queda para cuando **C-01** esté en la UI.

Contraseña de todos los usuarios: el valor de `SEED_PASSWORD` en `backend/.env`. No se copia acá.

---

## 1. Qué se prueba hoy y qué se salta

| Paso del guion final | Hoy | Dónde |
|----------------------|-----|--------|
| Login `socio@fitzone.com` | Se prueba | UI `/login` |
| Membresía activa | Se prueba por API. La UI no la muestra (falta **C-02**) | Swagger `GET /membresias/mia` |
| Reservar paddle y pagar | La pantalla `/canchas` es un mock. El flujo real va por API + checkout HTML | Swagger + `checkoutUrl` |
| Mi QR | Se prueba | UI `/mi-qr` |
| Check-in en recepción | Se prueba, pegando perfil + código (no hay cámara) | UI `/acceso` |
| Clases, notificaciones, PDF comprobante, check-out | No forman parte de este recorrido de 5 min | **C-11** cerrada (UI `/clases` disponible; demo extendida / defensa opcional). Huecos **C-12**, **C-04** |

Si un paso de la tabla “se prueba” falla, es bug de este ensayo. Si está en “no se prueba”, se anota como hueco conocido y se sigue.

---

## 2. Antes de abrir el navegador

Dos terminales, con el seed ya cargado (`cd backend` y `npm run seed` si hace falta):

```bash
cd backend
npm run start:dev
```

```bash
cd frontend
npm run dev
```

- API: `http://localhost:3000` · Swagger: `http://localhost:3000/api/docs`
- Front: `http://localhost:5173`
- `frontend/.env` (o `.env.local`) con `VITE_API_URL=http://localhost:3000`. Si lo acabás de cambiar, reiniciá Vite.

Usá **dos sesiones distintas**. La misma ventana comparte el login.

1. Ventana normal: socio.
2. Ventana de incógnito (u otro navegador): recepción.

Datos fijos del seed:

| Qué | Valor |
|-----|--------|
| Socio | `socio@fitzone.com` |
| Recepción | `admin.central@fitzone.com` (rol `admin_sede`, sede Central) |
| Sede Central | `a1000000-0000-4000-8000-000000000001` |
| Cancha Paddle 1 | `a3000000-0000-4000-8000-000000000001` |

Turno de prueba: una hora en punto, futura, a menos de un mes. Ejemplo si corrés esto el 8/11: `2026-11-09T19:00:00-03:00`. Si ese turno ya está ocupado, pasá a las 20:00 del mismo día.

Tarjeta que aprueba el checkout simulado: `4111111111111111`. Cualquier nombre, vencimiento y CVV alcanzan. No se guardan.

---

## 3. Recorrido

Anotá cada paso en la hoja del §4 mientras lo hacés. El código del QR dura unos 60 segundos: dejá el bloque de recepción para inmediatamente después del QR.

### A. Socio en la UI

1. Abrí `http://localhost:5173`.  
   **Esperado:** título “Bienvenido a FitZone Sports”.

2. Entrá a **Iniciar sesión**. Email `socio@fitzone.com` y la clave del seed.  
   **Esperado:** volvés al inicio y el menú muestra **Cerrar sesión** y **Mi QR**.

3. Abrí las herramientas del navegador → Red. Buscá la respuesta de `GET /auth/me` o `GET /perfiles/me` y copiá el `id` (UUID del perfil). Lo vas a pegar en Acceso.  
   **Esperado:** un UUID. La pantalla de Perfil no lo muestra; por eso se saca de la red.

4. Entrá a **Mi Perfil**.  
   **Esperado:** nombre, apellido, DNI, email `socio@fitzone.com` y rol `socio`, cargados de la API.  
   **Hueco conocido:** no aparecen plan, estado ni vigencia de la membresía.

5. Entrá a **Canchas**.  
   **Esperado en este ensayo:** texto fijo (“Sede 1”, “Cancha 1”, precio “$X”). El botón Reservar no llama a la API.  
   **Hueco conocido (C-01):** no es la grilla real. No lo cuentes como bug nuevo; seguí por Swagger.

6. Dejá **Mi QR** para el paso C, justo antes del check-in.

### B. Membresía, reserva y pago por API

En Swagger (`/api/docs`):

7. `POST /auth/login` con:

```json
{ "email": "socio@fitzone.com", "password": "<SEED_PASSWORD>" }
```

Copiá `access_token`. **Authorize** y pegá el token (si el campo ya dice Bearer, pegá solo el JWT).

8. `GET /membresias/mia`.  
   **Esperado:** `estado` activo y una vigencia que todavía no venció.  
   Usá este endpoint, no `GET /membresias/activas/:perfilId`: ese último es de recepción y con el token del socio responde 403.

9. `GET /canchas/disponibilidad` con query:

- `sedeId`: `a1000000-0000-4000-8000-000000000001`
- `fecha`: el día del turno, `YYYY-MM-DD` (en el ejemplo, `2026-11-09`)

**Esperado:** la cancha Paddle 1 y el turno de las 19:00 libre (o el horario que hayas elegido).

10. `POST /canchas/reservas`:

```json
{
  "canchaId": "a3000000-0000-4000-8000-000000000001",
  "inicio": "2026-11-09T19:00:00-03:00"
}
```

**Esperado:** 201, `estado` = `pendiente`, un `precio` y un `id` de reserva. Anotá ese `id`.

11. `POST /canchas/reservas/{id}/pagar` con el id del paso anterior.  
   **Esperado:** `checkoutUrl` que apunta a `http://localhost:3000/pasarela-simulada/checkout/...`.

12. Abrí esa URL en el navegador. Completá el formulario con la tarjeta `4111111111111111`.  
   **Esperado:** página de pago aprobado.

13. `GET /canchas/reservas/me` (mismo token de socio).  
   **Esperado:** esa reserva en `confirmada`.

### C. QR y check-in

14. En la ventana del **socio**, entrá a **Mi QR**.  
    **Esperado:** un QR, un código de 6 dígitos y un contador que baja. Anotá el código ya. Si llega a 0, esperá el nuevo.

15. En la ventana de **incógnito**, login con `admin.central@fitzone.com` y la misma clave.  
    **Esperado:** el menú muestra **Acceso** y no muestra **Mi QR**.

16. Entrá a **Acceso**. Elegí la sede **FitZone Central** si no quedó sola.  
    En “Perfil ID” pegá el UUID del paso 3. En “Código TOTP” pegá los 6 dígitos del paso 14. **Registrar check-in**.  
    **Esperado:** mensaje “Check-in registrado.” y el UUID del socio en la tabla **Presencias**.

17. Sin cambiar el código, registrá otra vez.  
    **Esperado:** error, en la práctica `YA_DENTRO` (el socio ya está dentro). Eso cierra el flujo; no es un fallo.

Check-out, cola offline y PDF quedan fuera de este pase.

---

## 4. Resultado del ensayo (2026-11-08)

Recorrido hecho sin errores de flujo. Ningún paso funcional falló. C-06 se cierra con esta hoja.

| # | Paso | Resultado | Qué viste |
|---|------|-----------|-----------|
| 1 | Home | OK | Entra. Sin sesión no redirige al login y los botones están dos veces (§6). |
| 2 | Login socio | OK | Sesión iniciada. |
| 3 | UUID del perfil en la red | OK | Hubo que leerlo de la red: la UI no lo muestra. |
| 4 | Perfil | OK | Datos personales de la API. Sin plan ni vigencia en pantalla (C-02). |
| 5 | Canchas | hueco C-01 | Maqueta. No se contó como error: la reserva se hizo por API. |
| 7 | Login Swagger | OK | |
| 8 | `GET /membresias/mia` | OK | |
| 9 | Disponibilidad | OK | |
| 10 | Reserva pendiente | OK | |
| 11 | `POST .../pagar` | OK | |
| 12 | Checkout `4111…` | OK | |
| 13 | Reserva confirmada | OK | |
| 14 | Mi QR | OK | Código visible. El JSON no se puede copiar desde la pantalla. |
| 15 | Login recepción | OK | |
| 16 | Check-in | OK | La presencia queda registrada. La tabla muestra el UUID, no el nombre y el apellido (§6). |
| 17 | Segundo check-in `YA_DENTRO` | OK | Rechazo esperado. El texto en pantalla queda crudo: `[YA_DENTRO] El socio ya figura dentro de esta sede.` |

Bugs de flujo no previstos: ninguno.

---

## 5. Qué decir si lo mostrás en voz alta

Texto corto, por si lo narrás mientras hacés el recorrido. Los huecos se dicen como tales.

1. “Entro como socio del seed.”
2. “El perfil sale de la API. La membresía todavía no está en esta pantalla: la consulto en `GET /membresias/mia`.”
3. “Canchas en la UI sigue siendo maqueta. La reserva real es: disponibilidad, hold pendiente, checkout simulado y reserva confirmada.”
4. “El socio muestra el QR de un solo uso, de un minuto.”
5. “Recepción, en otra sesión, pega el perfil y el código y el socio queda en la sede. Un segundo ingreso en la misma sede se rechaza.”

---

## 6. Anotaciones de pulido UI

No reabren C-06. Lo que se vio en el ensayo del 2026-11-08:

**Inicio sin sesión.** Entrar a `/` no redirige a `/login`. La portada se muestra igual, con el título y los accesos. Dashboard, Perfil y Canchas sí mandan al login si no hay sesión, porque esas rutas están protegidas. El inicio es público.

**Botones duplicados.** La pantalla inicial repite la navegación: el menú de arriba (Inicio, Canchas, Clases, Notificaciones, Mi Perfil, Dashboard) y, debajo, otra fila de botones (Dashboard, Mi Perfil, Canchas, Iniciar sesión, Registrarse).

**Términos de programación en pantalla.** En Acceso se le habla al usuario con el vocabulario de la API:

- Texto: “Pegá el JSON del QR del socio”.
- Campo “Payload QR (JSON)” con placeholder `{"v":1,"perfilId":"...","code":"123456"}`.
- Campo “Perfil ID (si no hay JSON)” con placeholder “uuid del socio”.
- La tabla de presencias muestra el UUID del usuario, no el nombre y el apellido.
- El segundo ingreso no dice una frase de mostrador: muestra `[YA_DENTRO] El socio ya figura dentro de esta sede.` El código entre corchetes sale porque la pantalla antepone `err.code` al mensaje.

Esas frases hay que pasarlas a lenguaje de recepción (“Esta persona ya está en la sede”) y sacar JSON, UUID y perfilId de lo que se lee en la demo.

| Pantalla | Qué se ve hoy | A dónde va |
|----------|----------------|------------|
| Inicio | Sin sesión no va al login y muestra dos veces los accesos a las otras pantallas. | Una sola navegación. El inicio, o redirige al login, o deja de repetir el menú. |
| Menú | Todos los links juntos, sin marcar la página actual. En teléfono se apila. | C-03 (Login, Canchas y Mi QR usables en el teléfono). |
| Dashboard | Solo el título. | Sacarlo del recorrido o darle contenido. |
| Canchas | Sedes y horarios fijos, precio “$X”, Reservar no llama a la API. Sin la card del resto de las pantallas. | C-01. No es un retoque de CSS. |
| Clases | Disponible en `/clases` (listar, inscribir, cancelar, lista de espera). No entra al recorrido de 5 min. | C-11 / S7-T06 cerradas 2026-11-13. Opcional en defensa extendida. |
| Notificaciones | Una frase de que el listado llega después. | C-12, si entra. |
| Perfil | Card con datos reales. No muestra plan, estado ni vigencia. | C-02. |
| Mi QR | El código de 6 dígitos se lee. | El id y el JSON quedan para copiar en recepción, no como texto de la demo del socio. |
| Acceso | JSON, perfilId, UUID y `[YA_DENTRO]` a la vista. En Presencias, el socio aparece por UUID y no por nombre y apellido. | Nombre y apellido en la tabla. Mensaje de error sin código. La cámara queda fuera de la demo. |
