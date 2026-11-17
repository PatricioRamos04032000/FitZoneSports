# Plan Maestro de Cierre y Entrega: FitZone Sports (TIF)

* **Fecha límite / Congelamiento:** Jueves 19/11/2026 a las 18:00 h (tag anotado `v1.0-entrega`).  
* **Estado actual (17/11):** Rama `desarrollo` en commit `0164f9b` (`C-19b`). **Cumplimiento global: \~68 % — NO admisible hoy** (nota realista actual: **\< 6** por fallos de compilación, cobertura insuficiente y artefactos faltantes).  
* **Objetivo:** Subsanar bloqueantes de compilación y admisibilidad, consolidar pruebas reales y cerrar la documentación para alcanzar una calificación de **9–10 (Destacado)**.  
* **Reglas de penalización:** Entrega fuera de término (**72 h**) o devolución por no admisibilidad restan **−2 puntos**. Más de **72 h** implica pérdida de promoción directa.

---

## 1\. Diagnóstico Consolidado por Ámbito (Auditoría Real)

| Ámbito / Artefacto | Estimación | Estado Real Verificado | Veredicto |
| :---- | :---: | :---- | :---- |
| **Código y Build** (`backend/`, `frontend/`) | 75 % / 70 % | **El backend NO compila** (falla de tipos y resolución de `pdfkit`). Frontend aún contiene páginas/textos placeholder y ramas `C-29`…`C-34` sin mergear. | ❌ **Bloqueante Crítico** |
| **Pruebas y CI** | 55 % | 173 unitarias pasan, pero **falla 1 suite (comprobantes)** y la **cobertura actual es 56.83 %** (por debajo del umbral de **60 %** exigido en `ADR-008`). Falta prueba real de concurrencia en BD y protección de rama en CI. | ❌ **Bloqueante Crítico** |
| **Admisibilidad Formal** | 55 % | Faltan `docker-compose.yml`, `Dockerfile` (back/front), `LICENSE`, `manual-usuario.md`, `LOG-coquet.md`, `Dossier PDF` y tag `v1.0-entrega`. | ❌ **Bloqueante Crítico** |
| **Bitácoras** (`docs/bitacoras/`) | 75 % | Existen `LOG-ramos.md`, `LOG-conti.md`, `LOG-goncevat.md` y `LOG.md` con actividad distribuida. **Falta `LOG-coquet.md`**. | ❌ **Bloqueante** |
| **Manuales** (`docs/manuales/`) | 66 % | Existen `manual-tecnico.md` y `manual-instalacion-operacion.md`. **Falta `manual-usuario.md`**. | ❌ **Bloqueante** |
| **Planificación** (`docs/planificacion/`) | 65 % | Múltiples documentos y actas existentes, pero la matriz de trazabilidad está fragmentada, el tablero oficial no está consolidado en `planificacion/` y faltan desvíos/riesgos cerrados. | ⚠️ **Parcial** |
| **ADR y Diagramas** (`docs/adr/`, `docs/diagramas/`) | 85 % | 11 ADR vigentes (cubre los 10 obligatorios) \+ 14 diagramas con fuentes editables y `.svg`. Requiere verificar estado "Aceptado" en todos los ADR y coherencia post-merge. | ✅ **Punto Fuerte** |

---

## 2\. Fase 1: Bloqueantes de Admisibilidad y Compilación (§6.1 Anexo G)

*Sin estos 8 puntos resueltos, el código no compila o la entrega se devuelve automáticamente con nota 0 y penalización.*

- [ ] **1\. Reparar compilación y pruebas del Backend (`pdfkit` \+ cobertura):**  
  - Ejecutar instalación limpia (`npm ci`), instalar/verificar `pdfkit` y `@types/pdfkit`, y corregir los errores de tipos en el build de TypeScript.  
  - Resolver la suite fallida del módulo de comprobantes (`174/174` pruebas en verde).  
  - Elevar la cobertura global por encima del umbral obligatorio de `ADR-008` (**\>60%** mínimo; objetivo recomendado: **\>70%** sentencias/líneas y **\>80%** en servicios principales).  
