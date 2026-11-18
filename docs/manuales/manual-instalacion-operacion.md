# Manual de instalación y operación — FitZone Sports

- **Tarea:** C-17
- **Anexo:** E de los lineamientos de entrega
- **Fecha:** 2026-11-17
- **Autor:** Matias Goncevat (P4)

Este manual describe cómo instalar, levantar y operar la aplicación FitZone Sports en un entorno local y en operación mínima de entrega. La referencia técnica del sistema está en el backend NestJS, el frontend React y el proyecto Supabase asociado. No reemplaza la especificación operativa del README raíz ni los ADR; lo que hace es dejar un procedimiento concreto de instalación, validación y contingencia.

## Índice

1. [Objetivo](#1-objetivo)
2. [Requisitos previos](#2-requisitos-previos)
3. [Preparación del repositorio](#3-preparación-del-repositorio)
4. [Configuración de entorno](#4-configuración-de-entorno)
5. [Arranque del backend](#5-arranque-del-backend)
6. [Arranque del frontend](#6-arranque-del-frontend)
7. [Base de datos y seed](#7-base-de-datos-y-seed)
8. [Validación funcional mínima](#8-validación-funcional-mínima)
9. [Operación de producción y mantenimiento](#9-operación-de-producción-y-mantenimiento)
10. [Rollback y contingencias](#10-rollback-y-contingencias)
11. [Alta y gestión de sede](#11-alta-y-gestión-de-sede)
12. [Checklist final de entrega](#12-checklist-final-de-entrega)

---

## 1. Objetivo

El objetivo de este Anexo E es dejar un procedimiento reproducible para:

- clonar el repositorio;
- instalar dependencias;
- configurar variables de entorno;
- levantar el backend y el frontend en local;
- cargar la base con el seed demo;
- validar la operación principal del sistema;
- manejar contingencias, rollback y configuración de una nueva sede.

La instalación se basa en el stack del proyecto: NestJS + React + Supabase + GitHub Actions + evidencia documental en `docs/`.

---

## 2. Requisitos previos

Se requiere lo siguiente:

| Requisito | Mínimo recomendado | Uso |
|----------|--------------------|-----|
| Node.js | 20.x o superior | ejecutar backend y frontend |
| npm | 10.x o superior | instalar dependencias |
| Git | última versión | clonar y sincronizar repositorio |
| Supabase project | proyecto activo | base de datos, Auth y políticas |
| Navegador | Chrome/Edge actual | probar la UI |
| Terminal | PowerShell o bash | ejecutar scripts |

Validación rápida:

```bash
node --version
npm --version
git --version
```

---

## 3. Preparación del repositorio

Clonar el repo en una carpeta local:

```bash
git clone https://github.com/PatricioRamos04032000/FitZoneSports.git
cd FitZoneSports
```

Estructura relevante:

- `backend/` — API NestJS
- `frontend/` — SPA React + Vite
- `supabase/migrations/` — migraciones SQL
- `backend/scripts/` — scripts de seed, smoke y export de Swagger
- `docs/` — ADR, manuales, bitácoras y planificación

---

## 4. Configuración de entorno

### 4.1 Backend (`backend/.env`)

El backend requiere un archivo `.env` local. Debe copiarse desde `.env.example` y completarse con las claves reales del proyecto Supabase.

```bash
cd backend
copy .env.example .env
```

Luego completar minimamente:

```env
PORT=3000
APP_PUBLIC_URL=http://localhost:3000
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
SUPABASE_ANON_KEY=<anon-key>
CORS_ORIGIN=http://localhost:5173
SEED_PASSWORD=<password-demo>
TOTP_SEED_ENCRYPTION_KEY=<32-byte-key-en-base64>
```

Variables clave:

- `SUPABASE_URL`: URL del proyecto en Supabase.
- `SUPABASE_SERVICE_ROLE_KEY`: clave con permisos administrativos.
- `SUPABASE_ANON_KEY`: necesaria para altas de usuario con `POST /auth/register`.
- `SEED_PASSWORD`: la contraseña común para usuarios de demo del seed.
- `TOTP_SEED_ENCRYPTION_KEY`: clave para cifrar el seed TOTP cuando el sistema emite QR.

> Importante: no commitear el archivo `.env`. Se debe mantener local y fuera del control de versiones.

### 4.2 Frontend (`frontend/.env.local`)

En la carpeta del frontend, crear un `.env.local` con la configuración pública del proyecto:

```env
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<anon-key>
```

### 4.3 Supabase

Asegurarse de que el proyecto Supabase esté creado y que tenga:

- Auth habilitado;
- las migraciones del repositorio aplicadas;
- usuarios de prueba disponibles (o seed cargado);
- acceso a la API de servicio y anon.

La base de datos debe estar en el proyecto correcto y no apuntar a un entorno equivocado.

---

## 5. Arranque del backend

### 5.1 Instalar dependencias

```bash
cd backend
npm install
```

### 5.2 Levantar API en desarrollo

```bash
npm run start:dev
```

La API queda disponible en:

- `http://localhost:3000`
- Swagger: `http://localhost:3000/api/docs`

### 5.3 Verificar salud del sistema

```bash
curl http://localhost:3000/health
```

Resultado esperado: `200 OK` con un JSON o estado de funcionamiento del backend.

### 5.4 Producción local

```bash
npm run build
npm run start:prod
```

Si la API se levanta sin errores, el backend ya está operativo.

### 5.5 Ruta recomendada para Windows

El repo incluye un wrapper para evitar errores de certificados al levantar con Node en Windows:

```bash
npm run start
```

---

## 6. Arranque del frontend

### 6.1 Instalar dependencias

```bash
cd frontend
npm install
```

### 6.2 Ejecutar en dev

```bash
npm run dev
```

La app queda disponible en:

- `http://localhost:5173`

### 6.3 Build de producción

```bash
npm run build
npm run preview
```

La preview sirve el build generado y es la referencia más cercana a una operación de producción.

---

## 7. Base de datos y seed

### 7.1 Aplicar migraciones

La base debe estar actualizada con la migración principal del proyecto. En el repo, las migraciones viven en `supabase/migrations/`.

Se recomienda aplicar las migraciones del proyecto en Supabase antes de cargar el seed:

- `20261027200000_canchas_m4.sql`
- `20261101210000_acceso_m2.sql`
- demás migraciones del entorno que correspondan al flujo que se quiere probar

### 7.2 Cargar seed demo

Desde la carpeta `backend`:

```bash
npm run seed
```

El seed crea usuarios de demo, sedes y datos mínimos del sistema, con los usuarios de ejemplo como `socio@fitzone.com`, `gerente@fitzone.com`, `admin@fitzone.com` o equivalentes documentados en `documentacion/Seed_Demo_S5.md` y el README raíz.

### 7.3 Verificación del seed

La verificación mínima incluye:

- existencia de sedes;
- existencia de un usuario socio con membresía activa;
- login con la contraseña definida en `SEED_PASSWORD`;
- acceso a la API con el token emitido por Supabase Auth.

---

## 8. Validación funcional mínima

La validación mínima para confirmar que el sistema está operativo es:

### 8.1 Backend

1. abrir `http://localhost:3000/health`
2. validar Swagger en `/api/docs`
3. probar `POST /auth/login` con un usuario demo
4. probar `GET /sedes`
5. probar `GET /membresias/mia` con un socio autenticado

### 8.2 Frontend

1. abrir la app en `http://localhost:5173`
2. iniciar sesión con un usuario demo
3. cargar la vista de sedes
4. navegar a perfil, canchas y clases
5. verificar que no haya errores de CORS ni de conexión a Supabase

### 8.3 Operación de demo

El flujo mínimo esperado es:

1. login del socio;
2. ver membresía activa;
3. reservar una cancha;
4. validar el pago simulado;
5. mostrar el QR / check-in de acceso;
6. revisar la lista de espera y notificaciones si aplica.

---

## 9. Operación de producción y mantenimiento

### 9.1 Entorno de operación recomendado

El proyecto está pensado para una operación simple con:

- Frontend: Vercel o hosting estático
- Backend: Render, Railway o entorno equivalente
- Base: Supabase project dedicado
- Secrets: variables en entorno del despliegue, no en repositorio

### 9.2 Variables de producción

Las mismas variables de `.env` deben estar en el entorno de despliegue, con valores reales. No se debe versiónar `.env` ni secretos en el repositorio.

### 9.3 Recomendaciones de operación

- mantener la API y la base en el mismo proyecto de desarrollo/producción de la demo;
- no usar valores reales de producción en una demo de curso;
- documentar el estado del seed y la contraseña de demo en un archivo local seguro;
- revisar el health endpoint y Swagger antes de cada entrega;
- mantener los usuarios seed y los perfiles de acceso bien documentados.

### 9.4 Docker

El arranque de la entrega es Docker Compose, como fija [ADR-009](../adr/ADR-009-despliegue-contenedores-reversion.md). Los archivos ya están: `docker-compose.yml`, `backend/Dockerfile` y `frontend/Dockerfile`. Las variables y el caso de Avast están en [README-DOCKER.md](../../README-DOCKER.md).

```bash
docker compose up --build
docker compose --profile seed run --rm seed
```

El primer comando levanta la API en el puerto 3000 y el portal en el puerto 80. El segundo carga el seed de entrega (25 sedes, una cancha y una clase por sede, y los cuatro roles) cuando la API ya responde.

La API usa Supabase. En `.env`, copiado desde `.env.docker.example`, tienen que estar `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` y `SUPABASE_ANON_KEY`. Sin esas tres variables el login no funciona. El servicio `db` es una referencia del esquema: si falla al aplicar migraciones, la API y el portal siguen en marcha.

El arranque con npm, backend y frontend por separado, está en las secciones 5 y 6 de este manual.

---

## 10. Rollback y contingencias

### 10.1 Rollback de código

Si el cambio introduce un problema funcional:

1. volver a la última rama estable;
2. revisar el último commit funcional;
3. reconstruir el entorno local con `npm install` si hace falta;
4. repetir el seed si la base quedó inconsistente;
5. revalidar el flujo principal.

### 10.2 Rollback de base de datos

Si la base quedó con una migración parcial o datos corruptos:

1. identificar la última migración estable;
2. restaurar desde backup si existe;
3. volver a ejecutar el seed de demo;
4. comprobar usuarios, perfiles y sedes;
5. revalidar el login y el flujo principal.

### 10.3 Estado degradado

Si falla la API:

- verificar `PORT`, `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`;
- revisar que la base de datos esté viva y accesible;
- validar que el backend no esté usando una clave incorrecta;
- revisar logs de NestJS.

Si falla la base de datos:

- la API no puede crear perfiles ni validar autenticación;
- se debe dejar en evidencia el problema y no continuar con la demo;
- se debe volver a la última versión funcional con datos intactos.

Si falla el frontend:

- verificar `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY`;
- comprobar que el backend esté levantado y CORS aceptando el origen; 
- confirmar que no haya un `localhost` o puerto distinto al configurado.

---

## 11. Alta y gestión de sede

El proceso de alta de una sede se debe hacer con el rol `gerente` o con el rol que tenga permisos de administración. La decisión funcional y los detalles de validación se encuentran documentados en la lógica del backend y en la documentación de negocio.

### 11.1 Requisitos de la sede

Una sede nueva requiere, como mínimo:

- nombre válido;
- dirección válida;
- estado activo;
- capacidad inicial coherente con la operación del negocio.

### 11.2 Alta mínima

Debe hacerse con la API del módulo de sedes, valiando que el usuario tenga el rol adecuado y que la sede no se inserte con datos vacíos.

### 11.3 Verificación post-alta

Tras crear la sede, validar:

- listado en `GET /sedes`;
- disponibilidad en la UI;
- que la sede nueva se pueda elegir en canchas y clases;
- que el mantenimiento o la edición no dejen la sede sin configuración.

---

## 12. Checklist final de entrega

Antes de cerrar una entrega, verificar:

- [ ] repositorio clonado y actualizado
- [ ] `backend/.env` y `frontend/.env.local` creados
- [ ] Supabase con migraciones aplicadas
- [ ] seed ejecutado correctamente
- [ ] backend levantado en `localhost:3000`
- [ ] frontend levantado en `localhost:5173`
- [ ] `GET /health` responde correctamente
- [ ] login con usuario demo funciona
- [ ] `GET /sedes` devuelve datos reales
- [ ] flujo clave de demo: login → membresía → reserva → pago → acceso
- [ ] variables secretas no quedaron en el repo
- [ ] el manual de operación refleja el estado real del entorno

---

## Cierre

Este manual deja la instalación y la operación del sistema en un formato reproducible y útil para la entrega. La ruta operacional principal es local (backend + frontend + Supabase), y la versión de producción debe mantener la misma estructura de variables y de validación para evitar errores al momento de la demostración.

La evidencia operativa del proyecto, junto con el seed, los ADR y los diagramas, debe quedar sincronizada con la documentación del repositorio para que no dependa de memoria ni de mensajes informales del equipo.
