# ADR-008 — Estrategia de pruebas y umbral de cobertura

- **Estado:** Aceptado
- **Fecha:** 2026-11-09
- **Autor:** Patricio Ramos (P1)
- **Sprint:** 8
- **Lineamientos:** §5.2.1 ADR-008

## Contexto

La Unidad V pide una estrategia de pruebas, una pirámide y un umbral mínimo de cobertura. El reporte tiene que superar ese umbral. Hasta este registro el backend ya corría Jest y Supertest, había un script SQL de la no sobreventa, y el documento de cobertura de octubre de 2026 decía de forma explícita que no había umbral: el entregable de esa unidad era el reporte, no un porcentaje.

El CI (`.github/workflows/ci-backend.yml`) ejecuta lint, tests unitarios y build del backend en pull requests hacia `desarrollo`. No publica cobertura y no corre los tests HTTP ni el script SQL. El frontend no tiene script de tests. Una parte de los controladores y repositorios sigue sin spec propio; los servicios de canchas, acceso, precios, clases, auth y la pasarela simulada sí tienen.

C-10 queda a cargo de dejar la suite en verde, publicar el reporte y hacer fallar el CI si no se llega al número de este ADR.

## Alternativas consideradas

| Alternativa | A favor | En contra | Por qué se descartó |
|---|---|---|---|
| Solo pruebas manuales en Swagger | Rápidas para mostrar un endpoint | No se repiten y no dejan evidencia en el pull request | No hay umbral posible |
| Pirámide invertida: casi todo E2E de navegador | Se parece a la demo de cinco minutos | Lento, frágil, y no aísla RN-02 ni el TOTP | La base de la pirámide tiene que ser unitaria |
| Umbral global del 80 % desde esta entrega | Margen cómodo frente a una lectura exigente | Controladores, repositorios y el checkout simulado bajarían el número; el CI quedaría rojo sin un sprint dedicado solo a cubrir wiring | El piso de admisibilidad es más bajo y está medido sobre el conjunto que Jest ya recolecta |
| Sin número, «mientras haya tests» | Evita discutir el porcentaje | La cátedra pide un umbral y que el reporte lo supere | No cierra §5.2.1 |

## Decisión

La pirámide de esta entrega es:

1. **Base.** Tests unitarios Jest + `ts-jest` sobre `backend/src/**/*.spec.ts` (servicios, guards, estrategias de precio, TOTP, pasarela simulada).
2. **Medio.** Tests HTTP con Supertest (`backend/test/**/*.e2e-spec.ts`) y el script SQL `supabase/tests/canchas_m4.test.sql`, que rechaza una segunda reserva del mismo turno. El script es secuencial, manual, contra un PostgreSQL local, y no se corre en CI.
3. **Cima.** E2E de navegador, fuera de esta entrega.

El umbral mínimo es **60 % de sentencias** en el conjunto de `collectCoverageFrom` de `backend/jest.config.ts` (código de `src/`, sin módulos, DTO, modelos, decoradores, `main.ts` ni `swagger.ts`), medido con `npm run test:cov`. Por debajo de 60 % la entrega no cumple este ADR.

El criterio determinante fue fijar un número que obligue a cubrir lógica de negocio y que C-10 pueda hacer cumplir en CI, sin exigir tests de navegador que el equipo no va a escribir antes del tag.

## Consecuencias

- **Positivas:** el porcentaje deja de ser opcional; la no sobreventa tiene una prueba en la base, aparte de los unitarios del servicio; el CI ya frena un pull request si los unitarios fallan.
- **Negativas:** el 60 % no mira el frontend ni los tests HTTP; un módulo nuevo sin tests diluye el número; el script SQL queda fuera del pipeline y alguien tiene que acordarse de correrlo.
- **Deuda asumida:** `coverageThreshold` todavía no está en `jest.config.ts` y el workflow no corre `test:cov`. Lo cierra C-10. Si esa medición queda bajo 60 %, no se baja el número en este archivo: se agregan tests o se supera este ADR con uno nuevo. No hay Vitest, Testing Library ni Playwright. El reporte HTML de cobertura no se versiona (`backend/coverage/` está ignorado).

## Requisitos relacionados

Unidad V. La prueba de carrera sostiene RN-02. Los unitarios de acceso sostienen RF-04 y RN-01 en la capa Nest.