- [ ] **2\. Crear despliegue Docker único en la raíz:**  
  - Crear `Dockerfile` en `backend/`, `Dockerfile` en `frontend/` y `docker-compose.yml` en la raíz.  
  - Garantizar que `docker compose up --build` levante backend, frontend y base de datos (PostgreSQL/Supabase), ejecutando migraciones y el seed de **25 sedes** en una máquina limpia.  
- [ ] **3\. Añadir archivo `LICENSE` en la raíz del repositorio.**  
- [x] **4\. Crear la 4ta bitácora individual (`docs/bitacoras/LOG-coquet.md`):**  
  - Incluir **$\geq 8$ entradas distribuidas en el tiempo** (fecha, sprint/unidad, actividad concreta, decisión técnica, problema/bloqueo, commits reales verificables en el tag y horas). Debe diferenciarse claramente de las otras tres.  
- [ ] **5\. Crear el Manual de Usuario (`docs/manuales/manual-usuario.md`):**  
  - Seguir el índice del Anexo D cubriendo los perfiles **Socio, Recepcionista y Gerente**: registro, membresía, Mi QR, canchas y precios, clases y lista de espera, cancelaciones, pagos/comprobantes y resolución de problemas offline.  
  - Incluir **capturas reales y actualizadas** del sistema entregado (sin placeholders).  
- [ ] **6\. Verificar ausencia de secretos versionados:** Confirmar que no existan `.env` ni `.env.local` commiteados en Git (solo `.env.example`).  
- [ ] **7\. Verificar estado de los 10 ADR obligatorios:** Revisar `ADR-001` a `ADR-010` para asegurar que todos figuren en estado **Aceptado/Resuelto** (ninguno en "Propuesto").  
- [ ] **8\. Crear y empujar el tag anotado `v1.0-entrega`:** Ejecutar antes del jueves 19/11 a las 18:00 h tras validar Docker, pruebas y documentación:

```sh
git tag -a v1.0-entrega -m "Entrega TIF FitZone Sports - Equipo NN"
git push origin v1.0-entrega
```

---

## 3\. Fase 2: Código, Funcionalidad y Calidad Técnica (Subir a 9–10)

### A. Integración de Ramas Pendientes y Limpieza de UI

- [ ] Mergear a `desarrollo`:  
  - `origin/C-29`: Alta y edición de sedes (`A4` / `RNF-04`).  
  - `origin/C-30`: Catálogo, alta atómica y renovación cobrada de membresía (`RF-02`).  
  - `origin/C-31`: Crear y editar agenda de clases (`RF-06`).  
  - `origin/C-32`: Canchas en pantalla completa (alta, precio, cancelar, horario pico, descuento socio, mantenimiento).  
  - `origin/C-33`: Check-out desde `/acceso` (`RN-01`: impedimento de presencia simultánea en dos sedes).  
  - `origin/C-34`: Título del aviso de lugar liberado sobre la tarjeta de lista de espera.  
- [ ] **Eliminar placeholders y textos de demostración en Frontend:** Reemplazar vistas incompletas o placeholders en el portal del socio y consola administrativa; asegurar estados de carga/error, única fuente de verdad en el store, capa `services` desacoplada y **validación responsive real en `375 px` y `390 px`**.  
- [ ] **Completar y verificar el Seed de Entrega (`seed-entrega.ts`):** Asegurar que genere las **25 sedes** y que todas cuenten con al menos 1 cancha y 1 clase, los 4 roles operativos, un socio con membresía activa, un usuario externo y **un socio con mora** (para demostrar `RN-03`).

### B. Pruebas Reales y Verificación de los 4 Puntos Críticos

