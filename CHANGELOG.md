# Changelog

Todos los cambios notables de FitZone Sports se documentan en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y el proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

Cada versión corresponde a un paso de la línea de integración (`desarrollo`) que trajo código. La documentación que entró entre dos números queda anotada en la versión vigente en ese momento.

## [Unreleased]

## [0.52.0] - 2026-11-19

### Added

- Una reserva pendiente se paga desde Mis reservas. El checkout en un host público no sale de localhost (C-24).

### Documentación

- Plan del Anexo H, registro del tablero (C-21) y dossier en Markdown (C-25). El PDF, el tag `v1.0-entrega` y las claves no se versionan.
- `documentacion/` no forma parte de la entrega. Los enlaces históricos quedan.

## [0.51.1] - 2026-11-18

### Fixed

- Quality gate de Sonar: las cargas de `/canchas` quedan marcadas con `void`, los horarios se comparan con `localeCompare`, y el Postgres local deja de tener la contraseña escrita en el Compose.
- Las imágenes de ejecución no corren como root. `npm ci` dentro de la imagen no ejecuta scripts de instalación. El descenso de títulos del dossier no usa la expresión regular que hacía backtracking.

## [0.51.0] - 2026-11-18

### Added

- E2E de Playwright: login del socio, reserva, pago simulado, consulta en Mis reservas y comprobante (C-40). No entra en el 60 % de sentencias.

### Documentación

- ADR-008 describe esa cima. La fila C-40 del plan de cierre queda en finalizado.

## [0.50.0] - 2026-11-18

### Added

- El job `sql-rn02` corre el SQL de RN-02 en CI y exige `OK 3` (C-41).

## [0.49.0] - 2026-11-18

### Added

- Dashboard del gerente: `GET /reportes/resumen` y la pantalla `/dashboard` (C-39).

## [0.48.1] - 2026-11-17

### Changed

- El Compose deja el frontend hablando con la API del host (C-07-2).

### Documentación

- README de cinco pasos (C-23), dossier en Markdown (C-25), licencia MIT (C-36) y el ajuste que deja de decir que Compose no existe (C-07-3). El lote C-35 a C-41 queda en el plan de cierre.

## [0.48.0] - 2026-11-17

### Added

- Docker Compose de la API y el frontend, con la base documentada en Supabase (C-07).

## [0.47.0] - 2026-11-17

### Added

- Comprobante PDF post-pago de la cancha (C-04, RF-14).

### Documentación

- Bitácoras de Bruno y de Lucas, y el manual de usuario (C-16).

## [0.46.0] - 2026-11-17

### Added

- Seed de entrega: al menos 25 sedes, canchas y clases mínimas, y los cuatro roles (C-08).

## [0.45.0] - 2026-11-17

### Added

- Umbral de cobertura del 60 % de sentencias en el CI (C-10).

## [0.44.0] - 2026-11-17

### Added

- Catálogo de componentes propios (S7-T09).

## [0.43.1] - 2026-11-16

### Fixed

- El título del aviso de lugar liberado se lee sobre la tarjeta (C-34).

### Documentación

- Bitácora de Matias, planificación de cierre (C-20) y manual de instalación y operación (C-17).

## [0.43.0] - 2026-11-15

### Added

- Check-out desde `/acceso`, con la misma cola del ingreso si no hay red (C-33).

## [0.42.0] - 2026-11-15

### Added

- Alta, precio, cancelación, pico, descuento y mantenimiento de canchas en pantalla (C-32).

## [0.41.0] - 2026-11-14

### Added

- El gerente crea y edita la agenda de clases (C-31).

## [0.40.0] - 2026-11-14

### Added

- El socio elige un plan, paga y la membresía anterior se cierra en la misma operación (C-30).

## [0.39.0] - 2026-11-14

### Added

- Alta y edición de sedes para el gerente (C-29).

## [0.38.0] - 2026-11-13

### Changed

- Los precios de cancha pasan de Strategy a Decorator (C-28.2).

### Documentación

- Diagramas de clases, secuencia y C4-3 del Decorator, y la bitácora del cierre C-28.

## [0.37.0] - 2026-11-13

### Changed

- S7-T08: pulido del flujo demo — menú por sesión/rol (`/dashboard` solo staff), Acceso con mensajes de recepción, Presencias con nombre/apellido, Home sin nav duplicada; confirmación de cancha por nombre.

### Documentación

- README §6 y planes de cierre alineados al pase solo UI.

## [0.36.0] - 2026-11-13

### Added

- Notificaciones in-app.

## [0.35.0] - 2026-11-13

### Added

- Pantalla de clases: listar e inscribir (S7-T06 / C-11).

## [0.34.0] - 2026-11-13

### Added

