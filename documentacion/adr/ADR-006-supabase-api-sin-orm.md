# ADR-006: Acceso a datos vía API de Supabase sin ORM

Estado: Aceptado  
Fecha: 2026-08-31

## Contexto

FitZone Sports persiste sedes, membresías, reservas de canchas, clases, pagos y perfiles de usuario en PostgreSQL (ADR-002), administrado en Supabase (ADR-004). El monolito NestJS debe leer y escribir esos datos respetando reglas de negocio como evitar la doble reserva de una cancha en el mismo horario (RN-02) y el patrón Repository que pide el curso.

Existen al menos dos formas habituales de acceder a PostgreSQL desde Nest cuando la base está en Supabase: conectar por `DATABASE_URL` con un ORM (TypeORM, Prisma) y mapeo de entidades, o usar el cliente SDK de Supabase (REST/PostgREST) para leer y escribir tablas. En la exposición al docente del 28/08/2026 se plantearon ambas opciones.

El frontend no debería acceder directo a las tablas de dominio (patrón BFF, ADR-005). La lógica de negocio (M1–M5) debe permanecer en Nest.

## Decisión

Vamos a acceder a las tablas de dominio en PostgreSQL exclusivamente desde Nest mediante la API de Supabase (cliente SDK), sin ORM (TypeORM/Prisma) sobre `DATABASE_URL`.

En Nest usaremos `@supabase/supabase-js` con `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` (solo en el backend). Cada repositorio encapsulará las llamadas al cliente Supabase; los servicios de dominio no expondrán PostgREST al frontend. El tipado se hará con interfaces y DTOs en Nest, no con entidades ORM. El esquema SQL y las migraciones se versionarán en el repositorio y se aplicarán en Supabase.

Flujo: `React → Nest (BFF) → Supabase API` (tablas de dominio).

Queda descartado usar ORM con mapeo de entidades sobre conexión directa a PostgreSQL como estrategia principal de runtime.

## Consecuencias

Positivas: alineamos el acceso a datos con la recomendación del docente y con el stack Supabase ya adoptado; mantenemos el patrón Repository sin exponer PostgREST al frontend; hay un solo punto de integración con la base desde el runtime de la API; simplificamos el despliegue en Render al no gestionar un pool ORM aparte del cliente Supabase.

Negativas: las transacciones ACID complejas (por ejemplo RN-02 con reservas concurrentes) pueden requerir funciones SQL o RPC en Supabase o un diseño cuidadoso de operaciones atómicas vía API; hay menos ergonomía que un ORM para relaciones profundas y más trabajo manual en queries y tipos; en desarrollo local seguimos dependiendo de la latencia de red Nest → Supabase API; falta definir si usamos Row Level Security en Supabase además de los guards en Nest.

## Alternativas consideradas

(a) TypeORM o Prisma sobre `DATABASE_URL`: descartada por feedback del docente y decisión de equipo; duplica la capa de acceso frente a la API de Supabase ya elegida en el hosting.

(b) SQL crudo con el driver `pg` en Nest (sin ORM): descartada como camino principal; podría servir para scripts puntuales, pero no alinea con la recomendación explícita de usar la API de Supabase.

(c) Frontend leyendo y escribiendo Supabase directo: descartada porque rompe el patrón BFF, expone reglas de negocio en el cliente y obligaría a manejar claves en el bundle del front.

(d) Solo Supabase, sin Nest, para los datos de dominio: descartada porque choca con ADR-001 y con los entregables de backend del curso.