- [ ] **Prueba real de concurrencia (`RN-02`):** No basta con mocks que simulen `TURNO_OCUPADO`. Implementar y ejecutar una **prueba automatizada real contra PostgreSQL/Supabase** que dispare dos reservas simultáneas para la misma cancha/fecha/horario y verifique que exactamente una confirma (`HTTP 201`) y la otra falla (`HTTP 409`).  
- [ ] **Acceso multi-sede (`RF-03`, `RN-01`):** Verificar ingreso de socio en sede distinta a la de origen y bloqueo ante doble check-in activo sin check-out previo.  
- [ ] **Precio dinámico (`RF-11`, `RN-03`):** Verificar tarifa estándar, descuento socio (15 %) y recargo pico (19–21 h) mediante **Strategy/Decorator** en ejecución, más cobro de tarifa externa a socio en mora.  
- [ ] **QR y acceso offline (`RNF-01`, `RF-04`):** Verificar QR rotativo TOTP y cola de sincronización offline; **alinear implementación y documentación** respecto a cómo el terminal local valida/encola el QR sin conexión para evitar contradicciones en la defensa.  
- [ ] **Ampliar cobertura de pruebas (\>70%):** Agregar tests para inscripción concurrente a clases, renovación de membresía, cancelaciones, sincronización offline y casos de error (`403`, `409`, idempotencia).

### C. Endurecimiento del Pipeline CI/CD

- [ ] Configurar el workflow de GitHub Actions para que ejecute: **build frontend, build backend, lint, pruebas unitarias, pruebas E2E y reporte de cobertura**.  
- [ ] Configurar **protección de rama** en GitHub para que el pipeline bloquee efectivamente el merge si falla cualquier paso o si la cobertura cae bajo el umbral.

---

## 4\. Fase 3: Documentación de Cierre, Planificación y README

- [ ] **Consolidar Planificación (`docs/planificacion/`):**  
  - **Matriz de trazabilidad única y oficial:** Consolidar en un solo archivo `RF-01..14`, `RN-01..03` y `RNF-01..04` $\rightarrow$ Historia/Tarjeta $\rightarrow$ Implementación $\rightarrow$ Prueba $\rightarrow$ Captura/Evidencia $\rightarrow$ Estado final.  
  - **Seguimiento de los 8 sprints:** Tabla completa de estimado vs. trabajado, velocidad y desvío acumulado.  
  - **Análisis final de desvíos (1/2 a 1 página con datos reales):** Responder qué se estimó mal, qué tomó más tiempo, qué riesgo se materializó y cómo se absorbió, qué se replanificaría y qué se recortó por fecha límite.  
  - **Registro de riesgos:** Cerrar todos los ítems con el resultado concreto ocurrido (sin notas a futuro).  
  - **Tablero exportado:** Ubicar el archivo oficial del tablero dentro de `docs/planificacion/` evidenciando actividad distribuida desde el Sprint 1\.  
- [ ] **Actualizar `README.md` raíz siguiendo el orden obligatorio:**  
  1. Descripción general del sistema.  
  2. Equipo de trabajo: integrantes con rol (`P1`–`P4`) y usuario exacto de Git.  
  3. Puesta en marcha con Docker en **5 pasos** (`docker compose up --build` \+ carga de 25 sedes).  
  4. Tabla de usuarios y contraseñas demo (los 4 roles \+ socio en mora).  
  5. Tabla completa de enlaces a ADR, diagramas, manuales y bitácoras.  
  6. Estado final de la suite de pruebas y porcentaje de cobertura.  
  7. Declaración explícita de **asistentes de IA y bibliotecas utilizadas**.  
- [ ] **Revisión final de Manuales existentes y Diagramas:**  
  - Verificar que `manual-instalacion-operacion.md` integre la puesta en marcha con Docker y los 11 puntos del Anexo E.  
  - Verificar que `manual-tecnico.md` resuelva los 2 casos de extensión del Anexo F (canchas de tenis y nueva estrategia de precio).  
  - Confirmar coherencia de los 14 diagramas contra el código mergeado y exportado en `swagger.json`.

---

## 5\. Fase 4: Entrega Formal en Moodle y Defensa

- [ ] **Generar y subir a Moodle (único integrante responsable):**  
  - `PROGV-2026-TIF-EquipoNN-Dossier.pdf` (Anexo A completo: portada, resumen ejecutivo, C4 1–3, ADR, UML, DER, despliegue, patrones, cobertura, RNF, planificación, bitácoras, índice de manuales, tablero, más URL del repo, tag y hash).  
  - `PROGV-2026-TIF-EquipoNN-Registro.xlsx` (tablero/planilla consolidada).  
  - `PROGV-2026-TIF-EquipoNN-Planificacion.pdf`.  
  - Consignar en el envío: **URL del repositorio**, tag `v1.0-entrega` y hash completo (`git rev-parse v1.0-entrega`).  
