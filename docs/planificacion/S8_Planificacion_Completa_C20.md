# Planificación completa — C-20

**Estado:** Cerrada el 2026-11-18 mediante C-38.  
**Última medición:** 32/32 suites, 184/184 tests y 65.77 % de sentencias.  
**Umbral vigente:** 60 % de sentencias según ADR-008; no se elevó a 70 %.  
**Fuentes:** plan de cierre, índice por sprints, bitácoras, tablero Trello y código del repositorio.

## 1. Objetivo

Consolidar el trabajo realizado por FitZone Sports desde el inicio del proyecto hasta su entrega final, con una matriz única de requisitos y un seguimiento basado en evidencias reales.

El documento reemplaza el borrador anterior de C-20. No incluye riesgos escritos como hechos futuros: registra desvíos ocurridos, su materialización y la respuesta aplicada.

## 2. Equipo y alcance

| Integrante | Rol | Responsabilidad principal |
|---|---|---|
| Patricio Ramos (P1) | Arquitectura / Backend Lead | ADR, coordinación, backend crítico, documentación y cierre |
| Bruno Conti (P2) | Backend | Membresías, clases, pagos, PDF y validaciones |
| Lucas Coquet (P3) | Frontend | Login, sesión, pantallas y experiencia por rol |
| Matias Goncevat (P4) | QA / DevOps / Mobile | CI, seed, Docker, cobertura, bitácora y planificación |

## 3. Cronograma por ocho sprints

| Sprint | Fechas | Resultado ocurrido | Evidencia principal |
|---|---|---|---|
| S1 | 31/08 al 06/09/2026 | Arquitectura inicial, roles, monorepo, C4/ADR y reuniones | Acta del 02/09 y plan S1–S2 |
| S2 | 07 al 13/09/2026 | Scaffolding Nest/React, Supabase, autenticación y esquema mínimo | Plan histórico S1–S2 y LOG |
| S3 | 14 al 27/09/2026 | Membresías y clases: diseño SQL, Repository, guards y ventanas de inscripción | MIGRACIONES y LOG; no existe plan propio |
| S4 | 28/09 al 11/10/2026 | Canchas, Strategy, Observer, correcciones de clases/membresías y seguimiento | Acta del 13/10 y LOG |
| S5 | 12 al 25/10/2026 | Migración M4, login real, sesión, layout y tareas de infraestructura | Acta del 21/10 y plan S5–S7 |
| S6 | 26/10 al 08/11/2026 | Perfil real, pagos, APIs de canchas, cliente HTTP, CI y notificaciones | Plan S5–S7 y entradas del LOG |
| S7 | 09 al 15/11/2026 | Decorator/State/Facade, demo, Swagger, componentes, Docker y cierres funcionales | Plan de cierre C-01…C-34 |
| S8 | 16 al 19/11/2026 | Congelamiento, Anexo G, tag, dossier, medición de calidad y reordenamiento documental | Plan de cierre y evidencia C-35…C-41 |

S1 comienza el 31/08/2026 y S8 comprende el período 16–19/11/2026. Las fechas históricas se conservaron como corte real de trabajo; no sustituyen fechas estimadas por trabajo futuro.

## 4. EDT realizado

| Línea | Responsable | Resultado |
|---|---|---|
| Arquitectura y documentación | P1 | C4, ADR, diagramas, manual técnico y manual de usuario |
| Backend y reglas | P1/P2 | Nest, JWT, canchas, clases, membresías, pagos y acceso |
| Frontend y demo | P3/P1 | Login, sesión, roles, pantallas y flujo demostrable |
| Calidad y operación | P4/P1 | CI, 32 suites verdes, 184 tests, 65.77 % de sentencias, Docker y seed |
| Planificación y cierre | P4/P1 | Índice por sprints, plan de cierre, tablero y dossier |

## 5. Control de avance ocurrido

| Fecha | Objetivo | Resultado |
|---|---|---|
| 2026-11-06 | Arrancar plan de cierre | Plan T1/T2/T3 definido |
| 2026-11-09 | Cerrar ADR y estructura docs | Base documental lista |
| 2026-11-11 | Alinear tablero y estados | Estados de cierre actualizados |
| 2026-11-13 | Revisar bitácoras y cierre documental | Evidencia final compilada |
| 2026-11-16 | Pase final de Anexo G | Checklist casi verde |
| 2026-11-19 | Congelamiento y tag | Cierre de la entrega realizado |

