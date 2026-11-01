# Guía de implementación de tests — FitZone Sports

**Fecha:** 2026-10-29  
**Estado:** análisis y plan de implementación (sin cambios de código aún)  
**Referencias:** [Stack tecnológico](./Stack_Tecnologico_y_Herramientas.md), [Estructura Backend](./Estructura_Backend.md), [ADR-003](./adr/ADR-003-stack-nestjs-react.md)

---

## 1. Respuesta corta: ¿usamos Jest?

**Sí, en el backend.** Los tests unitarios del API NestJS ya corren con **Jest 30 + `ts-jest`**.

| Capa | Unitarios | Tests HTTP / integración | E2E en navegador |
|------|-----------|--------------------------|------------------|
| **Backend** | Jest (activo, `*.spec.ts`) | Supertest (activo, `test/*.e2e-spec.ts`) | No aplica (API) |
| **Frontend** | **Aún no hay** | No aplica (SPA) | Cypress o Playwright (pendiente) |

Detalle del estado actual:

- **Backend unitarios:** ~20 archivos `src/**/*.spec.ts`, scripts `test` / `test:watch` / `test:cov`.
- **Backend “e2e” Nest:** ya usan **Supertest** sobre la app Nest (`npm run test:e2e`). En Nest se llaman e2e, pero son **tests de API HTTP** (no abren un navegador).
- **Frontend:** React 19 + Vite 8 + React Router. Sin Jest/Vitest, sin Testing Library, sin Cypress/Playwright, sin scripts de test en `package.json`.
- **CI:** el stack prevé GitHub Actions; aún no hay workflow de tests en el repo.

El documento de stack menciona Jest también para frontend. Con Vite conviene valorar **Vitest** (misma toolchain que Vite) frente a Jest; ver §4.

---

## 2. Pirámide de tests recomendada para FitZone

```text
                    ┌─────────────┐
                    │  E2E UI     │  Pocos · Playwright/Cypress
                    │  (navegador)│  Flujos críticos multi-rol
                    └──────┬──────┘
                           │
              ┌────────────┴────────────┐
              │  Integración / API      │  Supertest (backend)
              │  + componentes React    │  Testing Library (frontend)
              └────────────┬────────────┘
                           │
         ┌─────────────────┴─────────────────┐
         │  Unitarios                        │  Muchos · rápidos
         │  Services, guards, repos (Nest)   │  Jest (backend)
         │  Hooks, utils, lógica UI (React)  │  Jest o Vitest (frontend)
         └───────────────────────────────────┘
```

| Nivel | Qué prueba | Herramienta | Dónde vive |
|-------|------------|-------------|------------|
| Unitario backend | Service, guard, repository, filtros | Jest + `@nestjs/testing` | `backend/src/**/*.spec.ts` |
| API / integración | Rutas HTTP, auth, CORS, status codes | Jest + Supertest | `backend/test/**/*.e2e-spec.ts` |
| Unitario / componente frontend | Componentes, hooks, helpers | Jest o Vitest + Testing Library | `frontend/src/**/*.{test,spec}.{ts,tsx}` |
| E2E UI | Login → flujo de negocio en browser | Playwright **o** Cypress | `e2e/` (raíz o `frontend/e2e/`) |

---

## 3. Backend — estado y cómo seguir

### 3.1 Ya implementado (no hace falta “instalar” de cero)

Dependencias en `backend/package.json`:

- `jest`, `ts-jest`, `@types/jest`
- `supertest`, `@types/supertest`
- `@nestjs/testing`

Scripts:

```bash
cd backend
npm test              # unitarios
npm run test:watch
npm run test:cov
npm run test:e2e      # Supertest (config test/jest-e2e.json)

> **Reporte de cobertura:** `npm run test:cov` genera el reporte en `backend/coverage/` (`lcov.info`, `lcov-report/index.html`, etc.). Ver [`documentacion/Reporte_Cobertura_Backend.md`](./Reporte_Cobertura_Backend.md) para cómo generar y consultar el reporte (entregable Unidad V, sin Docker).
```

