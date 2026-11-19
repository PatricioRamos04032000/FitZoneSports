# Plan de proyecto — FitZone Sports — Equipo 03

Plantilla del Anexo H de los lineamientos de entrega. Fecha de este armado: 18 de noviembre de 2026. Las horas y los estados salen de los planes y de las bitácoras que ya están en el repositorio. Este archivo no crea estimaciones nuevas.

La matriz vigente es la de [S8_Planificacion_Completa_C20.md](./S8_Planificacion_Completa_C20.md). El detalle de las tarjetas de cierre está en [S8_Plan_Cierre_Entrega_6_19_Nov.md](./S8_Plan_Cierre_Entrega_6_19_Nov.md).

## 1. Alcance

Incluido: el portal web con cuatro roles (gerente, administrador de sede, socio y cliente externo). Entran el registro y el perfil, la membresía con catálogo y renovación cobrada, el acceso multi-sede con QR rotativo mientras el servidor responde, el aforo de la sede, la agenda de clases, la inscripción, la lista de espera, la grilla de canchas, el precio compuesto, el mantenimiento, la pasarela simulada y el PDF de comprobante. Entran el dashboard de solo lectura del gerente (C-39), los ADR, los catorce diagramas, los tres manuales, las cuatro bitácoras y el dossier.

Excluido: la app móvil, la cámara y el DNI en el acceso, MercadoPago real, el alta de administradores de sede, Storybook y la reescritura de la historia del repositorio. No se logra un check-in al 100 % con el servidor central caído: sin red solo hay una fila de sincronización. La sede encola el ingreso y la salida, y los confirma cuando vuelve la conexión. La foto de perfil está en el enunciado de RF-01 y quedó fuera de este corte: el alta pide los datos de la persona y no la imagen, porque no se configuró Storage.

## 2. Supuestos y restricciones

Supuestos: se da por existente un proyecto de Supabase con las claves fuera del repositorio. La pasarela de RF-13 es un simulacro. El comprobante de RF-14 es un PDF de la cadena, no un comprobante fiscal.

Restricciones: la entrega cierra el 19 de noviembre de 2026 a las 18:00. El equipo es de cuatro personas. El tag anotado se llama `v1.0-entrega` y se crea en C-26.

## 3. Equipo

| Integrante | Rol | Horas comprometidas | Responsabilidad principal |
|---|---|---|---|
| Patricio Ramos | P1 | 4 h por semana en el plan del 28/08. En el cierre, 8 a 10 h por semana | Arquitectura, documentación y backend crítico |
| Bruno Nicolás Conti | P2 | 4 h por semana. La semana 2 estima 7 h. En el cierre, 4 a 6 h por semana | Backend: membresías, clases, pagos, PDF y validaciones |
| Lucas Coquet | P3 | 4 h por semana. La semana 2 estima 4,5 h. En el cierre, 8 a 10 h por semana | Frontend: login, sesión, pantallas y experiencia por rol |
| Matias Goncevat | P4 | 4 h por semana. En el cierre, 4 a 6 h por semana | CI, seed, Docker, cobertura, bitácora y planificación |

El plan del 28 de agosto compromete 16 h semanales de equipo. El plan de cierre estima 48 a 64 h de equipo en las dos semanas finales. Esas cifras son las que esos planes ya escribieron.

## 4. Estructura de desglose del trabajo

Cada fila de abajo ya tiene responsable y horas en un plan del repositorio. Las tarjetas de S3 a S7 que no traen horas por fila siguen en [S5-S7_Plan_Trabajo_3_Semanas.md](./S5-S7_Plan_Trabajo_3_Semanas.md) y en las actas. S3 no tiene plan propio.

