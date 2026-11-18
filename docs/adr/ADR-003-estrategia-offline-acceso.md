# ADR-003 — Estrategia offline del control de acceso

- **Estado:** Aceptado
- **Fecha:** 2026-11-03
- **Autor:** Equipo FitZone Sports. Redacción al Anexo B: Patricio Ramos (P1)
- **Sprint:** 8
- **Lineamientos:** §5.2.1 ADR-003

## Contexto

El ingreso al gimnasio tenía que seguir el QR rotativo del socio (RF-04) y el control de acceso en sede tenía que seguir operando cuando se caía la conexión con el servidor central (RNF-01). Había dos cortes de red distintos: el de recepción, que debe registrar el ingreso, y el del socio, que solo necesita mostrar su QR.

El equipo era de cuatro personas. El camino crítico de la demo eran las canchas, y un nodo por sede con copia de secretos TOTP todavía no tenía validación de la cátedra. La regla de una sola sede a la vez (RN-01) se puede imponer en la base mientras hay conexión; sin conexión, el terminal no ve el estado del resto de la cadena.

Hasta el 2026-11-09 esta decisión y el protocolo de sincronización vivían en un mismo registro. El texto combinado quedó en `historial/ADR-007-acceso-totp-cola-offline.md`. El protocolo está en ADR-007.

## Alternativas consideradas

| Alternativa | A favor | En contra | Por qué se descartó |
|---|---|---|---|
| Check-in solo online, sin cola | Un solo camino, la validación ocurre siempre en la API | Con la red caída la recepción no registra nada | No cubre RNF-01 |
| Nodo local por sede con paquete de seeds TOTP | La recepción valida el QR sin API y puede rechazar en el momento | Hay que distribuir y rotar secretos, revocarlos sin red y operar un servicio por sede | Plausible más adelante; fuera del alcance y del plazo de esta entrega |
| Cubrir RNF-01 solo con la app móvil del socio | El QR se puede mostrar sin red | No registra el ingreso ni el aforo en recepción | No sustituye al terminal de sede |

## Decisión

Ante la caída de la conexión principal, la web de recepción acumula el check-in en el navegador y lo confirma contra la API al reconectar. Mientras no hay red no se validan membresía, TOTP ni RN-01: esa validación ocurre en el servidor, que sigue siendo la fuente de verdad.

Queda fuera de esta decisión el paquete de seeds en la sede, el servicio local por sede, los tornos y la app móvil instalable.

El criterio determinante fue poder demostrar RNF-01 en la demo sin operar infraestructura por sede.

## Consecuencias

- **Positivas:** la recepción sigue tomando ingresos sin internet; al volver la red cada evento se acepta o se rechaza con un error de negocio; RN-01 online queda en la base, igual que la no sobreventa de canchas.
- **Negativas:** un ingreso encolado puede rechazarse después (membresía vencida, código TOTP fuera de ventana, socio ya dentro de otra sede). La recepción no se entera hasta el sync.
- **Deuda asumida:** la validación TOTP 100 % offline y el cierre de presencia por tiempo de permanencia no forman parte de esta entrega. Si la cátedra exige validar el QR sin API, hace falta otro ADR y el nodo que acá se dejó afuera.

## Requisitos relacionados

RNF-01, RF-04, RN-01
