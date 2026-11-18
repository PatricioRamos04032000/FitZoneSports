# Architecture Decision Records — FitZone Sports

Índice de `docs/adr/`. Los diez obligatorios de los lineamientos §5.2.1 están abajo, uno por archivo, en estado **Aceptado**, con alternativas y consecuencias (Anexo B). Diez es el piso: ADR-011 es una decisión de más que el desarrollo necesitó.

El 2026-11-09 (tarea C-14) la numeración del equipo se alineó con la de la cátedra. El texto anterior no se reescribió: quedó en [`historial/`](./historial/).

## Obligatorios

| ID | Decisión | Archivo |
|----|----------|---------|
| ADR-001 | Estilo arquitectónico: monolito modular frente a microservicios, SOA y serverless | [ADR-001](./ADR-001-monolito-modular.md) |
| ADR-002 | Motor relacional e integridad transaccional | [ADR-002](./ADR-002-postgresql.md) |
| ADR-003 | Estrategia offline del control de acceso | [ADR-003](./ADR-003-estrategia-offline-acceso.md) |
| ADR-004 | Concurrencia en la reserva de canchas (bloqueo pesimista y garantía en la base) | [ADR-004](./ADR-004-concurrencia-reservas-canchas.md) |
| ADR-005 | Framework backend, inyección de dependencias y acceso a datos sin ORM | [ADR-005](./ADR-005-backend-nestjs-ioc-datos.md) |
| ADR-006 | Framework frontend, componentes propios y estado global de sesión | [ADR-006](./ADR-006-frontend-react-estado.md) |
| ADR-007 | Sincronización del terminal de sede: qué se guarda, cuándo se envía, cómo se resuelve el conflicto | [ADR-007](./ADR-007-acceso-totp-cola-offline.md) |
| ADR-008 | Pirámide de pruebas y umbral mínimo (60 % de sentencias del backend) | [ADR-008](./ADR-008-pruebas-cobertura.md) |
| ADR-009 | Despliegue, Docker Compose y reversión | [ADR-009](./ADR-009-despliegue-contenedores-reversion.md) |
| ADR-010 | Medios de pago: token opaco, sin persistir la tarjeta | [ADR-010](./ADR-010-tokenizacion-medios-de-pago.md) |

## Adicional

| ID | Decisión | Archivo |
|----|----------|---------|
| ADR-011 | Supabase Auth con NestJS como pasarela (BFF) | [ADR-011](./ADR-011-bff-supabase-auth.md) |

## Cómo se citaba antes del 2026-11-09

Bitácoras, C4 y notas de unidad hablan de la numeración vieja. Esa cita sigue siendo válida como historia; la decisión vigente es la de la columna de la derecha.

| Se citaba como | Ahora |
|----------------|--------|
| ADR-001 monolito | ADR-001 (mismo número) |
| ADR-002 PostgreSQL + ORM pendiente | Histórico. Motor: ADR-002. Acceso sin ORM: ADR-005 |
| ADR-003 NestJS + React | ADR-005 y ADR-006 |
| ADR-004 hosting (Supabase solo como base) | Histórico. Deploy: ADR-009. Auth: ADR-011 |
| ADR-005 BFF + Supabase Auth | ADR-011 |
| ADR-006 API de Supabase sin ORM | ADR-005 |
| ADR-007 TOTP + cola + sync + RN-01 | ADR-003 (estrategia) y ADR-007 (sincronización) |
| ADR-008 PostgreSQL | ADR-002 |
| ADR-009 NestJS + React | ADR-005 y ADR-006 |
| ADR-010 Vercel + Render + Supabase | ADR-009 |

## Histórico

Copias congeladas, con su número de entonces: [`historial/`](./historial/). No se usan como decisión actual. Un ADR aceptado no se corrige para cambiar de idea: se lo marca «Reemplazado por ADR-0NN» y se escribe otro.

## Plantilla

Anexo B de los lineamientos. Campos que no se recortan: título, estado, fecha, autor, sprint, contexto, alternativas (tabla), decisión, consecuencias (positivas, negativas, deuda), requisitos relacionados.

```
# ADR-0NN — Título en una línea

- **Estado:** Propuesto | Aceptado | Reemplazado por ADR-0NN | Obsoleto
- **Fecha:** AAAA-MM-DD
- **Autor:** apellido y nombre
- **Sprint:** 1 a 8

## Contexto
## Alternativas consideradas
## Decisión
## Consecuencias
## Requisitos relacionados
```
