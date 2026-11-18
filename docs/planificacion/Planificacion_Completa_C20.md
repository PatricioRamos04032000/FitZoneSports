# Planificación completa — C-20

## 1. Objetivo

Este documento consolida la planificación del trabajo restante para la entrega final del proyecto FitZone Sports, con foco en la admisibilidad formal y en la demostración funcional del producto. La planificación cubre:

- plan general del proyecto hasta el cierre del entregable;
- EDT del equipo y distribución de horas;
- cronograma visual de tareas;
- trazabilidad de requisitos funcionales (RF), no funcionales (RNF) y de negocio (RN);
- seguimiento semanal de avances y bloqueos;
- riesgos, contingencias y criterio de desvíos.

Se considera la base de trabajo para la entrega T2 y la preparación del cierre definitivo del 19/11/2026.

---

## 2. Alcance del cierre

### 2.1 Entregable final esperado

La entrega debe cumplir, como mínimo, los siguientes objetivos:

1. Tener el sistema levantable en entorno local o con Docker.
2. Demostrar el guion de 5 minutos en UI con flujo funcional completo.
3. Dejar evidencia documental completa: ADR, diagramas, manuales, bitácoras, planificación y tablero.
4. Alinear el repositorio con la estructura recomendada en `docs/`.
5. Tener la demostración, la documentación y el tag de entrega sincronizados antes del congelamiento.

### 2.2 Entregables incluidos en esta planificación

- plan general de trabajo;
- distribución de esfuerzos por persona;
- cronograma hasta el cierre;
- matriz de trazabilidad de requisitos;
- seguimiento semanal y control de desvíos;
- riesgos, mitigaciones y decisiones de corte.

---

## 3. Equipo, roles y capacidad

| Integrante | Rol principal | Área de responsabilidad | Capacidad estimada |
|------------|--------------|------------------------|--------------------|
| Patricio Ramos | P1 | Arquitectura, documentación, backend crítico, coordinación y defensa | 8–10 h/semana |
| Bruno Conti | P2 | Backend, validaciones, requisitos funcionales, pruebas | 4–6 h/semana |
| Lucas Coquet | P3 | Frontend, UX, demo UI, responsive | 8–10 h/semana |
| Matias Goncevat | P4 | Planificación, CI, seed, Docker, cobertura, documentación de operación | 4–6 h/semana |

### Capacidad total estimada

| Equipo | Semanas | Horas estimadas |
|--------|---------|-----------------|
| Total | 2 semanas | 48–64 h aprox. |

### Regla de trabajo

- La documentación formal, la demo operable y la evidencia de entregable tienen prioridad sobre refinamientos cosméticos.
- Los cambios no esenciales se postergan si afectan admisibilidad, demo o congelamiento.
- Si hay desvío de tiempos, se prioriza fijar el núcleo de la entrega y cortar trabajo no crítico.

---

## 4. EDT del proyecto

### 4.1 Distribución del esfuerzo

| Área | Responsable | Horas estimadas | % del esfuerzo |
|------|-------------|-----------------|----------------|
| Arquitectura y documentación | Patricio | 16–20 h | 30–35% |
| Frontend demo / UX / responsive | Lucas | 16–20 h | 30–35% |
| Backend funcional / validaciones | Bruno | 8–12 h | 15–20% |
| CI / Docker / seed / cobertura / planificación | Matias | 8–12 h | 15–20% |
| Total | Equipo | 48–64 h | 100% |

### 4.2 Distribución por tramo

| Tramo | Fechas | Foco principal | Horas aprox. |
|-------|--------|----------------|--------------|
| T1 — Demo operable | 6 al 8/11 | UI funcional, flujo de reserva/pago, validación de pedido | 18–22 h |
| T2 — Admisibilidad y cierre | 9 al 15/11 | ADR, diagramas, manuales, bitácoras, plan, Docker/seed | 28–36 h |
| T3 — Congelamiento | 16 al 19/11 | defectos críticos, tag, dossier y presentación | 8–12 h |

---

## 5. Cronograma de trabajo

### 5.1 Cronograma visual (Gantt)

