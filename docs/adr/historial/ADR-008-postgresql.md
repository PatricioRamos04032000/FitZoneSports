> **Histórico, congelado el 2026-11-09 (C-14).** No es la decisión vigente. Índice: [docs/adr/README.md](../README.md).

# ADR-008: Uso de PostgreSQL como base de datos relacional

Estado: Aceptado  
Fecha: 2026-11-02  
Reemplaza: [ADR-002](./ADR-002-postgresql.md)

## Contexto

El dominio de FitZone Sports exige integridad entre sedes, inventario de turnos de canchas, membresías y pagos. Hay que evitar la sobreventa de canchas (RN-02), responder consultas de disponibilidad con buen rendimiento (RNF-03), agregar sedes por configuración en datos sin redesplegar (RNF-04) y no almacenar datos de tarjeta — solo el token de la pasarela (RNF-02) — pero sí persistir comprobantes y estados de pago.

Se necesita un motor con transacciones robustas, esquema estructurado y migraciones versionadas en el repositorio. El enunciado del trabajo integrador orienta a una base relacional. El monolito modular (ADR-001) asume un único almacén primario compartido por todos los módulos.

ADR-002 mezclaba el motor (PostgreSQL) con el mecanismo de acceso (ORM pendiente). Ese ADR quedó reemplazado: este documento cubre **solo el motor**; el acceso desde Nest está en ADR-006.

## Decisión

Vamos a usar PostgreSQL como único almacén primario de datos de negocio. En desarrollo y demo lo administraremos mediante Supabase (ADR-010), que hospeda PostgreSQL administrado.

Cómo Nest lee y escribe las tablas de dominio no forma parte de este ADR: ver ADR-006 (API de Supabase, sin ORM). La lógica de negocio (M1–M5) permanece en Nest.

## Consecuencias

Positivas: las transacciones y constraints (por ejemplo unicidad de slot cancha + horario) apoyan RN-02; el esquema es claro para sedes, usuarios, membresías, clases, canchas y pagos; las migraciones quedan controladas y alineadas al monolito (ADR-001); podemos definir índices sobre disponibilidad (RNF-03).

Negativas: requiere diseño de esquema y migraciones desde el inicio; el equipo debe cuidar connection strings y secretos (no commitear `.env`); reportes analíticos muy pesados no son el foco del MVP, aunque PostgreSQL alcanza para los reportes consolidados del gerente en el alcance académico.

## Alternativas consideradas

(a) MongoDB u otra base NoSQL documental: descartada porque el modelo de reservas y las restricciones de unicidad (cancha + horario) son naturalmente relacionales; las transacciones multi-documento son más complejas para nuestro caso.

(b) MySQL / MariaDB: descartadas como opción principal; son SQL válidos, pero PostgreSQL es la opción del enunciado y del ADR de cátedra, y es suficiente para el equipo.

(c) SQLite: descartada por ser simple en local pero débil para multi-usuario concurrente y hosting compartido del equipo.

(d) Solo Supabase Auth/Storage sin SQL de dominio: descartada porque no cubre el modelado relacional ni el patrón Repository que exige el curso.
