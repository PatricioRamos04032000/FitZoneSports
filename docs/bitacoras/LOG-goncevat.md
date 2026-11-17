# Bitácora — Goncevat Matias — Rol P4

Registro individual de Matias Goncevat (P4, QA / DevOps / Mobile). Cada entrada es una sesión de trabajo. En **Commits** van los cambios relevantes de esa sesión y, cuando aplica, el entregable asociado a la tarea. Las horas son estimadas a partir de la duración real de la sesión o del avance registrado en el plan de trabajo.

---

## Sprint 1 — Unidad I — Semana del 2026-08-24

### 2026-08-27  ·  2 h

**Actividad**

Revisé el repositorio y el material base del proyecto para dejar claro mi rol dentro del equipo. Participé en la definición inicial del stack, la organización del monorepo y la preparación de la documentación base que luego guiaría las reuniones y la planificación del equipo.

**Decisión**

Mi participación debía orientarse a QA / DevOps / Mobile: no solo validar comportamiento, sino dejar el proyecto reproducible y documentado para que el resto pudiera levantarlo y probarlo sin ambigüedades.

**Problema o bloqueo**

El equipo aún estaba definiendo alcance y estructura. La prioridad fue dejar un punto de partida compartido y distinguir claramente lo que correspondía a documentación, backend y frontend.

**Commits**

- `815179a` Initial commit: add FitZone Sports integrator work document.
- `e96a34d` Add actor permissions docs and move docs into documentacion/.

---

## Sprint 1 — Unidad I — Semana del 2026-08-31

### 2026-08-31  ·  2 h

**Actividad**

Revisé las decisiones pendientes del proyecto y ayudé a cerrar la comprensión del alcance de la primera entrega. En ese marco dejé consignados los puntos de decisión y los riesgos de alcance para que el equipo no repitiera discusiones previas.

**Decisión**

La revisión de decisiones pendientes debía ser parte de la base del trabajo y no una tarea opcional. De esa manera, cada propuesta se contrastaba con el contexto real del proyecto y con los requisitos del docente.

**Problema o bloqueo**

Había varias decisiones de negocio y arquitectura dispersas en documentos. La tarea central era no perder contexto y evitar que cada integrante interpretara distinto la misma decisión.

**Commits**

- `c8836ba` Add stack, C4, ADRs and pending decisions docs.
- `789657b` Add 2-week work plan and doc updates from professor feedback.

---

## Sprint 2 — Unidad I — Semana del 2026-09-14

### 2026-09-19  ·  2 h

**Actividad**

Ajusté el plan de trabajo con las tareas que le correspondían a mi rol. En particular, completé la tabla de integrantes y la organización del monorepo, dejando explícito quién era responsable de infraestructura, QA y documentación.

**Decisión**

El trabajo de infraestructura y control de calidad debía quedar visible dentro del plan, no como soporte tácito. Así, la parte de reproducibilidad y pruebas no quedaba diluida entre backend y frontend.

**Problema o bloqueo**

No había una convención clara para carpetas, roles y responsabilidades. Sin esa base, la coordinación y la trazabilidad de tareas quedaban frágiles.

**Commits**

- `3bbf2e3` Reconstrucción del plan de organización del monorepo y tabla de integrantes.

---

## Sprint 2 — Unidad II — Semana del 2026-09-21

### 2026-09-26  ·  1 h

**Actividad**

Validé la experiencia de inicio del proyecto en local y reforcé la documentación de levantamiento. Mi foco estuvo en la parte operativa: qué hacía falta para clonar, configurar variables de entorno y probar el login desde una instalación limpia.

**Decisión**

La documentación de setup debía quedar en un README claro y reproducible, porque el proyecto crecía y cualquier bloqueo operativo podía frenar a todo el equipo.

**Problema o bloqueo**

La base todavía no estaba armonizada entre backend y frontend. La falta de un README operativo era un riesgo real para la prueba manual y para la integración del equipo.

**Commits**

- `c0d7b2b` Reconstrucción del README y checklist de setup local.

---

## Sprint 3 — Unidad II — Semana del 2026-10-05

### 2026-10-08  ·  3 h

**Actividad**

Probé el backend y el flujo de login en local para confirmar el funcionamiento real del endpoint y dejar evidencia de la integración mínima. Este trabajo me permitió detectar qué faltaba para que el frontend consumiera la API sin depender de datos mockeados.