| Épica | Qué cubre | Dónde está el desglose |
|---|---|---|
| Unidad I | C4, ADR, roles, monorepo | Tareas S1 de este apartado |
| Unidad II | Nest, React, Supabase y el arranque de membresías y clases | Tareas S2. S3 se lee en el LOG |
| Unidad III | Precio, Observer, Repository, reglas y API de canchas | Actas del 13/10 y del 21/10, y el plan S5–S7 |
| Unidad IV | Portal conectado a la API | C-01, C-03 y C-11, más el plan S5–S7 |
| Unidad V | Pruebas, CI, Docker y seed | C-07, C-08, C-10 y C-35 |
| Cierre | Manuales, dossier, tag y lo que sigue abierto | C-01 a C-41 |

### Unidad I — tareas S1

Fuente: [S1-S2_Plan_Trabajo_Semanas_1_y_2.md](./S1-S2_Plan_Trabajo_Semanas_1_y_2.md).

| ID | Tarea | Responsable | Estimación | Estado en ese plan |
|---|---|---|---|---|
| S1-T01 | Revisar el C4 y anotar hallazgos | Patricio Ramos | 1 h | Finalizado |
| S1-T02 | Revisar ADR-001 a ADR-006 | Bruno Conti | 1 h | Finalizado |
| S1-T03 | Revisar funcionalidades por actor y stack | Lucas Coquet | 1 h | Finalizado |
| S1-T04 | Revisar decisiones pendientes, secciones 1 a 3 | Matias Goncevat | 1 h | Finalizado |
| S1-T05 | Reunión: BFF, Supabase Auth, API y propuesta offline | Equipo | 0,5 h c/u | Finalizado |
| S1-T06 | Registrar la reunión en el LOG y el acta | Patricio Ramos | 0,5 h | Finalizado |
| S1-T07 | Completar integrantes y roles en el plan y el README | Matias Goncevat | 0,5 h | Finalizado |
| S1-T08 | Monorepo, ramas y carpetas frontend y backend | Matias Goncevat | 1 h | Finalizado |
| S1-T09 | Actualizar el C4 con BFF, Auth y offline de sede | Patricio Ramos | 1,5 h | Finalizado |
| S1-T10 | Redactar el ADR de acceso offline si el equipo lo pide | Patricio Ramos | 1 h | Finalizado |
| S1-T11 | Exportar C4 y compilar el PDF de Unidad I | Patricio Ramos | 1,5 h | Finalizado |
| S1-T12 | Borrador SQL de sedes, perfiles y membresías | Bruno Conti | 2 h | Finalizado |
| S1-T13 | Lista de pantallas mínimas por rol | Lucas Coquet | 1,5 h | Finalizado |
| S1-T14 | Checklist de cuentas GitHub, Supabase, Vercel y Render | Matias Goncevat | 1 h | Finalizado |
| S1-T15 | `.env.example` sin valores secretos | Matias Goncevat | 1 h | Finalizado |
| S1-T16 | Revisión cruzada del PDF | Lucas Coquet | 0,5 h | Por hacer |
| S1-T17 | Revisión cruzada del PDF | Bruno Conti | 0,5 h | Finalizado |

### Unidad II — tareas S2

| ID | Tarea | Responsable | Estimación | Estado en ese plan |
|---|---|---|---|---|
| S2-T01 | Crear el proyecto Supabase y habilitar Auth | Lucas Coquet | 0,5 h | Finalizado |
| S2-T02 | SQL inicial de sedes y perfiles | Bruno Conti | 1,5 h | Finalizado |
| S2-T03 | Seed mínimo: una o dos sedes y un gerente | Bruno Conti | 1 h | Finalizado |
| S2-T04 | Scaffolding NestJS | Bruno Conti | 1 h | Finalizado |
| S2-T05 | SupabaseModule con service role | Bruno Conti | 1 h | Finalizado |
| S2-T06 | AuthModule: login que delega en Supabase Auth | Bruno Conti | 1,5 h | Finalizado |
| S2-T07 | Guard JWT | Patricio Ramos | 1,5 h | Finalizado |
| S2-T08 | `GET /health` y Swagger | Patricio Ramos | 0,5 h | Finalizado |
| S2-T09 | SedesModule: `GET /sedes` | Bruno Conti | 1 h | Finalizado |
| S2-T10 | Scaffolding React + Vite | Lucas Coquet | 1 h | Finalizado |
| S2-T11 | Pantalla de login contra Nest | Lucas Coquet | 1,5 h | Finalizado |
| S2-T12 | Router y layout mínimo | Lucas Coquet | 1 h | Finalizado |
| S2-T13 | Swagger de login, health y sedes | Patricio Ramos | 0,5 h | Finalizado |
| S2-T14 | README de arranque local | Matias Goncevat | 1 h | Finalizado |
| S2-T15 | Prueba manual de login y sedes, anotada en el LOG | Matias Goncevat | 0,5 h | Finalizado |
| S2-T16 | Reunión de cierre de la semana 2 | Equipo | 0,5 h c/u | Finalizado |

