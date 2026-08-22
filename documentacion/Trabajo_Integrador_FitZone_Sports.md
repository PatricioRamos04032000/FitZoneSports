# Trabajo Integrador — Caso "FitZone Sports"

**Asignatura:** Programación V  
**Carrera:** Licenciatura en Sistemas · UNER  
**Plan de estudio:** 2024 · **Año:** 2026  
**Docente:** Prof. Lic. Aguirre, Juan José  

**Fuente:** `Trabajo_Integrador_FitZone_Sports.pdf` (presentación del caso, puntos considerados y plan de trabajo)

| Dato | Valor |
|------|-------|
| Práctica | 76 hs |
| Duración | 16 semanas |
| Unidades | 6 + 1 cierre |
| Integrantes (este plan) | 4 |

---

## Agenda

1. **El caso FitZone Sports** — Contexto, actores y alcance del proyecto integrador
2. **Puntos considerados** — Módulos funcionales, reglas de negocio y requisitos no funcionales
3. **Definición técnica** — Decisión arquitectónica, modelado C4 y patrones de diseño
4. **Plan de trabajo** — Organización del equipo de 4 personas y cronograma de 16 semanas
5. **Evaluación y cierre** — Entregables, ponderación y Demo Day final

---

## Marco pedagógico

**Metodología:** Aprendizaje Basado en Problemas (ABP).

Las actividades prácticas se articulan en torno a un Proyecto Integrador único: **FitZone Sports**. El estudiante aplica de manera acumulativa los conceptos de cada unidad, simulando un entorno de desarrollo profesional real, con enfoque por competencias.

Temas que se aplican:

- Arquitectura de aplicaciones
- Frameworks de desarrollo (backend)
- Patrones de diseño (GoF)
- Desarrollo de componentes (frontend)
- Pruebas, integración y despliegue
- Sistemas para plataformas móviles

| Concepto | Valor |
|----------|-------|
| Carga horaria total | 128 hs |
| Práctica efectiva | 76 hs |
| Horas semanales | 8 hs |
| Equipo sugerido por cátedra | 5 devs (máximo) → **4 en este plan** |

---

## Descripción general del caso

**FitZone Sports** es una plataforma integral de gestión para una cadena de gimnasios con presencia en **25 (o más) sucursales** distribuidas en la provincia.

Unifica:

- Administración de horarios de gimnasio
- Actividades grupales
- Alquiler de espacios deportivos

Permite interoperabilidad entre sedes y una experiencia fluida en **web** y **dispositivos móviles**.

Ámbitos clave:

- 25+ sucursales
- Gimnasio y control de acceso
- Clases grupales
- Canchas de paddle y fútbol 5
- App móvil + Web admin

### Conflicto central del diseño

Transaccionalidad en la reserva de canchas (evitar sobreventa) vs. necesidad de reportes centralizados entre sedes.

### Requisito crítico offline

El control de acceso (QR de socio) debe funcionar aunque falle la conexión a internet principal.

---

## Actores del sistema

| ID | Actor | Descripción |
|----|-------|-------------|
| A1 | Socio Activo | Membresía vigente. Accede a todas las sedes, reserva gimnasio y alquila canchas con descuento. |
| A2 | Cliente Externo | Usuario sin membresía. Usa la plataforma solo para alquilar canchas, pagando por uso. |
| A3 | Recepcionista / Admin. de Sede | Gestiona el día a día, valida el acceso y resuelve problemas puntuales en su sucursal. |
| A4 | Gerente Central | Administrador global: define precios, crea nuevas sedes y visualiza reportes consolidados. |

---

## Módulos funcionales

Cinco módulos cubren el ciclo completo del socio: alta, acceso, clases, canchas y pagos.

| Módulo | Nombre | Requisitos |
|--------|--------|------------|
| M1 | Usuarios y Membresías | RF-01 a RF-03 |
| M2 | Gimnasio y Acceso | RF-04, RF-05 |
| M3 | Clases Grupales | RF-06 a RF-08 |
| M4 | Canchas Deportivas | RF-09 a RF-12 |
| M5 | Pagos y Facturación | RF-13, RF-14 |

### M1 — Usuarios y Membresías (RF-01 a RF-03)

- **RF-01 — Registro y perfil:** Alta de usuarios (DNI, contacto, foto). Distingue entre Socio y Cliente Externo.
- **RF-02 — Control de membresía:** Planes Mensual / Trimestral / Anual. Estados Activo, Vencido o Suspendido. Renovación automática (simulada) o manual vía pasarela de pagos.
- **RF-03 — Acceso multi-sede:** Un socio registrado en la sede Central accede a la sede Norte sin restricciones.

**Nota (RN-03):** Un socio con cuota vencida no puede reservar clases ni canchas con descuento; sí puede pagar el precio de "externo".

### M2 — Gimnasio y Acceso / Control de Turnos (RF-04, RF-05)