Configuración:

- Unitarios: `backend/jest.config.ts` → `testRegex: .*\.spec\.ts$`, entorno `node`.
- API: `backend/test/jest-e2e.json` → `testRegex: .e2e-spec.ts$`, `setupFiles: setup-env.ts`.
- Variables falsas de Supabase en `test/setup-env.ts`; JWT de prueba en `test/support/supabase-jwt.ts`.

### 3.2 Convención unitaria (ya en uso)

Patrón Nest típico:

1. `Test.createTestingModule({ ... }).compile()`
2. Mock de repositorios / dependencias con `jest.fn()` / `useValue`
3. Assert sobre el service o controller aislado

Qué conviene cubrir más:

| Capa | Prioridad | Notas |
|------|-----------|--------|
| `*.service.ts` | Alta | Reglas de negocio, mapeo de errores P0001 → HTTP |
| Guards (`JwtAuthGuard`, `RolesGuard`) | Alta | Seguridad multi-rol |
| Repositorios | Media | Mock del cliente Supabase; no pegarle a la BD real en unitarios |
| Controllers | Baja–media | Mejor cubrir con Supertest si la lógica está en el service |

### 3.3 Supertest — qué es y cómo ampliarlo

**Supertest** dispara HTTP contra el servidor Express que levanta Nest (`app.getHttpServer()`), sin browser. Es el nivel correcto para “tests de implementación” de la API.

Patrón actual (simplificado):

```ts
const moduleFixture = await Test.createTestingModule({
  imports: [AppModule],
})
  .overrideProvider(AlgunRepository)
  .useValue({ findAll: jest.fn().mockResolvedValue([]) })
  .compile();

app = moduleFixture.createNestApplication();
await app.init();

await request(app.getHttpServer()).get('/sedes').expect(200);
```

Buenas prácticas para FitZone:

1. **Seguir mockeando** repositorios / Supabase en la mayoría de e2e HTTP (rápido, estable, sin depender de un proyecto Supabase real).
2. Reservar un subconjunto opcional `*.e2e-db-spec.ts` (más adelante) solo si el equipo quiere contra una BD de test; no mezclarlo con el suite diario.
3. Reutilizar `test/support/supabase-jwt.ts` para tokens con roles (`socio`, `gerente`, etc.).
4. Un archivo por dominio: `auth`, `sedes`, `perfiles`, `notificaciones`, `membresias`, `clases`, `canchas`, `pagos`.
5. Asserts mínimos útiles: status, shape JSON clave, headers CORS, 401/403 por rol.

Checklist de ampliación Supertest:

- [ ] Membresías / clases / canchas / pagos (módulos nuevos o poco cubiertos)
- [ ] Casos negativos: token ausente, rol incorrecto, body inválido
- [ ] Mantener `setup-env.ts` con todas las env que exija `ConfigModule`
- [ ] En CI: `npm run test` y `npm run test:e2e` en `backend/`

### 3.4 Lo que Supertest **no** reemplaza

- No valida UI React, rutas del SPA ni UX.
- No sustituye tests E2E de navegador (Playwright/Cypress).
- No prueba migraciones SQL por sí solo (eso es otro tipo de test o revisión manual / seed).

---

## 4. Frontend — unitarios e integración de componentes

### 4.1 Situación

No hay runner de tests. Páginas actuales: `Home`, `Login`, `Perfil`, `Canchas` + `Layout`. El stack documenta **Jest** para frontend; Vite suele ir mejor con **Vitest**.

### 4.2 Decisión: Jest vs Vitest

| Criterio | Jest | Vitest |
|----------|------|--------|
| Alineación con doc de stack | Sí (explícito) | No documentado aún |
| Encaje con Vite | Posible, más config | Nativo (`vite.config`, ESM) |
| API | Familiar si el equipo ya usa Jest en Nest | Casi idéntica a Jest (`describe`/`it`/`expect`) |
| Velocidad / DX con Vite | Buena | Mejor out-of-the-box |
| Testing Library | Compatible | Compatible |

