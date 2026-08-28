# ADR-002 — PostgreSQL como base de datos

| Campo | Valor |
|-------|-------|
| **ID** | ADR-002 |
| **Título** | Usar PostgreSQL como base de datos relacional |
| **Estado** | Aceptada |
| **Fecha** | 2026-08-25 |
| **Decisores** | Equipo FitZone Sports (P1–P4) |
| **Relacionado** | [ADR-001](./ADR-001-monolito-modular.md) · [ADR-004](./ADR-004-hosting-vercel-render-supabase.md) · Trabajo Integrador (ADR preliminar) |

---

## Contexto

El dominio exige **integridad** entre sedes, inventario de turnos de canchas, membresías y pagos:

- Evitar **sobreventa** de canchas (RN-02).
- Consultas de disponibilidad con buen rendimiento (RNF-03 → índices).
- Agregar sedes por **configuración en datos**, sin redesplegar (RNF-04).
- No almacenar datos de tarjeta; solo token de pasarela (RNF-02), pero sí persistir comprobantes y estados de pago.

Se necesita un motor con transacciones robustas, esquema estructurado y migraciones versionadas en el repositorio.

## Decisión

Usar **PostgreSQL** como único almacén primario de datos de negocio.

- Acceso desde el monolito NestJS vía la **API de Supabase** (cliente SDK / PostgREST). ORM (TypeORM/Prisma) **descartado** (decisión de equipo, feedback docente 2026-08-28).
- En desarrollo/demo, PostgreSQL administrado mediante **Supabase** (ver ADR-004): Auth + API de datos; la lógica de negocio (M1–M5) permanece en Nest.

## Alternativas consideradas

| Alternativa | Motivo de descarte (ahora) |
|-------------|----------------------------|
| **MongoDB / NoSQL documental** | Modelo de reservas y constraints de unicidad (cancha + horario) es naturalmente relacional; transacciones multi-documento más complejas |
| **MySQL / MariaDB** | Válidos como SQL, pero PostgreSQL es la opción del enunciado/ADR de cátedra y suficiente para el equipo |
| **SQLite** | Simple en local, débil para multi-usuario concurrente y hosting compartido del equipo |
| **Solo almacenamiento en Supabase Auth/Storage sin SQL de dominio** | No cubre el modelado relacional ni el Repository pattern del curso |

## Consecuencias

### Positivas

- Transacciones y constraints (p. ej. unicidad de slot) apoyan RN-02.
- Esquema claro para sedes, usuarios, membresías, clases, canchas y pagos.
- Migraciones controladas y alineadas al monolito (ADR-001).
- Índices sobre disponibilidad (RNF-03).

### Negativas / trade-offs

- Requiere diseño de esquema y migraciones desde el inicio.
- El equipo debe cuidar connection strings y secretos (no commitear `.env`).
- Reportes “analíticos” muy pesados no son el foco; PostgreSQL alcanza para reportes consolidados del gerente en el alcance académico.

### Impacto en el diseño

- Contenedor **Base de datos** en C4 = PostgreSQL.
- Patrón **Repository** aísla el motor respecto de los servicios de dominio.

---

## Notas

Coincide con el ADR preliminar del trabajo integrador: *“usar PostgreSQL como base relacional”* por integridad de pagos y consistencia del inventario de canchas.