**Decisión**

La prueba funcional debía quedar documentada con resultados concretos, no solo con “funciona en mi máquina”. Eso ayudó a ordenar el trabajo de QA y dejaba una base más sólida para la siguiente etapa.

**Problema o bloqueo**

El endpoint de login estaba operativo, pero la base de datos de Supabase asociada al proyecto no tenía sedes cargadas. Eso hacía que la prueba del backend mostrara un resultado correcto en el endpoint auth, pero incompleto para la experiencia real del usuario.

**Commits**

- `e397f8e` Setup inicial de testing E2E y documentación base del proyecto.
- `2ebc6b3` Validación de login y endpoints con evidencia de prueba.

---

## Sprint 4 — Unidad III — Semana del 2026-10-12

### 2026-10-15  ·  3 h

**Actividad**

Preparé el setup inicial de testing E2E y reforcé la documentación del proyecto para que el equipo pudiera validar de forma más consistente el flujo de login y el consumo del backend. La prioridad fue dejar herramientas de integración sin depender de la depuración manual constante.

**Decisión**

La automatización del QA no es un extra: es un criterio de estabilidad. Si no hay pruebas reproducibles, los cambios quedan sujetos a la memoria del equipo y no a evidencia.

**Problema o bloqueo**

El frontend comenzó a crecer y el backend no siempre respondía con datos reales. La ausencia de una base de pruebas E2E hacía que cada cambio fuera más difícil de validar con certeza.

**Commits**

- `e397f8e` Setup inicial de testing E2E y documentación del proyecto.

---

## Sprint 5 — Unidad III — Semana del 2026-10-19

### 2026-10-22  ·  2 h

**Actividad**

Actualicé el plan de trabajo y el LOG con el contenido de la semana 5. Mi tarea central fue dejar alineado el seguimiento del equipo con la nueva propuesta de tres semanas, incorporando responsables, estados y tareas pendientes por rol.

**Decisión**

El registro debía reflejar el estado real del proyecto y no solo la agenda ideal. Si el plan se desalineaba, la trazabilidad y la entrega se volvía más difícil.

**Problema o bloqueo**

Había varios planes superpuestos y varias tareas sin estado claro. El trabajo de coordinación era separar lo resuelto de lo que seguía en curso y dejarlo visible para el equipo.

**Commits**

- `97483c2` Actualización del plan de trabajo y del LOG con contenido de la semana 5.

---

## Sprint 5 — Unidad III — Semana del 2026-10-26

### 2026-11-01  ·  4 h

**Actividad**

Integré pruebas de Postman y ajusté aspectos de backend y documentación relacionados con canchas. Luego me enfoqué en la parte de CI, corrigiendo la configuración de Jest y el workflow de GitHub Actions para que la suite pudiera ejecutarse en entorno de integración sin errores de ESM ni rutas internas.

**Decisión**

La calidad no se prueba solo con “login manual”, sino también con automatización y observabilidad en CI. El proyecto necesitaba un flujo verificable para que los cambios no se rompieran por detalles del entorno.

**Problema o bloqueo**

El workflow de GitHub Actions no soportaba bien la configuración de Jest con módulos ESM, y eso dejaba la CI frágil. Tuve que corregir la configuración y revisar la ejecución real de tests para no dejar un pipeline falso positivo.

**Commits**

- `2c03798` Incorporación de tests de Postman, ajustes de backend y documentación de canchas.
- `6582367` Fix(ci): utilizar npm test en el workflow de GitHub Actions.
- `79d8eb2` Fix(ci): corregir el comando de tests para soportar ESM.
- `fd89acd` Fix(ci): inyectar NODE_OPTIONS experimental-vm-modules para Jest.
- `6c5b289` Fix(ci): unificar configuración de Jest y workflow.

---

## Sprint 5 — Unidad III — Semana del 2026-11-05

### 2026-11-05  ·  2 h

**Actividad**

Ajusté el plan vigente adoptando la propuesta de 3 semanas y dejé el checklist de cuentas de GitHub, Supabase y Vercel en una forma visible para todo el equipo. Eso me permitió cerrar la parte operativa de la semana y dejar más clara la coordinación de la entrega.

**Decisión**

El plan de trabajo debía reflejar responsabilidades concretas del equipo y no solo tareas generales. El checklist de accesos es parte de la operación del proyecto y evita bloqueos de coordinación durante la entrega.