**Recomendación del análisis:**

- Si el equipo prioriza **una sola herramienta mental** y lo escrito en stack → **Jest** en frontend.
- Si prioriza **menos fricción con Vite/ESM** → **Vitest** y actualizar una línea en `Stack_Tecnologico_y_Herramientas.md`.

Ambas opciones usan **React Testing Library** (`@testing-library/react`) + `jsdom`.

### 4.3 Plan A — Jest en frontend (alineado al stack)

Instalación orientativa:

```bash
cd frontend
npm i -D jest ts-jest @types/jest jest-environment-jsdom \
  @testing-library/react @testing-library/jest-dom @testing-library/user-event \
  identity-obj-proxy
```

Archivos a crear:

| Archivo | Rol |
|---------|-----|
| `frontend/jest.config.ts` | `testEnvironment: 'jsdom'`, transform TS/TSX, mapper de CSS/assets |
| `frontend/src/setupTests.ts` | `import '@testing-library/jest-dom'` |
| Scripts en `package.json` | `"test"`, `"test:watch"`, `"test:cov"` |

Consideraciones Vite + ESM:

- El frontend es `"type": "module"`. Puede hacer falta `extensionsToTreatAsEsm` / config cuidadosa, o usar `babel-jest` / preset comunitario.
- Si la config se complica, es señal para pasar a Vitest.

Ejemplo de test de componente:

```tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from './Login';

test('muestra el formulario de login', () => {
  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>,
  );
  expect(screen.getByRole('button', { name: /ingresar/i })).toBeInTheDocument();
});
```

### 4.4 Plan B — Vitest (recomendado técnicamente con Vite)

```bash
cd frontend
npm i -D vitest @vitest/coverage-v8 jsdom \
  @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

En `vite.config.ts`:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    globals: true,
  },
})
```

Scripts: `"test": "vitest"`, `"test:run": "vitest run"`, `"test:cov": "vitest run --coverage"`.

### 4.5 Qué testear en el frontend

| Prioridad | Objetivo | Ejemplo |
|-----------|----------|---------|
| Alta | Login / manejo de token / redirección por rol | Mock de `fetch` al BFF Nest |
| Alta | Guards de rutas (cuando existan) | Usuario sin sesión → `/login` |
| Media | Formularios (perfil, reserva, pago) | Validación, mensajes de error |
| Media | Layout / navegación por rol | Links visibles según `gerente` vs `socio` |
| Baja | Páginas estáticas / copy | Solo si hay lógica |

Convención de nombres sugerida: `*.test.tsx` junto al componente, o carpeta `__tests__/`.

Helpers útiles a crear temprano:

- `frontend/src/test/renderWithRouter.tsx` — wrapper con `MemoryRouter`
- `frontend/src/test/mockApi.ts` — stubs de respuestas del BFF
- Fixtures de usuario por rol (`socio`, `externo`, `recepcionista`, `gerente`)

---

## 5. E2E en navegador — Cypress vs Playwright

Estos tests levantan (o apuntan a) frontend + backend reales (o staging) y automatizan el browser. Complementan Supertest; **no lo reemplazan**.

### 5.1 Comparación

| Criterio | Playwright | Cypress |
|----------|------------|---------|
| Motores | Chromium, Firefox, WebKit | Principalmente Chromium (otros con más setup) |
| Lenguaje / API | Async/await clara, TypeScript excelente | API encadenada; TS soportado |
| Velocidad / paralelismo | Muy bueno de fábrica | Bueno; paralelismo más limitado en open source |
| DX debug | Trace viewer, codegen | Time-travel UI muy didáctica |
| Auth / multi-origen | Cómodo (varios contextos) | Más fricción histórica con multi-domain |
| Encaje CI | Oficialmente fuerte en GitHub Actions | Muy usado también |
| Curva del equipo | Un poco más “moderna” | Muy documentada en cursos |

