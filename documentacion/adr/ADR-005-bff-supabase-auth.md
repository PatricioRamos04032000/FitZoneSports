# ADR-005: Uso de Supabase Auth con NestJS como pasarela (BFF)

Estado: Aceptado  
Fecha: 2026-08-31

## Contexto

FitZone Sports necesita autenticar a cuatro tipos de usuario — socio activo (A1), cliente externo (A2), recepcionista (A3) y gerente central (A4) — y restringir el acceso a cada módulo según el rol. El backend del curso debe ser un monolito NestJS con API REST, guards por rol y documentación Swagger (Unidad II).

El hosting ya incluye Supabase (ADR-004), que ofrece capacidades de identidad (registro, login, tokens de sesión) además de PostgreSQL. Implementar identidad desde cero — almacenamiento de credenciales, hashing, refresh, emisión de JWT — implica esfuerzo y riesgo de seguridad para un equipo de cuatro personas.

En la exposición al docente del 28/08/2026 se discutió cómo debe relacionarse el frontend con los servicios de Supabase: si el cliente integra Supabase directamente o si toda comunicación pasa por Nest. La lógica de negocio (M1–M5) debe seguir en Nest (ADR-001), sin reemplazar el monolito por un BaaS completo.

## Decisión

Vamos a usar Supabase Auth como servicio de identidad e integrar NestJS como pasarela (BFF) hacia ese servicio. El frontend enviará credenciales y pedidos de login, registro y refresh a endpoints REST de Nest; el `AuthModule` de Nest delegará esas operaciones en Supabase Auth y devolverá al cliente la respuesta unificada de nuestra API. El frontend no usará el SDK de Supabase Auth.

Nest validará el JWT emitido por Supabase en cada request protegido y aplicará los guards de dominio para los roles A1–A4. El mapeo entre el usuario de Supabase y el rol FitZone vivirá en tablas de PostgreSQL (por ejemplo `perfiles` o `user_roles`), consultadas por Nest después de validar el token. Nest no implementará autenticación casera completa (tabla propia de credenciales con bcrypt como fuente de verdad).

Flujo: `React → Nest (BFF) → Supabase Auth`.

## Consecuencias

Positivas: reducimos el esfuerzo en flujos estándar de identidad (registro, login, refresh); el frontend tiene un único contrato HTTP contra Nest; encaja con el diagrama C4 (el contenedor de identidad se accede solo desde el backend); concentramos guards y políticas de rol A1–A4 en el monolito, como exige el curso.

Negativas: dependemos de la disponibilidad de red y de Supabase Auth en cada login y refresh; Nest debe configurar bien la validación del JWT (claves, expiración); el mapeo usuario Supabase ↔ rol FitZone requiere tablas y lógica adicional en Nest; los secretos de Supabase deben vivir solo en el backend, nunca en el bundle del frontend.

## Alternativas consideradas

(a) Autenticación 100 % casera en Nest (JWT propio, tabla de usuarios, bcrypt): descartada porque duplica lo que Supabase Auth ya provee y el docente indicó usar Supabase Auth con Nest como pasarela, no reemplazarla con auth propia.

(b) Frontend llamando directo a Supabase Auth (SDK en React): descartada porque incumple el patrón BFF acordado con el docente, expone la integración con Supabase en el cliente y fragmenta el contrato de la API.

(c) Supabase como BaaS completo (sin Nest para auth ni negocio): descartada porque choca con ADR-001/003 y con los entregables de frameworks backend del curso.
