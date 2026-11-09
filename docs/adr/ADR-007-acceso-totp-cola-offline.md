# ADR-007 — Sincronización del terminal de sede

- **Estado:** Aceptado
- **Fecha:** 2026-11-03
- **Autor:** Equipo FitZone Sports. Redacción al Anexo B: Patricio Ramos (P1), 2026-11-09
- **Sprint:** 8
- **Lineamientos:** §5.2.1 ADR-007

La estrategia (qué se hace cuando cae la red) está en ADR-003. Este registro dice qué queda en el navegador de recepción, cada cuánto se manda y cómo se resuelve un choque al reconectar. El texto que mezclaba las dos decisiones está en `historial/ADR-007-acceso-totp-cola-offline.md`.

## Contexto

Con la estrategia de cola ya elegida, faltaba definir el contenido del terminal. Replicar seeds TOTP, membresías y presencias hubiera permitido validar el QR sin API, y también hubiera dejado secretos en el navegador de la sede. El equipo no iba a operar esa réplica.

El check-in online ya entraba por `POST /acceso/check-ins`. Hacía falta un camino para los eventos acumulados, sin doble ingreso si el recepcionista reintenta, y sin cerrar solo la presencia de otra sede cuando el segundo ingreso pierde.

RN-01 se impone con la clave primaria de `presencias` (`perfil_id`) dentro de `registrar_check_in`. La migración es `supabase/migrations/20261101210000_acceso_m2.sql`.

## Alternativas consideradas

| Alternativa | A favor | En contra | Por qué se descartó |
|---|---|---|---|
| Réplica local de seeds, membresías y presencias, refresca cada N minutos | La sede valida y rechaza sin red | Secretos en el navegador, revocación atrasada y conflictos de dos copias de la presencia | Es el nodo que ADR-003 dejó fuera |
| Timer fijo (por ejemplo cada 30 s) aunque nadie esté mirando la pantalla | Vacía la cola sin un clic | Despierta la API en el free tier y reintenta errores de negocio en loop | El evento de red y el botón alcanzan para la demo |
| Last-write-wins: el sync pisa la presencia anterior | El ingreso encolado «gana» siempre | Un socio quedaría dentro de la sede equivocada, o en dos, según el orden de llegada | RN-01 no se negocia en el cliente |
| Borrar la presencia vieja y aceptar el ingreso nuevo | La cola no muestra errores | Cierra una visita que quizá sigue abierta en la otra sede, sin cajero de por medio | El conflicto se anota y lo resuelve una persona |

## Decisión

El terminal no replica catálogo, seeds ni membresías. En `localStorage`, clave `fitzone.acceso.cola`, solo persiste la cola de ingresos todavía no confirmados. Cada ítem lleva `clientEventId`, `perfilId`, `code`, `sedeId` y `ocurrioEn`.

No hay frecuencia periódica. La cola se envía en dos momentos: cuando el navegador dispara el evento `online`, y cuando recepción pulsa sincronizar. El POST es `/acceso/check-ins/sync`, de a lo sumo 50 ítems.

El servidor es la fuente de verdad:

- El mismo `clientEventId` (`check_ins.client_event_id`, único) es idempotente: el reintento responde ok y no vuelve a validar el TOTP.
- Cada ítem nuevo pasa por membresía activa, TOTP y `registrar_check_in`.
- Si la presencia ya existe, la base responde `YA_DENTRO` o `YA_EN_OTRA_SEDE`. Nest traduce ese error. El ítem queda en la cola con estado `error`. No se cierra sola la presencia anterior.
- Los ítems aceptados se quitan de la cola. Los que fallan por red siguen `pendiente`.

El criterio determinante fue no tener dos copias de la presencia: lo que no confirmó la API no es un ingreso.

## Consecuencias

- **Positivas:** no hay secretos TOTP en el puesto de recepción; un reintento no duplica el check-in; el recepcionista ve el ok y el error por ítem; RN-01 se resuelve con la misma clave primaria que en el check-in online.
- **Negativas:** hasta el sync, el aforo de la sede no incluye a quien está solo en la cola; un código TOTP de 60 s puede vencer mientras el puesto sigue offline y el sync lo va a rechazar; la cola es de ese navegador, no de la sede, y se pierde si se limpia el storage.
- **Deuda asumida:** no hay cierre de presencia por tiempo (el registro viejo mencionaba unas 3 horas como ejemplo; no está en la base). No hay copia de la cola en otro medio. El puesto no avisa a otras sedes hasta que la API acepta el ingreso.

## Requisitos relacionados

RNF-01, RN-01, RF-04, RF-05
