import { Injectable, Logger } from '@nestjs/common';
import { LugarLiberadoEvent } from '../lugar-liberado.event';
import { Observer } from '../observer';

@Injectable()
export class LogObserver implements Observer<LugarLiberadoEvent> {
  private readonly logger = new Logger('ListaEspera');

  update(evento: LugarLiberadoEvent): Promise<void> {
    this.logger.log(
      `Lugar liberado en clase ${evento.clase.id} para perfil ${evento.perfilId} (espera ${evento.esperaId}, vence ${evento.venceEn})`,
    );
    return Promise.resolve();
  }
}
