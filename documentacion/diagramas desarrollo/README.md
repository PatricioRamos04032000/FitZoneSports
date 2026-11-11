# Diagramas — FitZone Sports

Índice de los diagramas de la entrega (§5.3 de los lineamientos). Cada ficha se agrega cuando el diagrama está cerrado.

## C4-1 — Contexto

| | |
| --- | --- |
| Sección | §5.3.1, nivel C4-1 |
| Fuente | [fuentes/c4-1-contexto.mmd](../../docs/diagramas/fuentes/c4-1-contexto.mmd) |
| SVG | [img/c4-1-contexto.svg](../../docs/diagramas/img/c4-1-contexto.svg) |
| Referencia | [ADR-010](../../docs/adr/ADR-010-tokenizacion-medios-de-pago.md) |
| Autor | Patricio Ramos |
| Fecha | 2026-11-10 |
| Versión | 1.0 |

Muestra a los cuatro actores, el sistema FitZone Sports y la pasarela de pago como único sistema externo. La pasarela de esta entrega no es un proveedor real: el adaptador `PasarelaSimulada` corre dentro de la API y solo se guarda el token.

Para regenerar el SVG:

```text
npx @mermaid-js/mermaid-cli -i docs/diagramas/fuentes/c4-1-contexto.mmd -o docs/diagramas/img/c4-1-contexto.svg -c "documentacion/diagramas desarrollo/mermaid.config.json" -p "documentacion/diagramas desarrollo/puppeteer.json"
```

## C4-2 — Contenedores

| | |
| --- | --- |
| Sección | §5.3.1, nivel C4-2 |
| Fuente | [fuentes/c4-2-contenedores.mmd](../../docs/diagramas/fuentes/c4-2-contenedores.mmd) |
| SVG | [img/c4-2-contenedores.svg](../../docs/diagramas/img/c4-2-contenedores.svg) |
| Referencia | [ADR-009](../../docs/adr/ADR-009-despliegue-contenedores-reversion.md) |
| Autor | Patricio Ramos |
| Fecha | 2026-11-10 |
| Versión | 1.0 |

Aplicación web (portal y consola), terminal de sede, API Nest y base en Supabase, dentro del límite del sistema. A la izquierda, cada persona apunta al contenedor que usa. A la derecha, la API le pide el cobro a la pasarela. La leyenda está debajo. Sin red, la cola queda en el navegador.

## C4-3 — Componentes de Canchas

| | |
| --- | --- |
| Sección | §5.3.1, nivel C4-3 |
| Fuente | [fuentes/c4-3-canchas.mmd](../../docs/diagramas/fuentes/c4-3-canchas.mmd) |
| SVG | [img/c4-3-canchas.svg](../../docs/diagramas/img/c4-3-canchas.svg) |
| Referencia | [ADR-004](../../docs/adr/ADR-004-concurrencia-reservas-canchas.md) |
| Autor | Patricio Ramos |
| Fecha | 2026-11-10 |
| Versión | 1.0 |

M4: PreciosService a la izquierda y ReservasCanchaService a su derecha. El socio y el cliente externo reservan sobre ese servicio. El repositorio y el bloqueo del turno (RPC `reservar_cancha` e índice `reservas_cancha_sin_sobreventa`) quedan debajo. El cobro sale hacia `PasarelaPago`, a la derecha de FitZone. La leyenda está debajo.

## C4-3 — Componentes de Acceso

| | |
| --- | --- |
| Sección | §5.3.1, nivel C4-3 |
| Fuente | [fuentes/c4-3-acceso.mmd](../../docs/diagramas/fuentes/c4-3-acceso.mmd) |
| SVG | [img/c4-3-acceso.svg](../../docs/diagramas/img/c4-3-acceso.svg) |
| Referencia | [ADR-003](../../docs/adr/ADR-003-estrategia-offline-acceso.md), [ADR-007](../../docs/adr/ADR-007-acceso-totp-cola-offline.md) |
| Autor | Patricio Ramos |
| Fecha | 2026-11-10 |
| Versión | 1.0 |

