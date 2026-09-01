# ADR-003: Adopción de NestJS y React web multi-rol con TypeScript

Estado: Aceptado  
Fecha: 2026-08-25

## Contexto

El enunciado del trabajo integrador admite alternativas por contenedor: React o Vue en frontend web, React Native o Flutter en móvil, Spring Boot o NestJS en backend, y PostgreSQL en base de datos (cerrado en ADR-002).

El equipo necesita un stack coherente con el monolito modular (ADR-001), la documentación Swagger de la Unidad II y Atomic Design de la Unidad IV. La Unidad VI (móvil) está al final del curso: no conviene invertir esfuerzo temprano en la app móvil ni condicionar el resto del proyecto a ella.

Todos los actores — socio (A1), cliente externo (A2), recepcionista (A3) y gerente (A4) — deben poder operar desde la web; no alcanza con un panel solo-admin. Autenticación y acceso a datos son decisiones aparte (ADR-005 y ADR-006).

## Decisión

Vamos a usar NestJS (Node.js) con TypeScript como backend: monolito modular, API REST, Swagger, inyección de dependencias y módulos por dominio. En frontend, React con TypeScript como aplicación web multi-rol (A1–A4). TypeScript será el lenguaje común en front y back.

La app móvil queda diferida a la Unidad VI, con prioridad baja; React Native vs Flutter se cerrará recién entonces. No forma parte del MVP de M1–M5 ni del Demo Day del núcleo web.

Estilos, estado global en React y framework móvil definitivo siguen abiertos en `Decisiones_Pendientes_y_Cosas_a_Definir.md`.

## Consecuencias

Positivas: un solo lenguaje (TypeScript) reduce fricción entre backend y frontend; un solo front web concentra el esfuerzo de la Unidad IV y la demo funcional de punta a punta; NestJS encaja con módulos, Repository, Strategy y Observer; el contrato es claro (web multi-rol → REST → Nest → PostgreSQL); el trabajo de móvil no bloquea reservas, pagos, membresías ni paneles de sede y gerente.

Negativas: el frontend crece en cantidad de pantallas (cuatro roles) y requiere routing y autorización por rol bien definidos; el entregable móvil de la Unidad VI será acotado (por ejemplo QR offline) sobre una API ya estable; RNF-01 offline no se resuelve en el camino crítico web (se asume conectividad hasta la Unidad VI).

## Alternativas consideradas

(a) Spring Boot (Java) en backend: descartado; es válido académicamente, pero el equipo elige ecosistema Node/TypeScript para unificar con React.

(b) Vue en frontend web: descartado; es equivalente a React, pero se opta por React por familiaridad del equipo.

(c) Express “plano” sin Nest: descartado; ofrece menos estructura para módulos, DI y Swagger alineados al curso.

(d) Next.js full-stack en lugar de Nest: descartado; se prefiere API Nest separada para mantener contenedores C4 claros.

(e) Web solo admin + móvil para socio y externo desde el inicio: descartado; la móvil llega tarde en el cronograma y la web debe cubrir A1 y A2 desde el desarrollo principal.
