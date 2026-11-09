import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  LUGAR_LIBERADO,
  type LugarLiberadoEvent,
  mensajeLugarLiberado,
} from '../lugar-liberado.event';
import { NotificacionesRepository } from '../notificaciones.repository';

/** Guarda la notificación para que el socio la vea en la web. */
@Injectable()
export class InAppObserver {
  constructor(private readonly notificaciones: NotificacionesRepository) {}

  @OnEvent(LUGAR_LIBERADO, { async: true })
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
