# FitZone Sports

Plataforma integral de gestión para una cadena de gimnasios (25+ sedes) que unifica horarios de gimnasio, clases grupales y alquiler de canchas.

- **Frontend:** React 19 + TypeScript + Vite
- **Backend:** NestJS 12 + TypeScript (monolito modular, BFF)
- **Base de datos:** PostgreSQL en Supabase
- **Autenticación:** Supabase Auth (JWT ES256)
- **Despliegue:** Frontend en Vercel, Backend en Render, BD en Supabase

---

## Tabla de contenidos

1. [Requisitos previos](#1-requisitos-previos)
2. [Clonar el repositorio](#2-clonar-el-repositorio)
3. [Configuración de variables de entorno (.env)](#3-configuración-de-variables-de-entorno-env)
4. [Levantar el Backend en local](#4-levantar-el-backend-en-local)
5. [Levantar el Frontend en local](#5-levantar-el-frontend-en-local)
6. [Guía de demostración](#6-guía-de-demostración)
7. [Comandos útiles](#7-comandos-útiles)
8. [Estructura del proyecto](#8-estructura-del-proyecto)
9. [Tecnologías y dependencias](#9-tecnologías-y-dependencias)
10. [Pruebas](#10-pruebas)
11. [Notas importantes](#11-notas-importantes)

---

## 1. Requisitos previos

Antes de comenzar, asegúrate de tener instalado lo siguiente:

| Herramienta | Versión mínima | Propósito |
|-------------|----------------|-----------|
| Node.js | v20 o superior | Entorno de ejecución para backend y frontend |
| npm | v10 o superior | Gestor de paquetes (incluido con Node.js) |
| Git | Cualquier versión reciente | Clonar el repositorio |
| Acceso a Supabase | Proyecto activo | Base de datos y autenticación |

Puedes verificar las versiones instaladas ejecutando:

```bash
node --version
npm --version
git --version
```

---

## 2. Clonar el repositorio

Abre una terminal y clona el repositorio:

```bash
git clone https://github.com/PatricioRamos04032000/FitZoneSports.git
cd FitZoneSports
```

El repositorio contiene tres carpetas principales:

```
FitZoneSports/
├── backend/       # API NestJS (monolito modular)
├── frontend/      # SPA React + Vite
└── documentacion/ # Documentación académica del proyecto
```

---

## 3. Configuración de variables de entorno (.env)

### 3.1 Backend (`backend/.env`)

El archivo `.env` es **local y no se comparte por el repositorio** (está en `.gitignore`). Debes crearlo manualmente en la carpeta `backend/`.

Copia la plantilla de ejemplo y completa con tus credenciales:

```bash
cd backend
cp .env.example .env
```

Luego edita `backend/.env` con los valores reales:

```env
PORT=3000

# URL del proyecto Supabase (Project Settings > API)
SUPABASE_URL=https://tu-proyecto.supabase.co/

# Clave secreta de servicio (Project Settings > API Keys > Service Role Key)
# SECRETA: nunca commitear este archivo
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui

# Orígenes del frontend habilitados por CORS, separados por coma
CORS_ORIGIN=http://localhost:5173

# Contraseña común de los usuarios del seed de demo (npm run seed)
SEED_PASSWORD=una_clave_de_demo
```

| Variable | Obligatoria | Descripción | Ejemplo |
|----------|-------------|-------------|---------|
| `PORT` | No | Puerto en el que escucha la API | `3000` |
| `SUPABASE_URL` | Sí | URL de tu proyecto Supabase | `https://xxxx.supabase.co/` |
| `SUPABASE_SERVICE_ROLE_KEY` | Sí | Clave secreta de servicio de Supabase | `sb_...` |
| `CORS_ORIGIN` | No | Orígenes permitidos para CORS | `http://localhost:5173` |
| `SEED_PASSWORD` | Solo para seed | Contraseña de usuarios demo (`npm run seed`) | (local, no commitear) |

> ⚠️ **Importante:** El archivo `.env` contiene credenciales sensibles. Nunca lo subas al repositorio. Está incluido en `.gitignore`.

### 3.2 Frontend (`frontend/.env.local`)

Crea el archivo `frontend/.env.local` con las variables necesarias para el frontend:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co/
VITE_SUPABASE_PUBLISHABLE_KEY=tu_anon_key_aqui
```

| Variable | Obligatoria | Descripción | Ejemplo |
|----------|-------------|-------------|---------|
| `VITE_SUPABASE_URL` | Sí | URL de tu proyecto Supabase | `https://xxxx.supabase.co/` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Sí | Clave pública (anon) de Supabase | `sb_publishable_...` o `sb_anon_...` |

> ⚠️ El archivo `.env.local` también es local y no se commitea.

---

## 4. Levantar el Backend en local

El backend es una API NestJS que sirve como BFF (Backend for Frontend) entre el frontend y Supabase.

### 4.1 Instalar dependencias

```bash
cd backend
npm install
```

### 4.2 Ejecutar en modo desarrollo (con recarga automática)

```bash
npm run start:dev
```

La API quedará disponible en: **`http://localhost:3000`**

### 4.3 Compilar para producción

```bash
npm run build
```

### 4.4 Ejecutar en producción (desde build)

```bash
npm run start:prod
```

### 4.5 Endpoints principales del backend

| Método | Endpoint | Autenticación | Descripción |
|--------|----------|---------------|-------------|
| `GET` | `/` | No | Hola Mundo (template) |
| `GET` | `/health` | No | Estado de la API |
| `GET` | `/api/docs` | No | Documentación Swagger |
| `POST` | `/auth/login` | No | Iniciar sesión (Supabase Auth) |
| `GET` | `/auth/me` | Sí (JWT) | Usuario autenticado + rol |
| `GET` | `/sedes` | No | Lista de sedes |
| `GET` | `/perfiles/me` | Sí (JWT) | Perfil del usuario autenticado |
| `PATCH` | `/perfiles/me` | Sí (JWT) | Actualizar perfil propio |
| `GET` | `/clases?sedeId=` | No | Clases con cupo por sede |
| `POST` | `/clases/inscripciones` | No | Inscribirse a una clase |
| `DELETE` | `/clases/inscripciones/:id` | No | Cancelar inscripción |
| `GET` | `/membresias` | No | Todas las membresías |
| `GET` | `/membresias/activas/:perfilId` | No | Membresía activa de un perfil |
| `POST` | `/membresias` | No | Crear membresía |
| `GET` | `/notificaciones` | Sí (JWT) | Notificaciones del usuario |
| `PATCH` | `/notificaciones/preferencias` | Sí (JWT) | Preferencias de notificación |
| `PATCH` | `/notificaciones/:id/leida` | Sí (JWT) | Marcar notificación como leída |

La lista completa y actualizada está en Swagger: **`http://localhost:3000/api/docs`**.

---

## 5. Levantar el Frontend en local

El frontend es una aplicación React (SPA) construida con Vite.

### 5.1 Instalar dependencias

```bash
cd frontend
npm install
```

### 5.2 Ejecutar en modo desarrollo

```bash
npm run dev
```

La aplicación quedará disponible en: **`http://localhost:5173`**

### 5.3 Compilar para producción

```bash
npm run build
```

### 5.4 Previsualizar build de producción

```bash
npm run preview
```

### 5.5 Rutas disponibles en el frontend

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/` | Home | Página de inicio |
| `/login` | Login | Formulario de inicio de sesión |
| `/perfil` | Perfil | Perfil del socio |
| `/canchas` | Canchas | Selección de sede, horario y canchas |

> ⚠️ **Nota:** El frontend actual contiene páginas placeholder (estáticas). Algunas páginas aún no están integradas con la API del backend.


---

## 6. Guía de demostración

Guía corta para mostrar el sistema en local (equipo, docente o Demo Day interno). Detalle del seed: [`documentacion/Seed_Demo_S5.md`](documentacion/Seed_Demo_S5.md).

### 6.1 Preparación (una vez)

1. Configurar `backend/.env` y `frontend/.env.local` (§3).
2. Tener aplicadas en Supabase las migraciones del repo (`supabase/migrations/`), al menos hasta canchas M4 para el seed.
3. Cargar datos de demo:

```bash
cd backend
npm run seed
```

Usuarios demo (contraseña = valor de `SEED_PASSWORD`):

| Email | Rol |
|-------|-----|
| `gerente@fitzone.com` | `gerente` |
| `admin.central@fitzone.com` | `admin_sede` |
| `socio@fitzone.com` | `socio` (con membresía activa) |
| `externo@fitzone.com` | `externo` |

El seed también crea 2 sedes (Central, Norte) y 2 canchas de ejemplo. Es idempotente: se puede correr más de una vez.

4. Levantar API y SPA en dos terminales:

```bash
# Terminal 1
cd backend && npm run start:dev

# Terminal 2
cd frontend && npm run dev
```

### 6.2 Smoke check (que el entorno vive)

| Paso | Qué hacer | Resultado esperado |
|------|-----------|--------------------|
| Health | `curl http://localhost:3000/health` | JSON con `"status": "ok"` |
| Swagger | Abrir `http://localhost:3000/api/docs` | UI de la API |
| Frontend | Abrir `http://localhost:5173` | Home de FitZone |
| Sedes | `GET /sedes` (browser, Swagger o curl) | Central y Norte del seed |

Ejemplo de health:

```bash
curl http://localhost:3000/health
```

```json
{
  "status": "ok",
  "timestamp": "2026-10-15T19:16:00.985Z",
  "uptime": 7.07
}
```

### 6.3 Demo por API (recomendado hoy)

La mayor parte de la lógica de negocio se demuestra por **Swagger** (`http://localhost:3000/api/docs`) o `curl`. Flujo sugerido (~5–10 min):

1. **Login socio** — `POST /auth/login` con `socio@fitzone.com` + `SEED_PASSWORD`. Copiar el `access_token`.
2. **Identidad** — `GET /auth/me` con header `Authorization: Bearer <token>`. Debe devolver el usuario y rol `socio`.
3. **Perfil** — `GET /perfiles/me` con el mismo token.
4. **Sedes** — `GET /sedes` (público).
5. **Membresía** — `GET /membresias/activas/:perfilId` usando el id del perfil del socio.
6. **Clases** — `GET /clases?sedeId=<uuid-sede>` (el seed no crea clases; si hay clases en la BD de desarrollo, se listan acá).
7. **Notificaciones** — `GET /notificaciones` con el token del socio.
8. **Cambio de rol** — repetir login con `gerente@fitzone.com` y `GET /auth/me` para mostrar el rol `gerente`.

Authorize en Swagger: botón **Authorize**, pegar el JWT (sin la palabra `Bearer` si el esquema ya la agrega; si pide el valor completo, usar `Bearer <token>` según indique la UI).

### 6.4 Demo por UI (estado actual del frontend)

Rutas disponibles: `/`, `/login`, `/perfil`, `/canchas`.

> El frontend todavía tiene páginas **placeholder** o parcialmente conectadas. Para una demo estable de negocio, priorizar Swagger (§6.3) y usar la UI como recorrido visual de la SPA.

Recorrido visual sugerido:

1. Home en `http://localhost:5173`
2. Login en `/login` (cuando esté cableado al BFF, usar un usuario del seed)
3. Navegación a `/perfil` y `/canchas` para mostrar el esqueleto multi-página

### 6.5 Qué no esperar aún en la demo

- Flujos completos de reserva de cancha / pago en la UI (módulos en evolución; precios Strategy están en backend bajo `canchas/precios`).
- App móvil ni check-in offline (Unidad VI / RNF-01).
- Que el seed cree clases o reservas (solo usuarios, sedes, membresía del socio y canchas).

---

## 7. Comandos útiles

### Backend (`backend/`)

```bash
npm install              # Instalar dependencias
npm run start:dev        # Modo desarrollo (watch)
npm run start:prod       # Modo producción (desde dist/)
npm run build            # Compilar TypeScript a JavaScript
npm run seed             # Cargar usuarios/sedes/canchas de demo
npm test                 # Ejecutar tests unitarios
npm run test:e2e         # Ejecutar tests end-to-end (Supertest)
npm run test:cov         # Tests con cobertura
npm run lint             # Linting con oxlint
npm run format           # Formatear con Prettier
```

### Frontend (`frontend/`)

```bash
npm install              # Instalar dependencias
npm run dev              # Servidor de desarrollo (Vite)
npm run build            # Compilar para producción
npm run preview          # Previsualizar build de producción
npm run lint             # Linting con ESLint
```


---

## 8. Estructura del proyecto

```
FitZoneSports/
├── backend/                      # API NestJS (monolito modular, BFF)
│   ├── src/
│   │   ├── main.ts               # Arranque: CORS, Swagger, puerto
│   │   ├── app.module.ts         # Módulo raíz
│   │   ├── cors.ts / swagger.ts  # CORS y docs OpenAPI
│   │   ├── supabase/             # Cliente Supabase + Repository + filtro de errores
│   │   ├── auth/                 # Login, JWT, guards, roles
│   │   ├── health/               # GET /health
│   │   ├── sedes/                # GET /sedes
│   │   ├── perfiles/             # GET/PATCH /perfiles/me
│   │   ├── notificaciones/       # In-app + Observer (lista de espera)
│   │   ├── membresias/           # Membresías del socio
│   │   ├── clases/               # Clases, cupos, inscripciones
│   │   └── canchas/
│   │       └── precios/          # Strategy de precios (M4)
│   ├── test/                     # Tests HTTP (Jest + Supertest)
│   ├── scripts/                  # seed-demo.ts (npm run seed)
│   ├── .env.example              # Plantilla de variables (sin secretos)
│   ├── jest.config.ts            # Coverage / unitarios
│   └── package.json
├── frontend/                     # SPA React + Vite
│   ├── src/
│   │   ├── main.tsx              # Entrada React
│   │   ├── App.tsx               # React Router
│   │   ├── pages/                # Home, Login, Canchas, Perfil
│   │   └── components/           # Layout y UI compartida
│   ├── package.json
│   └── vite.config.ts
├── supabase/
│   └── migrations/               # SQL versionado (núcleo, M3–M5, etc.)
├── documentacion/                # C4, ADR, actas, guías, seed demo, etc.
└── README.md                     # Este archivo
```

Más detalle del backend: [`documentacion/Estructura_Backend.md`](documentacion/Estructura_Backend.md).

---

## 9. Tecnologías y dependencias principales

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Backend | NestJS | ^12.0.1 |
| Backend | TypeScript | ^6.0.2 |
| Backend | @supabase/supabase-js | ^2.117.0 |
| Backend | jose | ^6.2.12 |
| Backend | @nestjs/event-emitter | ^12.0.1 |
| Backend | @nestjs/swagger | ^12.0.2 |
| Frontend | React | ^19.2.8 |
| Frontend | Vite | ^8.3.0 |
| Frontend | React Router | ^7.18.4 |
| Frontend | TypeScript | ~6.0.2 |
| Base de datos | Supabase (PostgreSQL + Auth) | — |
| Despliegue Frontend | Vercel | — |
| Despliegue Backend | Render | — |

---

## 10. Pruebas

### Tests unitarios (backend)

```bash
cd backend
npm test
```

### Tests end-to-end (backend)

```bash
cd backend
npm run test:e2e
```

Los tests e2e no tocan Supabase real: usan mocks de repositorios y un JWKS de prueba para firmar JWT.

### Frontend

El frontend no tiene tests configurados actualmente.

---

## 11. Notas importantes

### Seguridad

- El archivo `backend/.env` contiene la `SUPABASE_SERVICE_ROLE_KEY`, que es **secreta**. Nunca la commitees ni la compartas.
- El archivo `frontend/.env.local` es local y no se sube al repositorio.
- Ambos archivos están incluidos en `.gitignore`.

### CORS

El backend acepta peticiones desde los orígenes definidos en `CORS_ORIGIN`. Por defecto permite `http://localhost:5173` (Vite en desarrollo).

### Red con inspección SSL

Si estás en una red con inspección SSL (como algunas redes corporativas), es posible que necesites arrancar el backend con:

```bash
NODE_OPTIONS=--use-system-ca npm run start:dev
```

### Estado del frontend

El frontend tiene el esqueleto de rutas (Home, Login, Perfil, Canchas). Parte de la UI sigue siendo placeholder o no está totalmente cableada al BFF; para demos de negocio usar Swagger (§6.3).

### Documentación extra

| Tema | Documento |
|------|-----------|
| Seed de demo | [`documentacion/Seed_Demo_S5.md`](documentacion/Seed_Demo_S5.md) |
| Estructura Nest | [`documentacion/Estructura_Backend.md`](documentacion/Estructura_Backend.md) |
| Plan de tests | [`documentacion/Guia_Implementacion_Tests.md`](documentacion/Guia_Implementacion_Tests.md) |
| Decisiones / mejoras | [`documentacion/Decisiones_Pendientes_y_Cosas_a_Definir.md`](documentacion/Decisiones_Pendientes_y_Cosas_a_Definir.md) |

### Soporte

Para credenciales de Supabase (Service Role Key), contacta al administrador del proyecto por Discord. No compartas credenciales por canales públicos.

---

*Última actualización: 29/10/2026*

