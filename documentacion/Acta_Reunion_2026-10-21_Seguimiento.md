# Acta — Reunión de seguimiento (2026-10-21)

**Fecha:** 2026-10-21 · desde las 21:09 GMT-03  
**Participantes:** Patricio Ramos (P1), Bruno Conti (P2), Lucas Coquet (P3), Matias Goncevat (P4)  
**Fuente:** transcripción automática `2026-10-21 21-09-45.txt` (tiene tramos ilegibles; se resumió lo que se entiende con claridad)  
**Para:** Matias, que estas semanas registra el `LOG.md` y actualiza el plan

---

## 1. Con qué está cada uno

| Integrante | Terminó | Está con | Bloqueos |
|------------|---------|----------|----------|
| **Bruno (P2)** | **S4-T01** Strategy de precios. Lo subió el mismo día de la reunión | **S4-T06** API REST del módulo Canchas. Sigue pendiente. Tiene que mirar la guía de reglas de negocio antes de seguir | La API de canchas no está hecha. Las reglas de esta reunión son la guía |
| **Lucas (P3)** | Pantallas de login, Mi Perfil y Canchas, con datos fijos | **S3-T05** conectar el login con `POST /auth/login`. Calcula probarlo contra el endpoint el viernes. **S3-T07** Mi Perfil muestra datos de prueba y falta conectarla. **S4-T03** Canchas espera la API | Canchas no se puede conectar hasta que exista la API. No hay una API de perfil en el plan: la pantalla sigue en desarrollo hasta que alguien haga ese backend. Lucas va a buscar si esa tarea existe |
| **Matias (P4)** | Nombres y roles de los integrantes (están en el README). El resto de pendientes viejos se dan por hechos, salvo lo que sigue | Checklist de cuentas (GitHub, Supabase, Vercel): es documentación. Va a pedir los correos de quién administra cada cuenta. Después le toca el plan de la próxima semana o quincena, y este log | Frenado en el checklist, por esas dudas de las cuentas |
| **Patricio (P1)** | **S4-T05** justificación de patrones (recorrió unos 13: algunos ya están, otros quedan para cuando se hagan las APIs que faltan). Recorrió con el equipo las reglas de canchas (**S4-T09**) | Mañana actualiza `Plan_Trabajo_2_Semanas.md` con lo que se subió hoy, para el docente. Le pasa este resumen a Matias | Ninguno |

---

## 2. Decisiones

Documento de trabajo: [Propuesta de reglas de negocio S4-T09](./Propuesta_Reglas_Negocio_S4-T09.md). Quedó en la rama `S4-T09` (commit `9fb6aa7`), todavía sin merge a `desarrollo`.

### 2.1 Precios y reservas de canchas

| Punto | Decisión |
|-------|----------|
| P1 — Dónde vive el precio base | Columna `precio_hora` en cada cancha. Cada cancha tiene su precio. Se descartó una tabla de tarifas por sede y tipo, y una constante en el código |
| P1 — Quién lo edita | El gerente central y el recepcionista de esa sede. El recepcionista solo edita las sedes que tiene asignadas |
| P2 — Duración del turno | 60 minutos, en hora en punto. La grilla queda por horas |
| RN-02 — Sin sobreventa | Índice único de cancha + inicio, y una función SQL que traba la cancha, comprueba turno y mantenimiento, e inserta. El backend no hace "leo y después inserto" |
| P3 — Horario pico | Configurable por sede: porcentaje, franja y días. Lo editan el administrador de esa sede y el gerente central. El gerente no queda con menos permisos que la sede. Valores por defecto: 20 %, 19:00–21:00, todos los días. Pagan recargo los turnos que empiezan dentro de la franja |
| P4 — Socio en horario pico | Se combinan. Cada estrategia recibe el precio de la anterior: base × (1 + recargo) × (1 − descuento) |
| P5 — Quién paga como socio (RN-03) | Membresía activa que cubra el día del turno. Si está vencida o suspendida, paga como externo, la reserva no se bloquea, y la respuesta avisa para que el front lo muestre |
| P6 — Cuándo queda fijo el precio | Se calcula al reservar y se guarda en la reserva, con el detalle. Un cambio posterior no toca lo ya reservado |
| P6 — Hasta cuándo se puede reservar | Como máximo **un mes** hacia adelante. Sirve para que una reserva muy lejana no congele el precio de hoy |
| P7 — Redondeo | Al peso entero, **hacia arriba**. En la propuesta sigue escrito `Math.round`; hay que alinear el documento con lo dicho en la reunión |
| P8 — Descuento de socio | Un solo valor para toda la cadena (15 % por defecto). Lo edita solo el gerente central. El socio entra a cualquier sede, así que el descuento es el mismo en todas. Un cambio solo afecta reservas nuevas |
| P8 — Administradores de sede | El gerente central asigna los administradores de cada sede, junto con el resto de funciones de A4 |