### Cierre — tarjetas C-01 a C-41

Las horas son las del plan de cierre. C-07, C-08, C-10 y C-17 siguen en por hacer en esa tabla. El repositorio ya tiene `docker-compose.yml`, `backend/scripts/seed-entrega.ts`, la medición de C-35 y `docs/manuales/manual-instalacion-operacion.md`. En esta tabla esas cuatro quedan como entregadas.

| ID | Tarea | Responsable | Estimación | Estado |
|---|---|---|---|---|
| C-01 | Canchas en la UI: disponibilidad, reserva y pago | Lucas | 6–8 h | Finalizado |
| C-02 | Membresía visible en la UI | Lucas | 1–2 h | El plan de cierre la deja en desarrollo. C-30 cerró el cobro y el manual de usuario muestra la membresía |
| C-03 | Lectura en el teléfono: login, canchas y Mi QR | Lucas | 2 h | Finalizado |
| C-04 | Comprobante PDF post-pago | Bruno | 3–4 h | Finalizado |
| C-05 | Decisión escrita de RNF-01 | Patricio | 1 h | Finalizado |
| C-06 | Ensayo corto del guion, sin cronómetro | Equipo | 1 h | Finalizado |
| C-07 | Docker Compose | Matias | 6–8 h | Entregado. La fila del plan de cierre no se actualizó |
| C-08 | Seed de 25 sedes | Matias | 4–5 h | Entregado. La fila del plan de cierre no se actualizó |
| C-09 | `swagger.json` y enlace en el README | Bruno | 0,5 h | Finalizado |
| C-10 | Suite verde y umbral de ADR-008 | Matias | 3–4 h | Entregado. C-35 midió 65,77 % de sentencias |
| C-11 | Pantalla de clases: listar e inscribir | Patricio | 3–4 h | Finalizado |
| C-12 | Notificaciones in-app, si sobra | Lucas | 1–2 h | Por hacer |
| C-13 | Reorganizar `docs/` | Patricio | 2–3 h | Finalizado |
| C-14 | Diez ADR obligatorios | Patricio | 5–6 h | Finalizado |
| C-15 | Catorce diagramas | Patricio | 8–10 h | Finalizado |
| C-16 | Manual de usuario con capturas | Patricio | 4–5 h | Finalizado |
| C-17 | Manual de instalación y operación | Matias | 3–4 h | Entregado. La fila del plan de cierre no se actualizó |
| C-18 | Manual técnico y dos casos de extensión | Patricio | 3–4 h | Finalizado |
| C-19 | Cuatro bitácoras | Cada integrante | 3–4 h c/u | C-19a, C-19b y C-19c finalizadas. El plan deja C-19d en desarrollo. Los cuatro archivos están en el repo |
| C-20 | Planificación con matriz, sprints y desvíos | Matias | 6–8 h | Finalizado el 18/11 por C-38 |
| C-21 | Excel del tablero | Matias | 1–2 h | Por hacer |
| C-22 | Recorrido del Anexo G | Patricio | 3–4 h | Finalizado. Residual aceptado el 18/11 |
| C-23 | README de cinco pasos | Patricio | 2 h | Finalizado |
| C-24 | Guion de cinco minutos y plan B | Patricio | 1–2 h | Finalizado |
| C-25 | Dossier PDF con hash del tag | Patricio | 2 h | Por hacer. El PDF existe y se reimprime con el tag |
| C-26 | Tag `v1.0-entrega` | Patricio | 0,5 h | Por hacer |
| C-27 | Subida a Moodle | Patricio | 0,5 h | Por hacer |
| C-28 | Decorator de precios y UML | Patricio | 5–7 h | Finalizado |
| C-29 | Alta y edición de sedes | Patricio | 3–4 h | Finalizado |
| C-30 | Catálogo, alta y renovación cobrada | Patricio | 4–6 h | Finalizado |
| C-31 | Agenda de clases | Patricio | 4–6 h | Finalizado |
| C-32 | Canchas en pantalla | Patricio | 5–7 h | Finalizado |
| C-33 | Check-out desde Acceso | Patricio | 4–5 h | Finalizado |
| C-34 | Contraste del aviso de lugar liberado | Patricio | 0,5 h | Finalizado |
| C-35 | Medir build y cobertura | Matias | 1–2 h | Finalizado. 32 suites, 184 tests, 65,77 % de sentencias |
| C-36 | `LICENSE` | Patricio | 0,5 h | Finalizado |
| C-37 | Ordenar `docs/planificacion/` | Matias | 2–3 h | Finalizado |
| C-38 | Reescribir la matriz de C-20 | Matias | 4–6 h | Finalizado |
| C-39 | Dashboard del gerente | Patricio | 4–6 h | Finalizado |
| C-40 | E2E de navegador | Patricio | 4–6 h | Finalizado |
| C-41 | SQL de no sobreventa en Postgres | Patricio | 3–4 h | Finalizado. La corrida local imprimió OK 3 |

