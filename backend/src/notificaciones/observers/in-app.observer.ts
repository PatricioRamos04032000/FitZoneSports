import { Injectable } from '@nestjs/common';
import { LugarLiberadoEvent, mensajeLugarLiberado } from '../lugar-liberado.event';
import { NotificacionesRepository } from '../notificaciones.repository';
import { Observer } from '../observer';

/** Guarda la notificación para que el socio la vea en la web. */
@Injectable()
export class InAppObserver implements Observer<LugarLiberadoEvent> {
  constructor(private readonly notificaciones: NotificacionesRepository) {}

  async update(evento: LugarLiberadoEvent): Promise<void> {
    await this.notificaciones.crear({
      perfil_id: evento.perfilId,
      tipo: 'lugar_liberado',
      ...mensajeLugarLiberado(evento),
      datos: {
        espera_id: evento.esperaId,
        clase_id: evento.clase.id,
        vence_en: evento.venceEn,
      },
    });
  }
}