- `backend/swagger.json` exportado y enlazado (C-09).

## [0.33.0] - 2026-11-10

### Added

- Membresía visible en el perfil y lectura responsive de login, canchas y QR.

### Documentación

- Diagramas de la entrega (C-15), manual técnico (C-18), bitácora de Patricio (C-19a) y la reunión del 11/11.

## [0.32.0] - 2026-11-10

### Added

- Pantalla de canchas: sede, disponibilidad, reserva y pago.

## [0.31.0] - 2026-11-09

### Changed

- El repositorio pasa a la estructura `docs/` del punto 4 (C-13).

### Documentación

- Los diez ADR obligatorios (C-14).

## [0.30.0] - 2026-11-07

### Added

- Átomos Button, Input y Spinner (S5-T09).

### Documentación

- Guion del ensayo de demo (C-06).

## [0.29.0] - 2026-11-07

### Added

- Pantallas de Clases y Notificaciones protegidas por rol (S5-T08).

## [0.28.0] - 2026-11-07

### Added

- El cliente cierra la sesión cuando una llamada autenticada responde 401 y tipa el rol (S4-T04).

## [0.27.0] - 2026-11-07

### Changed

- El precio de la cancha redondea hacia arriba (S4-T15).

## [0.26.0] - 2026-11-04

### Added

- Ajustes de la API de clases (S4-T14).

### Documentación

- Plan de tres semanas y plan de cierre de la entrega.

## [0.25.0] - 2026-11-04

### Added

- API de clases (S4-T10).

## [0.24.0] - 2026-11-04

### Added

- API de canchas (S4-T06).

## [0.23.1] - 2026-11-03

### Fixed

- Avisos de Sonar en el registro, el perfil y la sesión.

## [0.23.0] - 2026-11-03

### Added

- Acceso en sede (M2): migración de `totp_seeds`, `presencias` y `check_ins`.
- Módulo Nest de acceso con TOTP (60 s), check-in y check-out online, y sync de la cola offline.
- Emisión del seed TOTP cifrado al crear una membresía.
- Pantallas `/mi-qr` y `/acceso`, con cola local en el navegador.
- Colección Postman de acceso.

### Documentación

- Plan M2 de check-in y QR, plan de UX v2, ADR-007 y alineación de C4, stack y decisiones.

## [0.22.0] - 2026-11-03

### Added

- Registro de usuarios y pantalla de perfil con datos reales.

## [0.21.0] - 2026-11-03

### Added

- Validación y persistencia de la sesión en el frontend.

## [0.20.0] - 2026-11-03

### Added

- Login de React contra NestJS y Supabase.

## [0.19.0] - 2026-11-02

### Added

- Pasarela de pago simulada, con checkout y hold de la reserva pendiente.

### Documentación

- ADR 002 a 004 restaurados como reemplazados, y ADR 008 a 010.

## [0.18.1] - 2026-11-01

### Changed

- Tests de Postman de canchas, script de smoke, workflow de CI y reporte de cobertura.

## [0.18.0] - 2026-10-31

### Added

- Reservas de cancha con Facade y State, y Strategy de precios en uso.
- Migración para confirmar la reserva.

## [0.17.1] - 2026-10-31

### Fixed

- Se quita el probe de signup duplicado marcado por Sonar.

## [0.17.0] - 2026-10-31

### Added

- `POST /auth/register` con confirmación de email.

## [0.16.1] - 2026-10-29

### Changed

- Configuración de Jest y guía de implementación de tests. El README describe la demo.

## [0.16.0] - 2026-10-28

### Added

- Migración M5 de pagos.

## [0.15.0] - 2026-10-28

### Added

- `GET /perfiles/me` y `PATCH /perfiles/me` a partir del JWT.

## [0.14.1] - 2026-10-27

### Changed

- Ajuste del spec de precios de cancha.

### Documentación

- Caracterización de olores del lab de Unidad III, guía de SonarCloud y notas de correcciones.

## [0.14.0] - 2026-10-27

### Added

- Seed mínimo de demo (`npm run seed`).

## [0.13.0] - 2026-10-27

### Added

- Migración M4 de canchas, reservas y configuración de precios.

## [0.12.0] - 2026-10-27

### Added

- Migración Fase A del núcleo: sedes, perfiles y membresías.

## [0.11.0] - 2026-10-26

### Added

- Strategy de precios de cancha: tarifa estándar, hora pico y descuento de socio.

### Documentación

- Acta de seguimiento del 2026-10-21, plan de la semana 5 y propuesta de continuación.

## [0.10.1] - 2026-10-15

### Added

- Setup inicial de pruebas E2E, script para levantar el servidor y colección Postman de la API.

### Documentación