## 5. Cronograma

Las fechas son las de C-20. La capacidad cita el piso ya escrito: 4 h por persona por semana hasta el tramo de cierre. S8 cita el techo semanal del plan de cierre, sin multiplicarlo por los días del sprint.

| Sprint | Fechas | Objetivo | Capacidad | Entregable de cierre |
|---|---|---|---|---|
| 1 | 31/08 al 06/09/2026 | Arquitectura inicial, roles, monorepo, C4, ADR y reuniones | 4 h por persona por semana | Acta del 02/09 y plan de las semanas 1 y 2 |
| 2 | 07 al 13/09/2026 | Scaffolding Nest y React, Supabase, autenticación y esquema mínimo | 4 h por persona por semana | Plan de las semanas 1 y 2, y el LOG |
| 3 | 14 al 27/09/2026 | Membresías y clases: SQL, Repository, guards y ventanas de inscripción | 4 h por persona por semana | Migraciones y LOG. No hay plan propio de S3 |
| 4 | 28/09 al 11/10/2026 | Canchas, Strategy, Observer, correcciones de clases y seguimiento | 4 h por persona por semana | Acta del 13/10 y LOG |
| 5 | 12 al 25/10/2026 | Migración M4, login real, sesión, layout e infraestructura | 4 h por persona por semana | Acta del 21/10 y plan S5–S7 |
| 6 | 26/10 al 08/11/2026 | Perfil real, pagos, APIs de canchas, cliente HTTP, CI y notificaciones | 4 h por persona por semana | Plan S5–S7 y LOG |
| 7 | 09 al 15/11/2026 | Decorator, State, Facade, demo, Swagger, componentes y cierres funcionales | 4 h por persona por semana | Plan de cierre, tarjetas C-01 a C-34 |
| 8 | 16 al 19/11/2026 | Congelamiento, Anexo G, tag, dossier, medición y orden de la planificación | P1 8 a 10 h, P2 4 a 6 h, P3 8 a 10 h, P4 4 a 6 h, por semana | Evidencia de C-35 a C-41. El tag queda en C-26 |

## 6. Matriz de trazabilidad

Fuente: la matriz de C-20, cerrada el 18/11. La tercera columna dice el archivo donde se verifica, o el concepto que usa el código.

