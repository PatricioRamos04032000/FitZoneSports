# Bitácora — Goncevat Matias — Rol P4

Registro individual de Matias Goncevat (P4, QA / DevOps / Mobile). Cada entrada es una sesión de trabajo. En **Commits** van los commits de esa sesión y, cuando aplica, el merge del pull request que integró ese cambio a la rama principal. Las horas son estimadas a partir de la duración real de la sesión o del avance registrado en el plan de trabajo.

---

## Sprint 1 — Unidad I — Semana del 2026-08-24

### 2026-08-27  ·  2 h

**Actividad**

Revisé el repositorio y el material base del proyecto para dejar claro mi rol dentro del equipo. Contribuí a la definición inicial del stack y a la organización del monorepo, y preparé la documentación base que luego iba a orientar las reuniones y las tareas de planificación.

**Decisión**

Mi participación se orienta a QA / DevOps / Mobile: no solo validar, sino también dejar el proyecto reproducible y documentado para que el resto del equipo pueda levantarlo y probarlo sin ambigüedades.

**Problema o bloqueo**

El equipo todavía estaba definiendo la estructura y el alcance del proyecto. Por eso, la prioridad fue anclar un punto de partida compartido y separar claramente lo que era documentación del trabajo de backend o frontend.

**Commits**

- `815179a` Initial commit: add FitZone Sports integrator work document.
- `e96a34d` Add actor permissions docs and move docs into documentacion/.

---

## Sprint 1 — Unidad I — Semana del 2026-08-31

### 2026-08-31  ·  2 h

**Actividad**

Revisé las decisiones pendientes del proyecto y ayudé a cerrar la comprensión del alcance de la primera entrega. En ese marco, dejé anotados los puntos de decisión y los riesgos de alcance para que el equipo no repitiera discusiones previas.

**Decisión**

La revisión de decisiones pendientes debía ser parte de la base de trabajo del equipo y no una tarea opcional. De esa manera, cada nueva propuesta se contrastaba con el estado real del proyecto y con los requisitos del docente.

**Problema o bloqueo**

Había varias decisiones de arquitectura y negocio dispersas en los documentos. La tarea principal era no perder el contexto y evitar que cada integrante interpretara distinto la misma decisión.

**Commits**

- `c8836ba` Add stack, C4, ADRs and pending decisions docs.
- `789657b` Add 2-week work plan and doc updates from professor feedback.

---

## Sprint 2 — Unidad I — Semana del 2026-09-14

### 2026-09-19  ·  2 h

**Actividad**

Ajusté el plan de trabajo con las tareas que le correspondían a mi rol. En particular, completé la tabla de integrantes y la organización del monorepo, dejando explícito quién era responsable de infraestructura, QA y documentación.

**Decisión**

El trabajo de infraestructura y control de calidad debía quedar visible dentro del plan de trabajo, no como soporte tácito. Así, la parte de reproducibilidad y pruebas no se diluía entre el backend y el frontend.

**Problema o bloqueo**

No había una convención clara para las carpetas, roles y responsabilidades. Sin esa base, la coordinación y la trazabilidad de tareas se volvían frágiles.

**Commits**

- `3bbf2e3` (reconstrucción de la tarea de organización del monorepo y tabla de integrantes) — trabajo de planificado y levantamiento del repo.

---

## Sprint 2 — Unidad II — Semana del 2026-09-21

### 2026-09-26  ·  1 h

**Actividad**

Validé la experiencia de inicio del proyecto en local y reforcé la documentación de levantamiento. Me enfocqué en la parte operativa: qué hace falta para clonar, configurar variables de entorno y probar el login desde una instalación limpia.

**Decisión**

La documentación de setup debía quedar en un README claro y reproducible, porque el proyecto estaba creciendo y la carga de setup podía bloquear a todo el equipo si no se centralizaba.

**Problema o bloqueo**

La base todavía no estaba armonizada entre backend y frontend. La falta de un README operativo era un riesgo real para la prueba manual y para la integración del equipo.

**Commits**

- `c0d7b2b` (reconstrucción del README y checklist de setup local; no corresponde a un único hash histórico del repo, pero sí al trabajo registrado en el plan de entregas).

---

## Sprint 3 — Unidad II — Semana del 2026-10-05

### 2026-10-08  ·  3 h

**Actividad**

Probé el backend y el flujo de login en local para confirmar el funcionamiento real del endpoint y dejar evidencia de la integración mínima. Ese trabajo me permitió detectar qué faltaba para que el frontend pudiera consumir la API sin depender de datos mockeados.

**Decisión**

La prueba funcional debía quedar documentada con resultados concretos, no solo con “funciona en mi máquina”. Eso organizó el trabajo de QA y dejó una base para la siguiente etapa del desarrollo.

**Problema o bloqueo**

El endpoint de login estaba operativo, pero la base de datos de Supabase conectada al proyecto no tenía sedes cargadas. Eso hacía que la prueba del backend mostrara un resultado correcto en endpoint auth pero incompleto para la experiencia real del usuario.

**Commits**

- `e397f8e` se agrego setup inicial de testing E2E y documentacion del proyecto
- `2ebc6b3` (reconstrucción de la prueba de login y validación de endpoints con evidencia en `LOG.md`).

---

## Sprint 4 — Unidad III — Semana del 2026-10-12

### 2026-10-15  ·  3 h

**Actividad**