```mermaid
gantt
    title Planificación C-20 — cierre entrega FitZone Sports
    dateFormat  YYYY-MM-DD
    axisFormat %d/%m

    section T1 - Demo operable
    C-01 / reserva y pago UI       :done, c01, 2026-11-06, 2d
    C-02 / membresía visible       :active, c02, 2026-11-07, 1d
    C-03 / responsive móvil        :done, c03, 2026-11-07, 1d
    C-04 / PDF comprobante         :crit, c04, 2026-11-08, 1d
    C-05 / RNF-01 / decisión       :done, c05, 2026-11-06, 1d

    section T2 - Admisibilidad
    C-07 / Docker / conf          :active, c07, 2026-11-09, 3d
    C-08 / seed 25 sedes          :active, c08, 2026-11-09, 2d
    C-10 / CI + cobertura         :active, c10, 2026-11-10, 2d
    C-13 / estructura docs        :done, c13, 2026-11-09, 1d
    C-14 / ADR obligatorios       :done, c14, 2026-11-09, 2d
    C-15 / diagramas              :done, c15, 2026-11-10, 3d
    C-16 / manual usuario          :pending, c16, 2026-11-12, 2d
    C-17 / manual instalación      :pending, c17, 2026-11-12, 2d
    C-18 / manual técnico         :done, c18, 2026-11-11, 2d
    C-19 / bitácoras              :active, c19, 2026-11-12, 3d
    C-20 / planificación         :active, c20, 2026-11-13, 2d
    C-21 / export tablero         :pending, c21, 2026-11-14, 1d

    section T3 - Congelamiento
    C-22 / Anexo G / revisión      :active, c22, 2026-11-16, 2d
    C-23 / README raíz            :pending, c23, 2026-11-17, 1d
    C-24 / ensayo demo 5 min      :pending, c24, 2026-11-17, 1d
    C-25 / dossier PDF            :pending, c25, 2026-11-18, 1d
    C-26 / tag entrega            :pending, c26, 2026-11-19, 0.5d
    C-27 / Moodle upload          :pending, c27, 2026-11-19, 0.5d
```

### 5.2 Orden de ejecución

1. Cerrar la demo operable y validar la viabilidad técnica.
2. Completar los documentos de admisibilidad y trazabilidad.
3. Alinear la documentación con los requisitos de entrega.
4. Ejecutar T3 (congelamiento) con revisión final del Anexo G.

---

## 6. Trazabilidad de requisitos

### 6.1 Requisitos funcionales (RF)

| RF | Descripción | Responsable | Evidencia / entregable |
|----|-------------|-------------|------------------------|
| RF-02 | Membresía del socio y renovación | Patricio / Lucas | Perfil, pagos, plan y catálogo |
| RF-06 | Agenda de clases y gestión | Patricio | UI de clases y gestión |
| RF-07 | Inscripción a clases | Patricio / Lucas | Clase + lista de espera |
| RF-08 | Lista de espera | Patricio | Lógica de notificación / UI |
| RF-09 a RF-12 | Gestión de canchas | Patricio | Pantalla de administración de canchas |
| RF-14 | PDF comprobante post-pago | Bruno | comprobante generado |

### 6.2 Requisitos no funcionales (RNF)

| RNF | Descripción | Responsable | Evidencia / entregable |
|-----|-------------|-------------|------------------------|
| RNF-01 | Offline / acceso / sincronización | Patricio | ADR de acceso offline |
| RNF-02 | Seguridad y tokenización | Patricio | documentación y validación |
| RNF-03 | Mantenimiento y operación | Matias | Docker / seed / README |
| RNF-04 | Gestión de sedes | Patricio | alta y edición de sedes |

### 6.3 Requisitos de negocio (RN)

| RN | Descripción | Responsable | Evidencia |
|----|-------------|-------------|-----------|
| RN-01 | Check-out desde acceso | Patricio | salida de presencia y sincronización |
| RN-02 | Bloqueo y sobreventa | Bruno / Patricio | validación de reserva |
| RN-03 | Rutas de usuario y roles | Patricio / Bruno | guards y permisos |

### 6.4 Matriz de trazabilidad

| Requisito | Diseño | Implementación | Evidencia | Estado |
|-----------|--------|----------------|-----------|--------|
| RF-02 | membresía y planes | backend + UI | perfil, catalogo, pago | En cierre |
| RF-06 | agenda clase | backend + UI | clases / alta y edición | Cerrado |
| RF-07 / RF-08 | clases + waitlist | backend + UI | lista de espera | Cerrado |
| RF-09 a RF-12 | gestión canchas | backend + UI | canchas / pagos / mantenimiento | Cerrado |
| RNF-01 | acceso offline | ADR + flujo | cola-sync + QR | Cierre / validación |
| RNF-03 | despliegue y operación | Docker / seed | README / Docker | En curso |
| RNF-04 | sedes | API y UI | gestión de sedes | Cerrado |