| Requisito | Historia que lo implementa | Dónde se verifica |
|---|---|---|
| RF-01 Registro y perfil | `POST /auth/register` y perfil propio | `backend/src/usuarios/auth/auth.service.ts` (`register`) y `backend/src/usuarios/perfiles/perfiles.controller.ts` (`GET /perfiles/me`). La foto no está: el alta no la pide |
| RF-02 Planes, estados y renovación | Catálogo y renovación cobrada. C-30 | `backend/src/usuarios/membresias/membresias.repository.ts` llama a `renovar_membresia`. Concepto: el alta cierra la membresía anterior en una función SQL |
| RF-03 Acceso multi-sede | El check-in no ata al socio a su sede de origen | `supabase/migrations/20261101210000_acceso_m2.sql`, función `check_in`: entra `p_sede_id` y no la sede habitual |
| RF-04 QR dinámico | Código que rota y check-in | `backend/src/acceso/totp.service.ts` y `backend/src/acceso/acceso.service.ts` (`checkIn`). Concepto: TOTP. Sin red, la validación queda para el sync |
| RF-05 Aforo por sede | Ocupación contra el máximo de la sede | `frontend/src/admin/Acceso/Acceso.tsx` muestra `ocupacion` y `aforoMax`. El máximo se guarda en `backend/src/usuarios/sedes/sedes.service.ts` |
| RF-06 Agenda de clases | El gerente crea y edita clases. C-31 | `backend/src/clases/clases.controller.ts` (`POST` y `PATCH`) y `frontend/src/admin/Clases/GestionarClases.tsx` |
| RF-07 Reserva de clases hasta 48 h antes | Inscripción del socio. C-11 | `backend/src/clases/clases.service.ts`, constante `VENTANA_RESERVA_CLASE_MS`. El spec `clases.service.spec.ts` rechaza si faltan menos de 48 h |
| RF-08 Lista de espera y aviso | Aviso al liberarse un lugar | `backend/src/clases/notificaciones/lista-espera.publisher.ts` y `observers/in-app.observer.ts`. Concepto: Observer |
| RF-09 Alta y edición de canchas | Costo por hora y datos de la cancha. C-32 | `backend/src/canchas/canchas.controller.ts` (`POST` y `PATCH`) y `frontend/src/admin/Canchas/GestionarCanchas.tsx` |
| RF-10 Grilla y bloqueo del turno | Disponibilidad y una sola reserva del horario | `GET /canchas/disponibilidad` en `canchas.controller.ts`. El bloqueo es el índice único `reservas_cancha_sin_sobreventa` en `supabase/migrations/20261027200000_canchas_m4.sql` |
| RF-11 Precio estándar, descuento y hora pico | Cadena de precio. C-28 | `backend/src/canchas/precios/decorators/`: `standard-pricing.ts`, `peak-hour-pricing.decorator.ts` y `member-discount-pricing.decorator.ts`. `precios.service.ts` arma la cadena. Concepto: Decorator. El enunciado nombraba Strategy |
| RF-12 Mantenimiento | El bloqueo no cancela la reserva ya tomada. C-32 | `backend/src/canchas/canchas.service.ts` marca el horario en mantenimiento. `canchas.service.spec.ts` cubre el alta y la baja del período |
| RF-13 Pasarela simulada | Cobro sin medio real | `backend/src/pagos/pasarela-pago.ts` es el puerto. `pasarela-simulada.ts` aprueba o rechaza. Concepto: simulacro. ADR-010. MercadoPago real queda fuera |
| RF-14 Comprobante PDF | PDF con cancha, horario y monto. C-04 | `backend/src/pagos/comprobantes/comprobante-pdf.template.ts`. Concepto: Template Method. La reserva lo descarga en `reservas-cancha.controller.ts`, `GET :id/comprobante`. No es factura fiscal |
| RN-01 Una sola sede a la vez | Una presencia abierta por socio | `presencias` en `20261101210000_acceso_m2.sql`. Un segundo ingreso choca con `unique_violation` y la función responde `YA_DENTRO`. Sin red, el choque se ve al sincronizar |
| RN-02 Sin sobreventa del turno | Una sola reserva del mismo turno | Índice `reservas_cancha_sin_sobreventa`. La prueba `supabase/tests/canchas_m4.test.sql` cubre `TURNO_OCUPADO` y la corrida local imprimió OK 3 |
| RN-03 Mora paga tarifa externa | El vencido pierde el descuento de socio | `member-discount-pricing.decorator.ts`: el descuento exige membresía activa. `precios.service.spec.ts` afirma que a las 19:00 el vencido paga tarifa externa |
| RNF-01 Acceso ante caída de conexión | La sede sigue operando sin red | `frontend/src/admin/Acceso/accesoCola.ts` guarda la fila en `localStorage`. Concepto: cola de sincronización. ADR-003 y ADR-007. No hay un nodo que valide el QR con el servidor caído |
| RNF-02 Sin datos de tarjeta | El pago guarda un token | `pasarela-simulada.ts` persiste `token_pasarela`. `pasarela-pago.ts` declara la tarjeta de prueba y dice que no se persiste |
| RNF-03 Consulta rápida de disponibilidad | La grilla se apoya en índices | `canchas_sede`, `mantenimientos_cancha_rango`, `reservas_cancha_cancha_inicio` y `reservas_cancha_perfil` en `20261027200000_canchas_m4.sql`. El 18/11 la grilla apareció en 786 ms. No hay umbral nuevo |
| RNF-04 Alta de sede sin detener el sistema | Una sede nueva es una fila. C-29 | `backend/src/usuarios/sedes/sedes.controller.ts` (`POST` y `PATCH`) y `sedes.service.ts`. La baja es `activa = false` |

