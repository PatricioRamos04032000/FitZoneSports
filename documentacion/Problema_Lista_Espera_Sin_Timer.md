# Problema: lista de espera sin proceso automático

**Fecha:** 2026-10-15 · **Autor:** Patricio Ramos (P1)  
**Estado:** pendiente — a resolver después (no bloquea el resto de la semana)  
**Relacionado:** RF-08, D7 · [Diseño BD S3-T06](./Diseno_BD_S3-T06_Membresias_Clases.md) · [Correcciones Clases](./Correcciones_S3-T03_S3-T04_Membresias_Clases.md) (punto 12)

---

## Qué pasa hoy

La base (`procesar_lista_espera`) decide a quién notificar, reserva el cupo con un plazo (`vence_en`) e invalida al que no confirmó. Nest solo configura la duración del plazo y debería publicar el aviso (Observer).

**No hay un proceso ni un job en segundo plano.** El vencimiento y el paso al siguiente socio solo ocurren cuando alguien vuelve a llamar a `procesar_lista_espera` (por ejemplo al cancelar otra inscripción, o si Nest la llama al listar/reservar esa clase).

## Por qué es grave en la realidad

| Situación | Efecto |
|-----------|--------|
| El plazo del socio A vence y nadie más toca esa clase | El cupo sigue “reservado” para A aunque ya no pueda confirmar. El socio B no es notificado. |
| Pocas cancelaciones o poco tráfico en esa clase | La lista se estanca: gente notificada vencida ocupa lugares y los siguientes no avanzan. |
| El aviso depende de Nest y hoy Clases no llama al Publisher | Aunque se procese la lista, el socio puede no enterarse (otro bug, ver correcciones). |

En demo o pruebas manuales se puede “desbloquear” llamando de nuevo a la función. En producción, con clases con poca actividad, **el flujo de lista de espera no se sostiene solo**.

## Dirección de solución (cuando toque)

Elegir una (o combinar):

1. **Job programado** (cron / worker): cada N minutos llama `procesar_lista_espera` para las clases con gente `notificado` o `esperando`, y publica los avisos con el Observer.
2. **Cola con delay** (p. ej. al notificar, encolar “revisar esta espera a las `vence_en`”): al vencer, procesar esa clase y avisar al siguiente.
3. **Mínimo viable académico:** llamar `procesar_lista_espera` en cada `GET /clases` y antes de inscribir/confirmar (ya sugerido en el diseño S3-T06). Mitiga si hay tráfico; **no alcanza** si nadie consulta esa clase.

La opción 3 es barata y conviene hacerla ya al corregir Clases. Las 1 o 2 son las que lo dejan usable de verdad.

## Fuera de alcance por ahora

No implementar el timer en esta iteración. Queda registrado para no olvidarlo al cerrar M3 / al preparar Demo Day.