## 6. Matriz única de requerimientos

### 6.1 Requisitos funcionales

| ID | Requisito | Implementación / evidencia | Estado real |
|---|---|---|---|
| RF-01 | Registro y perfil; DNI, contacto y foto como datos previstos | `POST /auth/register`, perfil propio y control de identidad | Cerrado; la foto queda fuera del corte porque no se configuró Storage y el alta no la solicita |
| RF-02 | Planes mensual, trimestral y anual; estados y renovación | Catálogo, pago simulado y alta/renovación con SQL atómica; C-30 | Cerrado |
| RF-03 | Acceso multi-sede sin fijar al socio a la sede de origen | Membresía activa y check-in independiente de sede | Cerrado |
| RF-04 | QR dinámico que rota y validación central | TOTP por minuto y endpoint de acceso; C-29/M2 | Cerrado en el MVP web; validación definitiva al sincronizar |
| RF-05 | Aforo real y máximo por sede | Ocupación/presencias y pantalla `/acceso` | Cerrado como indicador operativo |
| RF-06 | Gestión de agenda de clases | `POST/PATCH /clases`, pantalla de gerente y validaciones; C-31 | Cerrado |
| RF-07 | Reserva de clases hasta 48 h antes y cancelación | Servicio de clases, JWT y pantalla `/clases`; C-11 | Cerrado |
| RF-08 | Lista de espera y aviso al liberarse un lugar | Repository/servicio, Observer y UI de clases | Cerrado |
| RF-09 | Alta y edición de canchas con costo por hora | `/canchas/gestionar`, API y C-32 | Cerrado |
| RF-10 | Grilla horaria y bloqueo del turno reservado | Disponibilidad, reserva y restricción única de turno; C-01/C-32 | Cerrado |
| RF-11 | Precio estándar, descuento socio y recargo pico | Decorator implementado sobre la cadena de precios; C-28 | Cerrado; reemplaza la palabra Strategy del enunciado por Decorator GoF |
| RF-12 | Bloqueo por mantenimiento sin afectar reservas tomadas | Mantenimiento en API/UI; C-32 | Cerrado |
| RF-13 | Pasarela simulada sin medios reales | Puerto `PasarelaPago` y simulacro aprobado/rechazado; ADR-010 | Cerrado como simulacro |
| RF-14 | Comprobante PDF post-pago con cancha, horario y monto | Template Method, PDFKit y descarga desde UI; C-04 | Cerrado; no es factura fiscal |

### 6.2 Reglas de negocio

| ID | Regla | Evidencia | Estado real |
|---|---|---|---|
| RN-01 | El socio no puede estar dentro de dos sedes a la vez | `presencias` con presencia única y chequeos de check-in/check-out | Cerrado para operación online; offline resuelve conflictos al sincronizar |
| RN-02 | Dos reservas del mismo turno no producen sobreventa | Índice único parcial y prueba SQL `OK 3`; C-41 | Cerrado y verificado |
| RN-03 | Mora pierde descuento; puede pagar como externo | Membresía vencida, regla de inscripción y Decorator de precio externo | Cerrado |

### 6.3 Requisitos no funcionales

| ID | Requisito | Evidencia | Estado real |
|---|---|---|---|
| RNF-01 | Control de acceso disponible ante caída de conexión | Cola `localStorage` y batch de sincronización; ADR-003/007 | MVP cerrado; no hay nodo físico ni medición del 99.5 % |
| RNF-02 | No almacenar datos de tarjeta; usar token | ADR-010 y pasarela simulada | Cerrado |
| RNF-03 | Consulta rápida de disponibilidad de canchas | Índices PostgreSQL, API Nest y medición real del 18/11: 786 ms hasta ver 15 horarios | Cerrado para la medición local; no se declaró un piso nuevo |
| RNF-04 | Agregar una sede sin detener el sistema | Sedes persistidas en PostgreSQL y endpoints de alta/edición; C-29 | Cerrado |

## 7. EDT y capacidad ejecutada

La estimación inicial se replanificó según el avance del tablero y las responsabilidades reales. P1 asumió tarjetas documentales y funcionales al detectarse desvíos de asignación; P4 concentró CI, Docker, seed, mediciones y organización documental. P2 cerró backend crítico y comprobantes; P3 finalizó la base de frontend y el flujo operativo disponible.

