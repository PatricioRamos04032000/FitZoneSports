import { Injectable, NotFoundException } from '@nestjs/common';
import { Notificacion, PreferenciasNotificacion } from './notificacion.model';
import { NotificacionesRepository } from './notificaciones.repository';
import { PreferenciasRepository } from './preferencias.repository';

@Injectable()
export class NotificacionesService {
  constructor(
    private readonly notificaciones: NotificacionesRepository,
    private readonly preferencias: PreferenciasRepository,
  ) {}

  listar(perfilId: string): Promise<Notificacion[]> {
    return this.notificaciones.findByPerfil(perfilId);
  }

  async marcarLeida(id: string, perfilId: string): Promise<Notificacion> {
    const notificacion = await this.notificaciones.marcarLeida(id, perfilId);
    if (!notificacion) throw new NotFoundException('La notificación no existe');
    return notificacion;
  }

  async getPreferencias(perfilId: string): Promise<PreferenciasNotificacion> {
    return this.conPerfil(await this.preferencias.findByPerfil(perfilId));
  }

  async actualizarPreferencias(
    perfilId: string,
    preferencias: PreferenciasNotificacion,
  ): Promise<PreferenciasNotificacion> {
    return this.conPerfil(await this.preferencias.actualizar(perfilId, preferencias));
  }

  private conPerfil(
    preferencias: PreferenciasNotificacion | null,
  ): PreferenciasNotificacion {
    if (!preferencias) throw new NotFoundException('El usuario no tiene perfil');
    return preferencias;
  }
}
