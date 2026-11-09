# ADR-004 — Concurrencia en la reserva de canchas

- **Estado:** Aceptado
- **Fecha:** 2026-10-27
- **Autor:** Equipo FitZone Sports. Redacción: Patricio Ramos (P1)
- **Sprint:** 7
- **Lineamientos:** §5.2.1 ADR-004

## Contexto

Dos socios pueden pedir el mismo turno de la misma cancha al mismo tiempo. La regla de negocio es que exactamente uno queda con la reserva (RN-02). Un control previo en la API (leer si el turno está libre y después insertar) pierde la carrera: las dos lecturas ven el turno libre y las dos escrituras confirman.

El precio lo calcula Nest con estrategias intercambiables y lo envía ya resuelto. La base tiene que garantizar el cupo del turno, no el cálculo del precio. Una reserva `pendiente` de pago también ocupa el turno durante una ventana corta: si no lo hiciera, otro socio compraría el mismo horario mientras el primero está en el checkout.

La función y el índice quedaron en la migración `supabase/migrations/20261027200000_canchas_m4.sql`. El hold de la pendiente, en `20261101200000_hold_reserva_pendiente.sql`.

## Alternativas consideradas

| Alternativa | A favor | En contra | Por qué se descartó |
|---|---|---|---|
| Chequeo solo en Nest (`SELECT` y después `INSERT`) | Fácil de leer en el servicio | Las dos transacciones ven el turno libre | La condición de carrera queda entre la lectura y la escritura. El índice único la cierra igual, pero el perdedor no debe depender de que el servicio haya leído bien |
| Bloqueo optimista (columna `version` o `updated_at`) | No retiene un lock de fila | Los dos leen la misma versión; igual hace falta una restricción para que el segundo `UPDATE` falle, y el error no es el código de negocio del turno | No agrega una garantía que el índice único no dé ya, y suma un ida y vuelta |
| Aislamiento `SERIALIZABLE` como única medida, sin índice de unicidad | Postgres aborta una de las dos transacciones | El fallo llega como error de serialización, no como `TURNO_OCUPADO`, y un reintento ciego puede volver a chocar | No alcanza como contrato del perdedor |
| Mutex en memoria de Nest, un trabajador por cancha | Ordena los pedidos de un solo proceso | No cruza dos instancias de la API ni sobrevive a un reinicio | El despliegue no promete un solo proceso |

## Decisión

La reserva entra por la función `reservar_cancha`, en una sola transacción de PostgreSQL. Esa función toma un bloqueo pesimista de la fila de la cancha (`SELECT … FROM canchas WHERE id = p_cancha_id FOR UPDATE`), valida horario, mantenimiento y horizonte, y recién ahí inserta.

La garantía que sobrevive aunque el lock no alcanzara es el índice único parcial `reservas_cancha_sin_sobreventa` sobre `(cancha_id, inicio)` donde el estado es `pendiente` o `confirmada`. Una violación de unicidad se traduce a `TURNO_OCUPADO`. Nest no decide el cupo con un `if` previo: llama al RPC y mapea ese error.

Una reserva `pendiente` ocupa el mismo índice. A los 10 minutos (`minutos_hold_reserva`) la limpia `cancelar_reservas_pendientes_vencidas`, que la función corre sobre ese turno antes de insertar.

El criterio determinante fue que el perdedor reciba un rechazo de la base, no una segunda confirmación.

## Consecuencias

- **Positivas:** dos reservas simultáneas del mismo turno terminan en una sola fila vigente; el perdedor obtiene `TURNO_OCUPADO`; el hold evita vender el turno mientras el pago sigue abierto; el mismo esquema (restricción en la base, la API traduce el error) se reutiliza en RN-01.
- **Negativas:** quien llega segundo espera el commit del primero sobre esa cancha; la lógica del cupo está en SQL y hay que leerla junto con el servicio Nest; el hold depende de que la función de limpieza corra antes del insert (y de `pg_cron` si se quiere limpiar sin tráfico).
- **Deuda asumida:** no hay prueba de dos sesiones en paralelo dentro del CI. `supabase/tests/canchas_m4.test.sql` rechaza una segunda reserva secuencial con `TURNO_OCUPADO`; se corre a mano contra un PostgreSQL local y no se ejecuta en GitHub Actions.

## Requisitos relacionados

RN-02, RF-09, RF-10, RF-13
