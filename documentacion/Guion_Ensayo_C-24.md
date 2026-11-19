# Guion de ensayo C-24 — Demo de 5 minutos

**Tarea:** C-24 · ensayo cronometrado + plan B sin red  
**Fecha del guion:** 2026-11-18  
**Estado:** cerrado el 2026-11-18. El guion, el reloj y el plan B están escritos.  
**Recorrido previo, sin reloj:** [Guion_Ensayo_C-06.md](Guion_Ensayo_C-06.md).

Cada paso trae lo que se abre, lo que se pega y lo que tiene que verse. No hace falta volver arriba.

Datos leídos de Supabase el 2026-11-18 a la noche. La contraseña no está en esta hoja: en cada login dice `REEMPLAZAR`. Es `SEED_PASSWORD` de `backend/.env`. En esta base no es la `fitzone-demo` de la plantilla Docker. Completala en los dos logins antes de largar el reloj.

---

## Antes del cronómetro

1. Portal y API arriba.
2. Ventana normal en `http://localhost/login`. Si el portal es npm, `http://localhost:5173/login`.
3. Ventana de incógnito en la misma dirección de login. La misma ventana comparte la sesión.
4. **Socio Demo** no estaba dentro de ninguna sede. Si en **Acceso** ya figura en **En la sede**, **Salir** antes de largar. Para entrar a recepción usá el login del paso de las 3:40.

---

## 0:00 — Login del socio

Ventana normal.

```text
http://localhost/login
```

npm:

```text
http://localhost:5173/login
```

Pegar y **Ingresar**:

```text
socio@fitzone.com
REEMPLAZAR
```

**Esperado:** «Bienvenido a FitZone Sports». Menú con **Canchas**, **Mi Perfil** y **Mi QR**. El socio no ve **Dashboard**.

**Decir:** «Entro como socio del seed.»

---

## 0:40 — Membresía

En la misma ventana, **Mi Perfil**.

**Esperado:** bloque **Mi membresía**, plan **trimestral**, estado **activo**, vigencia hasta el **14/02/2027**. Hay otra mensual vencida en la base; la pantalla muestra la activa.

**Decir:** «En Perfil se ve la membresía activa.»

---

## 1:10 — Reservar

En la misma ventana, **Canchas**.

Hay dos sedes llamadas FitZone Central. Elegí la que deja esta dirección debajo del desplegable:

```text
Av. Demo 100
```

Si dice San Martín 1234, es la otra: no tiene paddle activa.

Fecha y hora, según la corrida:

| Corrida | Fecha | Hora |
|---------|-------|------|
| 1 | 19/11/2026 | 19:00 |
| 2 | 19/11/2026 | 20:00 |

No uses el 19/11 a las 17:00 ni el 20/11 a las 19:00: ya están confirmadas.

Cancha: **Cancha 1**. Botón: **Reservar**.

**Esperado:** «Cancha 1», precio socio **$ 15.300**, horario pico y estado **pendiente**. A las 19:00 y a las 20:00 el pico es 20 % y el descuento de socio es 15 % sobre una base de $ 15.000.

Si esa fila ya figura en **Mis reservas** como pendiente, no reserves de nuevo. El pago está en el paso siguiente.

---

## 2:10 — Pagar

En la confirmación de recién, **Pagar reserva**. Si recargaste la página, el mismo botón está en **Mis reservas**, en la fila pendiente. El hold dura 10 minutos: pagá en este paso.

Pegar, en este orden, y **Pagar**:

```text
4111111111111111
Socio Demo
12/30
123
```

**Esperado:** **Pago aprobado**. **Volver a Canchas**: la reserva queda **confirmada**.

**Decir:** «Reservo paddle, pago en el checkout simulado y queda confirmada.»

---

## 3:20 — QR

En la misma ventana del socio, **Mi QR**.

**Esperado:** seis dígitos y un contador de 60 segundos. Dejá esta ventana a la vista. Si el contador marca menos de 20 s, esperá el código siguiente antes de pasarlo.

**Decir:** «El socio muestra el QR de un minuto.»

---

## 3:40 — Check-in

Ventana de incógnito. Si todavía no entraste:

```text
admin.central@fitzone.com
REEMPLAZAR
```

**Ingresar**, después **Acceso**.

La sede tiene que decir debajo:

```text
Av. Demo 100
```

El admin la trae elegida. Si el nombre es FitZone Central pero la dirección es San Martín 1234, cambiala.

En la ventana del socio, leé los seis dígitos de **Mi QR**. Pegá esta línea en **Código del QR**, con esos dígitos en lugar de los guiones, y **Registrar ingreso**:

```text
076bfb09-f718-4124-aaad-8e70accd3ea3 ______
```

El id es el de `socio@fitzone.com`. También vale ese id en **Socio (si no hay QR)** y los seis dígitos en **Código de acceso**.

**Esperado:** «Ingreso registrado.» En **En la sede**, **Socio Demo**.

**Decir:** «Recepción registra el ingreso. El socio aparece por nombre.»

---

## 4:30 — Segundo ingreso

Misma ventana de **Acceso**, sin cambiar la sede. Pegá otra vez la misma línea (el mismo id y los mismos seis dígitos) y **Registrar ingreso**:

```text
076bfb09-f718-4124-aaad-8e70accd3ea3 ______
```

Si en la ventana del socio el contador ya llegó a cero, leé los seis dígitos nuevos y usá esos. El rechazo pide un código vigente.

**Esperado:** «Esta persona ya está en la sede.»

**Decir:** «Un segundo ingreso se rechaza en el mostrador.»

---

## Plan B — reemplaza el paso de las 4:30

Usalo si se cae la red o si piden la cola. Queda fuera de los cinco minutos.

No cortes el Wi-Fi de la máquina: la base está en Supabase y se caerían las dos ventanas. La sede sin red se simula solo en la ventana de recepción.

1. En esa ventana: F12 → **Red** → **Sin conexión**.
2. **Esperado:** «Estado de red: **offline**».
3. En la ventana del socio, los seis dígitos tienen que tener más de 25 s de vida. Si no, esperá el siguiente. Pegá la línea y **Registrar ingreso**:

```text
076bfb09-f718-4124-aaad-8e70accd3ea3 ______
```

4. **Esperado:** «Sin red. Quedó pendiente de sincronizar.» En **Cola offline**, una fila **pendiente** / **Entrada**.
5. Volvé el desplegable a **Sin limitación**. Al pasar a online la cola se envía sola.
6. **Esperado:** «Sincronización: 1 ok, 0 con error.» **Socio Demo** en **En la sede**.

Si el minuto venció en la cola, el texto es «Sincronización: 0 ok, 1 con error.» Decilo: el sync rechaza un código vencido. Cerrá con un check-in online, red en **Sin limitación**, con los seis dígitos nuevos de **Mi QR** y la misma línea de arriba.

---

## Corridas

La tarjeta queda cerrada con este guion. Si se ensaya con cronómetro, las dos filas sirven para anotar el tiempo.

| Corrida | Fecha | Duración | Dónde se cortó | Plan B | Notas |
|---------|-------|----------|----------------|--------|-------|
| 1 | | | | | |
| 2 | | | | | |