**Recomendación para FitZone:** **Playwright**, porque:

1. Multi-rol y flujos con auth JWT se manejan bien con storage state / contexts.
2. Encaja con TypeScript del monorepo.
3. Un solo `npx playwright test` en CI cubre Chromium (suficiente para el integrador; opcional Firefox/WebKit).
4. Cypress sigue siendo válida si el equipo ya la conoce mejor; la decisión es de DX, no de “correctitud”.

### 5.2 Alcance E2E sugerido (pocos, críticos)

No automatizar toda la UI. Empezar con:

1. **Login socio** → home / perfil.
2. **Login gerente** → acceso a vistas de gestión (y 403 visual o redirect si aplica).
3. **Reserva / inscripción a clase** (cuando el flujo esté estable).
4. **Reserva de cancha** (M4).
5. **Pago / confirmación** (M5), si el medio de pago es mockeable.

Smoke mínimo Demo Day: login + un flujo feliz por rol principal.

### 5.3 Plan de implementación Playwright

Ubicación sugerida (monorepo):

```text
e2e/                          # opción preferida: suite compartida en la raíz
├── playwright.config.ts
├── package.json              # o scripts desde la raíz del monorepo
├── tests/
│   ├── auth.login.spec.ts
│   ├── socio.perfil.spec.ts
│   └── ...
└── support/
    ├── auth.ts               # login helper / storageState
    └── fixtures.ts
```

Alternativa: `frontend/e2e/` si preferís acoplarlo al SPA.

Pasos:

```bash
# desde la raíz o frontend, según decisión de carpeta
npm init playwright@latest
```

Config mínima relevante:

```ts
// playwright.config.ts (idea)
export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  webServer: [
    {
      command: 'npm run start:dev',
      cwd: '../backend',
      url: 'http://localhost:3000/health',
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'npm run dev',
      cwd: '../frontend',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
    },
  ],
});
```

Datos y entorno:

- Usuarios de prueba vía seed (`backend` ya tiene `npm run seed`) o cuentas fijas en proyecto Supabase **de test**.
- Nunca usar credenciales de producción.
- Variables: `E2E_BASE_URL`, `API_URL`, emails/passwords de demo en `.env.e2e` (gitignored).

Scripts sugeridos:

```json
{
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui",
  "test:e2e:report": "playwright show-report"
}
```

### 5.4 Plan alternativo Cypress

```bash
cd frontend
npm i -D cypress
npx cypress open
```

Estructura típica: `frontend/cypress/e2e/*.cy.ts`, `cypress.config.ts` con `baseUrl: http://localhost:5173`.

Misma regla de alcance: pocos flujos críticos; auth con `cy.session` si está disponible.

---

## 6. Matriz “quién prueba qué” (evitar solapamiento)

| Escenario | Unitario BE | Supertest | Unit/RTL FE | Playwright/Cypress |
|-----------|:-----------:|:---------:|:-----------:|:------------------:|
| Regla de negocio en service | ✅ | ◐ | ❌ | ❌ |
| Status HTTP / guards / CORS | ◐ | ✅ | ❌ | ❌ |
| Render de formulario / validación UI | ❌ | ❌ | ✅ | ◐ |
| Login completo socio en browser | ❌ | ◐ (API) | ◐ | ✅ |
| Regresión Demo Day (smoke) | ❌ | ✅ smoke API | ❌ | ✅ smoke UI |

✅ principal · ◐ opcional / parcial · ❌ no corresponde

---

## 7. CI (GitHub Actions) — esqueleto

Cuando se arme el pipeline (previsto en el stack):

```yaml
# idea: .github/workflows/ci.yml
jobs:
  backend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: backend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22', cache: npm, cache-dependency-path: backend/package-lock.json }
      - run: npm ci
      - run: npm test
      - run: npm run test:e2e

  frontend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22', cache: npm, cache-dependency-path: frontend/package-lock.json }
      - run: npm ci
      - run: npm run lint
      - run: npm test -- --run   # o vitest run / jest --ci
      - run: npm run build

  e2e:
    needs: [backend, frontend]
    runs-on: ubuntu-latest
    # secrets de entorno de test; Playwright browsers install
    steps:
      - run: npx playwright install --with-deps chromium
      - run: npm run test:e2e
```