- **RF-04 — Validación de ingreso:** Código QR dinámico del socio (cambia cada minuto para evitar capturas de pantalla). Validación en la base de datos central de la membresía activa.
- **RF-05 — Aforo en tiempo real:** Pantalla del recepcionista muestra el aforo actual y el aforo máximo permitido por sede.

**Nota (RN-01):** Un usuario no puede estar dentro de dos sedes al mismo tiempo (evita compartición de credenciales).

### M3 — Clases Grupales (Spinning, Yoga, etc.) (RF-06 a RF-08)

- **RF-06 — Gestión de agenda:** El administrador crea clases: tipo, instructor, horario y capacidad máxima (ej. 20 bicicletas).
- **RF-07 — Reserva de clases:** Reserva hasta 48 hs antes; el sistema decrementa el cupo. Cancelación sin penalidad hasta 2 hs antes.
- **RF-08 — Lista de espera:** Si la clase está llena, el socio puede enlistarse. Al liberarse un lugar se lo notifica (patrón Observer).

### M4 — Canchas Deportivas (Paddle y Fútbol 5) (RF-09 a RF-12)

- **RF-09 — Gestión de recursos:** Alta de canchas por sede y definición de costo por hora y tipo de cancha.
- **RF-10 — Reserva de turnos:** Grilla horaria de disponibilidad; al reservar, el horario queda bloqueado para el resto.
- **RF-11 — Precio dinámico (Strategy):** Precio estándar + descuento a socios (15%) + recargo en horario pico (19:00–21:00).
- **RF-12 — Mantenimiento:** El administrador inhabilita una cancha por mantenimiento, bloqueando reservas futuras sin afectar las ya tomadas.

**Nota (RN-02):** Si dos usuarios reservan la misma cancha en el mismo segundo, solo uno tiene éxito (manejo de concurrencia).

### M5 — Pagos y Facturación (RF-13, RF-14)

- **RF-13 — Pasarela de pago simulada:** Integración con un servicio mock (simulacro de MercadoPago / Modo).
- **RF-14 — Generación de comprobante:** Al pagar una reserva se genera un ticket/factura en PDF con cancha, horario y monto.

**Nota (RNF-02):** Los datos de tarjeta no se almacenan localmente; solo se guarda el token de la pasarela.

---

## Reglas de negocio (Business Logic)

| # | Nombre | Descripción |
|---|--------|-------------|
| 01 | Integridad de datos | Un usuario no puede estar dentro de dos sedes al mismo tiempo, evitando la compartición de credenciales. |
| 02 | Consistencia de reserva | Si dos usuarios intentan reservar la misma cancha en el mismo horario y segundo, solo uno debe tener éxito (concurrencia / locks). |
| 03 | Mora | Un socio con cuota vencida no puede reservar clases ni canchas con descuento, pero puede pagar el precio "externo" para usar las canchas. |

---

## Requisitos no funcionales

| ID | Nombre | Descripción |
|----|--------|-------------|
| RNF-01 | Disponibilidad | 99.5% — el control de acceso (tornos) debe funcionar aunque falle la conexión principal a internet. |
| RNF-02 | Seguridad | Los datos de tarjeta de crédito no se almacenan localmente; solo se guarda el token de la pasarela. |
| RNF-03 | Rendimiento | La consulta de disponibilidad de canchas debe responder en pocos milisegundos (índices en base de datos). |
| RNF-04 | Escalabilidad | La arquitectura permite agregar una nueva sede sin detener el sistema (configuración por base de datos). |

---

## Definición técnica

### Decisión arquitectónica: Monolito Modular

**¿Por qué no Microservicios?**

- Transacciones ACID fuertes: evitar la sobreventa de canchas
- Equipo pequeño (proyecto: 4 devs)
- Velocidad de desarrollo (Time-to-Market)

### ADR — Architecture Decision Record

- **Decisión:** usar PostgreSQL como base relacional.
- **Contexto:** integridad de pagos y consistencia en el inventario de canchas.
- **Consecuencias:** esquema estructurado, soporte transaccional robusto, migraciones controladas.

### Modelado C4 — Contenedores

| Contenedor | Tecnología sugerida |
|------------|---------------------|
| Frontend Web (Admin) | React / Vue |
| App Móvil (Socio) | React Native / Flutter |
| Backend API (Monolito) | Java Spring Boot / Node NestJS |
| Base de Datos | PostgreSQL |

### Patrones de diseño aplicados (GoF)

#### Strategy — Precio dinámico de canchas

`StandardPricing`, `MemberDiscountPricing` (−15%) y `PeakHourPricing` (19–21 hs) implementan una interfaz común `PricingStrategy`.

#### Observer — Lista de espera de clases

Cuando se libera un cupo por cancelación, se notifica automáticamente a los socios enlistados.

#### Repository — Acceso a datos

`BookingRepository` desacopla la lógica de negocio de la base de datos, permitiendo cambiar de motor sin tocar el servicio.

---

## Roadmap de unidades

Las 16 semanas (76 hs prácticas) se organizan en 6 unidades acumulativas y un cierre integrador con Demo Day.

