# FitZone Sports

Portal web de una cadena de gimnasios. El socio consulta su membresía, se anota a clases, reserva canchas y muestra un código de ingreso. La recepción registra la entrada y la salida. El gerente administra sedes, la agenda y las canchas. Los pagos de esta entrega pasan por una pasarela simulada.

- **Frontend:** React 19 + TypeScript + Vite
- **Backend:** NestJS 12 + TypeScript
- **Datos e identidad:** PostgreSQL y Auth en Supabase
- **Arranque de la entrega:** Docker Compose

---

## 1. Qué es el sistema

FitZone Sports reúne, en un solo portal, el acceso a la sede, las clases grupales, el alquiler de canchas y el cobro de esas operaciones. Hay cuatro roles: gerente, administrador de sede, socio y cliente externo. La aplicación que se entrega se levanta con Docker y usa un proyecto Supabase ya creado para la base y el login.

## 2. Equipo

El autor de Git es el nombre que aparece en `git log`. Sirve para cruzar los commits con la bitácora de cada integrante.

| Integrante | Rol | Autor en Git | Usuario de GitHub |
|------------|-----|--------------|-------------------|
| Patricio Ramos | P1. Arquitectura, documentación y backend | `Patricio Ramos` | `PatricioRamos04032000` |
| Bruno Nicolás Conti | P2. Backend | `bruno` y `Bruno Nicolás Conti` | `brunoc11` |
| Lucas Coquet | P3. Frontend | `LucasCoquet` | `LucasCoquet` |
| Matias Goncevat | P4. Planificación, CI, seed y Docker | `MatiGoncevat` | `MatiGoncevat` |

## 3. Puesta en marcha

Hacen falta Git, Docker y Docker Compose. La base y el login están en Supabase: el archivo `.env` no se versiona y hay que completarlo con las claves de ese proyecto.

1. Clonar el repositorio.

```bash
git clone https://github.com/PatricioRamos04032000/FitZoneSports.git
cd FitZoneSports
```

2. Copiar la plantilla y completar las claves de Supabase.

```bash
cp .env.docker.example .env
```

En `.env`, reemplazar los marcadores de `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` y `SUPABASE_ANON_KEY`. `VITE_SUPABASE_URL` lleva la misma URL. `VITE_SUPABASE_PUBLISHABLE_KEY` lleva la clave anónima. `SEED_PASSWORD` ya viene en `fitzone-demo`.

3. Construir y levantar los contenedores.

```bash
docker compose up --build
```

4. Cargar los datos de entrega cuando la API ya responde. El comando corre una sola vez.

```bash
docker compose --profile seed run --rm seed
```

Ese seed crea 25 sedes, una cancha y una clase por sede, y los cuatro usuarios de la sección 4. Se puede volver a ejecutar.

5. Abrir el portal y la documentación de la API.

- Portal: <http://localhost>
- Swagger: <http://localhost:3000/api/docs>
- Contrato exportado: [`backend/swagger.json`](backend/swagger.json)

El login usa un email de la sección 4 y la contraseña `fitzone-demo`.

Sin `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` y `SUPABASE_ANON_KEY` los contenedores pueden llegar a levantarse, y el login no funciona. Esas claves quedan fuera del repositorio. El servicio `db` de Compose es una referencia del esquema: la API habla con Supabase. Si `db` falla al aplicar migraciones, la API y el portal siguen en marcha.

