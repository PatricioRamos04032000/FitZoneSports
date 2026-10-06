import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { LUGAR_LIBERADO, type LugarLiberadoEvent } from '../lugar-liberado.event';

@Injectable()
export class LogObserver {
  private readonly logger = new Logger('ListaEspera');

  @OnEvent(LUGAR_LIBERADO, { async: true })
  update(evento: LugarLiberadoEvent): void {
    this.logger.log(
      `Lugar liberado en clase ${evento.clase.id} para perfil ${evento.perfilId} (espera ${evento.esperaId}, vence ${evento.venceEn})`,
    );
  }
}
