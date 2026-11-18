# ADR-010 — Medios de pago: tokenización y no persistencia de la tarjeta

- **Estado:** Aceptado
- **Fecha:** 2026-11-09
- **Autor:** Patricio Ramos (P1)
- **Sprint:** 8
- **Lineamientos:** §5.2.1 ADR-010

## Contexto

Reservar una cancha termina en un pago (RF-13) y en un comprobante (RF-14). El requisito no funcional pide no guardar datos de tarjeta: el sistema se queda con un token de la pasarela (RNF-02). Procesar y almacenar el PAN y el CVV obliga a PCI DSS (cifrado, red segmentada, gestión de claves, auditoría). El equipo es de cuatro personas y el alcance de la materia es un checkout simulado, no una certificación de pagos.

En el código ya existía un puerto `PasarelaPago` y una pasarela simulada. El formulario de prueba vive en el propio backend (`checkout-simulado.controller.ts`). Mercado Pago real estaba fuera del corte de la entrega. Había que dejar por escrito qué se persiste y qué no, porque el simulacro sí recibe un número de tarjeta de prueba en el POST.

La tabla `pagos` está en `supabase/migrations/20261028210000_pagos_m5.sql`.

## Alternativas consideradas

| Alternativa | A favor | En contra | Por qué se descartó |
|---|---|---|---|
| Guardar PAN y CVV en `pagos` | El comprobante podría reimprimir «la tarjeta usada» | PCI DSS, y un volcado de la base filtra tarjetas | Inaceptable para RNF-02, aunque el número sea de prueba |
| Mercado Pago (o equivalente) ya en esta entrega, con checkout alojado en el proveedor | El PAN no llega a Nest; el token lo emite el proveedor; es la tokenización de verdad | Cuenta, credenciales, webhooks y un circuito que el corte de la entrega dejó afuera | El requisito de la demo es el cobro simulado, no la pasarela real |
| Solo transferencia o pago en mostrador, sin medio electrónico | No hay datos de tarjeta en ningún lado | No hay RF-13 demostrable ni token que mostrar en la defensa | No cubre el pago de la reserva |

## Decisión

El cobro pasa por el puerto `PasarelaPago`, inyectado en Nest. La implementación de esta entrega es `PasarelaSimulada`.

El formulario de checkout compara el número contra dos tarjetas de prueba fijas (`4111111111111111` aprueba, `4000000000000002` rechaza). Nombre, vencimiento y CVV solo se miran para ver que el formulario vino completo: no se escriben en la base ni en el log. El número se usa en memoria para elegir aprobado o rechazado y se descarta.

Si el cobro sale aprobado, en `pagos.token_pasarela` se guarda un token opaco (`sim-` más un UUID). Si sale rechazado, esa columna queda en null. No hay columna de PAN ni de CVV.

El criterio determinante fue cumplir RNF-02 con el simulacro que la demo ya usa: la base solo conoce el token, el monto, el estado y la reserva.

## Consecuencias

- **Positivas:** un volcado de `pagos` no contiene tarjetas; el dominio depende de un puerto y se puede cambiar la pasarela sin tocar la reserva; el rechazo de prueba no deja un token falso.
- **Negativas:** el simulacro no es tokenización PCI. El POST del checkout sí trae el PAN de prueba hasta Nest, aunque después se descarta. Quien mire el log de acceso del proceso podría ver ese body si en el futuro alguien lo registra.
- **Deuda asumida:** al conectar una pasarela real, el formulario tiene que ser el del proveedor (campos alojados o SDK) para que el PAN no entre a Nest, y `token_pasarela` tiene que ser el token que devuelva esa pasarela. Hasta entonces el prefijo `sim-` marca que el token no sirve para un cobro externo. El Circuit Breaker de la pasarela queda fuera de esta entrega.

## Requisitos relacionados

RNF-02, RF-13, RF-14