Si Avast inspecciona HTTPS, el armado de las imágenes falla con `UNABLE_TO_VERIFY_LEAF_SIGNATURE`. En Windows, desde la raíz:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/exportar-ca-avast.ps1
```

Después, otra vez `docker compose up --build`. El detalle está en [README-DOCKER.md](README-DOCKER.md).

Para levantar backend y frontend con npm, el procedimiento está en el [manual de instalación y operación](docs/manuales/manual-instalacion-operacion.md). En ese camino la carga de entrega es `npm run seed:entrega` dentro de `backend/`.

## 4. Usuarios de prueba

La contraseña de los cuatro es el valor de `SEED_PASSWORD`. Con la plantilla de Docker es `fitzone-demo`.

| Email | Rol |
|-------|-----|
| `gerente@fitzone.com` | `gerente` |
| `admin.central@fitzone.com` | `admin_sede` |
| `socio@fitzone.com` | `socio` (membresía activa) |
| `externo@fitzone.com` | `externo` |

El guion de cinco minutos no entra en la entrega. El uso de cada pantalla está en el [manual de usuario](docs/manuales/manual-usuario.md).

## 5. Documentación

`documentacion/` no forma parte de la entrega. Los documentos de la entrega están en `docs/`. Los enlaces que quedan hacia esa carpeta son registro histórico y no hacen falta para entender la entrega.

| Qué | Dónde |
|-----|--------|
| Decisiones de arquitectura (ADR-001 a ADR-011) | [docs/adr/README.md](docs/adr/README.md) |
| Manuales | [docs/manuales/README.md](docs/manuales/README.md) |
| Manual de usuario | [docs/manuales/manual-usuario.md](docs/manuales/manual-usuario.md) |
| Manual de instalación y operación | [docs/manuales/manual-instalacion-operacion.md](docs/manuales/manual-instalacion-operacion.md) |
| Manual técnico | [docs/manuales/manual-tecnico.md](docs/manuales/manual-tecnico.md) |
| Bitácoras | [docs/bitacoras/README.md](docs/bitacoras/README.md) |
| Bitácora de Patricio Ramos | [docs/bitacoras/LOG-ramos.md](docs/bitacoras/LOG-ramos.md) |
| Bitácora de Bruno Conti | [docs/bitacoras/LOG-conti.md](docs/bitacoras/LOG-conti.md) |
| Bitácora de Lucas Coquet | [docs/bitacoras/LOG-coquet.md](docs/bitacoras/LOG-coquet.md) |
| Bitácora de Matias Goncevat | [docs/bitacoras/LOG-goncevat.md](docs/bitacoras/LOG-goncevat.md) |
| Contrato OpenAPI | [backend/swagger.json](backend/swagger.json) |
| Compose | [README-DOCKER.md](README-DOCKER.md) |

Diagramas (fuente editable en `docs/diagramas/fuentes/`, exportación en `docs/diagramas/img/`):

| Diagrama | Exportación |
|----------|-------------|
| C4 — contexto | [c4-1-contexto.svg](docs/diagramas/img/c4-1-contexto.svg) |
| C4 — contenedores | [c4-2-contenedores.svg](docs/diagramas/img/c4-2-contenedores.svg) |
| C4 — acceso | [c4-3-acceso.svg](docs/diagramas/img/c4-3-acceso.svg) |
| C4 — canchas | [c4-3-canchas.svg](docs/diagramas/img/c4-3-canchas.svg) |
| UML de clases de dominio | [uml-clases-dominio.svg](docs/diagramas/img/uml-clases-dominio.svg) |
| DER físico | [er-fisico.svg](docs/diagramas/img/er-fisico.svg) |
| Secuencia — reserva y pago | [sec-reserva-pago.svg](docs/diagramas/img/sec-reserva-pago.svg) |
| Secuencia — reserva concurrente | [sec-reserva-concurrente.svg](docs/diagramas/img/sec-reserva-concurrente.svg) |
| Secuencia — acceso offline | [sec-acceso-offline.svg](docs/diagramas/img/sec-acceso-offline.svg) |
| Estados de la reserva | [est-reserva.svg](docs/diagramas/img/est-reserva.svg) |
| Estados de la membresía | [est-membresia.svg](docs/diagramas/img/est-membresia.svg) |
| Actividad — lista de espera | [act-lista-espera.svg](docs/diagramas/img/act-lista-espera.svg) |
| Despliegue | [dep-despliegue.svg](docs/diagramas/img/dep-despliegue.svg) |
| Pipeline de CI | [pipe-ci.svg](docs/diagramas/img/pipe-ci.svg) |

## 6. Pruebas

Umbral de esta entrega, declarado en [ADR-008](docs/adr/ADR-008-pruebas-cobertura.md): **60 % de sentencias** del backend, medido con `npm run test:cov`.

Corrida del 2026-11-18, en `backend/`, con `npm run test:cov` (C-35):

| Dato | Resultado |
|------|-----------|
| Suites | 32, todas en verde |
| Tests | 184, todos en verde |
| Sentencias (`Statements`) | 65,77 % |

Esa medición cubre los tests unitarios del conjunto `collectCoverageFrom` de `backend/jest.config.ts`. Los comandos, siempre desde `backend/`:

```bash
npm test
npm run test:cov
npm run test:e2e
```

`npm run test:e2e` en `backend/` ejecuta los tests HTTP y no entra en el 65,77 %. En `frontend/`, `npm run test:e2e` corre el E2E de Playwright (login, reserva, pago, consulta y comprobante). Usa `E2E_PASSWORD` o, si no está, `SEED_PASSWORD`. Tampoco mueve ese porcentaje.

## 7. Asistentes de IA y bibliotecas

El equipo usó Cursor, un asistente de IA, para proponer código, pruebas y redacción. Las decisiones de arquitectura están en los ADR. En la defensa, cada integrante explica y modifica el código que entregó.

| Capa | Tecnología | Versión |
|------|------------|---------|
| Backend | NestJS | ^12.0.1 |
| Backend | TypeScript | ^6.0.2 |
| Backend | @supabase/supabase-js | ^2.118.0 |
| Backend | jose | ^6.2.12 |
| Backend | @nestjs/event-emitter | ^12.0.1 |
| Backend | @nestjs/swagger | ^12.0.2 |
| Frontend | React | ^19.2.8 |
| Frontend | Vite | ^8.3.0 |
| Frontend | React Router | ^7.18.4 |
| Frontend | TypeScript | ~6.0.2 |
| Base de datos | Supabase (PostgreSQL + Auth) | — |
| Despliegue del portal | Vercel | — |
| Despliegue de la API | Render | — |

## 8. Licencia

Este repositorio se publica bajo la licencia MIT, año 2026, a nombre de los cuatro integrantes. El texto está en [LICENSE](LICENSE).

---

*Última actualización: 17/11/2026*
