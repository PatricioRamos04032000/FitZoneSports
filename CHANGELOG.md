# Changelog

Todos los cambios notables de FitZone Sports se documentan en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y el proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

Cada versión corresponde a un paso de la línea de integración (`desarrollo`) que trajo código. La documentación que entró entre dos números queda anotada en la versión vigente en ese momento.

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
