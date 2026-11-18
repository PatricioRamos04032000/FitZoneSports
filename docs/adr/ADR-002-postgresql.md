# ADR-002 — PostgreSQL como motor relacional

- **Estado:** Aceptado
- **Fecha:** 2026-08-25
- **Autor:** Equipo FitZone Sports (P1–P4). Alineación al Anexo B: Patricio Ramos (P1), 2026-11-09
- **Sprint:** 1
- **Lineamientos:** §5.2.1 ADR-002

Este registro cubre solo el motor. Cómo Nest lee y escribe está en ADR-005. Dónde está hospedado está en ADR-009.

Hasta el 2026-11-09 el motor vigente estaba numerado como ADR-008. Un registro anterior mezclaba PostgreSQL con un ORM pendiente; ese texto está en `historial/ADR-002-postgresql.md` y el motor separado, en `historial/ADR-008-postgresql.md`.

## Contexto

El dominio cruza sedes, turnos de cancha, membresías, clases y pagos. Había que impedir la sobreventa (RN-02), responder la disponibilidad con un esquema indexable (RNF-03), sumar sedes como datos (RNF-04) y guardar comprobantes y estados de pago sin guardar la tarjeta (RNF-02). El monolito (ADR-001) asume un almacén primario compartido por todos los módulos.

El enunciado orientaba a una base relacional, con transacciones y restricciones, y con migraciones versionadas en el repositorio. El equipo no administraba un servidor de bases propio.

## Alternativas consideradas

| Alternativa | A favor | En contra | Por qué se descartó |
|---|---|---|---|
| MongoDB u otro documental | Flexible si el esquema cambia seguido | La unicidad cancha + horario y la presencia de una sola sede son restricciones relacionales; la transacción entre documentos es más frágil | El modelo ya era tablas, claves y unicidad |
| MySQL o MariaDB | También son SQL y alcanzan para este dominio | No aportan nada que PostgreSQL no cubra, y el enunciado y el hosting elegido (Supabase) son PostgreSQL | No había un requisito que los hiciera preferibles |
| SQLite | Cero operación en una laptop | Débil para varios usuarios concurrentes y para el hosting compartido del equipo | No sirve como base de la demo ni de RN-02 bajo concurrencia |
| Solo Auth y Storage, sin SQL de dominio | Menos modelo que diseñar | No hay dónde poner turnos, membresías ni pagos, ni un Repository sobre tablas | No cubre el dominio |

## Decisión

El único almacén primario de datos de negocio es PostgreSQL. En desarrollo y en la demo lo administra Supabase (ADR-009). El major no está fijado en el repositorio: es el que ofrece el proyecto de Supabase.

El criterio determinante fue la integridad transaccional: restricciones e índices que la API no puede saltear, en particular la unicidad del turno y la de la presencia.

## Consecuencias

- **Positivas:** RN-02 y RN-01 se apoyan en constraints, no solo en código; el esquema de sedes, perfiles, membresías, clases, canchas y pagos es explícito; las migraciones viven en `supabase/migrations/`; se pueden indexar las consultas de disponibilidad (RNF-03).
- **Negativas:** el esquema y las migraciones hay que diseñarlos desde el principio; la cadena de conexión y la `service_role` no pueden commitearse; reportes analíticos pesados no son el foco, aunque el SQL alcanza para el consolidado del gerente en este alcance.
- **Deuda asumida:** no hay migraciones hacia atrás (el procedimiento está en ADR-009). No se evalúa un motor analítico aparte. Cambiar de PostgreSQL implicaría reescribir las funciones `reservar_cancha` y `registrar_check_in`.

## Requisitos relacionados

RNF-03, RN-02, RN-01, RNF-02, RNF-04
