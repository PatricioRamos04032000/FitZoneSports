# ADR-003 — Stack NestJS + React (TypeScript)

| Campo | Valor |
|-------|-------|
| **ID** | ADR-003 |
| **Título** | Adoptar NestJS (API) y React web multi-rol con TypeScript |
| **Estado** | Aceptada |
| **Fecha** | 2026-08-25 |
| **Actualizado** | 2026-08-25 (web multi-rol; móvil diferido) |
| **Decisores** | Equipo FitZone Sports (P1–P4) |
| **Relacionado** | [ADR-001](./ADR-001-monolito-modular.md) · [C4 Containers](../C4_Arquitectura_FitZone.md) · [Stack](../Stack_Tecnologico_y_Herramientas.md) |

---

## Contexto

El enunciado admite alternativas por contenedor:

| Contenedor | Opciones de cátedra |
|------------|---------------------|
| Frontend Web | React / Vue |
| App Móvil | React Native / Flutter |
| Backend | Java Spring Boot / Node NestJS |
| BD | PostgreSQL (cerrado en ADR-002) |

El equipo necesita un stack coherente con el monolito modular, Swagger (Unidad II) y Atomic Design (Unidad IV). La Unidad VI (móvil) está **al final del curso**: no se espera invertir esfuerzo temprano en móvil ni condicionar el resto del proyecto a esa app.

**Decisión de alcance de canal:** la aplicación debe funcionar en la **web para todos los roles**, incluido el cliente externo (A2). Socio (A1), externo (A2), recepcionista (A3) y gerente (A4) operan por React.

## Decisión

- **Backend:** **NestJS** (Node.js) + **TypeScript** — monolito modular, API REST, Swagger, DI y módulos por dominio.
- **Frontend web (camino crítico):** **React** + **TypeScript** — aplicación **multi-rol** (A1–A4), no un panel solo-admin.
- **Lenguaje común:** TypeScript en front y back.
- **App móvil:** **diferida a Unidad VI**, prioridad baja; React Native vs Flutter se cierra recién entonces. No forma parte del MVP de M1–M5 ni del Demo Day del núcleo web.

Autenticación prevista: **JWT** + guards por rol en NestJS (incluyendo rol de cliente externo). Estilos, estado global y ORM quedan como decisiones de implementación.

## Alternativas consideradas

| Alternativa | Motivo de descarte (ahora) |
|-------------|----------------------------|
| **Spring Boot (Java)** | Válido académicamente; el equipo elige ecosistema Node/TS para unificar con React |
| **Vue (web)** | Equivalente a React; se opta por React por familiaridad |
| **Express “plano” sin Nest** | Menos estructura para módulos, DI y Swagger alineados al curso |
| **Next.js full-stack en lugar de Nest** | Se prefiere API Nest separada (C4 Containers claros) |
| **Web solo admin + móvil para socio/externo desde el inicio** | Descartado: móvil llega tarde; la web debe cubrir A1 y A2 desde el desarrollo principal |

## Consecuencias

### Positivas

- Un solo lenguaje (TS) reduce fricción entre backend y frontend.
- Un solo front web concentra el esfuerzo de Unidad IV y la demo funcional de punta a punta.
- NestJS encaja con módulos, Repository, Strategy y Observer.
- Contrato claro: web multi-rol → REST → Nest → PostgreSQL.
- El trabajo de móvil no bloquea reservas, pagos, membresías ni paneles de sede/gerente.

### Negativas / trade-offs

- El frontend crece en pantallas (cuatro roles); requiere routing y autorización por rol bien definidos.
- El entregable móvil de Unidad VI será acotado (p. ej. QR offline) sobre una API ya estable.
- RNF-01 offline no se resuelve en el camino crítico web (se asume conectividad hasta Unidad VI).

### Impacto en el diseño

- Contenedores C4: **Frontend Web multi-rol** + API NestJS + PostgreSQL; móvil como contenedor diferido.
- Entregable Unidad II: backend Nest + Swagger.
- Entregable Unidad IV: frontend React con flujos A1–A4.
- Unidad VI: app opcional/acotada; no reabrir el diseño del monolito.

---

## Decisiones hijas (aún abiertas)

No forman parte de este ADR; se registrarán al cerrarse:

- ORM: TypeORM vs Prisma  
- Estado React: Zustand vs Redux Toolkit vs Context  
- Estilos: Tailwind vs CSS Modules u otro  
- Framework móvil: React Native vs Flutter (**solo Unidad VI**)