Se mencionó una tabla de tipos de cancha con un precio estándar al crear la cancha, para el día en que exista otro tipo además de pádel y fútbol 5. No se decidió. El precio acordado es el de cada cancha.

Las otras preguntas del documento (plazo de la lista de espera, penalidad de clase, ventana de 48 h, precios de los planes) no se reabrieron. De los precios de los planes se dijo que no son prioritarios y se dejan como están.

### 2.2 Otros temas

- **Mañana, para el docente.** Lucas le manda por mail el plan de trabajo de dos semanas (`Plan_Trabajo_2_Semanas.md`). No pidió Trello ni una recorrida de código: quiere ver cómo va el grupo. El plan viejo no se usa. Patricio lo actualizó y mañana le suma lo que se subió hoy.
- **Patrones en la exposición.** El docente les va a pedir justificar qué patrón se usó, por qué, cómo, y cuál se podría haber usado en un lugar donde no se usó. Hay que tenerlos estudiados entre todos, no solo quien escribió el documento.
- **Front con datos fijos.** Mientras falte una API, la pantalla puede mostrar datos de prueba y después cambiar esa fuente por el endpoint real. Así el front no espera al backend para verse.
- **Responsive y móvil.** Bruno pidió tenerlo en cuenta: el plazo del parcial se extendió y después viene la unidad mobile. Lucas por ahora prioriza que las pantallas funcionen. Figma y una librería de componentes quedaron como idea para definir entre todos, sin decisión.
- **Próxima planificación.** El turno vuelve a Matias. Arma el plan de una o dos semanas más y asigna tareas. Siguen faltando APIs de backend; sin datos de prueba el front no se puede cerrar.
- **Documentación.** Hay muchos archivos mezclados. Conviene ordenar lo principal antes de mostrárselo al docente. No quedó un responsable.

### 2.3 El plan no coincide con lo que se dijo

Cuando Matias actualice `Plan_Trabajo_2_Semanas.md`, estos estados del archivo no coinciden con la reunión:

| Tarea | Dice el plan | Dijo la reunión |
|-------|----------------|-----------------|
| S4-T06 API de Canchas | Finalizado | Sigue pendiente. Es lo que Bruno tiene ahora |
| S4-T01 Strategy | Finalizado | Coincide: Bruno lo subió hoy |
| S4-T05 Justificación de patrones | Por hacer | Patricio la dio por hecha |
| S4-T09 Reglas de negocio | Por hacer | Recorridas y decididas en esta reunión. Falta el merge de la rama `S4-T09` |
| S4-T02 Observer | Por hacer en la semana 4 | Ya estaba implementado antes de esta reunión |

---

## 3. Texto listo para `LOG.md`

**2026-10-21 — Reunión de seguimiento**

**Tipo:** reunión de equipo  
**Participantes:** Patricio Ramos, Bruno Conti, Lucas Coquet, Matias Goncevat

Se recorrieron las reglas de negocio de canchas y se dejaron decididas en la propuesta S4-T09 (rama `S4-T09`, sin merge). Precio por cancha, turnos de 60 minutos, horario pico por sede, descuento y recargo encadenados, precio fijo al reservar, reserva como máximo a un mes, redondeo al peso hacia arriba, descuento de socio único para la cadena. El precio de la cancha y el horario pico los editan el gerente y el recepcionista de esa sede. El descuento de socio y la asignación de administradores de sede los maneja el gerente central.

**Cada uno está con:**

- Bruno: API REST de Canchas (S4-T06). El Strategy (S4-T01) ya está subido.
- Lucas: conectar el login con el backend (prueba el viernes), Mi Perfil con datos de prueba, pantalla de Canchas a la espera de la API.
- Matias: checklist de cuentas (GitHub, Supabase, Vercel) y, a partir de esta reunión, el plan de la próxima semana y este log.
- Patricio: justificación de patrones hecha. Mañana actualiza el plan de dos semanas para el docente.

---

*Acta · Reunión 2026-10-21 · FitZone Sports · Programación V · UNER*