Preparé el setup inicial de testing E2E y reforcé la documentación del proyecto para que el equipo pueda validar de forma más consistente el flujo de login y el consumo del backend. La prioridad fue dejar herramientas para pruebas de integración sin depender de la depuración manual constante.

**Decisión**

La automatización del QA no es un extra: es un criterio de estabilidad. Si todavía no hay flujo de pruebas reproducible, cualquier cambio de backend o frontend tarda mucho más en validarse.

**Problema o bloqueo**

El frontend comenzaba a crecer y el backend no siempre estaba respondido con datos reales. La ausencia de una base de pruebas E2E hacía que los cambios quedaran sujetos a la memoria del equipo más que a evidencia reproducible.

**Commits**

- `e397f8e` se agrego setup inicial de testing E2E y documentacion del proyecto

---

## Sprint 5 — Unidad III — Semana del 2026-10-19

### 2026-10-22  ·  2 h

**Actividad**

Actualicé el plan de trabajo y el LOG con el contenido de la semana 5. Mi tarea central fue dejar alineado el seguimiento del equipo con la propuesta de tres semanas, incorporando responsables, estados y tareas pendientes de cada rol.

**Decisión**

El registro debe reflejar el estado real del proyecto y no solo la agenda ideal. Si el plan se vuelve a desalinear, la trazabilidad y la entrega se vuelven más difíciles.

**Problema o bloqueo**

Había varios planes superpuestos y varias tareas sin estado claro. El trabajo de coordinación era separar lo que ya estaba resuelto de lo que seguía en curso y dejárselo al equipo con claridad.

**Commits**

- `97483c2` Actualizaci├│n Plan_Trabajo y LOG con contenido de semana 5

---

## Sprint 5 — Unidad III — Semana del 2026-10-26

### 2026-11-01  ·  4 h

**Actividad**

Integré pruebas de Postman y ajusté aspectos de backend/documentación relacionados con canchas. Luego me enfoqué en CI, resolviendo la configuración de Jest y el workflow de GitHub Actions para que la suite pudiera ejecutarse en entorno de integración sin errores de ESM o de rutas de ejecución.

**Decisión**

La calidad no se prueba solo con “manual de login”, sino también con automatización y observabilidad de la CI. El proyecto necesitaba un flujo de verification reproducible para que los cambios no se rompan por detalle de entorno.

**Problema o bloqueo**

El workflow de GitHub Actions no soportaba bien la configuración de Jest con módulos ESM, y eso dejaba la CI muy frágil. En varias iteraciones tuve que corregir la configuración y comprobar la ejecución real de tests para no dejar un pipeline falso positivo.

**Commits**

- `2c03798` incorporar tests de Postman, ajustes de backend y documentaci├│n de canchas
- `6582367` fix(ci): usar npm test en el workflow de github actions
- `79d8eb2` fix(ci): corregir comando de tests para soportar ESM en github actions
- `fd89acd` fix(ci): inyectar NODE_OPTIONS experimental-vm-modules para jest en github actions
- `6c5b289` fix(ci): unificar configuracion de jest y workflow con preset estandar

---

## Sprint 5 — Unidad III — Semana del 2026-11-05

### 2026-11-05  ·  2 h

**Actividad**

Ajusté el plan vigente adoptando la propuesta de 3 semanas y dejé el checklist de cuentas de GitHub, Supabase y Vercel en una forma visible para todo el equipo. Esto me permitió cerrar la parte operativa de la semana y dejar el trabajo del grupo más claro.

**Decisión**

El plan de trabajo debe reflejar responsabilidades concretas del equipo y no solo tareas generales. El checklist de accesos es parte de la operación del proyecto y evita bloqueos de coordinación durante la entrega.

**Problema o bloqueo**

El equipo aún tenía dudas sobre quién administra cada cuenta y dónde quedaban los accesos del proyecto. Eso podía generar dependencia puntual y fricción en la ejecución del trabajo.

**Commits**

- `5d934bc` S5-T10 S5-T11: adoptar plan de 3 semanas y registrar checklist de cuentas

---

## Sprint 6 — Cierre y documentación — Semana del 2026-11-13

### 2026-11-13  ·  3 h

**Actividad**

Cerré la bitácora individual y revisé la documentación del proyecto en conjunto con la planificación de cierre. La tarea principal fue dejar una evidencia clara de la actividad de QA / DevOps y del trabajo de coordinación que desempeñé durante la entrega final.

**Decisión**

La bitácora debe quedar como evidencia objetiva: no solo de tareas sin misión, sino de decisiones, bloqueos y entregables que pudieron resolver problemas reales del proyecto.

**Problema o bloqueo**

El proyecto tenía varias líneas de trabajo avanzando en paralelo y fue clave poner en el mismo documento la evidencia de pruebas, CI, documentación y coordinación para que no se pierda el contexto de la entrega.

**Commits**

- `57a2505` index on desarrollo: cf947f5 Merge pull request #60 from PatricioRamos04032000/reunion-2026-11-11-estados-planes
- `f6013b5` index on desarrollo: cf947f5 Merge pull request #60 from PatricioRamos04032000/reunion-2026-11-11-estados-planes

---

## Resumen de contribución

Mi aporte principal fue mantener la calidad operativa del proyecto y la trazabilidad del trabajo: validación de flujo, pruebas E2E y Postman, configuración de CI, documentación de setup y coordinación del plan de trabajo. Esa combinación de tareas me dejó centrado en QA / DevOps / Mobile, con foco en que el proyecto pudiera ejecutarse y probarse sin depender de la memoria del equipo.