- Confección final de la justificación de patrones (S4-T05).

## [0.10.0] - 2026-10-13

### Added

- Pantalla de Canchas con datos de demostración.

### Documentación

- Bitácora de trabajo, panorama del desarrollo al 2026-10-13 y acta de seguimiento de esa fecha.

## [0.9.0] - 2026-10-07

### Added

- API de membresías y de clases.

## [0.8.0] - 2026-10-07

### Added

- Pantalla Mi Perfil.

## [0.7.0] - 2026-10-07

### Added

- Router, layout y pantalla de login en el frontend.

## [0.6.1] - 2026-10-06

### Changed

- El Observer de la lista de espera pasa a `@nestjs/event-emitter`.

### Documentación

- Notas de la clase 1 de Unidad III y justificación del Observer con EventEmitter.

## [0.6.0] - 2026-10-06

### Added

- Guard de roles: `@RequiereRol` valida `perfiles.rol` y `/auth/me` devuelve el rol.

## [0.5.1] - 2026-10-06

### Fixed

- El login usa un cliente de Supabase propio y no contamina el cliente compartido.

### Documentación

- Propuesta de reglas de negocio S4-T09 (gerente y recepcionista editan precios; la reserva de cancha llega hasta un mes).

## [0.5.0] - 2026-10-06

### Added

- Notificaciones de lugar liberado en la lista de espera, con el patrón Observer.
- Migración de notificaciones.

## [0.4.0] - 2026-10-05

### Added

- CORS configurable con `CORS_ORIGIN`.

## [0.3.0] - 2026-10-05

### Added

- Patrón Repository en `GET /sedes`, con filtro de errores de Supabase.

### Documentación

- Guía del patrón Repository y actualización del plan de trabajo (S3-T06, S3-T11, S3-T01 y S2-T13).

## [0.2.0] - 2026-10-05

### Added

- Migración de membresías y clases, con tests SQL.

## [0.1.0] - 2026-10-05

### Added

- Swagger de login, health y sedes.
- `GET /health` y documentación de la API en `/api/docs`.

### Documentación

- Plan de trabajo de las semanas 1 a 4, alineado al tablero.