No se usa una estimación futura para justificar el cierre: los porcentajes y horas se limitan a las entradas ya registradas en cada bitácora.

## 8. Desvíos ocurridos y replanteo

| Desvío ocurrido | Dónde se estimó mal | Qué se materializó | Replanteo aplicado |
|---|---|---|---|
| El borrador de C-20 agrupaba RF-09–RF-12 y omitía varios RF | La matriz no seguía el enunciado ID por ID | Faltaban RF-01, RF-03, RF-04, RF-05, RF-10, RF-11 y RF-13 en la lectura de planificación | C-38 reemplaza la matriz por una fila por requisito, conservando cada cierre en evidencia |
| RN-03 se había asociado a rutas y roles | Se confundió la regla de mora con autorización | La regla real es que el socio vencido pierde descuento y paga tarifa externa | La matriz define RN-03 por membresía vencida y precio externo |
| RNF-03 se había confundido con Docker | Se tomó operación por rendimiento de disponibilidad | El Anexo G pide índices y respuesta de la consulta de canchas | Se midió `/canchas/disponibilidad` el 18/11 y la UI mostró la grilla en 786 ms |
| RNF-01 se pensó inicialmente como una decisión móvil | No distinguió el offline de sede del QR del socio | La sede necesita cola local y sync; el móvil solo muestra el QR | ADR-007 dejó el MVP como cola local + batch Nest/Supabase y conflictos diferidos |
| C-04 y pdfkit llegaron a T1/T2 con integración pendiente | PDFKit estaba declarado, pero no instalado o integrado en el primer intento | El comprobante no apareció con el flujo de pago | Se cerró C-04 con Template Method, PDFKit y descarga post-pago |
| C-02 quedó en Por hacer mientras C-30 resolvía renovación | La membresía visible se separó del cobro real sin cerrar todo el alcance RF-02 | RF-02 tenía dos piezas parciales | C-30 cerró catálogo, alta y renovación cobrada; C-02 conserva el acceso visible ya previsto |
| El histórico no tenía plan propio para S3 | La nomenclatura mezclaba S3 y S4 sin separar evidencia | S3 quedaba sin documento principal propio | C-37 señala S3 sin plan propio y remite al LOG como fuente |
| C-20 dependía de C-35 y C-37 | El documento no podía citar la medición ni usar el nombre final | El porcentaje y las rutas podían quedar obsoletas | C-38 usa 65.77 % medido y `S8_Planificacion_Completa_C20.md` como nombre final |

## 9. Riesgos materializados y corte

- **Cobertura:** C-10 declaró el 60 %; C-35 midió 65.77 %. No se elevó el piso.
- **Planificación:** C-20 quedó incompleta y desordenada; C-37 ordenó la carpeta y C-38 reemplazó la matriz.
- **Offline fuerte:** quedó acotado a cola local y sync; no se simuló un nodo físico por sede.
- **Tablero:** C-21 aún no produjo el registro XLSX nombrado por el Anexo G; no se marca como cerrado en este documento.
- **Entrega:** C-24 quedó cerrado el 2026-11-18 con el guion. C-25, C-26 y C-27 siguen en el paso final y cierran contra evidencia de Moodle y tag.

## 10. Criterio de cierre de C-20 y C-38

C-20 queda cerrado porque:

- existe el documento reescrito en `docs/planificacion/`;
- la matriz recorre RF-01…RF-14, RN-01…RN-03 y RNF-01…RNF-04;
- existen ocho sprints, desde S1 al 31/08 hasta S8 al 19/11;
- los desvíos describen estimación, materialización y replanteo ocurrido;
- C-35 aporta el porcentaje 65.77 % y C-37 aporta el nombre y organización final;
- no se agregan riesgos descritos como hechos futuros ni se cambia el umbral ADR-008.

## 11. Referencias

- [Plan de cierre](./S8_Plan_Cierre_Entrega_6_19_Nov.md)
- [Plan de proyecto y seguimiento, Anexo H](./PROGV-2026-TIF-Equipo03-Planificacion.md)
- [Índice por sprints](./README.md)
- [ADR-008](../adr/ADR-008-pruebas-cobertura.md)
- [Anexo G residual](../../documentacion/C-22_Anexo_G_Pendiente.md)
- [Exportaciones](./exportaciones/)