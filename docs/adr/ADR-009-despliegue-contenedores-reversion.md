# ADR-009 — Despliegue, contenerización y reversión

- **Estado:** Aceptado
- **Fecha:** 2026-11-09
- **Autor:** Equipo FitZone Sports (mapa PaaS, 2026-08-25). Redacción de Compose y reversión: Patricio Ramos (P1)
- **Sprint:** 8
- **Lineamientos:** §5.2.1 ADR-009

## Contexto

Había que publicar una SPA, un proceso NestJS y un PostgreSQL sin administrar un servidor propio, con presupuesto de cursada. El mapa de hosting (frontend, API y base) ya estaba elegido. La cátedra, además, verifica la entrega con `docker compose up --build` en una máquina limpia y pide un procedimiento de reversión.

En el repositorio, al 2026-11-09, no hay `docker-compose.yml` ni Dockerfiles. El CI construye y testea el backend; no despliega. Las migraciones en `supabase/migrations/` son solo hacia adelante. El registro de hosting anterior está en `historial/ADR-010-hosting-vercel-render-supabase.md`.

## Alternativas consideradas

| Alternativa | A favor | En contra | Por qué se descartó |
|---|---|---|---|
| Un VPS con Nginx, TLS y backups propios | Control total y un solo proveedor | Operación que el equipo no puede sostener en el cuatrimestre | El tiempo se iría en el servidor y no en el dominio |
| AWS o GCP completos | Encajan en un sistema real | Cuentas, redes y costos fuera de escala | Demasiado para cuatro personas y una demo |
| PostgreSQL y Auth dentro de Compose, sin Supabase | La máquina de la cátedra no depende de un proyecto en la nube | Hay que rehacer login, JWT y las funciones RPC que hoy viven en Supabase | Rompe ADR-002, ADR-005 y ADR-011 a días del tag |
| Solo README de cinco pasos, sin imagen Docker | Es lo que hoy ya se puede escribir | La verificación de admisibilidad del código es `docker compose up --build` | No alcanza como estrategia de la entrega |

## Decisión

El despliegue de demo queda en tres servicios gestionados:

| Capa | Dónde | Qué corre |
|---|---|---|
| Web | Vercel | Build de la SPA React |
| API | Render | Proceso NestJS |
| Datos e identidad | Supabase | PostgreSQL y Supabase Auth |

La contenerización de la entrega es Docker Compose con dos servicios: la API Nest y el frontend (el build de Vite servido como estático). PostgreSQL no va en ese Compose: la API sigue apuntando al proyecto Supabase de desarrollo mediante variables de entorno, que no se versionan. El archivo Compose y los Dockerfiles los cierra C-07; este ADR fija el alcance para que ese trabajo no meta una base paralela.

La reversión, en este orden:

1. **Código.** Revertir el commit en GitHub. No se reescribe historia ya publicada.
2. **Web.** En Vercel, promover el deployment anterior.
3. **API.** En Render, volver al deploy anterior del servicio.
4. **Base.** No hay migraciones `down` en el repo. Si una migración corrompe datos, se restaura el backup de Supabase (point-in-time si el plan del proyecto lo tiene; si no, un backup lógico tomado antes de migrar). Las migraciones se aplican primero en el proyecto de desarrollo.
5. **Máquina local.** Bajar el Compose del tag roto y levantar el tag anterior (`docker compose up --build`).

El criterio determinante fue separar el hosting de la demo, ya elegido, del comando único que la cátedra usa para levantar la entrega, sin duplicar la base.

## Consecuencias

- **Positivas:** cada contenedor del C4 tiene un destino; los secretos quedan fuera del git; volver atrás en web y API es promover un deploy viejo, sin redeploy de la base; Compose no tiene que clonar Auth.
- **Negativas:** una máquina sin red hacia Supabase no levanta la API aunque las imágenes construyan; el free tier de Render puede dormir el proceso antes de una demo; hay tres consolas además de GitHub; revertir una migración es restaurar un backup, no un script.
- **Deuda asumida:** C-07 todavía tiene que agregar `docker-compose.yml` y los Dockerfiles. El workflow no despliega solo ni ejecuta la reversión. No hay entorno de staging distinto del proyecto Supabase de desarrollo.

## Requisitos relacionados

Unidad V. RNF-04 (una sede nueva es un dato en Supabase, no un deploy). ADR-010 para el tratamiento de los pagos en ese mismo proceso.
