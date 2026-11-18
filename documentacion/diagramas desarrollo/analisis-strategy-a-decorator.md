# Análisis de cambios en los diagramas

Fecha: 2026-11-11. Autor: Patricio Ramos.

Tres hipótesis. Ninguna cambia el código ni los SVG de hoy: dicen qué diagramas habría que tocar si el diseño se moviera.

1. El precio pasa de Strategy a Decorator.
2. El check-in se valida en la sede, sin internet.
3. El despliegue y el pipeline quedan cerrados como los piden ADR-008 y ADR-009.

---

## 1. De Strategy a Decorator

Qué pasaría con los diagramas de `docs/diagramas/` si el precio de la cancha deja de ser Strategy y pasa a ser Decorator.

Hoy `PreciosService` guarda una lista `PricingStrategy[]`. `calcular` se queda con las que `aplica(ctx)` y acumula `calcular` sobre el precio base. Las tres reglas son `StandardPricing`, `PeakHourPricing` y `MemberDiscountPricing`. Decorator no es esa lista: cada regla envuelve a la anterior y, al calcular, delega en el componente de adentro.

## Hay que redibujar

| Diagrama | Fuente | Qué cambia |
| --- | --- | --- |
| Clases del dominio | [fuentes/uml-clases-dominio.drawio](../../docs/diagramas/fuentes/uml-clases-dominio.drawio) | La zona Strategy. Es el único lugar donde se ve la estructura del patrón. |
| Secuencia, reserva y pago | [fuentes/sec-reserva-pago.mmd](../../docs/diagramas/fuentes/sec-reserva-pago.mmd) | El tramo en el que `PreciosService` llama a `PricingStrategy` con `aplica` y `calcular`. |

En el de clases hay que reemplazar la interfaz `PricingStrategy`, las tres realizaciones y la agregación `estrategias: PricingStrategy[]`. En Decorator queda un componente de precio, un decorador que envuelve a otro componente, y los decoradores concretos (pico y descuento de socio). `StandardPricing` deja de ser una estrategia intercambiable: pasa a ser el componente concreto de base, o desaparece si la base es solo el precio de la cancha. `PreciosService` deja de filtrar una lista y arma una cadena. `ReservasCanchaService` puede seguir dependiendo de `PreciosService` si `calcular(ctx)` se mantiene.

En la secuencia, el mensaje `aplica y calcular` no describe un Decorator. Hay que mostrar la delegación hacia adentro de la cadena. El resto de esa secuencia (grilla, hold, pasarela simulada, confirmación) no habla del patrón y se queda.

Después de tocar la fuente hay que volver a exportar el SVG: [img/uml-clases-dominio.svg](../../docs/diagramas/img/uml-clases-dominio.svg) y [img/sec-reserva-pago.svg](../../docs/diagramas/img/sec-reserva-pago.svg).

## Hay que corregir el rótulo, no el dibujo

| Diagrama | Fuente | Qué cambia |
| --- | --- | --- |
| C4-3 Canchas | [fuentes/c4-3-canchas.mmd](../../docs/diagramas/fuentes/c4-3-canchas.mmd) | `PreciosService` está marcado como `Strategy`, con el texto de estándar, socio y pico. |
| Texto de arquitectura | [C4_Arquitectura_FitZone.md](./C4_Arquitectura_FitZone.md) | Nombra Strategy en el precio dinámico, en M4 y en la tabla de patrones. |
| Fichas | [README.md](./README.md) | La ficha de clases dice «Strategy de precios». La de la secuencia de pago dice que el precio lo calcula `PricingStrategy`. |

En el C4-3 las cajas y la relación «Calcula el precio» siguen: las reglas no están dibujadas como componentes sueltos. Cambia el subtítulo del componente y la descripción. Lo mismo en el texto que lo acompaña.

## No se tocan

Estos diagramas no muestran cómo se arma el precio.

- C4-1 Contexto y C4-2 Contenedores.
- C4-3 Acceso.
- Secuencia de reserva concurrente. La nota dice que los dos pedidos pasan por `PreciosService.calcular`. Ese llamado puede quedar aunque por dentro sea una cadena de decoradores.
- Secuencia de acceso offline.
- Estados de membresía y de reserva.
- Actividad de la lista de espera.
- DER físico.
- Despliegue.
- Pipeline.

El C4-4 de código, el de `PricingStrategy`, no se hizo. Si más adelante se dibuja, tiene que ser la cadena de Decorator y no la interfaz Strategy.

`Propuesta_Inventario_Diagramas.md` y `Propuesta_ER_FitZone.md` nombran Strategy. Son propuestas anteriores, no los diagramas de la entrega.

---

## 2. Check-in que se valida sin internet

Hoy la recepción, sin red, no acepta ni rechaza el ingreso. El terminal guarda el ítem en `localStorage` (`fitzone.acceso.cola`) y, al reconectar, `POST /acceso/check-ins/sync` verifica el TOTP, la membresía y RN-01 en la API. Eso es lo que dibujan la secuencia de acceso, el C4-3 de Acceso, el C4-2 y la nota del despliegue. ADR-003 dejó afuera el otro camino: un nodo en la sede, con un paquete de seeds TOTP, que valida el QR sin llamar a la API.

