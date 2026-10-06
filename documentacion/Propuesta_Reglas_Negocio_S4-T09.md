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

RF-11 fija el horario pico en 19:00–21:00; P3 lo toma como valor por defecto y permite que cada sede lo cambie.

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

### P3 — Recargo de horario pico: configurable por sede (Decidido por P1, 2026-10-06)

**Cada sede tiene su propia configuración de horario pico, y la edita el gerente.** Se configuran tres cosas:

| Dato | Ejemplo | Validación |
|------|---------|------------|
| Porcentaje de recargo | 20 | Entre 0 y 100. 0 = sin recargo |
| Horario pico | desde 19:00 hasta 21:00 | Horas en punto (los turnos son de 60 min, P2); `desde` < `hasta` |
| Días en que aplica | lunes a viernes | Lista de días (1 = lunes … 7 = domingo). Vacía = sin recargo |

- **Qué turnos pagan recargo:** los que **empiezan** dentro del horario, en hora Argentina. Con 19:00–21:00: los de las 19 y las 20.
- **Valores por defecto** al crear una sede: 20%, 19:00–21:00, todos los días (lo que pide RF-11).
- **Cambios:** solo afectan reservas nuevas; las ya hechas mantienen su precio (P6).

**Base de datos (propuesta):** tabla `configuracion_pico` con una fila por sede:

```sql
create table public.configuracion_pico (
  sede_id uuid primary key references public.sedes (id) on delete cascade,
  recargo_pct numeric(5, 2) not null default 20 check (recargo_pct between 0 and 100),
  desde time not null default '19:00',
  hasta time not null default '21:00',
  dias smallint[] not null default '{1,2,3,4,5,6,7}',
  updated_at timestamptz not null default now(),
  constraint configuracion_pico_horario check (desde < hasta)
);
```

**API (propuesta):** `GET /sedes/:id/configuracion-pico` (público, para mostrar en la grilla qué turnos tienen recargo) y `PUT /sedes/:id/configuracion-pico` (solo gerente).

**Alcance del gerente (Decidido por P1, 2026-10-06):** cada sede tiene **un gerente**, y un mismo gerente puede estar a cargo de **varias sedes**. El gerente edita la configuración pico **solo de las sedes a su cargo**; para otra sede, `PUT` responde 403.

- **Diferencia con la consigna:** A4 describe un gerente global. Por ahora el gerente es por sede; un rol global se puede agregar más adelante sin cambiar este esquema.
- **Base de datos (propuesta):** `perfiles.sede_home_id` no alcanza (es una sola sede). Se agrega `sedes.gerente_id`:

```sql
alter table public.sedes
  add column gerente_id uuid references public.perfiles (id);
create index sedes_gerente on public.sedes (gerente_id);
```

  Nest valida que el perfil tenga rol `gerente` al asignarlo, y en cada `PUT` que `sedes.gerente_id` sea el usuario del token.

### P4 — Socio en horario pico: ¿se combinan descuento y recargo?

| Opción | Descripción |
|--------|-------------|
| **a (R)** | **Se combinan**: base × (1 + recargo de la sede) × (1 − descuento de socio). Las estrategias se encadenan: cada una recibe el precio de la anterior |
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

### P8 — Dónde vive cada parámetro (Decidido por P1, 2026-10-06)

| Parámetro | Dónde | Quién lo edita |
|-----------|-------|----------------|
| Precio base | `canchas.precio_hora` (P1) | Gerente |
| Recargo, horario y días pico | `configuracion_pico`, una fila por sede (P3) | Gerente |
| Descuento de socio | `configuracion_cadena`, **un único valor para toda la cadena** | Gerente |

**Descuento de socio configurable para toda la cadena:**

- **Valor por defecto:** 15% (RF-11). Validación: entre 0 y 100; 0 = sin descuento.
- **Un solo valor para todas las sedes:** el socio accede a todas las sedes (A1) y el gerente es administrador global (A4), así que el socio paga el mismo descuento en cualquier sede.
- **Cambios:** solo afectan reservas nuevas (P6).
- Lo que **no** cambia: quién tiene derecho al descuento (socio con membresía activa, P5 / RN-03).

**Base de datos (propuesta):** tabla de una sola fila para los parámetros de toda la cadena, donde se pueden sumar otros más adelante:

```sql
create table public.configuracion_cadena (
  id boolean primary key default true check (id), -- garantiza una sola fila
  descuento_socio_pct numeric(5, 2) not null default 15
    check (descuento_socio_pct between 0 and 100),
  updated_at timestamptz not null default now()
);
insert into public.configuracion_cadena default values;
```

**API (propuesta):** `GET /configuracion/descuento-socio` (público, para mostrar el precio de socio en la grilla) y `PUT /configuracion/descuento-socio` (solo gerente).

### Ejemplos (base $20.000)

Con el descuento de socio por defecto (15%) y una sede con configuración pico por defecto (20%, 19:00–21:00, todos los días):

| Cliente | Turno | Cálculo | Precio |
|---------|-------|---------|--------|
| Externo | 17:00 | 20.000 | **$20.000** |
| Externo | 19:00 | 20.000 × 1,20 | **$24.000** |
| Socio activo | 17:00 | 20.000 × 0,85 | **$17.000** |
| Socio activo | 20:00 | 20.000 × 1,20 × 0,85 | **$20.400** |
| Socio vencido | 19:00 | igual que externo | **$24.000** |

Sede configurada con 30%, 18:00–22:00, lunes a viernes:

| Cliente | Turno | Cálculo | Precio |
|---------|-------|---------|--------|
| Externo | martes 18:00 | 20.000 × 1,30 | **$26.000** |
| Externo | martes 22:00 | fuera del horario | **$20.000** |
| Socio activo | martes 21:00 | 20.000 × 1,30 × 0,85 | **$22.100** |

Si el gerente cambia el descuento de socio a 10% (misma sede):

| Cliente | Turno | Cálculo | Precio |
|---------|-------|---------|--------|
| Socio activo | martes 17:00 | 20.000 × 0,90 | **$18.000** |
| Socio activo | martes 21:00 | 20.000 × 1,30 × 0,90 | **$23.400** |
| Externo | sábado 19:00 | sábado no aplica | **$20.000** |

Estos casos sirven directamente como tests de S4-T01.

### Esquema sugerido para S4-T01

```ts
interface PricingStrategy {
  aplica(ctx: ContextoPrecio): boolean;
  calcular(precio: number, ctx: ContextoPrecio): number;
}
// ContextoPrecio: { precioBase, inicio, esSocioActivo, descuentoSocioPct, pico: ConfiguracionPico }
// ConfiguracionPico: { recargoPct, desde, hasta, dias } (de la sede de la cancha)
// StandardPricing      -> siempre aplica, devuelve precioBase
// PeakHourPricing      -> aplica si el día de inicio está en pico.dias y la hora
//                         de inicio está en [desde, hasta); precio * (1 + recargoPct / 100)
// MemberDiscountPricing-> aplica si esSocioActivo, precio * (1 - descuentoSocioPct / 100)
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
2. Bruno arranca S4-T06 (tablas `canchas` con `precio_hora`, `reservas_cancha` con `precio` y `configuracion_pico`) y S4-T01 con los ejemplos de las tablas como tests.
3. Asignar los endpoints de configuración (`/sedes/:id/configuracion-pico` y `/configuracion/descuento-socio`) y su pantalla para el gerente: no estaban en el plan.
4. Actualizar [Decisiones pendientes](./Decisiones_Pendientes_y_Cosas_a_Definir.md) (Mora RN-03).