| Unidad | Tema | Horas |
|--------|------|-------|
| I | Arquitectura | 8 hs |
| II | Frameworks | 16 hs |
| III | Patrones | 10 hs |
| IV | Componentes | 16 hs |
| V | Testing y CI/CD | 12 hs |
| VI | Móvil | 14 hs |
| C | Cierre integrador | 8 hs |

---

## Organización del equipo (4 integrantes)

| Rol | Persona | Liderazgo | Responsabilidades |
|-----|---------|-----------|-------------------|
| Arquitecto / Backend Lead | P1 | Unidad I | Modelado C4, ADR, decisiones estructurales. Apoya a P2 en Unidades II y III. |
| Backend Developer | P2 | Unidades II y III | API REST, ORM y patrones Strategy, Observer y Repository. |
| Frontend Developer | P3 | Unidad IV | Atomic Design, estado global e integración con la API. |
| QA / DevOps / Mobile | P4 | Unidades V y VI | Testing, pipeline CI/CD, contenedores y app móvil offline-first. |

**Colaboración cruzada:** todo el equipo participa del debate arquitectónico (Semana 1) y de la integración final (Semanas 15 y 16).

---

## Cronograma semanal

### Semanas 1 a 8 (subtotal: 36 hs prácticas)

| Sem. | Unidad | Tema | Horas | Responsable |
|------|--------|------|-------|-------------|
| 1 | I | Análisis y decisión arquitectónica (debate grupal) | 2 hs | Todo el equipo |
| 2 | I | Modelado C4 (Contexto/Contenedores) y documento ADR | 6 hs | P1 lidera + equipo |
| 3 | II | Scaffolding del proyecto e Inyección de Dependencias | 4 hs | P2 lidera · apoya P1 |
| 4 | II | ORM, entidades y primera versión de la API REST | 8 hs | P2 lidera · apoya P1 |
| 5 | III | Patrones creacionales y estructurales (GoF) | 4 hs | P2 lidera |
| 6 | III | Refactoring: patrones Strategy y Observer | 4 hs | P2 + P1 |
| 7 | III | Patrón Repository y capa de servicios | 4 hs | P1 + P2 |
| 8 | IV | Atomic Design: átomos y moléculas de UI | 4 hs | P3 lidera |

### Semanas 9 a 16 (subtotal: 40 hs prácticas · total cuatrimestre: 76 hs)

| Sem. | Unidad | Tema | Horas | Responsable |
|------|--------|------|-------|-------------|
| 9 | IV | Estado global y comunicación entre componentes | 6 hs | P3 lidera |
| 10 | IV | Capa de servicio frontend (consumo de la API) | 4 hs | P3 lidera · apoya P2 |
| 11 | V | Testing y TDD (pruebas unitarias e integración) | 6 hs | P4 lidera · todos testean su módulo |
| 12 | V | Pipeline CI/CD y contenedores (Docker) | 6 hs | P4 lidera |
| 13 | VI | Ecosistema móvil: setup y persistencia local | 4 hs | P4 lidera |
| 14 | VI | Offline-first y consumo de API desde la app | 6 hs | P4 lidera · apoya P2 |
| 15 | Cierre | Integración final E2E y corrección de errores | 6 hs | Todo el equipo |
| 16 | Cierre | Demo Day: defensa técnica del proyecto | 2 hs | Todo el equipo |

---

## Entregables por unidad y ponderación

| Unidad | Entregable principal | Peso |
|--------|----------------------|------|
| I. Arquitectura | PDF con diagramas C4 y documento ADR | 10% |
| II. Frameworks | Repositorio con backend funcional + Swagger | 25% |
| III. Patrones | Código refactorizado con patrones + justificación | 15% |
| IV. Componentes | Repositorio frontend con componentes documentados | 15% |
| V. Pruebas | Pipeline CI/CD funcionando + reporte de cobertura | 15% |
| VI. Móvil | APK/IPA instalable con QR de socio visible offline | 10% |
| Cierre | Repositorio final unificado + Defensa (Demo Day) | 10% |

**Total: 100%** · Se combinan rúbricas, checklists, peer review y Demo Day.

---

## Demo Day — Defensa final

Presentación de **15 minutos** con demo funcional, revisión técnica y preguntas de situación.

1. **5 min — Demo funcional**  
   Registrar socio → pagar membresía → reservar cancha de Paddle → ver QR en el móvil.

2. **5 min — Revisión técnica**  
   Ejemplos: "¿Por qué usaron Strategy aquí?" · "¿Qué pasa si dos personas reservan a la vez?"

3. **5 min — Preguntas de situación**  
   Ejemplo: "El cliente quiere agregar canchas de tenis. ¿Qué hay que modificar?"

### Bitácora del equipo (`LOG.md`)

Cada integrante documenta en Markdown sus actividades, decisiones y problemas encontrados por unidad, vinculando el registro a los commits del repositorio.

---

*Trabajo Integrador · Caso "FitZone Sports" · Programación V · UNER*
