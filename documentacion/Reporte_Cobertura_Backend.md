# Reporte de cobertura — Backend (Unidad V)

**Proyecto:** FitZone Sports  
**Entregable:** Reporte de cobertura del comando `npm run test:cov` del backend  
**Unidad:** V — Testing y CI/CD (15 % de la rúbrica)  
**Estado:** ✅ Completo (sin Docker)  
**Fecha:** 2026-10-31  
**Responsable:** Matias Goncevat (P4) — tarea S7-T10  

---

## 1. Objetivo

Generar y documentar el artefacto del reporte de cobertura de tests unitarios del backend (`backend/`) ejecutando el comando `npm run test:cov`, para que pueda ser consultado localmente y utilizado por la pipeline de CI sin necesidad de Docker.

---

## 2. Prerrequisitos

| Requisito | Detalle |
|-----------|---------|
| Repositorio clonado | Rama `desarrollo` del repo `FitZoneSports`. |
| Node.js + npm | Versiones instaladas (ver `package.json`). |
| Dependencias instaladas | `npm install` ejecutado dentro de `backend/`. |
| Variables de entorno | `backend/.env` con `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` (plantilla en `.env.example`). En redes con inspección SSL usar `NODE_OPTIONS=--use-system-ca`. |

---

## 3. Cómo generar el reporte de cobertura

Desde la raíz del monorepo, ejecutar:

```bash
# 1. Entrar al backend
cd backend

# 2. (Opcional) Instalar dependencias si aún no lo hizo
npm install

# 3. Ejecutar tests con cobertura
npm run test:cov
```

### ¿Qué hace el comando?

Según `backend/package.json` (línea 19):

```json
"test:cov": "node --experimental-vm-modules ./node_modules/jest/bin/jest.js --coverage"
```

- Ejecuta **Jest 30** con `ts-jest` sobre los tests unitarios (`src/**/*.spec.ts`).
- El flag `--coverage` activa la medición de cobertura de código.
- No requiere Docker ni contenedores.

---

## 4. Dónde se genera el reporte

Luego de ejecutar `npm run test:cov`, Jest crea la carpeta:

```
backend/coverage/
```

Esta carpeta **no se commitea** (está ignorada en el `.gitignore` raíz: `/coverage`).

### Archivos generados

| Archivo / carpeta | Formato | Uso |
|-------------------|---------|-----|
| `lcov.info` | LCOV | Reporte de cobertura legible por herramientas de CI (SonarCloud, Codecov, etc.). |
| `lcov-report/index.html` | HTML | Reporte visual navegable. Abrir este archivo en el navegador para explorar cobertura por archivo. |
| `lcov-report/` | Directorio | Recursos del reporte HTML (CSS, JS, imágenes, subcarpetas por módulo `src/`). |
| `clover.xml` | Clover | Formato alternativo de cobertura para CI. |
| `coverage-final.json` | JSON | Datos crudos de cobertura generados por Jest/istanbul. |

### Cómo consultar el reporte visual

```bash
# Desde backend/
start coverage/lcov-report/index.html    # Windows (PowerShell)
# o
# Abrir manualmente el archivo backend/coverage/lcov-report/index.html en el navegador
```

---

## 5. Alcance de la medición

Configurado en `backend/jest.config.ts`:

- **Carpetas incluidas:** `src/**`, `libs/**`, `apps/**`
- **Excluidas de la medición:** `*.module.ts`, `*.dto.ts`, `*.model.ts`, `*.decorator.ts`, `*.spec.ts`, `main.ts`, `swagger.ts`
- **Patrón de tests:** `.*\.spec\.ts$` (tests unitarios)
- **Entorno:** `node`

> Los tests e2e (`test/**/*.e2e-spec.ts`, ejecutados con `npm run test:e2e`) usan una config separada (`test/jest-e2e.json`) y **no** se miden con `test:cov` por defecto.

---

## 6. Resultado de la última ejecución (referencia)

Ejecutado en `desarrollo`, sin Docker:

```
Test Suites: 22 passed, 22 total
Tests:       89 passed, 89 total
Snapshots:   0 total
Time:        13.223 s
```

La cobertura se calcula sobre los archivos de `src/` (excluyendo los marcados en `jest.config.ts`). Módulos con cobertura alta incluyen `auth/`, `sedes/`, `supabase/`, `notificaciones/observers` y `health/`. Módulos sin tests aún muestran 0 % (por ejemplo, `clases/` y `membresias/`), lo cual es esperado dado que aún no tienen specs unitarios.

> **Nota:** No se impone un umbral mínimo de cobertura (`coverageThreshold`) en esta entrega. El entregable de la Unidad V es la existencia del reporte y su trazabilidad, no un porcentaje mínimo obligatorio.

---

## 7. Integración con la pipeline de CI (sin Docker)

El reporte está listo para ser consumido por la pipeline sin modificar el comando:

1. El job de tests corre `cd backend && npm run test:cov`.
2. Se genera `backend/coverage/lcov.info`.
3. Ese archivo se publica/consumen en el paso de SonarCloud:
   - `sonar.javascript.lcov.reportPaths=backend/coverage/lcov.info`
   - Ver `documentacion/Guia_SonarCloud_FitZone.md` (línea 52) y el `sonar-project.properties` borrador (línea 42-53).

Ejemplo de flujo en GitHub Actions (sin Docker):

```yaml
- name: Run tests with coverage
  run: |
    cd backend
    npm run test:cov
- name: SonarCloud scan
  env:
    SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
  run: |
    sonar-scanner \
      -Dsonar.javascript.lcov.reportPaths=backend/coverage/lcov.info
```

---

## 8. Notas y limitaciones

- El reporte se genera en `backend/coverage/` y está en `.gitignore`; no debe commitearse.
- `npm run test:cov` mide solo tests unitarios de Jest. Los e2e con Supertest (`npm run test:e2e`) requieren su propia ejecución y config.
- No hay umbral de cobertura forzado; se puede agregar en `jest.config.ts` si el equipo lo decide en la Fase 4 del plan de calidad (`Guia_Implementacion_Tests.md`).
- No se utiliza Docker en ningún paso de este entregable.

---

## 9. Referencias cruzadas

| Documento | Relación |
|-----------|----------|
| `backend/package.json` | Define el script `test:cov`. |
| `backend/jest.config.ts` | Configura `coverageDirectory: './coverage'` y `collectCoverageFrom`. |
| `documentacion/Guia_Implementacion_Tests.md` | Guía general de tests backend y frontend. |
| `documentacion/Estructura_Backend.md` | Tabla de scripts y tests (§7). |
| `documentacion/Guia_SonarCloud_FitZone.md` | Integración del reporte LCOV con SonarCloud (línea 52). |
| `documentacion/Panorama_Desarrollo_2026-10-13.md` | Entregable Unidad V: reporte de cobertura. |
| `documentacion/Propuesta_Continuacion_Semanas.md` | Tarea S7 (Matias, 2 h): artifact/doc de `npm run test:cov`. |
