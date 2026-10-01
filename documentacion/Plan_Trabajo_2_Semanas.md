# Plan de trabajo — Próximas 2 semanas

**Proyecto:** FitZone Sports · Programación V · UNER  
**Equipo:** 4 integrantes  
**Dedicación mínima:** 4 h/semana por integrante → **16 h/semana de equipo** (~32 h en 2 semanas)  
**Fecha de elaboración:** 2026-08-28  
**Última actualización de estados:** 2026-09-04  
**Unidad en curso:** I (Arquitectura) → transición a II (Frameworks)

**Referencias:** [Trabajo Integrador](./Trabajo_Integrador_FitZone_Sports.md) · [Decisiones pendientes](./Decisiones_Pendientes_y_Cosas_a_Definir.md) · [LOG](./LOG.md) · [Acta 2026-09-02](./Acta_Reunion_2026-09-02_Semana1.md)

**Cómo leer este documento**

- Cada **objetivo general** agrupa varias **tareas concretas** (ID `S1-Txx` / `S2-Txx`).
- Cada tarea tiene **asignado**, **duración** y **estado**.
- **Estado** (obligatorio, no usar solo checkbox):
  - **Por hacer** — asignada, aún no empezada
  - **En desarrollo** — el integrante la está trabajando **ahora**
  - **Finalizado** — completada
- La sección **Trabajo en curso (ahora)** resume qué hace cada uno hoy (puede diferir de “todas las asignadas”).
- Al pie de cada semana: **resumen de carga** por integrante (debe rondar **4 h** c/u).

---

#### Integrantes
| Rol | Código | Nombre | GitHub / contacto |
| ------ | ------ | ------ | ------ |
| Arquitecto / Backend Lead | **P1** | Patricio Ramos | |
| Backend Developer | **P2** | Bruno Conti | |
| Frontend Developer | **P3** | Lucas Coquet | |
| QA / DevOps / Mobile | **P4** | Matias Goncevat | |

--------------------------------------------------------------------------------

#### Trabajo en curso (ahora)
Actualizado tras la jornada del **2026-10-01**. Refleja lo que cada integrante **está trabajando**, no solo el backlog asignado.

| Integrante | Rol | Tarea en curso (ID) | Qué está haciendo | Estado |
| ------ | ------ | ------ | ------ | ------ |
| Patricio Ramos | P1 | S3-T06 | Definir Diagrama ER y modelo SQL de base de datos | En desarrollo |
| Bruno Conti | P2 | S3-T10 | Configurar cliente separado de Supabase para Auth y arreglar POST /login | En desarrollo |
| Lucas Coquet | P3 | S3-T05 | Conectar formulario de login React con API NestJS | Por hacer |
| Matias Goncevat | P4 | S3-T02 | Revisar integración de PRs y preparar E2E inicial (baja temporal) | Por hacer |

**Recién finalizado:**

| ID | Tarea | Quién | Estado |
| ------ | ------ | ------ | ------ |
| S2-T06 | AuthModule BFF (pasarela Supabase Auth) y tests unitarios a verde | Bruno (P2) | Finalizado |
| S3-T08 | Crear backend/.env.example y actualizar README.md (Reasignado a P2) | Bruno (P2) | Finalizado |

--------------------------------------------------------------------------------

#### Capacidad y contexto
| Dato | Valor |
| ------ | ------ |
| Horas mínimas por persona / semana | 4 h |
| Horas mínimas de equipo / semana | 16 h |
| Entregable Unidad II (25%) | Repositorio con backend funcional + Swagger |
| Estado previo | Scaffolding de Nest y React listos; BFF y Supabase API conectados. |

##### Resumen ejecutivo (para el docente)
**Semana 3:** Unidad II — Ordenamiento de API Auth, configuración CORS, definición de ER SQL (bloqueante para módulos) e integración de Front con Back.
**Semana 4:** Transición a Unidad III — Desarrollo Módulos Core (Membresías, Clases) y refactorización con patrones de diseño (Strategy, Observer).
**Fuera de alcance:** App móvil React Native, integraciones de pago reales (pasarelas mock), Testing CI/CD avanzado.

##### Arquitectura de referencia
```text
React → Nest (BFF) → Supabase Auth
                 ↘ Supabase API (Patrón Repository)

```

---

#### Semana 3 — API REST Core e Integración

**Objetivo general:** Completar las bases bloqueantes del backend (Auth, CORS, DB) y conectar exitosamente el login desde el frontend.

**Entregables de la semana**

| Entregable | Estado |
| --- | --- |
| Esquema ER SQL cerrado para Membresías y Clases | En desarrollo |
| Plantilla base del patrón Repository (sobre Sedes) | Por hacer |
| Frontend conectado al Backend (Login funcionando E2E) | Por hacer |
| Swagger y CORS configurados en el backend | Por hacer |

##### Objetivos generales → tareas