**Problema o bloqueo**

El equipo aún tenía dudas sobre quién administraba cada cuenta y dónde quedaban los accesos del proyecto. Eso podía generar dependencia puntual y fricción durante la ejecución del trabajo.

**Commits**

- `5d934bc` S5-T10/S5-T11: adoptar plan de 3 semanas y registrar checklist de cuentas.

---

## Sprint 6 — Cierre y documentación — Semana del 2026-11-13

### 2026-11-13  ·  3 h

**Actividad**

Revisé la documentación del proyecto y dejé cerrada la evidencia de trabajo de QA / DevOps y coordinación para la etapa final. Mi foco fue asegurar que el estado real del proyecto quedara visible y no solo la intención de trabajo.

**Decisión**

La bitácora y la documentación deben quedar como evidencia objetiva: no solo de tareas sin misión, sino de decisiones, bloqueos y entregables que resolvieron problemas reales del proyecto.

**Problema o bloqueo**

El proyecto tenía varias líneas de trabajo avanzando en paralelo y resultaba clave dejar en un mismo documento la evidencia de pruebas, CI, documentación y coordinación para no perder contexto de entrega.

**Commits**

- `66c4562` C-19d: agrega bitácora individual de Matias Goncevat con entradas, actividad, decisiones, bloqueos, commits y horas.
- `cccc91c` docs: completa planificación (§5.6), EDT, trazabilidad, riesgos y Anexos G/H [C-20].
- `4d386df` C-17: [manual de instalación y operación](../manuales/manual-instalacion-operacion.md), con requisitos, entorno, seed, arranque local, operación y contingencias.

---

## Sprint 6 — Cierre y documentación — Semana del 2026-11-17

### 2026-11-17  ·  5 h

**Actividad**

Cerré la tarea C-10 de suite verde, cobertura y umbral de ADR-008. Verifiqué que los 173 tests del backend pasaran (28 suites) y que la cobertura global de sentencias quedara en 63.93 %, por encima del 60 % exigido por el ADR-008. Ajusté `backend/jest.config.ts` para imponer `coverageThreshold` y actualicé `.github/workflows/ci-backend.yml` para que la pipeline corra `npm run test:cov -- --runInBand` y falle si cae por debajo del umbral. También dejé la evidencia final del cierre de la bitácora individual y registré la revisión del cierre de la pantalla Clases (C-11) dentro de la documentación del proyecto.

**Decisión**

La cobertura no podía quedar como un dato opcional en un reporte. Debía transformarse en una validación automática en CI para evitar entregas con pruebas verdes pero cobertura insuficiente. Asimismo, la documentación del cierre y la revisión funcional debían quedar registradas para que no se perdiera el contexto de la entrega final.

**Problema o bloqueo**

La suite ya pasaba localmente, pero el pipeline no lo validaba de forma automática ni aplicaba un umbral real. La solución fue dejar la ejecución de cobertura en la CI y declarar el umbral en Jest para que el fallo sucediera de forma reproducible. Además, el cierre funcional y documental de la entrega se realizó en paralelo, por lo que era importante registrar cada entregable con su evidencia concreta.

**Commits**

- `7bbc862` docs: registra C-10 en la bitácora individual de Goncevat (P4)
- `550f579` C-10: cierra suite verde, cobertura y umbral ADR-008
- `befbe1a` C-11: anota la revisión del cierre de la pantalla Clases.
- `4d386df` C-17: [manual de instalación y operación](../manuales/manual-instalacion-operacion.md), con requisitos, entorno, seed, arranque local, operación y contingencias.
- `cccc91c` docs: completa planificación (§5.6), EDT, trazabilidad, riesgos y Anexos G/H [C-20]
- `66c4562` C-19d: agrega bitácora individual de Matias Goncevat con entradas, actividad, decisiones, bloqueos, commits y horas

---

## Resumen de contribución

Mi aporte principal fue sostener la calidad operativa del proyecto y la trazabilidad del trabajo: validación de flujo, pruebas E2E y Postman, configuración de CI, documentación de setup, planificación y cierre de entregables. Esa combinación de tareas me dejó centrado en QA / DevOps / Mobile, con foco en que el proyecto pudiera ejecutarse, probarse y documentarse sin depender de la memoria del equipo.
