# Guía SonarCloud — FitZone Sports

**Fecha:** 2026-10-27  
**Responsable de la org:** Patricio Ramos (P1)  
**Quién conecta el CI:** Matias Goncevat (P4), cuando arme el pipeline (S6 / Unidad V)  
**Herramienta:** [SonarCloud](https://sonarcloud.io) (SonarQube en la nube; no hace falta instalar servidor)

La cátedra menciona SonarQube / ESLint / PMD como detectores de olores. En este repo usamos **SonarCloud** + el lint que ya existe (Oxlint en backend, ESLint en frontend). El pipeline mínimo sigue siendo **lint → test → build**; Sonar es un paso **extra** de calidad.

---

## 1. Qué tienen que hacer los compañeros (ahora)

Objetivo: tener cuenta y poder entrar a la organización del equipo. **No** hace falta configurar el análisis del repo todavía.

### Paso a paso (Bruno, Lucas, Matias)

1. Entrá a [https://sonarcloud.io](https://sonarcloud.io).
2. Elegí **Log in with GitHub** (la misma cuenta con la que trabajan el repo `FitZoneSports`).
3. Aceptá los permisos que pida GitHub ↔ SonarCloud.
4. Avisá a Patricio (Discord / chat del equipo) cuando tu usuario de SonarCloud esté listo.  
   Conviene decir el **usuario de GitHub** con el que entraste, para que te invite bien.
5. Cuando Patricio te invite a la organización, aceptá la invitación (mail o aviso en SonarCloud).
6. (Opcional, recomendado para Matias y quien toque código seguido) En Cursor / VS Code instalá la extensión **SonarQube for IDE** (antes SonarLint) y, cuando la org esté compartida, vinculala a SonarCloud para ver olores en el editor.

**No hace falta que hagan:** crear otra organización, generar tokens, tocar GitHub Actions, ni analizar el proyecto a mano.

---

## 2. Qué hace Patricio después (cuando ya tengan cuenta)

1. En SonarCloud → organización del equipo → **Members** / invitaciones.
2. Invitar a Bruno, Lucas y Matias (por usuario de GitHub o el mail asociado).
3. Confirmar que el proyecto del repo `FitZoneSports` esté importado (o importarlo una vez).
4. Anotar y compartir por canal seguro (no en el repo):
   - nombre de la **organization**
   - **projectKey** del proyecto
5. Generar un **token** de SonarCloud (para CI) y pasárselo solo a Matias, o pedirle a Matias que lo genere él con permisos de la org.
6. En GitHub → Settings del repo → Secrets → crear `SONAR_TOKEN` (lo puede cargar Matias con el token).
7. Dejar listo un borrador de `sonar-project.properties` en la raíz del monorepo (cuando Matias arranque CI), por ejemplo:

```properties
sonar.projectKey=REEMPLAZAR_PROJECT_KEY
sonar.organization=REEMPLAZAR_ORG

sonar.sources=backend/src,frontend/src
sonar.tests=backend/src,backend/test
sonar.test.inclusions=**/*.spec.ts,**/*.e2e-spec.ts

sonar.exclusions=**/node_modules/**,**/dist/**,**/coverage/**,**/documentacion/**

sonar.javascript.lcov.reportPaths=backend/coverage/lcov.info
```

8. Actualizar esta guía o el LOG con “org compartida + miembros OK” cuando estén adentro.

---

## 3. Qué hace Matias cuando toque CI (S6) — no ahora

Orden sugerido (sin mezclar con otras tareas):

1. Workflow GitHub Actions en PR a `desarrollo`: **lint → test → build** del backend.
2. En el job de tests: cobertura LCOV (`npm test -- --coverage` / `test:cov` según el script).
3. Job o paso **SonarCloud Scan** con:
   - `fetch-depth: 0` en el checkout
   - secret `SONAR_TOKEN`
   - acción oficial SonarCloud / sonar-scanner
4. (Opcional) Quality Gate blando al principio; no bloquear el equipo el primer día.

Referencia de acción: documentación actual de SonarCloud para GitHub Actions.

---

## 4. Criterio del equipo (cátedra)

Sonar **detecta** olores (método largo, duplicación, etc.). **Corregir o no** lo decide el equipo según si esa zona del código va a cambiar. En Unidad III eso se documenta (planilla de olores / LOG): detectar y a veces **no** refactorizar también cuenta.

---

## 5. Checklist rápido

| Quién | Qué | Estado |
|-------|-----|--------|
| Compañeros | Cuenta SonarCloud con GitHub | Por hacer |
| Patricio | Invitar a la org + compartir org/projectKey | Después de las cuentas |
| Patricio / Matias | Secret `SONAR_TOKEN` en GitHub | Cuando exista CI |
| Matias | Workflow lint/test/build + scan Sonar | S6 / Unidad V |

**Relacionado:** [Decisiones §7](./Decisiones_Pendientes_y_Cosas_a_Definir.md) · [Propuesta continuación — CI Matias](./Propuesta_Continuacion_Semanas.md)
