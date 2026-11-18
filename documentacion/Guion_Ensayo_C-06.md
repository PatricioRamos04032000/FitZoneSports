# Guion de ensayo C-06 — Demo Day, sin cronómetro

**Tarea:** C-06 · ensayo corto API + UI  
**Fecha del guion:** 2026-11-08  
**Estado:** cerrado el 2026-11-08. El recorrido se hizo sin errores de flujo. El pulido de UI del §6 quedó **resuelto por S7-T08** (2026-11-13); no reabre C-06. El ensayo cronometrado sigue en **C-24**.  
**Para qué sirve:** dejar el recorrido y la hoja del ensayo. No es la muestra final cronometrada (eso es **C-24**, tramo T3).  
**Objetivo de producto** (plan de cierre, §6): en 5 minutos, login → membresía → reservar paddle y pagar → QR → check-in en sede.

**Actualización 2026-11-13 (S7-T08):** el pase del guion de producto se hace **solo con la UI** (sin Swagger para cancha ni membresía). C-01 (canchas UI) y membresía en Perfil ya están. Check-out sigue por API/Swagger.

Contraseña de todos los usuarios: el valor de `SEED_PASSWORD` en `backend/.env`. No se copia acá.

---

## 1. Qué se prueba hoy y qué se salta

| Paso del guion final | Hoy (post S7-T08) | Dónde |
|----------------------|-------------------|--------|
| Login `socio@fitzone.com` | Se prueba | UI `/login` |
| Membresía activa | Se prueba | UI `/perfil` (`GET /membresias/mia`) |
| Reservar paddle y pagar | Se prueba | UI `/canchas` + checkout HTML |
| Mi QR | Se prueba | UI `/mi-qr` |
| Check-in en recepción | Se prueba (pegar código del QR; no hay cámara) | UI `/acceso` |
| Clases, notificaciones, PDF comprobante, check-out UI | No forman parte de este recorrido de 5 min | **C-11**/S7-T06 cerradas (`/clases`). Huecos **C-12**, **C-04**. Check-out: Swagger `POST /acceso/check-outs` |

Si un paso de la tabla “se prueba” falla, es bug. Si está en “no se prueba”, se anota como hueco conocido y se sigue.

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
| Sede demo (cancha paddle) | FitZone Demo Centro · `a1000000-0000-4000-8000-000000000001` |
| Cancha Paddle 1 | `a3000000-0000-4000-8000-000000000001` |

Turno de prueba: una hora en punto, futura, a menos de un mes. Ejemplo: día siguiente a las 19:00. Si ese turno ya está ocupado, pasá a las 20:00 del mismo día.

Tarjeta que aprueba el checkout simulado: `4111111111111111`. Cualquier nombre, vencimiento y CVV alcanzan. No se guardan.

---

## 3. Recorrido (pase solo UI — post S7-T08)

Anotá cada paso. El código del QR dura unos 60 segundos: dejá recepción para inmediatamente después del QR.

### A. Socio

1. Abrí `http://localhost:5173`.  
   **Esperado:** sin sesión redirige a `/login` (no muestra portada de bienvenida con botones).

2. **Iniciar sesión** con `socio@fitzone.com` y la clave del seed.  
   **Esperado:** volvés al inicio (“Bienvenido a FitZone Sports”); menú con Canchas, Clases, Notificaciones, Mi Perfil, **Mi QR**, Cerrar sesión. **Sin Dashboard** (solo staff).

3. (Opcional para Acceso manual) En Red, copiá el `id` de `GET /auth/me` o `GET /perfiles/me` si vas a pegar socio a mano. También podés pegar el JSON del QR desde Mi QR.

4. **Mi Perfil**.  
   **Esperado:** datos personales + bloque **Mi membresía** (plan, estado activo, vigencia).

5. **Canchas**. Elegí sede **FitZone Demo Centro**, una fecha futura y un horario libre (p. ej. 19:00). **Reservar** en Paddle 1.  
   **Esperado:** confirmación con **nombre de cancha** (no UUID), precio y estado pendiente. **Pagar reserva** → checkout simulado con `4111111111111111` → reserva confirmada al volver.