| Objetivo | Tareas vinculadas |
| --- | --- |
| O1 — Cierre Auth y tests unitarios | S3-T10, S3-T05 |
| O2 — DB y Patrón Repository | S3-T06, S3-T11 |
| O3 — Swagger y CORS | S3-T01 |
| O4 — Frontend post-login | S3-T07 |

##### Tabla de tareas — Semana 3


| ID | Tarea | Asignado | Rol | Duración | Estado |
| --- | --- | --- | --- | --- | --- |
| S3-T10 |  Separar cliente de Supabase para login + arreglar tests y `POST /login` | Bruno Conti | P2 | 2 h | En desarrollo |
| S3-T06 |  Diseño de DB (ER y SQL) para Membresías, Clases, Cupos y Perfiles | Patricio Ramos | P1 | 2.5 h | En desarrollo |
| S3-T01 | Integrar Swagger, probar endpoints manualmente (S3-T02 reasignado) y setup CORS | Patricio Ramos | P1 | 2 h | Por hacer |
| S3-T11 | Definir plantilla Patrón Repository y refactorizar `GET /sedes` como ejemplo | Patricio Ramos | P1 | 1 h | Por hacer |
| S3-T05 | React: Conectar form de login con POST /auth/login (Depende de S3-T10) | Lucas Coquet | P3 | 2 h | Por hacer |
| S3-T07 | React: Pantalla "Mi Perfil" (Depende de S3-T06 tabla `perfiles`) | Lucas Coquet | P3 | 2 h | Por hacer |
| S3-T03 | Módulo Membresías (M1) (En Pausa - Esperando S3-T06 y S3-T11) | Bruno Conti | P2 | 2 h | Por hacer |
| S3-T04 | Módulo Clases (M3) (En Pausa - Esperando S3-T06 y S3-T11) | Bruno Conti | P2 | 2 h | Por hacer |
| S3-T09 | Reunión de seguimiento. P1 redacta el LOG.md | Equipo | Todos | 0.5 h | Por hacer |

##### Carga por integrante — Semana 3

| Integrante | Tareas | En desarrollo ahora | Total estimado | ¿≤ 4 h? |
| --- | --- | --- | --- | --- |
| **P1** Patricio | S3-T06, S3-T01, S3-T11, S3-T09 | S3-T06 | **6 h** | Ajustar* |
| **P2** Bruno | S3-T10, S3-T03, S3-T04, S3-T09 | S3-T10 | **6.5 h** | Ajustar* |
| **P3** Lucas | S3-T05, S3-T07, S3-T09 | — | **4.5 h** | ✓ |
| **P4** Matias | S3-T02 (En revisión/E2E manual asíncrono) | — | **1.5 h** | *(Baja)* |

**Ajuste sugerido: La carga de P1 y P2 subió temporalmente por la reasignación de tareas críticas de P4. Si P1 y P2 no llegan a terminar S3-T03 y S3-T04, se patean sin problema a la Semana 4.*

---

#### Semana 4 — Patrones de Diseño (GoF) y UI Avanzada

**Objetivo general:** Iniciar Unidad III refactorizando la lógica de negocio con patrones GoF y avanzar en las vistas de React.

**Entregables de la semana**

| Entregable | Estado |
| --- | --- |
| Código backend aplicando Patrones Strategy/Observer | Por hacer |
| Justificación técnica de patrones (Documentación) | Por hacer |
| UI React: Dashboard y grilla de canchas | Por hacer |

##### Objetivos generales → tareas

| Objetivo | Tareas vinculadas |
| --- | --- |
| O5 — Desarrollo REST Canchas | S4-T06 |
| O6 — Refactorización GoF | S4-T01, S4-T02 |
| O7 — Desarrollo Frontend (Atomic Design) | S4-T03, S4-T04 |
| O8 — DevOps Temprano | S4-T07 |

##### Tabla de tareas — Semana 4

*(S4-T06 y definición de negocio movidas como bloqueantes para el Strategy S4-T01)*

| ID | Tarea | Asignado | Rol | Duración | Estado |
| --- | --- | --- | --- | --- | --- |
| S4-T06 | Preparar Módulo Canchas (M4) API REST para consumir en React | Bruno Conti | P2 | 2.5 h | Por hacer |
| S4-T09 | **(Bloqueante)** Definir reglas de negocio (precio/recargo canchas y eventos observer) | Equipo | Todos | 1 h | Por hacer |
| S4-T01 | Implementar Patrón Strategy para cálculo de precios/recargos de canchas | Bruno Conti | P2 | 2 h | Por hacer |
| S4-T02 | Implementar Patrón Observer para notificaciones | Patricio Ramos | P1 | 2.5 h | Por hacer |
| S4-T03 | React: Pantalla de Canchas (M4) con selector de horarios y sedes | Lucas Coquet | P3 | 3 h | Por hacer |
| S4-T04 | React: Setup de estado global básico (Zustand o Context) | Lucas Coquet | P3 | 1.5 h | Por hacer |
| S4-T05 | Redactar justificación de patrones aplicados (Documento Unidad III) | Patricio Ramos | P1 | 1.5 h | Por hacer |
| S4-T07 | Setup inicial de testing E2E (Postman collection) para la API | Matias Goncevat | P4 | 3 h | Por hacer |
| S4-T08 | Reunión de cierre Semana 4 (Demo técnica interna) | Equipo | Todos | 1 h c/u | Por hacer |