- [ ] **Preparar y ensayar Defensa (15 min totales):**  
  - **Guion de demo (5 min cronometrados, mínimo 2 ensayos):** (1) Login socio $\rightarrow$ (2) Membresía y perfil $\rightarrow$ (3) Mi QR rotativo $\rightarrow$ (4) Reserva de cancha con precio dinámico $\rightarrow$ (5) Evidencia de rechazo `409` ante reserva simultánea $\rightarrow$ (6) Clase y lista de espera $\rightarrow$ (7) Comprobante PDF $\rightarrow$ (8) Modo offline y sincronización $\rightarrow$ (9) Panel administrativo (check-in/out y gestión).  
  - **Preguntas individuales:** Asegurar que cada integrante domine arquitectura/ADR, una pieza de backend, una de frontend, pruebas, diagramas, planificación/desvíos y un caso de fallo/extensión.  
  - **Plan B sin Internet:** Tener listos backend/frontend levantados localmente en Docker, dataset precargado, video corto de respaldo, capturas actualizadas, Dossier PDF local y hotspot móvil alternativo.

---

## 6\. Matriz de Responsables y Hoja de Ruta (48 Horas al Congelamiento)

### Asignación por Rol

| Integrante | Rol | Tareas Prioritarias |
| :---- | :---- | :---- |
| **Patricio (P1)** | Arquitectura / Docs / Backend crítico | Merge `C-29`…`C-34`, alineación documental offline, revisión de estados ADR y diagramas, `LICENSE`, armado de `Dossier.pdf` y creación de tag `v1.0-entrega`. |
| **Bruno (P2)** | Backend Build & Testing | **Reparar build (`pdfkit`) y suite de comprobantes**, implementar **prueba real de concurrencia (`RN-02`) en BD**, elevar cobertura a **\>70%**, verificar seed (25 sedes \+ mora) y exportar `swagger.json`. |
| **Lucas (P3)** | Frontend & Demo UI | Eliminar placeholders, validar responsive (`375 px` / `390 px`), completar `LOG-coquet.md` (8+ entradas), tomar capturas del sistema final y redactar `manual-usuario.md`. |
| **Matías (P4)** | Docker, CI, Planificación & Moodle | Crear `docker-compose.yml` \+ `Dockerfile` (back/front), endurecer CI y protección de rama, actualizar `README.md`, consolidar trazabilidad/desvíos/tablero en `docs/planificacion/` y subir a Moodle. |

### Cronograma Operativo (Martes 17/11 al Jueves 19/11)

| Ventana de Tiempo | Foco Principal | Hitos de Control |
| :---- | :---- | :---- |
| **Martes 17/11 (Tarde/Noche)** | **Reparación Build & Merges** | Arreglar `pdfkit` y comprobantes, mergear `C-29`…`C-34`, dejar `174/174` tests en verde y crear `Dockerfile` \+ `docker-compose.yml`. Iniciar `LOG-coquet.md`. |
| **Miércoles 18/11 (Mañana)** | **Concurrencia, UI & Manual** | Ejecutar prueba real de concurrencia `RN-02`, subir cobertura a **\>70%** eliminar placeholders UI, finalizar `LOG-coquet.md` y redactar `manual-usuario.md` con capturas. |
| **Miércoles 18/11 (Tarde)** | **Planificación, README & Dossier** | Consolidar trazabilidad, 8 sprints, desvíos y riesgos en `docs/planificacion/`, actualizar `README.md`, añadir `LICENSE` y compilar `Dossier.pdf`. |
| **Jueves 19/11 (Mañana)** | **Prueba Limpia y Ensayos** | Probar `docker compose up --build` desde cero, verificar CI bloqueante, auditar checklist Anexo G y realizar 2 ensayos cronometrados de 5 min \+ Plan B. |
| **Jueves 19/11 (Antes de 17:30 h)** | **Congelamiento y Moodle** | Crear y pushear tag anotado `v1.0-entrega`, obtener hash con `git rev-parse` y subir los 3 entregables oficiales a Moodle (límite estricto: **18:00 h**). |