## 7. Seguimiento por sprint

Trabajado es la suma de las marcas `· N h` de `LOG-ramos.md`, `LOG-conti.md`, `LOG-coquet.md` y `LOG-goncevat.md` cuya fecha cae en el sprint de C-20. Las sesiones del 27/08 entran en el sprint 1: son la semana de apertura de las bitácoras, anterior al corte del 31/08. Las entradas del 18/11 que no traen horas no suman una cifra. En la bitácora de Patricio, las horas anteriores al 6/11 están marcadas como estimación reconstruida por el tamaño de la sesión.

| Sprint | Comprometido | Completado | Trabajado (h) | Desvío | Observación |
|---|---|---|---|---|---|
| 1 | Arquitectura inicial, roles, monorepo, C4, ADR y reuniones | Acta del 02/09 y plan de las semanas 1 y 2 | 24 | S1-T16 sigue en por hacer. El piso escrito era 4 h por persona | Incluye 8 h del 27/08 |
| 2 | Scaffolding Nest y React, Supabase, autenticación y esquema mínimo | Tareas S2 del plan, en finalizado | 0 | Ninguna bitácora marca horas entre el 7 y el 13/09 | El plan de la semana 2 estima 7 h para Bruno y 4,5 h para Lucas |
| 3 | Membresías y clases: SQL, Repository, guards y ventanas | Migraciones y LOG | 20 | No hay plan propio de S3. C-37 remite al LOG | |
| 4 | Canchas, Strategy, Observer y correcciones de clases | Acta del 13/10 | 36 | El 13/10 las pantallas seguían con datos fijos y la API de canchas estaba en curso | |
| 5 | Migración M4, login real, sesión, layout e infraestructura | Acta del 21/10 y plan S5–S7 | 18,5 | El 21/10 se cerraron las reglas de precio y de reserva | |
| 6 | Perfil, pagos, APIs de canchas, cliente HTTP, CI y notificaciones | Plan S5–S7 y LOG | 60 | C-20 no escribe un desvío solo de este sprint | |
| 7 | Decorator, State, Facade, demo y cierres funcionales | C-01 cerró el 13/11. Plan de cierre C-01 a C-34 | 37,5 | C-01 cerró el 13/11 | |
| 8 | Congelamiento, Anexo G, tag, dossier y medición | C-24 y C-35 a C-41 cerrados. C-21, C-25, C-26 y C-27 abiertos. El tag no existe | 23 | El tag no existe. Las entradas de Patricio del 18/11 no traen horas | 16 h de Matias, 4 h de Bruno y 3 h de Lucas |

