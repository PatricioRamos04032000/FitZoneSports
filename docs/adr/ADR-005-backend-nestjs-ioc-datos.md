# ADR-005 — Framework backend, inyección de dependencias y acceso a datos

- **Estado:** Aceptado
- **Fecha:** 2026-11-02
- **Autor:** Equipo FitZone Sports. Redacción al Anexo B: Patricio Ramos (P1)
- **Sprint:** 1
- **Lineamientos:** §5.2.1 ADR-005

## Contexto

El monolito modular (ADR-001) necesitaba un framework de API con módulos, un contenedor de inyección de dependencias y un modo de leer y escribir PostgreSQL (ADR-002). La cátedra admitía Spring Boot o NestJS. El equipo ya había elegido TypeScript también para la web, y el entregable de la Unidad II pedía Swagger y una estructura por módulos.

La base está en Supabase. Desde Nest se podía conectar con un ORM sobre `DATABASE_URL` o usar el cliente de Supabase. En la exposición del 28/08/2026 el docente recomendó la API de Supabase. Un ADR anterior mezclaba el motor de la base con un ORM todavía no elegido; ese texto está en `historial/ADR-002-postgresql.md`. El registro que separaba «sin ORM» está en `historial/ADR-006-supabase-api-sin-orm.md`.

Hacía falta, además, un lugar donde vivir Repository, Decorator (precios) y Observer, sin mover la lógica de negocio al navegador ni a un BaaS.

## Alternativas consideradas

| Alternativa | A favor | En contra | Por qué se descartó |
|---|---|---|---|
| Spring Boot | Encaja en el enunciado, ecosistema Java maduro | Otro lenguaje respecto de React; el equipo no lo tenía como base de trabajo | Se prefirió un solo lenguaje en API y web |
| Express sin contenedor de módulos | Menos marco, arranque corto | Módulos, guards y Swagger quedan armados a mano | No ordena el monolito que pide ADR-001 |
| TypeORM o Prisma sobre `DATABASE_URL` | Entidades, migraciones y relaciones en el proceso Node | Duplica el acceso que ya ofrece la API de Supabase; el docente recomendó no usarlo como camino principal | El acceso de runtime no es un ORM |
| Driver `pg` con SQL crudo en cada servicio | Control total de la sentencia | Cada módulo abre su propio SQL y se diluye Repository | Sirve para un script puntual, no como estrategia de la API |
| Contenedor propio (Inversify u otro) además del de Nest | Familiar si el equipo ya lo usaba | Dos contenedores para el mismo proceso | Nest ya inyecta repositorios, guards y la pasarela de pago |

## Decisión

El backend es NestJS 12 con TypeScript (licencia MIT; el proyecto lo mantiene el equipo de NestJS sobre Node.js). El contenedor de inyección es el de Nest: módulos por dominio registran controladores, servicios y repositorios.

No hay ORM en runtime. Los repositorios usan `@supabase/supabase-js` con `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`, solo en el backend. El tipado es con interfaces y DTO de Nest. El SQL que tiene que ser atómico (reserva de cancha, check-in, inscripción a clase) está en funciones de PostgreSQL versionadas en `supabase/migrations/` y se invoca por RPC.

La identidad no forma parte de este ADR: el frontend habla solo con Nest y Nest delega el login en Supabase Auth (ADR-011).

El criterio determinante fue unificar el lenguaje con la web y dejar las transacciones en PostgreSQL, sin una segunda capa de mapeo.

## Consecuencias

- **Positivas:** un solo lenguaje en API y web; módulos alineados al monolito; Repository encapsula PostgREST; las reglas de cupo y de presencia quedan en funciones SQL con un error de negocio traducible; Swagger sale del mismo proceso.
- **Negativas:** no hay Identity Map ni dirty checking de un ORM; las relaciones anidadas se escriben en el `select` del cliente; en local la API depende de la red hacia Supabase; hay que cuidar que la `service_role` no llegue al bundle del frontend.
- **Deuda asumida:** no hay calendario de salto de major de NestJS ni de Node. Row Level Security está habilitado en tablas sensibles como red de contención, y la autorización de negocio sigue en los guards de Nest. La dependencia de un ORM no se reabre salvo un ADR nuevo.

## Requisitos relacionados

Unidad II. Apoya RN-02 y RN-01 (RPC), RNF-03 (consultas sobre el esquema relacional) y RNF-04 (sedes como datos, no como servicios).
