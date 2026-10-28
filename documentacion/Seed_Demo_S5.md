# Seed mínimo de demo (S5)

**Estado:** versionado en el repo  
**Script:** [`backend/scripts/seed-demo.ts`](../backend/scripts/seed-demo.ts)  
**Referencia:** [Propuesta de continuación](./Propuesta_Continuacion_Semanas.md) §4 ítem 3

Carga datos de demo para que el equipo pruebe login, sedes y canchas sin inventar filas a mano. Es idempotente: se puede correr más de una vez.

## Requisitos

1. Migraciones aplicadas en el Supabase de desarrollo hasta M4 (`20261027200000_canchas_m4.sql`). La de pagos M5 (`20261028210000_pagos_m5.sql`) no es requerida por este seed.
2. En `backend/.env` (ver [`.env.example`](../backend/.env.example)):
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SEED_PASSWORD` (contraseña común de los usuarios demo; no va en el repo)

## Cómo correr

```bash
cd backend
npm run seed
```

En Windows, si Node falla con error de certificado TLS (`UNABLE_TO_VERIFY_LEAF_SIGNATURE`), el script `npm run seed` ya usa `--use-system-ca`.

## Usuarios

Contraseña: la de `SEED_PASSWORD`.

| Email | Rol | Notas |
|-------|-----|--------|
| `gerente@fitzone.com` | `gerente` | Mismo email que el seed documentado en S3-T06 §7 |
| `admin.central@fitzone.com` | `admin_sede` | Ligado a FitZone Central en `admins_sede` |
| `socio@fitzone.com` | `socio` | Membresía mensual `activo` del mes corriente (DNI `30000001`) |
| `externo@fitzone.com` | `externo` | Sin membresía |

Si el usuario Auth ya existe, el script reutiliza el id y actualiza la contraseña a `SEED_PASSWORD`.

## Datos públicos

| Tabla | Contenido |
|-------|-----------|
| `sedes` | FitZone Central, FitZone Norte (UUIDs fijos) |
| `configuracion_pico` | Creada por el trigger al insertar sedes |
| `perfiles` | Los 4 roles de arriba |
| `admins_sede` | Admin → Central |
| `membresias` | Una `activo` del socio (no inserta otra si ya hay) |
| `canchas` | Paddle 1 en Central ($20000/h), Fútbol 5 1 en Norte ($25000/h) |

No carga clases ni reservas.

## Verificación

1. `npm run seed` dos veces seguidas sin error.
2. En Supabase: 2 sedes del seed, 2 canchas, 4 perfiles, 1 membresía activa del socio, 1 fila en `admins_sede`.
3. Login con cada email + `SEED_PASSWORD` vía `POST /auth/login`.
4. `GET /sedes` responde con las sedes del seed.

## UUIDs fijos

| Entidad | Id |
|---------|-----|
| Sede Central | `a1000000-0000-4000-8000-000000000001` |
| Sede Norte | `a1000000-0000-4000-8000-000000000002` |
| Cancha paddle | `a3000000-0000-4000-8000-000000000001` |
| Cancha fútbol 5 | `a3000000-0000-4000-8000-000000000002` |

Los ids de `perfiles` son los de `auth.users` (no fijos).