Ese camino no cierra RN-01 entre sedes mientras siguen desconectadas. La sede no ve la presencia del resto de la cadena. Puede aceptar el QR contra su copia y, al reconectar, chocar con `YA_DENTRO` o `YA_EN_OTRA_SEDE`. El diagrama tiene que mostrar las dos cosas: la decisión local y el conflicto diferido. No un ingreso que ya quedó firme en toda la cadena.

### Hay que redibujar

| Diagrama | Fuente | Qué cambia |
| --- | --- | --- |
| Secuencia, acceso offline | [fuentes/sec-acceso-offline.mmd](../../docs/diagramas/fuentes/sec-acceso-offline.mmd) | Sin red el terminal deja de limitarse a encolar. Verifica el código y la membresía en la sede y registra el ingreso en local. El sync pasa a ser la conciliación, no la primera validación. |
| C4-3 Acceso | [fuentes/c4-3-acceso.mmd](../../docs/diagramas/fuentes/c4-3-acceso.mmd) | La cola deja de ser el único comportamiento sin red. Hace falta la copia local (seeds y membresías) y una relación de validación que no sale hacia la API. El sync sigue, para RN-01. |
| C4-2 Contenedores | [fuentes/c4-2-contenedores.mmd](../../docs/diagramas/fuentes/c4-2-contenedores.mmd) | El terminal hoy dice «sin red, cola en localStorage» y la relación con la API es «check-in y sync». Hay que separar el ingreso local del envío posterior. |
| Despliegue | [fuentes/dep-despliegue.drawio](../../docs/diagramas/fuentes/dep-despliegue.drawio) | Aparece un nodo en la sede, no solo el navegador contra Render. Sin red ese nodo no llama a la API. La nota que dice que solo encola deja de valer. |

El portal puede seguir pidiendo el código a la API cuando hay red. Lo que se mueve es la verificación en el momento del ingreso.

### No se tocan

- C4-1. El recepcionista sigue entrando por el terminal. No aparece un sistema externo nuevo.
- DER físico. La réplica vive en la sede, no como tablas nuevas de Supabase. `presencias` y `check_ins` siguen siendo la fuente de verdad al reconectar.
- Clases del dominio, secuencias de reserva, estados, actividad, C4-3 Canchas, pipeline.

`C4_Arquitectura_FitZone.md` §5 y las fichas del [README.md](./README.md) de acceso, contenedores y despliegue hay que reescribirlas junto con esos cuatro diagramas. Hace falta otro ADR: ADR-003 dice que este nodo quedó fuera de la entrega.

---

## 3. Despliegue y pipeline en condiciones

«En condiciones» acá es cerrar la deuda que los ADR ya aceptaron, no agregar un deploy desde GitHub Actions. ADR-009 deja la publicación en Vercel y en Render, fuera del workflow. ADR-008 fija el 60 % de sentencias y deja `test:cov` para C-10. C-07 es el `docker-compose.yml` que todavía no está.

### Pipeline

Hoy [fuentes/pipe-ci.drawio](../../docs/diagramas/fuentes/pipe-ci.drawio) es el workflow real: pull request a `desarrollo`, checkout, Node.js 24, `npm ci`, lint, Jest y `nest build`.

El paso que falta para dejarlo como ADR-008 es uno solo, después de los unitarios: `npm run test:cov`, y el job en rojo si las sentencias bajan de 60 %. Sigue sin tests HTTP, sin el SQL de canchas, sin frontend y sin un cuadro de deploy. Esos no están en el workflow ni en la deuda de C-10.

Si además se quisiera que Actions publique en Vercel y en Render, eso es otra decisión. ADR-009 la dejó afuera. En ese caso el pipeline ganaría esos dos pasos y el de despliegue tendría que mostrar la flecha que hoy no tiene.

### Despliegue

Hoy [fuentes/dep-despliegue.drawio](../../docs/diagramas/fuentes/dep-despliegue.drawio) muestra la demo: navegador, Vercel, Render y Supabase. El Compose está en una nota que dice que el archivo no existe.

Con C-07 cerrado hay que dibujar la máquina de la cátedra como nodos de verdad: contenedor de la web y contenedor de la API, los dos hablando con el mismo Supabase. PostgreSQL no entra en ese Compose. La nota que avisa que el archivo falta se va.

La reversión no es un paso del pipeline. Queda dicha en el despliegue: en Vercel y en Render se promueve el deploy anterior; en la base no hay migración `down`, se restaura el backup.

[C4_Arquitectura_FitZone.md](./C4_Arquitectura_FitZone.md) §4 ya dibuja GitHub → Vercel y GitHub → Render. El workflow no hace eso. Al cerrar el despliegue, esa viñeta tiene que decir que las plataformas publican desde el repo y que Actions no, o hay que sacar esas flechas. Si no, el §4 y el diagrama de despliegue cuentan dos procesos distintos.

El C4-2 ya dice que el Compose empaqueta solo la web y la API. Esa frase sigue siendo cierta cuando el archivo exista. No hay que redibujarlo por este cierre.
