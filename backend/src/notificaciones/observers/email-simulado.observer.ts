import { Injectable, Logger } from '@nestjs/common';
import { LugarLiberadoEvent, mensajeLugarLiberado } from '../lugar-liberado.event';
import { Observer } from '../observer';
import { PreferenciasRepository } from '../preferencias.repository';

/** Solo si el socio lo activó en su perfil. El envío real queda fuera de alcance. */
@Injectable()
export class EmailSimuladoObserver implements Observer<LugarLiberadoEvent> {
  private readonly logger = new Logger('EmailSimulado');

  constructor(private readonly preferencias: PreferenciasRepository) {}

  async update(evento: LugarLiberadoEvent): Promise<void> {
    const prefs = await this.preferencias.findByPerfil(evento.perfilId);
    if (!prefs?.notificar_por_email) return;

    const email = await this.preferencias.findEmail(evento.perfilId);
    if (!email) {
      this.logger.warn(`El perfil ${evento.perfilId} no tiene email`);
      return;
    }

    const { titulo, mensaje } = mensajeLugarLiberado(evento);
    this.logger.log(`Para: ${email} | Asunto: ${titulo} | ${mensaje}`);
  }
}