M2 y el camino del QR. El socio consulta el QR en el portal y la recepcionista registra el ingreso en el terminal. Sin red, la cola queda en `localStorage` y sincroniza al volver. `TotpService` solo corre en la API. RN-01 lo impone `registrar_check_in`. La leyenda está debajo.

C4-2 se regenera con `mermaid-c42.config.json`. Los dos C4-3, con `mermaid-bloques.config.json`:

```text
npx @mermaid-js/mermaid-cli -w 2800 -H 3200 -i docs/diagramas/fuentes/c4-2-contenedores.mmd -o docs/diagramas/img/c4-2-contenedores.svg -c "documentacion/diagramas desarrollo/mermaid-c42.config.json" -p "documentacion/diagramas desarrollo/puppeteer-c42.json"
npx @mermaid-js/mermaid-cli -w 2800 -H 3200 -i docs/diagramas/fuentes/c4-3-canchas.mmd -o docs/diagramas/img/c4-3-canchas.svg -c "documentacion/diagramas desarrollo/mermaid-bloques.config.json" -p "documentacion/diagramas desarrollo/puppeteer.json"
npx @mermaid-js/mermaid-cli -w 2800 -H 3200 -i docs/diagramas/fuentes/c4-3-acceso.mmd -o docs/diagramas/img/c4-3-acceso.svg -c "documentacion/diagramas desarrollo/mermaid-bloques.config.json" -p "documentacion/diagramas desarrollo/puppeteer.json"
```

## UML — Clases del dominio

| | |
| --- | --- |
| Sección | §5.3.1, diagrama de clases |
| Fuente | [fuentes/uml-clases-dominio.drawio](../../docs/diagramas/fuentes/uml-clases-dominio.drawio) |
| SVG | [img/uml-clases-dominio.svg](../../docs/diagramas/img/uml-clases-dominio.svg) |
| Autor | Patricio Ramos |
| Fecha | 2026-11-10 |
| Versión | 1.0 |

Un solo diagrama, en diagrams.net, con tres zonas: Strategy de precios, Repository sobre Supabase y Observer de la lista de espera. El State de la reserva no entra en esta hoja.

Para regenerar el SVG, con la CLI de diagrams.net o con la extensión Draw.io del editor:

```text
draw.io -x -f svg -b 16 -o docs/diagramas/img/uml-clases-dominio.svg docs/diagramas/fuentes/uml-clases-dominio.drawio
```

## UML — Secuencia, reserva con pago

| | |
| --- | --- |
| Sección | §5.3.2, secuencia |
| Fuente | [fuentes/sec-reserva-pago.mmd](../../docs/diagramas/fuentes/sec-reserva-pago.mmd) |
| SVG | [img/sec-reserva-pago.svg](../../docs/diagramas/img/sec-reserva-pago.svg) |
| Autor | Patricio Ramos |
| Fecha | 2026-11-10 |
| Versión | 1.0 |

Desde la grilla hasta la reserva confirmada. El precio lo calcula `PricingStrategy`. La pasarela es simulada: guarda el pago pendiente, no la tarjeta, y el cierre es el pago aprobado con token.

## UML — Secuencia, reserva concurrente

| | |
| --- | --- |
| Sección | §5.3.2, secuencia |
| Fuente | [fuentes/sec-reserva-concurrente.mmd](../../docs/diagramas/fuentes/sec-reserva-concurrente.mmd) |
| SVG | [img/sec-reserva-concurrente.svg](../../docs/diagramas/img/sec-reserva-concurrente.svg) |
| Referencia | [ADR-004](../../docs/adr/ADR-004-concurrencia-reservas-canchas.md) |
| Autor | Patricio Ramos |
| Fecha | 2026-11-10 |
| Versión | 1.0 |