6. **Mi QR**.  
   **Esperado:** QR, código de 6 dígitos y contador. Anotá el código (o copiá el payload del QR).

### B. Recepción

7. Incógnito: login `admin.central@fitzone.com`.  
   **Esperado:** menú con **Dashboard**, **Acceso**; sin Mi QR.

8. **Acceso**. Pegá el **código del QR** (o socio + código). **Registrar ingreso**.  
   **Esperado:** “Ingreso registrado.” En **En la sede**, el socio aparece por **nombre y apellido** (p. ej. Socio Demo), no por UUID.

9. Sin cambiar el código, registrá otra vez.  
   **Esperado:** mensaje de mostrador (“Esta persona ya está en la sede.”), **sin** prefijo `[YA_DENTRO]`.

Check-out UI, cola offline detallada y PDF quedan fuera de este pase de 5 min (check-out: Swagger).

---

## 4. Resultado del ensayo (2026-11-08)

Recorrido histórico sin errores de flujo. C-06 se cerró con esta hoja. Los huecos de UI de aquella fecha se listan en §6; **S7-T08 (2026-11-13)** los cerró en código (ver tabla §6).

| # | Paso | Resultado | Qué viste (08/11) |
|---|------|-----------|-------------------|
| 1 | Home | OK | Entra. Sin sesión no redirige al login y los botones están dos veces (luego S7-T08). |
| 2 | Login socio | OK | Sesión iniciada. |
| 3 | UUID del perfil en la red | OK | Hubo que leerlo de la red. |
| 4 | Perfil | OK | Datos personales. Sin plan ni vigencia entonces (C-02 / luego UI). |
| 5 | Canchas | hueco C-01 entonces | Maqueta; reserva por API. |
| 7–13 | API membresía / reserva / pago | OK | |
| 14 | Mi QR | OK | |
| 15 | Login recepción | OK | |
| 16 | Check-in | OK | Presencias por UUID entonces. |
| 17 | Segundo check-in | OK | Texto crudo `[YA_DENTRO]` entonces. |

Bugs de flujo no previstos: ninguno.

---

## 5. Qué decir si lo mostrás en voz alta

1. “Entro como socio del seed.”
2. “En Perfil se ve la membresía activa.”
3. “En Canchas reservo paddle, pago en el checkout simulado y queda confirmada.”
4. “El socio muestra el QR de un minuto.”
5. “Recepción, en otra sesión, registra el ingreso; el socio aparece por nombre. Un segundo ingreso se rechaza con un mensaje de mostrador.”

---

## 6. Anotaciones de pulido UI

No reabren C-06. Lo visto el **2026-11-08** y el estado **post S7-T08 (2026-11-13)**:

| Pantalla | En el ensayo 08/11 | Post S7-T08 |
|----------|--------------------|-------------|
| Inicio | Sin sesión no va al login; botones duplicados. | Sin sesión: `/` redirige a `/login`. Con sesión: hub breve post-login. |
| Menú | Todos los links juntos (incl. Dashboard). | Por sesión; Dashboard solo `admin_sede` \| `gerente`; Notificaciones visible (stub). |
| Dashboard | Solo el título; visible a todos. | Ruta restringida a staff; socio/externo no entran. |
| Canchas | Mock. | UI real (C-01); nombre de cancha en confirmación. Rediseño grilla/calendario → más adelante. |
| Clases | Placeholder. | Disponible (`/clases`). Fuera del recorrido de 5 min. |
| Notificaciones | Stub. | Sigue stub → **C-12**. |
| Perfil | Sin membresía en pantalla. | Membresía visible. |
| Acceso | JSON / UUID / `[YA_DENTRO]`. | Labels de recepción; Presencias con nombre; mensaje sin código API. Cámara y check-out UI → más adelante. |
| Ensayo 5 min | — | **C-24**. |