[0.52.0]: https://github.com/PatricioRamos04032000/FitZoneSports/releases/tag/v0.52.0
[0.51.1]: https://github.com/PatricioRamos04032000/FitZoneSports/releases/tag/v0.51.1
[0.51.0]: https://github.com/PatricioRamos04032000/FitZoneSports/releases/tag/v0.51.0
[0.50.0]: https://github.com/PatricioRamos04032000/FitZoneSports/releases/tag/v0.50.0
[0.49.0]: https://github.com/PatricioRamos04032000/FitZoneSports/releases/tag/v0.49.0
[0.48.1]: https://github.com/PatricioRamos04032000/FitZoneSports/releases/tag/v0.48.1
[0.48.0]: https://github.com/PatricioRamos04032000/FitZoneSports/releases/tag/v0.48.0
[0.47.0]: https://github.com/PatricioRamos04032000/FitZoneSports/releases/tag/v0.47.0
[0.46.0]: https://github.com/PatricioRamos04032000/FitZoneSports/releases/tag/v0.46.0
[0.45.0]: https://github.com/PatricioRamos04032000/FitZoneSports/releases/tag/v0.45.0
[0.44.0]: https://github.com/PatricioRamos04032000/FitZoneSports/releases/tag/v0.44.0
[0.43.1]: https://github.com/PatricioRamos04032000/FitZoneSports/releases/tag/v0.43.1
[0.43.0]: https://github.com/PatricioRamos04032000/FitZoneSports/releases/tag/v0.43.0
[0.42.0]: https://github.com/PatricioRamos04032000/FitZoneSports/releases/tag/v0.42.0
[0.41.0]: https://github.com/PatricioRamos04032000/FitZoneSports/releases/tag/v0.41.0
[0.40.0]: https://github.com/PatricioRamos04032000/FitZoneSports/releases/tag/v0.40.0
[0.39.0]: https://github.com/PatricioRamos04032000/FitZoneSports/releases/tag/v0.39.0
[0.38.0]: https://github.com/PatricioRamos04032000/FitZoneSports/releases/tag/v0.38.0
[0.37.0]: https://github.com/PatricioRamos04032000/FitZoneSports/releases/tag/v0.37.0
[0.36.0]: https://github.com/PatricioRamos04032000/FitZoneSports/releases/tag/v0.36.0
[0.35.0]: https://github.com/PatricioRamos04032000/FitZoneSports/releases/tag/v0.35.0
[0.34.0]: https://github.com/PatricioRamos04032000/FitZoneSports/releases/tag/v0.34.0
[0.33.0]: https://github.com/PatricioRamos04032000/FitZoneSports/releases/tag/v0.33.0
[0.32.0]: https://github.com/PatricioRamos04032000/FitZoneSports/releases/tag/v0.32.0
[0.31.0]: https://github.com/PatricioRamos04032000/FitZoneSports/releases/tag/v0.31.0
[0.30.0]: https://github.com/PatricioRamos04032000/FitZoneSports/releases/tag/v0.30.0
[0.29.0]: https://github.com/PatricioRamos04032000/FitZoneSports/releases/tag/v0.29.0
[0.28.0]: https://github.com/PatricioRamos04032000/FitZoneSports/releases/tag/v0.28.0
[0.27.0]: https://github.com/PatricioRamos04032000/FitZoneSports/releases/tag/v0.27.0
[0.26.0]: https://github.com/PatricioRamos04032000/FitZoneSports/releases/tag/v0.26.0
[0.25.0]: https://github.com/PatricioRamos04032000/FitZoneSports/releases/tag/v0.25.0
[0.24.0]: https://github.com/PatricioRamos04032000/FitZoneSports/releases/tag/v0.24.0
[0.23.1]: https://github.com/PatricioRamos04032000/FitZoneSports/releases/tag/v0.23.1
[0.23.0]: https://github.com/PatricioRamos04032000/FitZoneSports/releases/tag/v0.23.0
[0.22.0]: https://github.com/PatricioRamos04032000/FitZoneSports/releases/tag/v0.22.0
[0.21.0]: https://github.com/PatricioRamos04032000/FitZoneSports/releases/tag/v0.21.0
[0.20.0]: https://github.com/PatricioRamos04032000/FitZoneSports/releases/tag/v0.20.0
[0.19.0]: https://github.com/PatricioRamos04032000/FitZoneSports/releases/tag/v0.19.0
[0.18.1]: https://github.com/PatricioRamos04032000/FitZoneSports/releases/tag/v0.18.1
[0.18.0]: https://github.com/PatricioRamos04032000/FitZoneSports/releases/tag/v0.18.0
[0.17.1]: https://github.com/PatricioRamos04032000/FitZoneSports/releases/tag/v0.17.1
[0.17.0]: https://github.com/PatricioRamos04032000/FitZoneSports/releases/tag/v0.17.0
[0.16.1]: https://github.com/PatricioRamos04032000/FitZoneSports/releases/tag/v0.16.1
[0.16.0]: https://github.com/PatricioRamos04032000/FitZoneSports/releases/tag/v0.16.0
[0.15.0]: https://github.com/PatricioRamos04032000/FitZoneSports/releases/tag/v0.15.0
[0.14.1]: https://github.com/PatricioRamos04032000/FitZoneSports/releases/tag/v0.14.1
[0.14.0]: https://github.com/PatricioRamos04032000/FitZoneSports/releases/tag/v0.14.0
[0.13.0]: https://github.com/PatricioRamos04032000/FitZoneSports/releases/tag/v0.13.0
[0.12.0]: https://github.com/PatricioRamos04032000/FitZoneSports/releases/tag/v0.12.0
[0.11.0]: https://github.com/PatricioRamos04032000/FitZoneSports/releases/tag/v0.11.0
[0.10.1]: https://github.com/PatricioRamos04032000/FitZoneSports/releases/tag/v0.10.1
[0.10.0]: https://github.com/PatricioRamos04032000/FitZoneSports/releases/tag/v0.10.0
[0.9.0]: https://github.com/PatricioRamos04032000/FitZoneSports/releases/tag/v0.9.0
[0.8.0]: https://github.com/PatricioRamos04032000/FitZoneSports/releases/tag/v0.8.0
[0.7.0]: https://github.com/PatricioRamos04032000/FitZoneSports/releases/tag/v0.7.0
[0.6.1]: https://github.com/PatricioRamos04032000/FitZoneSports/releases/tag/v0.6.1
[0.6.0]: https://github.com/PatricioRamos04032000/FitZoneSports/releases/tag/v0.6.0
[0.5.1]: https://github.com/PatricioRamos04032000/FitZoneSports/releases/tag/v0.5.1
[0.5.0]: https://github.com/PatricioRamos04032000/FitZoneSports/releases/tag/v0.5.0
[0.4.0]: https://github.com/PatricioRamos04032000/FitZoneSports/releases/tag/v0.4.0
[0.3.0]: https://github.com/PatricioRamos04032000/FitZoneSports/releases/tag/v0.3.0
[0.2.0]: https://github.com/PatricioRamos04032000/FitZoneSports/releases/tag/v0.2.0
[0.1.0]: https://github.com/PatricioRamos04032000/FitZoneSports/releases/tag/v0.1.0