Dos socios piden el mismo turno. El índice `reservas_cancha_sin_sobreventa` deja una reserva pendiente y la otra recibe 409, `TURNO_OCUPADO`.

## UML — Secuencia, acceso offline

| | |
| --- | --- |
| Sección | §5.3.2, secuencia |
| Fuente | [fuentes/sec-acceso-offline.mmd](../../docs/diagramas/fuentes/sec-acceso-offline.mmd) |
| SVG | [img/sec-acceso-offline.svg](../../docs/diagramas/img/sec-acceso-offline.svg) |
| Referencia | [ADR-003](../../docs/adr/ADR-003-estrategia-offline-acceso.md), [ADR-007](../../docs/adr/ADR-007-acceso-totp-cola-offline.md) |
| Autor | Patricio Ramos |
| Fecha | 2026-11-10 |
| Versión | 1.0 |

El portal pide el código a la API. Sin red, el terminal lo encola en `localStorage`. Al reconectar, `POST /acceso/check-ins/sync` verifica el código y registra el ingreso con RN-01.

Para regenerar las tres secuencias:

```text
npx @mermaid-js/mermaid-cli -w 2000 -H 1400 -i docs/diagramas/fuentes/sec-reserva-pago.mmd -o docs/diagramas/img/sec-reserva-pago.svg
npx @mermaid-js/mermaid-cli -w 1600 -H 1000 -i docs/diagramas/fuentes/sec-reserva-concurrente.mmd -o docs/diagramas/img/sec-reserva-concurrente.svg
npx @mermaid-js/mermaid-cli -w 2000 -H 1400 -i docs/diagramas/fuentes/sec-acceso-offline.mmd -o docs/diagramas/img/sec-acceso-offline.svg
```

## UML — Estados, membresía

| | |
| --- | --- |
| Sección | §5.3.2, estados |
| Fuente | [fuentes/est-membresia.mmd](../../docs/diagramas/fuentes/est-membresia.mmd) |
| SVG | [img/est-membresia.svg](../../docs/diagramas/img/est-membresia.svg) |
| Autor | Patricio Ramos |
| Fecha | 2026-11-11 |
| Versión | 1.0 |

RF-02. Alta o renovación crea una membresía activa. Pasa a vencida cuando se cumple `vigente_hasta` o cuando una renovación cierra la anterior. `suspendido` está en el enum y esta entrega no lo asigna.

## UML — Estados, reserva de cancha

| | |
| --- | --- |
| Sección | §5.3.2, estados |
| Fuente | [fuentes/est-reserva.mmd](../../docs/diagramas/fuentes/est-reserva.mmd) |
| SVG | [img/est-reserva.svg](../../docs/diagramas/img/est-reserva.svg) |
| Autor | Patricio Ramos |
| Fecha | 2026-11-11 |
| Versión | 1.0 |

RF-10. De pendiente pasa a confirmada con el pago aprobado, o a cancelada si el socio cancela, el pago se rechaza o vence el hold. Una confirmada se cancela sin plazo ni penalidad. No hay estado cumplida: la cancelación tardía es de la inscripción a clase.

Para regenerar los dos diagramas de estado:

```text
npx @mermaid-js/mermaid-cli -w 900 -H 700 -i docs/diagramas/fuentes/est-membresia.mmd -o docs/diagramas/img/est-membresia.svg
npx @mermaid-js/mermaid-cli -w 900 -H 800 -i docs/diagramas/fuentes/est-reserva.mmd -o docs/diagramas/img/est-reserva.svg
```

## UML — Actividad, lista de espera

| | |
| --- | --- |
| Sección | §5.3.2, actividad |
| Fuente | [fuentes/act-lista-espera.mmd](../../docs/diagramas/fuentes/act-lista-espera.mmd) |
| SVG | [img/act-lista-espera.svg](../../docs/diagramas/img/act-lista-espera.svg) |
| Autor | Patricio Ramos |
| Fecha | 2026-11-11 |
| Versión | 1.0 |

