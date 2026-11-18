import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LUGAR_LIBERADO, LugarLiberadoEvent } from './lugar-liberado.event';

/** Fila de `lista_espera` que devuelven `cancelar_inscripcion` y `procesar_lista_espera`. */
export interface EsperaNotificada {
  id: string;
  perfil_id: string;
  vence_en: string;
}

export interface ClaseNotificable {
  id: string;
  tipo: string;
  inicio: string;
}

/**
 * Clases lo usa después de cancelar una inscripción o procesar la lista.
 * No conoce a los observadores: se suscriben solos con `@OnEvent(LUGAR_LIBERADO)`
 * y corren después de que este método vuelve, así que no demoran la respuesta.
 */
@Injectable()
export class ListaEsperaPublisher {
  constructor(private readonly eventos: EventEmitter2) {}

  notificarLugaresLiberados(
    clase: ClaseNotificable,
    esperas: EsperaNotificada[],
  ): void {
    for (const espera of esperas) {
      const evento: LugarLiberadoEvent = {
        esperaId: espera.id,
        perfilId: espera.perfil_id,
        venceEn: espera.vence_en,
        clase: { id: clase.id, tipo: clase.tipo, inicio: clase.inicio },
      };
      this.eventos.emit(LUGAR_LIBERADO, evento);
    }
  }
}