##### Carga por integrante — Semana 4

| Integrante | Tareas | En desarrollo ahora | Total estimado | ¿≤ 4 h? |
| --- | --- | --- | --- | --- |
| **P1** Patricio | S4-T09, S4-T02, S4-T05, S4-T08 | — | **6 h** | Ajustar |
| **P2** Bruno | S4-T06, S4-T09, S4-T01, S4-T08 | — | **6.5 h** | Ajustar |
| **P3** Lucas | S4-T09, S4-T03, S4-T04, S4-T08 | — | **6.5 h** | Ajustar |
| **P4** Matias | S4-T09, S4-T07, S4-T08 | — | **5 h** | Ajustar |

---

#### Vista por integrante (ambas semanas)

##### P1 — Patricio Ramos (Arquitecto / Backend Lead)

| Semana | ID tareas | En desarrollo ahora | Total |
| --- | --- | --- | --- |
| 3 | S3-T06, S3-T01, S3-T11, S3-T09 | S3-T06 | 6 h |
| 4 | S4-T09, S4-T02, S4-T05, S4-T08 | — | 6 h |
| **Total 2 semanas** |  |  | **12 h** |

##### P2 — Bruno Conti (Backend Developer)

| Semana | ID tareas | En desarrollo ahora | Total |
| --- | --- | --- | --- |
| 3 | S3-T10, S3-T03, S3-T04, S3-T09 | S3-T10 | 6.5 h |
| 4 | S4-T06, S4-T09, S4-T01, S4-T08 | — | 6.5 h |
| **Total 2 semanas** |  |  | **13 h** |

##### P3 — Lucas Coquet (Frontend Developer)

| Semana | ID tareas | En desarrollo ahora | Total |
| --- | --- | --- | --- |
| 3 | S3-T05, S3-T07, S3-T09 | — | 4.5 h |
| 4 | S4-T09, S4-T03, S4-T04, S4-T08 | — | 6.5 h |
| **Total 2 semanas** |  |  | **11 h** |

##### P4 — Matias Goncevat (QA / DevOps / Mobile)

| Semana | ID tareas | En desarrollo ahora | Total |
| --- | --- | --- | --- |
| 3 | S3-T02 | — | 1.5 h |
| 4 | S4-T09, S4-T07, S4-T08 | — | 5 h |
| **Total 2 semanas** |  |  | **6.5 h** |

---

#### Fuera de alcance (estas 2 semanas)

| Tema | Motivo |
| --- | --- |
| Pipeline CI/CD completo en GitHub Actions | Unidad V |
| App Móvil (React Native) | Unidad VI |
| Integración pasarela de pagos | Fase final de desarrollo (Módulo 5) |
| Código de validación Offline / TOTP | Diferido para enfoque móvil |

---

#### Control de avance

**Reunión semanal:** 30 min (viernes o día acordado).

1. Recorrer tabla de tareas y actualizar **Estado** (Por hacer / En desarrollo / Finalizado).
2. Actualizar la sección **Trabajo en curso (ahora)** — una tarea “en desarrollo” por persona como mínimo.
3. Verificar carga por integrante (¿alguien bloqueado o sobrecargado?).
4. Actualizar [LOG.md](https://www.google.com/search?q=./LOG.md).
5. Definir top 3 tareas de la semana siguiente.

##### Plantilla LOG

```md
## YYYY-MM-DD — Seguimiento plan 2 semanas

**Semana:** 3 | 4  
**En desarrollo ahora:**
- P1 … (S3-Txx)
- P2 … (S3-Txx)
- P3 … (S3-Txx)
- P4 … (S3-Txx)
**Finalizado desde la última vez:** S2-T09, S2-T06, S2-T04…  
**Por hacer / bloqueadas:**  
**Ajustes de asignación:**  
**Próxima semana (top 3):**  

```

---

#### Trazabilidad cátedra

| Semana cátedra | Tema oficial | Este plan |
| --- | --- | --- |
| 3 | Scaffolding e Inyección de Dependencias | Semana 3 (Consolidación API y Front) |
| 4 | ORM, entidades y API REST | Semana 3 (Repository y Módulos M1/M3) |
| 5 | Patrones creacionales y estructurales | Semana 4 (Inicio refactor Strategy/Observer) |

---

*Plan de trabajo · FitZone Sports · Programación V · UNER*