RF-08. Si no hay cupo, o ya hay gente en la cola, el socio queda en esperando. Al liberarse un lugar, `procesar_lista_espera` marca vencidos y pasa a notificado al más antiguo, con 30 minutos o hasta el inicio de la clase. `ListaEsperaPublisher` emite `lista-espera.lugar-liberado` y los tres observers corren en paralelo. Si no confirma a tiempo, el cupo pasa al siguiente. El email no se envía: si lo activó, queda en el log.

Para regenerar la actividad:

```text
npx @mermaid-js/mermaid-cli -w 1400 -H 1800 -i docs/diagramas/fuentes/act-lista-espera.mmd -o docs/diagramas/img/act-lista-espera.svg
```

## DER físico

| | |
| --- | --- |
| Sección | §5.3.3, entidad-relación |
| Fuente | [fuentes/er-fisico.drawio](../../docs/diagramas/fuentes/er-fisico.drawio) |
| SVG | [img/er-fisico.svg](../../docs/diagramas/img/er-fisico.svg) |
| Autor | Patricio Ramos |
| Fecha | 2026-11-11 |
| Versión | 1.0 |

Esquema `public` de PostgreSQL, con claves e índices. `auth.users` queda aparte: el email vive ahí y `perfiles.id` es la misma clave. RN-01 es la clave primaria de `presencias`. RN-02 es el índice único parcial `reservas_cancha_sin_sobreventa` sobre `(cancha_id, inicio)` mientras la reserva está pendiente o confirmada.

Para regenerar el SVG, con la aplicación de escritorio de diagrams.net:

```text
draw.io -x -f svg -b 16 -o docs/diagramas/img/er-fisico.svg docs/diagramas/fuentes/er-fisico.drawio
```

## Despliegue

| | |
| --- | --- |
| Sección | §5.3.3, despliegue |
| Fuente | [fuentes/dep-despliegue.drawio](../../docs/diagramas/fuentes/dep-despliegue.drawio) |
| SVG | [img/dep-despliegue.svg](../../docs/diagramas/img/dep-despliegue.svg) |
| Referencia | [ADR-009](../../docs/adr/ADR-009-despliegue-contenedores-reversion.md) |
| Autor | Patricio Ramos |
| Fecha | 2026-11-11 |
| Versión | 1.0 |

La demo corre la web en Vercel, la API en Render y los datos en Supabase. La pasarela simulada vive en el proceso de la API. GitHub Actions no despliega. El Compose de la cátedra, cuando esté el archivo de C-07, levanta esos mismos dos artefactos y sigue usando Supabase.

Para regenerar el SVG, con la aplicación de escritorio de diagrams.net:

```text
draw.io -x -f svg -c -b 16 -o docs/diagramas/img/dep-despliegue.svg docs/diagramas/fuentes/dep-despliegue.drawio
```

## Pipeline

| | |
| --- | --- |
| Sección | §5.3.3, pipeline |
| Fuente | [fuentes/pipe-ci.drawio](../../docs/diagramas/fuentes/pipe-ci.drawio) |
| SVG | [img/pipe-ci.svg](../../docs/diagramas/img/pipe-ci.svg) |
| Referencia | [ADR-008](../../docs/adr/ADR-008-pruebas-cobertura.md) |
| Autor | Patricio Ramos |
| Fecha | 2026-11-11 |
| Versión | 1.0 |

Un pull request hacia `desarrollo` dispara el job `ci-backend` en GitHub Actions. En el backend corre checkout, Node.js 24, `npm ci`, lint, tests unitarios y build. No mide cobertura, no corre los tests HTTP ni el SQL, no mira el frontend y no despliega.

Para regenerar el SVG, con la aplicación de escritorio de diagrams.net:

```text
draw.io -x -f svg -c -b 16 -o docs/diagramas/img/pipe-ci.svg docs/diagramas/fuentes/pipe-ci.drawio
```
