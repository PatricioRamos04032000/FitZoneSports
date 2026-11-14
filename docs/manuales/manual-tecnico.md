# Manual técnico — FitZone Sports

- **Tarea:** C-18
- **Anexo:** F de los lineamientos de entrega
- **Fecha:** 2026-11-11
- **Autor:** Patricio Ramos (P1)

Este manual describe el sistema que está en el repositorio. Cada afirmación cita un archivo. Las decisiones largas viven en los ADR: acá se enlazan, no se reescriben. Los diagramas viven en `docs/diagramas/`: acá se listan, no se redibujan.

Los casos de la sección 7 son una guía para quien extiende el código (y para la defensa de cinco minutos). Este archivo no agrega el valor `tenis` al enum ni deja una estrategia nueva en el backend.

## Índice

1. [Visión arquitectónica](#1-visión-arquitectónica)
2. [Los cinco módulos](#2-los-cinco-módulos)
3. [Modelo de datos y persistencia](#3-modelo-de-datos-y-persistencia)
4. [Patrones de diseño](#4-patrones-de-diseño)
5. [Concurrencia en las reservas](#5-concurrencia-en-las-reservas)
6. [Arquitectura offline del acceso](#6-arquitectura-offline-del-acceso)
7. [Guía de extensión](#7-guía-de-extensión)
8. [Pruebas y cobertura](#8-pruebas-y-cobertura)
9. [Pipeline de integración](#9-pipeline-de-integración)
10. [Convenciones](#10-convenciones)

## 1. Visión arquitectónica

FitZone Sports es un monolito modular: una API REST en NestJS, una base PostgreSQL compartida y una SPA React. La decisión y las alternativas (microservicios, SOA, serverless, monolito sin módulos) están en [ADR-001](../adr/ADR-001-monolito-modular.md).

El C4-2 muestra los contenedores de la demo: la SPA (portal y terminal de sede son la misma aplicación), la API Nest y PostgreSQL en Supabase. La pasarela de pago es un sistema externo simulado. Fuente y export:

- [docs/diagramas/fuentes/c4-2-contenedores.mmd](../diagramas/fuentes/c4-2-contenedores.mmd)
- [docs/diagramas/img/c4-2-contenedores.svg](../diagramas/img/c4-2-contenedores.svg)

El mapa de hosting (Vercel, Render, Supabase) y el Compose de la entrega están en [ADR-009](../adr/ADR-009-despliegue-contenedores-reversion.md). El workflow de GitHub Actions construye y testea el backend; no despliega.

### 1.1 Índice de ADR

Los diez obligatorios y el adicional están aceptados. El índice con el historial de numeración es [docs/adr/README.md](../adr/README.md).

| ID | Decisión | Archivo |
|----|----------|---------|
| ADR-001 | Monolito modular | [ADR-001](../adr/ADR-001-monolito-modular.md) |
| ADR-002 | PostgreSQL | [ADR-002](../adr/ADR-002-postgresql.md) |
| ADR-003 | Offline del acceso | [ADR-003](../adr/ADR-003-estrategia-offline-acceso.md) |
| ADR-004 | Concurrencia de reservas | [ADR-004](../adr/ADR-004-concurrencia-reservas-canchas.md) |
| ADR-005 | NestJS, inyección y datos sin ORM | [ADR-005](../adr/ADR-005-backend-nestjs-ioc-datos.md) |
| ADR-006 | React y estado de sesión | [ADR-006](../adr/ADR-006-frontend-react-estado.md) |
| ADR-007 | Sincronización del terminal | [ADR-007](../adr/ADR-007-acceso-totp-cola-offline.md) |
| ADR-008 | Pruebas y umbral del 60 % | [ADR-008](../adr/ADR-008-pruebas-cobertura.md) |
| ADR-009 | Despliegue, Compose y reversión | [ADR-009](../adr/ADR-009-despliegue-contenedores-reversion.md) |
| ADR-010 | Token de pago, sin persistir la tarjeta | [ADR-010](../adr/ADR-010-tokenizacion-medios-de-pago.md) |
| ADR-011 | Supabase Auth con Nest como BFF | [ADR-011](../adr/ADR-011-bff-supabase-auth.md) |

### 1.2 Diagramas de la entrega

Hay 14 diagramas. La fuente editable está en `docs/diagramas/fuentes/` y el SVG en `docs/diagramas/img/`. El C4-4 de la jerarquía `PricingStrategy` no forma parte de esta entrega: los lineamientos lo dejan opcional. La estructura del patrón se lee en el diagrama de clases y en el código de la sección 4.1.

| # | Diagrama | Fuente | SVG |
|---|----------|--------|-----|
| 1 | C4-1 Contexto | [c4-1-contexto.mmd](../diagramas/fuentes/c4-1-contexto.mmd) | [svg](../diagramas/img/c4-1-contexto.svg) |
| 2 | C4-2 Contenedores | [c4-2-contenedores.mmd](../diagramas/fuentes/c4-2-contenedores.mmd) | [svg](../diagramas/img/c4-2-contenedores.svg) |
| 3 | C4-3 Canchas | [c4-3-canchas.mmd](../diagramas/fuentes/c4-3-canchas.mmd) | [svg](../diagramas/img/c4-3-canchas.svg) |
| 4 | C4-3 Acceso | [c4-3-acceso.mmd](../diagramas/fuentes/c4-3-acceso.mmd) | [svg](../diagramas/img/c4-3-acceso.svg) |
| 5 | Clases del dominio | [uml-clases-dominio.drawio](../diagramas/fuentes/uml-clases-dominio.drawio) | [svg](../diagramas/img/uml-clases-dominio.svg) |
| 6 | Secuencia reserva y pago | [sec-reserva-pago.mmd](../diagramas/fuentes/sec-reserva-pago.mmd) | [svg](../diagramas/img/sec-reserva-pago.svg) |
| 7 | Secuencia reserva concurrente | [sec-reserva-concurrente.mmd](../diagramas/fuentes/sec-reserva-concurrente.mmd) | [svg](../diagramas/img/sec-reserva-concurrente.svg) |
| 8 | Secuencia acceso offline | [sec-acceso-offline.mmd](../diagramas/fuentes/sec-acceso-offline.mmd) | [svg](../diagramas/img/sec-acceso-offline.svg) |
| 9 | Estados de la membresía | [est-membresia.mmd](../diagramas/fuentes/est-membresia.mmd) | [svg](../diagramas/img/est-membresia.svg) |
| 10 | Estados de la reserva | [est-reserva.mmd](../diagramas/fuentes/est-reserva.mmd) | [svg](../diagramas/img/est-reserva.svg) |
| 11 | Actividad lista de espera | [act-lista-espera.mmd](../diagramas/fuentes/act-lista-espera.mmd) | [svg](../diagramas/img/act-lista-espera.svg) |
| 12 | DER físico | [er-fisico.drawio](../diagramas/fuentes/er-fisico.drawio) | [svg](../diagramas/img/er-fisico.svg) |
| 13 | Despliegue | [dep-despliegue.drawio](../diagramas/fuentes/dep-despliegue.drawio) | [svg](../diagramas/img/dep-despliegue.svg) |
| 14 | Pipeline | [pipe-ci.drawio](../diagramas/fuentes/pipe-ci.drawio) | [svg](../diagramas/img/pipe-ci.svg) |

## 2. Los cinco módulos

La API se arma en [backend/src/app.module.ts](../../backend/src/app.module.ts). Los cinco módulos funcionales del enunciado ocupan estas carpetas. `ConfigModule`, `EventEmitterModule`, `SupabaseModule` y `HealthModule` son infraestructura compartida, no un sexto módulo de negocio. La web es una sola SPA ([ADR-006](../adr/ADR-006-frontend-react-estado.md)).

| Módulo | Responsabilidad | Carpeta |
|--------|-----------------|---------|
| M1 Usuarios y membresías | Login vía BFF, perfil, rol, sede de origen y vigencia de la membresía | [backend/src/usuarios/](../../backend/src/usuarios/) (`auth`, `perfiles`, `membresias`, `sedes`) |
| M2 Acceso | QR rotativo, check-in, presencia en una sola sede y cola del terminal. `GET /acceso/presencias` incluye `nombre` y `apellido` del perfil | [backend/src/acceso/](../../backend/src/acceso/) |
| M3 Clases | Agenda, inscripción, lista de espera y avisos cuando se libera un lugar | [backend/src/clases/](../../backend/src/clases/) |
| M4 Canchas | Canchas, grilla, precio, reserva y ciclo de la reserva | [backend/src/canchas/](../../backend/src/canchas/) |
| M5 Pagos | Cobro simulado de la reserva y token opaco | [backend/src/pagos/](../../backend/src/pagos/) |

M4 se parte en tres piezas que el C4-3 de canchas muestra juntas: el módulo de canchas, `precios/` y `reservas/`. Las registra el mismo `AppModule`.

## 3. Modelo de datos y persistencia

El almacén de negocio es PostgreSQL, administrado por Supabase. El motor está en [ADR-002](../adr/ADR-002-postgresql.md). Nest no usa ORM: los repositorios llaman a la API de Supabase y el SQL atómico vive en funciones de Postgres ([ADR-005](../adr/ADR-005-backend-nestjs-ioc-datos.md)).

Las migraciones, en orden, están en `supabase/migrations/`:

| Archivo | Qué introduce |
|---------|----------------|
| `20260915000000_fase_a_nucleo.sql` | Sedes, perfiles, rol |
| `20261005220000_membresias_clases.sql` | Membresías y clases |
| `20261006190000_notificaciones.sql` | Avisos de la lista de espera |
| `20261027200000_canchas_m4.sql` | Canchas, pico, reservas, `reservar_cancha` |
| `20261028210000_pagos_m5.sql` | Pagos |
| `20261031200000_confirmar_reserva_cancha.sql` | Confirmación de la reserva |
| `20261101200000_hold_reserva_pendiente.sql` | Hold de la reserva pendiente |
| `20261101210000_acceso_m2.sql` | Check-in y presencia (RN-01) |

Convenciones que el SQL ya usa:

- Tablas, columnas y funciones en `snake_case`, esquema `public`.
- Claves primarias `uuid`, default `gen_random_uuid()` cuando la fila nace en la base.
- Enums de Postgres (`tipo_cancha`, `estado_reserva_cancha`, `rol_usuario`). El tipo de cancha nace así en [20261027200000_canchas_m4.sql](../../supabase/migrations/20261027200000_canchas_m4.sql):

```sql
create type public.tipo_cancha as enum ('paddle', 'futbol5', 'otro');
```

- El precio de una reserva queda congelado en la fila: columna `precio` y `detalle jsonb` con las reglas aplicadas en ese momento. Un cambio posterior de tarifa no reescribe la reserva.
- La no sobreventa es un índice único parcial, no un `if` de la API:

```sql
create unique index reservas_cancha_sin_sobreventa
  on public.reservas_cancha (cancha_id, inicio)
  where estado in ('pendiente', 'confirmada');
```

El DER físico está en [er-fisico.drawio](../diagramas/fuentes/er-fisico.drawio).

## 4. Patrones de diseño

### 4.1 Strategy — precio dinámico de canchas

La interfaz está en [backend/src/canchas/precios/pricing.strategy.ts](../../backend/src/canchas/precios/pricing.strategy.ts). Cada regla tiene `nombre`, `aplica(ctx)` y `calcular(precio, ctx)`. El contexto (`ContextoPrecio`) trae el precio base de la cancha, el inicio del turno, si el cliente es socio activo, el porcentaje de descuento y la franja pico de la sede. No trae el deporte.

[PreciosService.calcular](../../backend/src/canchas/precios/precios.service.ts) filtra las estrategias con `aplica` y acumula `calcular` sobre `precioBase`. Al final redondea hacia arriba al peso (`Math.ceil`). El servicio no elige la regla con un `switch`.

La lista la arma la factory de [precios.module.ts](../../backend/src/canchas/precios/precios.module.ts), inyectada con el token `PRICING_STRATEGIES`. El orden de hoy es el orden de la acumulación:

1. `StandardPricing` — siempre aplica y deja el precio base de la cancha.
2. `PeakHourPricing` — recargo si el turno cae en la franja pico de la sede, en hora de `America/Argentina/Buenos_Aires`.
3. `MemberDiscountPricing` — descuento si `esSocioActivo` y el porcentaje es mayor a cero. Un socio vencido no entra: paga como externo (RN-03).

El descuento va último porque `calcular` recibe el precio que dejaron las reglas anteriores. Una regla nueva se inserta en esa lista. La sección 7.2 recorre ese cambio.

### 4.2 Observer — lista de espera de clases

[ListaEsperaPublisher](../../backend/src/clases/notificaciones/lista-espera.publisher.ts) emite `LUGAR_LIBERADO` con `EventEmitter2` por cada lugar liberado. No importa a los observadores. Ellos se suscriben con `@OnEvent(LUGAR_LIBERADO, { async: true })` y corren después de que el publicador vuelve:

| Observador | Qué hace |
|------------|----------|
| [InAppObserver](../../backend/src/clases/notificaciones/observers/in-app.observer.ts) | Persiste el aviso para el portal |
| [EmailSimuladoObserver](../../backend/src/clases/notificaciones/observers/email-simulado.observer.ts) | Registra el mail si el perfil lo tiene activado. El envío real queda fuera de esta entrega |
| [LogObserver](../../backend/src/clases/notificaciones/observers/log.observer.ts) | Deja el evento en el log |

La actividad de la lista está en [act-lista-espera.mmd](../diagramas/fuentes/act-lista-espera.mmd).

### 4.3 Repository — persistencia

[SupabaseRepository](../../backend/src/supabase/supabase.repository.ts) es la plantilla: cada repositorio de dominio define `table` y usa `from()`, `rpc()` y `unwrap()`. El cliente de Supabase no se usa fuera de esa capa. El comentario del archivo lo fija.

Repositorios concretos: `SedesRepository`, `PerfilesRepository`, `MembresiasRepository`, `ClasesRepository`, `CanchasRepository`, `ReservasCanchaRepository`, `PagosRepository`, `AccesoRepository`, `NotificacionesRepository`, `PreferenciasRepository` y `PerfilesRolRepository`.

Diagrama de clases del patrón: [uml-clases-dominio.drawio](../diagramas/fuentes/uml-clases-dominio.drawio) (página 4) y [uml-clases-dominio.svg](../diagramas/img/uml-clases-dominio.svg) (zona inferior «Repository — patrón GoF»).

Lo que tiene que ser atómico (reservar cancha, check-in, inscripción) no es un `select` seguido de un `insert` en el repositorio: es una función SQL invocada por RPC. La reserva entra por `reservar_cancha` (sección 5).

### 4.4 Patrones estructurales y de ciclo de vida

Estos tres están en el código. La factory de `precios.module.ts` es el contenedor de Nest armando la lista de estrategias. No hay un Factory GoF aparte.

**Facade.** [ReservasCanchaService](../../backend/src/canchas/reservas/reservas-cancha.service.ts) es el caso de uso «reservar cancha». `reservar` valida, pide el precio a `PreciosService`, llama al RPC y devuelve la reserva en `pendiente`. Quien reserva no habla con el repositorio, con las estrategias ni con la pasarela por separado. La secuencia está en [sec-reserva-pago.mmd](../diagramas/fuentes/sec-reserva-pago.mmd).

**State.** El ciclo de la reserva está en [backend/src/canchas/reservas/estado/](../../backend/src/canchas/reservas/estado/). `EstadoReserva` declara `pagar` y `cancelar`. Los estados concretos son `PendienteDePago`, `Confirmada` y `Cancelada`. `Reserva.desdeFila` reconstruye el estado desde el enum SQL. Un estado terminal rechaza la acción que no le corresponde. El diagrama es [est-reserva.mmd](../diagramas/fuentes/est-reserva.mmd).

**Puerto de cobro.** [pasarela-pago.ts](../../backend/src/pagos/pasarela-pago.ts) define `PasarelaPago` y el token `PASARELA_PAGO`. El servicio de reservas depende de ese puerto. En esta entrega la implementación es el simulacro (`tok_ok`, `tok_fail`). La tarjeta no se persiste ([ADR-010](../adr/ADR-010-tokenizacion-medios-de-pago.md)).

## 5. Control de concurrencia en las reservas

Dos socios pueden pedir el mismo turno. Exactamente uno queda con la reserva (RN-02). El relato completo, con las alternativas descartadas, está en [ADR-004](../adr/ADR-004-concurrencia-reservas-canchas.md). La secuencia de los dos actores está en [sec-reserva-concurrente.mmd](../diagramas/fuentes/sec-reserva-concurrente.mmd).

El camino en el código:

1. Nest calcula el precio con Strategy y lo manda ya resuelto. La base no recalcula la tarifa.
2. `ReservasCanchaRepository` llama a `reservar_cancha` ([20261027200000_canchas_m4.sql](../../supabase/migrations/20261027200000_canchas_m4.sql), hold en [20261101200000_hold_reserva_pendiente.sql](../../supabase/migrations/20261101200000_hold_reserva_pendiente.sql)).
3. La función toma `SELECT … FROM canchas WHERE id = p_cancha_id FOR UPDATE`, valida horario, mantenimiento y horizonte, y recién ahí inserta.
4. Si dos transacciones pasan el lock, el índice `reservas_cancha_sin_sobreventa` deja una sola fila en `pendiente` o `confirmada` para ese `(cancha_id, inicio)`.
5. La violación de unicidad se traduce a `TURNO_OCUPADO`. [ReservasCanchaService](../../backend/src/canchas/reservas/reservas-cancha.service.ts) lo mapea a HTTP 409. El perdedor no recibe una segunda confirmación.

Una reserva `pendiente` ocupa el mismo índice durante la ventana de hold. La función limpia las pendientes vencidas de ese turno antes de insertar.

## 6. Arquitectura offline del control de acceso

Hay dos decisiones. [ADR-003](../adr/ADR-003-estrategia-offline-acceso.md) dice qué se hace cuando cae la red. [ADR-007](../adr/ADR-007-acceso-totp-cola-offline.md) dice qué guarda el navegador, cuándo lo manda y cómo se resuelve el choque. Los diagramas que las dibujan son [c4-3-acceso.mmd](../diagramas/fuentes/c4-3-acceso.mmd) y [sec-acceso-offline.mmd](../diagramas/fuentes/sec-acceso-offline.mmd).

Qué corre hoy:

- El socio pide el código al portal. `TotpService` lo genera en la API (`GET /acceso/totp/me/codigo`). El navegador del socio muestra el QR.
- Con red, recepción llama a la API y el check-in entra por `registrar_check_in`. La clave de `presencias` impone una sola sede a la vez (RN-01), en [20261101210000_acceso_m2.sql](../../supabase/migrations/20261101210000_acceso_m2.sql).
- Sin red, la web de recepción no valida membresía, TOTP ni RN-01. Guarda el ingreso en `localStorage`, clave `fitzone.acceso.cola`, con `clientEventId`, `perfilId`, `code`, `sedeId` y `ocurrioEn`.
- La cola sale cuando el navegador dispara `online` o cuando recepción sincroniza. El POST es `/acceso/check-ins/sync`, de a lo sumo 50 ítems.
- En el servidor, el mismo `clientEventId` es idempotente. El ítem nuevo pasa por membresía, TOTP y `registrar_check_in`. Si la presencia ya existe, la base responde `YA_DENTRO` o `YA_EN_OTRA_SEDE`. El ítem queda en la cola con error. La presencia anterior no se cierra sola.

Queda fuera de esta entrega, y así lo registran los dos ADR: el paquete de seeds TOTP en la sede, un servicio local por sede, la validación del QR sin API, los tornos y la app móvil instalable. Hasta el sync, el aforo no cuenta a quien está solo en la cola. Un código de 60 segundos puede vencer mientras el puesto sigue offline, y el sync lo rechaza.

## 7. Guía de extensión

Los dos casos se resuelven por caminos distintos. Agregar tenis no pide una estrategia nueva. Agregar una estrategia no pide un deporte nuevo.

El precio de una cancha es `canchas.precio_hora`. `ContextoPrecio` no tiene tipo de deporte. `StandardPricing`, `PeakHourPricing` y `MemberDiscountPricing` se aplican igual a paddle, fútbol 5 o cualquier tipo que se sume. `reservar_cancha` bloquea por `cancha_id` e `inicio`, no por deporte.

### 7.1 Caso resuelto: agregar canchas de tenis

Hoy el deporte no existe. El enum SQL y los tres tipos del código son `paddle`, `futbol5` y `otro`:

- [supabase/migrations/20261027200000_canchas_m4.sql](../../supabase/migrations/20261027200000_canchas_m4.sql) (`create type public.tipo_cancha`)
- [backend/src/canchas/cancha.model.ts](../../backend/src/canchas/cancha.model.ts) (`TipoCancha`)
- [backend/src/canchas/cancha.dto.ts](../../backend/src/canchas/cancha.dto.ts) (`TIPOS_CANCHA`, que Swagger publica)
- [frontend/src/services/canchas.ts](../../frontend/src/services/canchas.ts) (`TipoCancha`)

La defensa pide el valor `tenis`. El valor `otro` ya está y no cubre ese pedido.

El recorrido no toca `PreciosService`, `PricingStrategy`, `ReservasCanchaService` ni `reservar_cancha`.

**Paso 1. Migración que solo agrega el valor.**

Archivo nuevo, por ejemplo `supabase/migrations/20261111190000_tipo_cancha_tenis.sql`:

```sql
alter type public.tipo_cancha add value 'tenis';
```

Ese archivo no inserta la cancha. PostgreSQL no deja usar un valor de enum recién agregado en la misma transacción que lo crea. El `INSERT` va en el seed, que corre después de que la migración quedó commiteada. Las migraciones de este repo avanzan una sola vez: si el valor ya existe, la sentencia falla, y no se vuelve a correr el archivo.

**Paso 2. Los tres tipos del código.**

En `cancha.model.ts`:

```typescript
export type TipoCancha = 'paddle' | 'futbol5' | 'otro' | 'tenis';
```

En `cancha.dto.ts`, el arreglo que alimenta el enum de Swagger:

```typescript
export const TIPOS_CANCHA: readonly TipoCancha[] = [
  'paddle',
  'futbol5',
  'otro',
  'tenis',
] as const;
```

En `frontend/src/services/canchas.ts`:

```typescript
export type TipoCancha = "paddle" | "futbol5" | "otro" | "tenis";
```

El portal no tiene un mapa de etiquetas por deporte. Las pantallas que muestran `tipo` van a renderizar el string que devuelva la API. Con el union actualizado, TypeScript acepta `'tenis'`.

**Paso 3. Una cancha en el seed.**

En [backend/scripts/seed-demo.ts](../../backend/scripts/seed-demo.ts), al lado de `CANCHA_PADDLE_ID` y `CANCHA_FUTBOL_ID`:

```typescript
const CANCHA_TENIS_ID = 'a3000000-0000-4000-8000-000000000003';
```

Dentro del `upsert` de `seedCanchas`, una fila más. El precio es el de esa cancha, no una regla de tenis:

```typescript
{
  id: CANCHA_TENIS_ID,
  sede_id: SEDE_CENTRAL_ID,
  tipo: 'tenis',
  nombre: 'Tenis 1',
  precio_hora: 22000,
  activa: true,
},
```

Desde `backend/`, con la migración ya aplicada: `npm run seed`.

**Paso 4. Cómo se verifica.**

1. `GET /canchas/disponibilidad` de la sede Central lista «Tenis 1» con `tipo: "tenis"` y `precioHora: 22000`.
2. Un turno fuera de pico, para un externo, cotiza 22000. Ese número sale de `precio_hora` más `StandardPricing`.
3. El mismo turno en la franja pico, para un socio activo, aplica pico y descuento de socio sobre 22000. Las tres estrategias registradas no se modificaron.
4. `POST` de reserva de esa cancha entra por `reservar_cancha` igual que una de paddle. Un segundo intento del mismo inicio responde `TURNO_OCUPADO`.

### 7.2 Caso resuelto: agregar una estrategia de precio

El ejemplo es un recargo de fin de semana del 10 %. Cabe en el `ContextoPrecio` actual: el día se lee de `inicio`, en `America/Argentina/Buenos_Aires`, igual que [PeakHourPricing](../../backend/src/canchas/precios/strategies/peak-hour-pricing.strategy.ts). No hace falta una columna nueva. El 10 % vive en la clase, como constante del ejemplo. Un porcentaje configurable por sede sería otra tabla y otro campo del contexto, y queda fuera de este caso.

`PreciosService.calcular` y la firma de `PricingStrategy` quedan como están.

**Paso 1. La clase.**

Archivo nuevo `backend/src/canchas/precios/strategies/weekend-surcharge-pricing.strategy.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { ContextoPrecio, PricingStrategy } from '../pricing.strategy';

const ZONA_ARGENTINA = 'America/Argentina/Buenos_Aires';
/** Ejemplo de la guía de extensión. No sale de una tabla. */
const RECARGO_FIN_DE_SEMANA_PCT = 10;

/**
 * Recargo de sábado y domingo (días ISO 6 y 7) en hora de Argentina.
 * Caso resuelto del manual técnico, sección 7.2.
 */
@Injectable()
export class WeekendSurchargePricing implements PricingStrategy {
  readonly nombre = 'WeekendSurchargePricing';

  aplica(ctx: ContextoPrecio): boolean {
    const dia = diaIsoArgentina(ctx.inicio);
    return dia === 6 || dia === 7;
  }

  calcular(precio: number, _ctx: ContextoPrecio): number {
    return precio * (1 + RECARGO_FIN_DE_SEMANA_PCT / 100);
  }
}

function diaIsoArgentina(inicio: Date | string): number {
  const fecha = inicio instanceof Date ? inicio : new Date(inicio);
  const weekday =
    new Intl.DateTimeFormat('en-US', {
      timeZone: ZONA_ARGENTINA,
      weekday: 'short',
    })
      .formatToParts(fecha)
      .find((parte) => parte.type === 'weekday')?.value ?? '';

  const mapa: Record<string, number> = {
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
    Sun: 7,
  };
  return mapa[weekday] ?? 0;
}
```

**Paso 2. Registrarla en la factory.**

En [precios.module.ts](../../backend/src/canchas/precios/precios.module.ts) se importa la clase, se declara como provider y se inserta en la lista. El orden importa. `StandardPricing` va primero porque pisa el acumulado con `precioBase`. El descuento de socio va último porque multiplica lo que ya sumaron pico y fin de semana.

```typescript
import { WeekendSurchargePricing } from './strategies/weekend-surcharge-pricing.strategy';

// providers: StandardPricing, PeakHourPricing, WeekendSurchargePricing,
// MemberDiscountPricing, y la factory:

{
  provide: PRICING_STRATEGIES,
  useFactory: (
    standard: StandardPricing,
    peak: PeakHourPricing,
    weekend: WeekendSurchargePricing,
    memberDiscount: MemberDiscountPricing,
  ): PricingStrategy[] => [standard, peak, weekend, memberDiscount],
  inject: [
    StandardPricing,
    PeakHourPricing,
    WeekendSurchargePricing,
    MemberDiscountPricing,
  ],
},
```

Un sábado a las 19:00, con pico del 20 % y socio activo al 15 %, el acumulado queda `precioBase × 1,20 × 1,10 × 0,85`. El redondeo al peso lo sigue haciendo `PreciosService`.

**Paso 3. El test.**

En [precios.service.spec.ts](../../backend/src/canchas/precios/precios.service.spec.ts). El archivo ya fija que el 2026-10-06 es martes y el 2026-10-10 es sábado. El 2026-10-07 es miércoles.

Sobre la clase, el miércoles no aplica y el sábado sí:

```typescript
const MIERCOLES_17_HS = '2026-10-07T17:00:00-03:00';
const strategy = new WeekendSurchargePricing();

expect(strategy.aplica(crearContexto({ inicio: MIERCOLES_17_HS }))).toBe(false);
expect(strategy.aplica(crearContexto({ inicio: SABADO_19_HS }))).toBe(true);
expect(strategy.calcular(20_000, crearContexto({ inicio: SABADO_19_HS }))).toBe(22_000);
```

Sobre el servicio, el caso que ya existe —«Externo sábado 19:00 no paga recargo porque sábado no aplica ($20.000)»— usa una franja pico de lunes a viernes. El pico no entra. Con la estrategia registrada, ese sábado pasa de 20000 a 22000 (`20000 × 1,10`) y `reglasAplicadas` incluye `WeekendSurchargePricing`. Hay que actualizar esa expectativa. Los casos de martes no cambian: el miércoles y el martes dejan `aplica` en falso.

**Paso 4. Qué queda igual.**

`PreciosService.calcular` sigue filtrando `aplica` y acumulando `calcular`. La interfaz `PricingStrategy` no gana métodos. `reservar_cancha` sigue recibiendo el precio ya calculado. Tennis y este recargo no se necesitan el uno al otro: una cancha de tenis de fin de semana tomaría el 10 % porque el turno cae sábado o domingo, no porque el tipo sea `tenis`.

## 8. Pruebas: cómo correrlas y cómo leer la cobertura

La pirámide y el umbral están en [ADR-008](../adr/ADR-008-pruebas-cobertura.md). Resumen operativo:

| Capa | Dónde | Cómo se corre |
|------|--------|----------------|
| Unitarios | `backend/src/**/*.spec.ts` | Desde `backend/`: `npm test` |
| Cobertura | El mismo conjunto, con `collectCoverageFrom` de [jest.config.ts](../../backend/jest.config.ts) | `npm run test:cov` |
| HTTP | `backend/test/**/*.e2e-spec.ts` | `npm run test:e2e` |
| SQL de no sobreventa | [supabase/tests/canchas_m4.test.sql](../../supabase/tests/canchas_m4.test.sql) | `psql` contra un PostgreSQL local, en el orden de migraciones que el propio archivo declara. El encabezado prohíbe ejecutarlo en Supabase |

El umbral de esta entrega es **60 % de sentencias** sobre el código de `src/` que Jest recolecta. Quedan fuera del porcentaje los módulos, DTO, modelos, decoradores, specs, `main.ts` y `swagger.ts`. El reporte sale en `backend/coverage/` (HTML en `coverage/lcov-report/index.html`). Esa carpeta no se versiona.

`npm test` es el comando de los unitarios. `npm run test:cov` es el que se compara con el 60 %. Una línea del resumen de Jest, `Statements`, es el número del ADR. Por debajo de 60 % no se baja el umbral en el ADR: se agregan tests o se supera el ADR con uno nuevo.

El CI de la sección 9 corre lint, `npm test -- --runInBand` y el build. No publica cobertura, no corre `test:e2e` y no corre el script SQL. `coverageThreshold` todavía no está en `jest.config.ts`. Ese cierre es la tarea C-10, no este manual. El frontend no tiene script de tests.

## 9. Pipeline de integración y entrega continuas

El workflow es [.github/workflows/ci-backend.yml](../../.github/workflows/ci-backend.yml). El dibujo es [pipe-ci.drawio](../diagramas/fuentes/pipe-ci.drawio).

Se dispara en un pull request hacia `desarrollo`. Los pasos, en el directorio `backend/`:

1. Checkout.
2. Node.js 24, con caché de `backend/package-lock.json`.
3. `npm ci`.
4. `npm run lint` (oxlint).
5. `npm test -- --runInBand`.
6. `npm run build` (`nest build`).

El job define `NODE_OPTIONS=--experimental-vm-modules` y claves de Supabase de mentira, para que los módulos que leen `process.env` al arrancar no fallen el build. No hay secretos reales en el workflow.

Ese pipeline no despliega a Vercel ni a Render. El mapa de la demo y la reversión (revertir el commit, promover el deployment anterior en Vercel, volver al deploy anterior en Render) están en [ADR-009](../adr/ADR-009-despliegue-contenedores-reversion.md). El Compose de la entrega lo cierra C-07. Este workflow no lo ejecuta.

## 10. Convenciones de código, ramas y commits

Lo que el repositorio ya hace:

- Un módulo Nest por carpeta de dominio (`usuarios`, `acceso`, `clases`, `canchas`, `pagos`), registrado en `app.module.ts`.
- Las estrategias de precio viven en `backend/src/canchas/precios/strategies/`, una clase por archivo, nombre `*-pricing.strategy.ts`.
- El SQL de esquema vive en `supabase/migrations/`, con prefijo `AAAAMMDDHHMMSS_`. Una migración avanza. No se reescribe una ya aplicada.
- La rama de trabajo es distinta de `desarrollo`. El pull request apunta a `desarrollo`, que es la rama que dispara el CI.
- El mensaje de commit nombra la tarjeta del tablero (`C-18`, `S4-T01`, `S7-T02b`) y dice qué quedó cerrado. El historial de la entrega pide mensajes con esa referencia.

El equipo no tiene escrita una guía Conventional Commits. Un mensaje se lee por la tarjeta y por la frase, no por un prefijo `feat:` o `fix:`.
