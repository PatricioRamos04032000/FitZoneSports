# ADR-011 — Supabase Auth con NestJS como pasarela (BFF)

- **Estado:** Aceptado
- **Fecha:** 2026-08-31
- **Autor:** Equipo FitZone Sports. Redacción al Anexo B: Patricio Ramos (P1)
- **Sprint:** 1

Decisión adicional. No reemplaza a ninguno de los diez obligatorios. Hasta el 2026-11-09 estaba numerada como ADR-005; el texto de entonces está en `historial/ADR-005-bff-supabase-auth.md`. El framework y el acceso a datos quedaron en el ADR-005 de los lineamientos.

## Contexto

Había que autenticar a cuatro roles y restringir cada módulo. Supabase, ya elegido como hosting de la base, también emite la identidad (registro, login, tokens). Implementar hashing, refresh y emisión de JWT en Nest duplica ese servicio y suma riesgo.

En la exposición del 28/08/2026 se discutió si el navegador habla con Supabase o si toda llamada pasa por Nest. La lógica de negocio tenía que seguir en el monolito. Un registro de hosting anterior prohibía usar Supabase Auth; ese límite quedó archivado en `historial/ADR-004-hosting-vercel-render-supabase.md`.

## Alternativas consideradas

| Alternativa | A favor | En contra | Por qué se descartó |
|---|---|---|---|
| Auth casera en Nest (JWT propio, tabla de credenciales, bcrypt) | Ninguna dependencia de identidad | Duplica registro, login y refresh, y concentra secretos de contraseñas | El docente indicó usar Supabase Auth con Nest como pasarela |
| SDK de Supabase Auth en React | Menos código en Nest | El navegador conoce al proveedor, el contrato de la API se parte y la `anon key` queda en el bundle | Rompe el BFF |
| Supabase como BaaS, sin Nest | Menos procesos | La lógica de M1–M5 y los patrones del curso no tienen dónde vivir | Choca con ADR-001 y ADR-005 |

## Decisión

Supabase Auth es el servicio de identidad. Nest es la pasarela: el frontend envía login, registro y refresh a la API, y `AuthModule` los delega en Supabase. El navegador no usa el SDK de Supabase.

Nest valida el JWT de Supabase en cada pedido protegido y aplica los guards de rol. El rol FitZone sale de PostgreSQL (`perfiles`), después de validar el token. Nest no guarda la contraseña.

Flujo: React → Nest (BFF) → Supabase Auth. Los datos de dominio siguen React → Nest → API de Supabase (ADR-005).

El criterio determinante fue un solo contrato HTTP para el frontend y no reimplementar la identidad.

## Consecuencias

- **Positivas:** registro y refresh salen del servicio de Supabase; los guards de rol quedan en el monolito; el diagrama C4 muestra la identidad detrás de la API.
- **Negativas:** sin red a Supabase no hay login ni refresh; hay que configurar bien emisor, clave y expiración del JWT; el alta del rol es una tabla más, no un claim mágico.
- **Deuda asumida:** la dependencia `@supabase/supabase-js` está declarada en el `package.json` del frontend y `frontend/src` no la importa. Hay que sacarla para que el árbol de dependencias no sugiera un segundo camino.

## Requisitos relacionados

RF-01 (identidad y perfil). Habilita la autorización del resto de los módulos.
