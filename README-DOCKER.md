# FitZone Sports — Despliegue con Docker

Este documento explica cómo levantar el proyecto con Docker Compose y cuáles son sus limitaciones.

## Arquitectura de los contenedores

| Servicio | Imagen | Puerto | Notas |
|----------|--------|--------|-------|
| `db` | `postgres:15-alpine` | 5432 | **Ornamental / referencia.** No es usado por el backend en runtime. Se incluye solo para ejecutar las migraciones SQL de `supabase/migrations/` si se desea inspeccionar el esquema localmente. |
| `backend` | `node:20-alpine` (build NestJS) | 3000 | API NestJS. Requiere credenciales reales de Supabase en `.env`. |
| `frontend` | `nginx:alpine` (build Vite) | 80 | React + Vite servido por nginx. Apunta al backend vía `VITE_API_URL`. |
| `seed` | `node:20-alpine` (build NestJS) | — | Servicio one-off. Ejecuta `npm run seed:entrega` (C-08: ≥25 sedes, canchas, clases y 4 roles). No queda ejecutándose (`restart: "no"`). |

## Requisito indispensable: credenciales de Supabase

El backend de FitZone Sports **no usa PostgreSQL local en runtime**. Se conecta a **Supabase (nube)** a través de:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY`

Sin estas credenciales reales en un archivo `.env`, **el backend no puede conectar a Supabase y el seed fallará.**

### Pasos previos

1. Copiar la plantilla:
   ```bash
   cp .env.docker.example .env
   ```

2. Editar `.env` y completar al menos:
   - `SUPABASE_URL` (ej. `https://abcdefgh.supabase.co`)
   - `SUPABASE_SERVICE_ROLE_KEY` (clave service_role de Supabase)
   - `SUPABASE_ANON_KEY` (clave anon/public de Supabase)
   - Opcionalmente `SEED_PASSWORD` (por defecto `fitzone-demo`)

### Si la máquina tiene Avast con escaneo HTTPS

Avast firma el tráfico con una CA propia, distinta en cada PC. El certificado de otra máquina no sirve y no va en el repositorio. Sin el de esa PC, `npm ci` y las llamadas del backend a Supabase fallan dentro de Docker con `UNABLE_TO_VERIFY_LEAF_SIGNATURE`.

En Windows, desde la raíz del repositorio:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/exportar-ca-avast.ps1
```

Eso escribe `backend/certs/extra-ca.crt` y `frontend/certs/extra-ca.crt` (ambos en `.gitignore`). Los Dockerfiles los usan solo si el archivo existe. Después hay que reconstruir: `docker compose up --build`.

Si el script dice que no hay CA de Avast, no hay nada que hacer. Si el escaneo HTTPS está apagado en Avast, tampoco.

A mano, el mismo archivo se saca de `certmgr.msc` → Entidades de certificación raíz de confianza → `Avast Web/Mail Shield Root` → Exportar → X.509 codificado en Base-64 (`.cer`). Hay que dejar una copia con el nombre `extra-ca.crt` en `backend/certs/` y otra en `frontend/certs/`.

## Comandos de uso

### 1. Construir y levantar todos los servicios

```bash
docker compose up --build
```

Esto crea e inicia `db`, `backend` y `frontend`. El servicio `db` puede fallar al aplicar algunas migraciones (porque están escritas para Supabase, no para PostgreSQL vanilla), pero eso **no afecta** al backend ni al frontend.

### 2. Ejecutar el seed de entrega (una sola vez)

```bash
docker compose --profile seed run --rm seed
```

Este servicio depende de que `backend` ya esté levantado y de que las credenciales de Supabase estén correctas en `.env`. Carga:
- 25 sedes con canchas y clases
- 4 perfiles con roles (gerente, admin_sede, socio, externo)

### 3. Detener todo

```bash
docker compose down
```

## Acceso una vez levantado

- Frontend: `http://localhost:80`
- Backend API: `http://localhost:3000` (Swagger disponible)
- Base de datos local (ornamental): `localhost:5432` (`postgres` / `postgres` / `fitzone`)

## Limitaciones conocidas

1. **`db` es ornamental.** Las migraciones en `supabase/migrations/` usan `gen_random_uuid()` (requiere `pgcrypto`) y referencian `auth.users` (schema de Supabase), por lo que pueden fallar en un PostgreSQL vanilla. Esto no afecta el funcionamiento del sistema porque el backend opera contra Supabase en la nube.

2. **Supabase es obligatorio.** No se puede ejecutar el seed ni usar el backend sin credenciales reales de Supabase. El archivo `.env` no se commitea; cada entorno debe proveer el suyo.

3. **El frontend se comunica con el backend** a través de la URL definida en `VITE_API_URL` (por defecto `http://backend:3000` dentro de la red de Docker, o `http://localhost:3000` desde el host).

## Archivos relacionados

- `backend/Dockerfile` — Imagen del backend (NestJS).
- `frontend/Dockerfile` — Imagen del frontend (React + Vite + nginx).
- `docker-compose.yml` — Orquestación de servicios.
- `.env.docker.example` — Plantilla de variables de entorno (copiar a `.env`).