## 8. Análisis de desvíos

Dónde se estimó mal. El borrador de C-20 agrupaba RF-09 a RF-12 y omitía varios RF, porque la matriz no seguía el enunciado identificador por identificador. RN-03 se había leído como rutas y roles. RNF-03 se había leído como Docker. RNF-01 se había pensado como una decisión móvil. C-04 llegó a los primeros tramos con PDFKit declarado y sin integrar. C-02 quedó en por hacer mientras C-30 resolvía la renovación cobrada. S3 no tenía plan propio. C-20 no podía citar la medición ni el nombre final hasta que existieran C-35 y C-37. El estimado de 4 h semanales de agosto no alcanza para describir la concentración de noviembre: varias tarjetas que el plan asignaba a Lucas las cerró Patricio.

Qué riesgo se materializó y cómo se absorbió. La matriz incompleta se reemplazó el 18/11 por una fila por requisito. RN-03 quedó definido como mora con tarifa externa. RNF-03 se midió en `/canchas`: 786 ms hasta ver la grilla. RNF-01 quedó como cola local y sincronización, y la app móvil quedó fuera, por la decisión de C-05. C-04 cerró con Template Method, PDFKit y la descarga posterior al pago. C-30 cerró el catálogo y la renovación cobrada. C-37 señaló que S3 no tiene plan propio. C-38 usó el 65,77 % medido y el nombre `S8_Planificacion_Completa_C20.md`.

Qué se replanificaría si el cuatrimestre empezara de nuevo. Docker, el seed de 25 sedes y el manual de operación entrarían junto con el primer arranque reproducible, y la matriz de requisitos se escribiría sobre el enunciado completo en lugar de esperar a C-38.

## Registro de riesgos

Probabilidad, impacto y mitigación prevista no constan en los planes del cuatrimestre. No se les asigna un valor en este armado. La columna que sí está escrita es lo que ocurrió, tomada de C-20 y del capítulo 8.9 del dossier, y actualizada con el cierre del 18/11.

| Riesgo | Prob. | Impacto | Mitigación prevista | Qué ocurrió |
|---|---|---|---|---|
| La UI de canchas se queda en datos fijos | — | — | — | C-01 cerró el 13/11 con reserva y pago desde la pantalla |
| RNF-01 se interpreta como app móvil | — | — | — | La app quedó fuera. La sede encola el ingreso y la salida. C-05 |
| El offline fuerte pide un nodo por sede | — | — | — | Quedó la cola local y el sync. No se simuló un nodo físico |
| La documentación llega tarde | — | — | — | ADR, diagramas y los tres manuales están en el repo. C-38 reescribió la matriz el 18/11 |
| Una sola persona concentra Docker, seed y pruebas | — | — | — | El compose, el seed de 25 sedes, la medición de C-35 y el manual de instalación están en el repo. C-21 sigue abierto |
| La no sobreventa se prueba tarde | — | — | — | C-41 corrió el SQL. La salida local fue OK 3 |
| La cobertura queda bajo el umbral | — | — | — | C-35 midió 65,77 % de sentencias. El piso de ADR-008 sigue en 60 % |
| La planificación queda incompleta | — | — | — | C-37 ordenó la carpeta y C-38 reemplazó la matriz |
| El tablero no se exporta | — | — | — | C-21 todavía no produjo `PROGV-2026-TIF-Equipo03-Registro.xlsx` |
| El tag sale después de las 18:00 del 19/11 | — | — | — | El tag no existe. C-24 está cerrado. C-25, C-26 y C-27 siguen abiertos |