Orden práctico de adopción en el curso:

1. Mantener y ampliar **Jest + Supertest** backend (ya existe).
2. Sumar **tests de componentes** en frontend (Jest o Vitest).
3. Agregar job CI de unitarios + build.
4. Recién después: **Playwright/Cypress** smoke + job `e2e` (más frágil y costoso).

---

## 8. Checklist de implementación por fase

### Fase 0 — Hoy (ya hecho en backend)

- [x] Jest unitarios Nest
- [x] Supertest en `backend/test`
- [x] Helpers JWT / env de test
- [ ] Documentar comandos en README (parcialmente hecho)

### Fase 1 — Cerrar backend “tests de implementación”

- [ ] Cobertura Supertest de módulos faltantes (membresías, clases, canchas, pagos)
- [ ] Casos 401/403 por rol en endpoints sensibles
- [ ] Script CI local documentado: `cd backend && npm test && npm run test:e2e`

### Fase 2 — Frontend unitarios

- [ ] Decidir **Jest vs Vitest** en reunión corta (actualizar stack si es Vitest)
- [ ] Instalar Testing Library + runner
- [ ] `setupTests` + helper `renderWithRouter`
- [ ] Tests de `Login` y de un componente con lógica
- [ ] Scripts `test` / `test:watch` en `frontend/package.json`

### Fase 3 — E2E UI

- [ ] Elegir **Playwright** (recomendado) o Cypress
- [ ] Carpeta `e2e/` + config `baseURL` + `webServer`
- [ ] 2–3 specs smoke (login + un flujo de negocio)
- [ ] Usuarios seed / `.env.e2e` gitignored
- [ ] Job CI opcional (puede ser nightly o solo en `desarrollo`)

### Fase 4 — Calidad continua

- [ ] Umbral de coverage opcional (`test:cov`) en servicios críticos
- [ ] Fallo de PR si unitarios o Supertest fallan
- [ ] E2E no bloqueante al inicio; bloquear cuando estén estables

---

## 9. Comandos de referencia (objetivo final)

```bash
# Backend
cd backend
npm test
npm run test:e2e

# Frontend (cuando exista)
cd frontend
npm test

# E2E UI (cuando exista)
cd e2e   # o frontend
npm run test:e2e
```

---

## 10. Decisiones que el equipo debe cerrar

| # | Decisión | Opciones | Sugerencia |
|---|----------|----------|------------|
| 1 | Runner unitario frontend | Jest · Vitest | Vitest si priorizan DX Vite; Jest si priorizan doc/stack único |
| 2 | Herramienta E2E | Playwright · Cypress | Playwright |
| 3 | Ubicación E2E | `e2e/` raíz · `frontend/e2e/` | `e2e/` en raíz del monorepo |
| 4 | E2E en CI | En cada PR · solo `desarrollo` · manual | Primero manual / nightly; luego en PR smoke |
| 5 | BD en tests API | Solo mocks · Supabase test real | Mantener mocks en diario; BD real solo si hace falta |

---

## 11. Conclusión

- **Unitarios:** sí, el proyecto **ya usa Jest** en el backend; el frontend todavía no tiene suite.
- **Supertest:** **ya está** en el backend como tests de API (`npm run test:e2e`); falta ampliar cobertura a módulos nuevos, no “empezar de cero”.
- **E2E browser:** pendiente; conviene **Playwright** (o Cypress si el equipo lo prefiere) con pocos flujos críticos, después de estabilizar unitarios + Supertest + tests de componentes.

Este documento es el plan; la implementación concreta (instalación, configs y primeros specs del frontend/E2E) puede hacerse por fases según la tabla del §8.
