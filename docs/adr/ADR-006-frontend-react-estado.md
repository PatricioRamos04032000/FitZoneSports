# ADR-006 — Framework frontend, componentes y estado global

- **Estado:** Aceptado
- **Fecha:** 2026-11-09
- **Autor:** Patricio Ramos (P1), sobre la elección de React del equipo (2026-08-25)
- **Sprint:** 8
- **Lineamientos:** §5.2.1 ADR-006

## Contexto

Los cuatro roles (socio, cliente externo, recepcionista y gerente) tenían que operar desde la web. La Unidad IV pedía una interfaz con componentes y un estado de sesión compartido entre pantallas: token, usuario y rol. La cátedra admitía React o Vue.

Al cerrar el stack, en noviembre de 2026, el registro del framework dejaba abiertos los estilos y la librería de estado global. En el código el portal ya tenía sesión, rutas por rol y componentes propios. Había que registrar qué se usa de verdad, no la lista de candidatos.

La app móvil seguía diferida. El frontend no llama a Supabase: habla con la API Nest (ADR-011).

## Alternativas consideradas

| Alternativa | A favor | En contra | Por qué se descartó |
|---|---|---|---|
| Vue | Equivale a React para esta UI | El equipo ya construía las pantallas en React | No había un problema que Vue resolviera mejor |
| Next.js con API routes | Un solo proyecto y render en servidor | Mezcla el contenedor de la web con el de la API y empuja lógica al frontend | La API queda en Nest (ADR-005) para mantener el C4 en dos contenedores |
| Librería de componentes (MUI, Chakra u otra) | Pantallas más rápidas al inicio | Otro sistema visual encima de Atomic Design y más peso en el bundle | Los átomos necesarios (botón, input, spinner) son pocos y ya estaban en el repo |
| Tailwind | Utilidades consistentes | El CSS ya estaba por componente | Cambiar de sistema de estilos no acerca la demo |
| Zustand o Redux | Sirven si el estado de cliente crece | La sesión es un solo árbol chico; el resto de las pantallas pide datos a la API y los guarda en estado local | Un store global de dominio duplicaría la API |

## Decisión

La aplicación web es una SPA React 19 con TypeScript, Vite 8 y React Router 7. React se publica bajo licencia MIT y lo gobierna Meta. Los componentes son propios, ordenados con Atomic Design (`frontend/src/components`: átomos, y el layout como organismo). Los estilos son CSS por componente, sin librería de UI.

El estado global es la sesión: `AuthProvider` expone token, usuario, rol y el cierre de sesión por React Context. El access token se guarda en `sessionStorage`. Cada pantalla carga sus datos con el cliente HTTP de `frontend/src/services` y los mantiene en estado local.

El criterio determinante fue cubrir los cuatro roles con el código que ya estaba en marcha, sin sumar una librería de estado ni un kit visual.

## Consecuencias

- **Positivas:** una sola SPA para el portal y la consola; la sesión llega a las rutas protegidas sin prop drilling; no hay un segundo modelo de datos en el cliente; el bundle no arrastra un kit de UI.
- **Negativas:** cada pantalla repite el ciclo de carga y error; no hay caché de servidor ni reintentos automáticos de lecturas; el CSS propio pide disciplina para no divergir entre pantallas.
- **Deuda asumida:** no hay tests de componentes ni E2E de navegador (ADR-008). Si el estado de cliente deja de ser solo la sesión (por ejemplo un carrito o una cola distinta de la de acceso), se evalúa Zustand en un ADR nuevo. La dependencia `@supabase/supabase-js` figura en `frontend/package.json` y el código de `src/` no la importa.

## Requisitos relacionados

Unidad IV. Apoya RF-04 (portal del QR), RF-09 (reserva desde la web) y el acceso de recepción de RNF-01.
