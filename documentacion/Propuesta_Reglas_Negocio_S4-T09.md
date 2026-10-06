# Propuesta: reglas de negocio de precios y pendientes (S4-T09)

**Responsable:** Patricio Ramos (P1) · **Decide:** el equipo en la reunión  
**Fecha:** 2026-10-06  
**Estado:** propuesta, a decidir  
**Desbloquea:** S4-T06 (Módulo Canchas) y S4-T01 (Strategy de precios), ambas de Bruno

Cada punto tiene opciones y una recomendación (**R**). En la reunión se marca la opción elegida y se pasa a "Decidido".

---

## 1. Lo que ya fija la consigna

| Regla | Fuente |
|-------|--------|
| Cada cancha tiene costo por hora según su tipo (paddle, fútbol 5) | RF-09 |
| Precio estándar + 15% de descuento a socios + recargo en horario pico (19:00–21:00) | RF-11 |
| `StandardPricing`, `MemberDiscountPricing` y `PeakHourPricing` implementan `PricingStrategy` | Patrón Strategy |
| Socio con cuota vencida: no tiene descuento, paga como externo (no se le bloquea la reserva) | RN-03 |
| Dos reservas de la misma cancha y horario: solo una tiene éxito | RN-02 |
| El gerente define precios y políticas | A4 |

**Eventos del Observer:** ya decidido en S4-T02 (solo "lugar liberado"; in-app + log + email simulado opcional). Ver [Diseño Observer](./Diseno_Observer_S4-T02_Notificaciones.md).

---

## 2. Precios de canchas (para S4-T01 y S4-T06)

### P1 — Dónde se define el precio base

| Opción | Descripción |
|--------|-------------|
| **a (R)** | Columna `precio_hora` en `canchas`. El gerente lo carga al dar de alta la cancha y lo puede editar |
| b | Tabla `tarifas` por sede y tipo de cancha |
| c | Constante en el código por tipo de cancha |

**R:** (a). Es lo que pide RF-09, permite precios distintos por sede sin otra tabla, y el gerente lo maneja sin redeploy.

### P2 — Duración del turno

| Opción | Descripción |
|--------|-------------|
| **a (R)** | Turnos fijos de **60 min** que empiezan en hora en punto (08:00, 09:00, …) |
| b | 60 min fútbol 5 y 90 min paddle |
| c | Duración libre elegida por el usuario |

**R:** (a). La grilla y la regla anti doble reserva (RN-02) quedan simples: `unique (cancha_id, inicio)`.

### P3 — Recargo de horario pico

| Tema | Opciones | R |
|------|----------|---|
| Porcentaje | +10% · **+20%** · +30% | **+20%** |
| Qué turnos | **Los que empiezan a las 19:00 y 20:00** (hora Argentina) | idem |
| Qué días | **Todos** · solo lunes a viernes | **Todos** (más simple; se puede cambiar después) |

### P4 — Socio en horario pico: ¿se combinan descuento y recargo?

| Opción | Descripción |
|--------|-------------|
| **a (R)** | **Se combinan**: base × 1,20 × 0,85. Las estrategias se encadenan: cada una recibe el precio de la anterior |
| b | Se aplica solo una (la más favorable al cliente) |
| c | En pico no hay descuento |

**R:** (a). Es la lectura directa de RF-11 ("estándar + descuento + recargo") y muestra mejor el Strategy: el servicio arma la lista de estrategias que aplican y las aplica en orden.

### P5 — Quién paga como socio (RN-03)

**R:** socio = tiene una membresía `activo` cuya vigencia cubre el **día del turno**. Si está vencida o suspendida, se le cobra precio externo **sin bloquear** la reserva, y la respuesta lo indica (p. ej. `"descuento_socio": false, "motivo": "MEMBRESIA_VENCIDA"`) para que el front muestre el aviso.

Esto cierra la pregunta pendiente "Mora (RN-03): ¿bloquea descuento o solo avisa?": **quita el descuento y avisa**.

### P6 — Cuándo queda fijo el precio

| Opción | Descripción |
|--------|-------------|
| **a (R)** | Se calcula al reservar y se guarda en `reservas_cancha.precio` junto con el detalle (`base`, reglas aplicadas). Un cambio de precio posterior no afecta reservas ya hechas |
| b | Se calcula al pagar |

**R:** (a). El comprobante PDF (RF-14) usa ese monto.

### P7 — Redondeo

**R:** al peso entero (`Math.round`) después de aplicar todas las reglas.

### P8 — Dónde viven los porcentajes y el horario pico

| Opción | Descripción |
|--------|-------------|
| **a (R)** | Constantes en Nest (`DESCUENTO_SOCIO = 0.15`, `RECARGO_PICO = 0.20`, `PICO = 19–21`) |
| b | Tabla `politicas_precio` editable por el gerente |

**R:** (a) por ahora: el gerente ya controla el precio base (P1). Pasar a (b) es agregar una tabla y que las estrategias lean de ahí, sin cambiar su interfaz.

### Ejemplos (base $20.000)

| Cliente | Turno | Cálculo | Precio |
|---------|-------|---------|--------|
| Externo | 17:00 | 20.000 | **$20.000** |
| Externo | 19:00 | 20.000 × 1,20 | **$24.000** |
| Socio activo | 17:00 | 20.000 × 0,85 | **$17.000** |
| Socio activo | 20:00 | 20.000 × 1,20 × 0,85 | **$20.400** |
| Socio vencido | 19:00 | igual que externo | **$24.000** |

Estos casos sirven directamente como tests de S4-T01.

### Esquema sugerido para S4-T01

```ts
interface PricingStrategy {
  aplica(ctx: ContextoPrecio): boolean;
  calcular(precio: number, ctx: ContextoPrecio): number;
}
// ContextoPrecio: { precioBase, inicio, esSocioActivo }
// StandardPricing      -> siempre aplica, devuelve precioBase
// PeakHourPricing      -> aplica si inicio es 19:00 o 20:00, precio * 1.20
// MemberDiscountPricing-> aplica si esSocioActivo, precio * 0.85
```

---

## 3. Otras decisiones abiertas (de S3-T06)

| ID | Tema | Opciones | R |
|----|------|----------|---|
| Q1 | Plazo para confirmar un lugar de la lista de espera (D7) | 15 min · **30 min** · 2 h | **30 min**, y si la clase empieza antes, el plazo termina 1 h antes del inicio |
| Q2 | Penalidad por cancelación tardía de clase (D6, menos de 2 h) | Ninguna, solo registro · **3 tardías en 30 días bloquean reservar clases 7 días** · cobro | **Solo registro por ahora**; la regla de bloqueo queda para cuando haya reportes |
| Q3 | Ventana de reserva de clases "hasta 48 hs antes" (D5) | Se puede reservar desde 48 h antes · se puede reservar hasta 48 h antes del inicio | **Consultar al docente.** Mientras: abre 48 h antes y cierra al inicio |
| Q4 | Precios reales de los planes (hoy de ejemplo: 25.000 / 67.500 / 240.000) | Mantener · definir otros | Mantener para la demo |

---

## 4. Después de la reunión

1. Marcar cada punto como **Decidido** en este documento.
2. Bruno arranca S4-T06 (tabla `canchas` con `precio_hora`, `reservas_cancha` con `precio`) y S4-T01 con los ejemplos de la tabla como tests.
3. Actualizar [Decisiones pendientes](./Decisiones_Pendientes_y_Cosas_a_Definir.md) (Mora RN-03).