---

## 7. Seguimiento semanal

### 7.1 Seguimiento y control

Se lleva control de avance sobre cinco ejes:

- funcionalidad: qué funciona en la demo;
- documentación: qué ya está en `docs/`;
- admisibilidad: qué pasa el chequeo del Anexo G;
- calidad: tests, cobertura, seed, Docker;
- riesgos: bloqueos y ejecución de contingencias.

### 7.2 Reuniones de seguimiento

| Fecha | Objetivo | Output |
|-------|----------|--------|
| 2026-11-06 | arrancar plan de cierre | plan T1/T2/T3 |
| 2026-11-09 | cerrar ADR y estructura docs | base documental |
| 2026-11-11 | alinear tablero y estados | estados de cierre |
| 2026-11-13 | revisar bitácoras y cierre documental | evidencia final |
| 2026-11-16 | pase final de Anexo G | checklist casi verde |
| 2026-11-19 | congelamiento y tag | cierre de la entrega |

---

## 8. Riesgos y mitigación

| Riesgo | Impacto | Probabilidad | Mitigación |
|--------|---------|--------------|------------|
| Demora en Docker/seed | bloquea arranque y validación | Media | Matias prioriza seed + README de 5 pasos |
| UI no opera en móvil | afecta demo y UX | Media | Lucas prioriza responsive y flujo clave |
| Documentación incompleta | afecta admisibilidad | Alta | Patricio y Matias revisan checklist a diario |
| Cierre final con defects críticos | arriesga nota y demo | Media | congelamiento enfocado en bugs de guion |
| Trello y plan desalineados | confusión de estados | Media | revisión semanal y estado real del tablero |

### Contingencia de corte

Si el tiempo se acorta, se recorta en este orden:

1. features no críticas;
2. mejoras de UX no necesarias para demo;
3. stretch no funcional;
4. refinamientos de documentación secundaria;
5. cualquier trabajo que no afecte la entrega final o la admisibilidad formal.

---

## 9. Desvíos y control de cambios

### 9.1 Desvíos esperados

Los desvíos más probables son:

- tareas de documentación que toman más tiempo que la estimación inicial;
- ajustes de UI para que la demo funcione en pantalla móvil;
- correcciones de CI/seed para que el arranque quede reproducible;
- cambios mínimos en el flujo de reserva para cerrar la demo con estabilidad.

### 9.2 Política de control

- Todo cambio que afecte la demo debe ser revisado por el responsable del flujo correspondiente.
- Todo cambio que impacte la documentación formal debe dejar evidencia en `docs/` y en la trazabilidad.
- Toda corrección de bugs críticos debe quedar registrada en la bitácora del responsable.

---

## 10. Criterio de cierre del C-20

La actividad C-20 se considera cerrada cuando:

- el paquete de planificación esté en `docs/planificacion/`;
- el cronograma visual y la EDT estén presentes;
- exista trazabilidad de RF/RN/RNF claramente vinculada al trabajo del equipo;
- se registre seguimiento, riesgos, contingencias y desvíos;
- el plan acompañe con evidencias reales al resto de los entregables de cierre.

### Checklist mínimo de aprobación

- [ ] Plan general del proyecto actualizado.
- [ ] EDT por integrante y por tramo.
- [ ] Cronograma visual en Mermaid o tabla.
- [ ] Trazabilidad de requisitos funcionales y no funcionales.
- [ ] Registro de seguimiento, riesgos y desvíos.
- [ ] Sin inconsistencias con el Anexo G, tablero y entregable real.

---

## 11. Lote agregado el 17/11

C-35 a C-41 están en el backlog del [plan de cierre](./Plan_Cierre_Entrega_6_19_Nov.md), con el mismo formato que C-01…C-34. C-38 es la reescritura de este archivo. El import a Trello de solo ese lote es [Plan_Cierre_C35-C41_Trello_Import.xlsx](./Plan_Cierre_C35-C41_Trello_Import.xlsx).

## 12. Estado final proyectado

El cierre del proyecto se proyecta con la siguiente secuencia:

1. cerrar UI y flujos funcionales;
2. revisar y completar documentación;
3. validar arranque local/Docker;
4. revisar checklist Anexo G;
5. ejecutar ensayo demo;
6. realizar tag del cierre y cargar dossier final.

Este plan es la base de coordinación del cierre y deja explicitado que el trabajo no es solo de desarrollo, sino también de documentación, trazabilidad y entrega formal.

---

*Planificación completa — FitZone Sports — C-20 · 2026-11-17*