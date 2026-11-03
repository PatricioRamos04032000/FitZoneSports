# Seed mínimo de demo (S5)

**Estado:** versionado en el repo  
**Script:** [`backend/scripts/seed-demo.ts`](../backend/scripts/seed-demo.ts)  
**Referencia:** [Propuesta de continuación](./Propuesta_Continuacion_Semanas.md) §4 ítem 3

Carga datos de demo para que el equipo pruebe login, sedes y canchas sin inventar filas a mano. Es idempotente: se puede correr más de una vez.

**Seed vs registro (S6-T02):** el seed crea usuarios **ya confirmados** (atajo de demo: `socio@fitzone.com`, etc.). Las altas reales de la app van por `POST /auth/register` (mail de confirmación de Supabase Auth + perfil `externo`).

## Requisitos

1. Migraciones aplicadas en el Supabase de desarrollo hasta M4 (`20261027200000_canchas_m4.sql`). Para el seed TOTP del socio hace falta Acceso M2 (`20261101210000_acceso_m2.sql`). Pagos M5 y hold de reserva no son requeridos por este seed.
2. En `backend/.env` (ver [`.env.example`](../backend/.env.example)):
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_ANON_KEY` (también para la API Nest; el seed usa service role)
   - `SEED_PASSWORD` (contraseña común de los usuarios demo; no va en el repo)
3. Para el registro por API: en el dashboard Supabase, **Authentication → Providers → Email → Confirm email** activado. Site URL / Redirect URLs según el front. Plantilla custom de mail: solo plan Pro; en free va la default (rate limit de mails).
4. En Windows, arrancar Nest con `npm run start:dev` (usa CA del sistema; si no, `fetch failed` contra Supabase).

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
| `socio@fitzone.com` | `socio` | Membresía mensual `activo` del mes corriente (DNI `30000001`); seed TOTP demo (ver abajo) |
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
| `totp_seeds` | 1 fila del socio: secreto base32 `JBSWY3DPEHPK3PXP` (período **60 s**, ventana ±1). Sigue en claro en `seed_cifrado` para demo; Nest lee plaintext o `enc:v1:…` si se emitió con `TOTP_SEED_ENCRYPTION_KEY` |

No carga clases, reservas, `presencias` ni `check_ins`.

## Verificación

1. `npm run seed` dos veces seguidas sin error.
2. En Supabase: 2 sedes del seed, 2 canchas, 4 perfiles, 1 membresía activa del socio, 1 fila en `admins_sede`, **1 fila en `totp_seeds` del socio**.
3. Login con cada email + `SEED_PASSWORD` vía `POST /auth/login`.
4. `GET /sedes` responde con las sedes del seed.

### TOTP demo (M2 / S8-T1)

| Campo | Valor |
|-------|--------|
| Socio | `socio@fitzone.com` |
| Secreto base32 | `JBSWY3DPEHPK3PXP` |
| Período | 60 segundos |

Sirve para probar códigos con cualquier generador TOTP (o Nest en Fase 2) sin inventar seeds a mano.

## UUIDs fijos

| Entidad | Id |
|---------|-----|
| Sede Central | `a1000000-0000-4000-8000-000000000001` |
| Sede Norte | `a1000000-0000-4000-8000-000000000002` |
| Cancha paddle | `a3000000-0000-4000-8000-000000000001` |
| Cancha fútbol 5 | `a3000000-0000-4000-8000-000000000002` |

Los ids de `perfiles` son los de `auth.users` (no fijos).
