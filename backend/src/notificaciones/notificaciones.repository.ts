import { Injectable } from '@nestjs/common';
import { SupabaseRepository } from '../supabase/supabase.repository';
import { Notificacion, NuevaNotificacion } from './notificacion.model';

@Injectable()
export class NotificacionesRepository extends SupabaseRepository<Notificacion> {
  protected readonly table = 'notificaciones';

  async crear(nueva: NuevaNotificacion): Promise<Notificacion> {
    return this.unwrap(
      await this.from().insert(nueva).select().single(),
      'crear',
    );
  }

  async findByPerfil(perfilId: string): Promise<Notificacion[]> {
    return this.unwrap(
      await this.from()
        .select('*')
        .eq('perfil_id', perfilId)
        .order('created_at', { ascending: false }),
      'findByPerfil',
    );
  }

  /** Devuelve null si no existe o no es del perfil. */
  async marcarLeida(id: string, perfilId: string): Promise<Notificacion | null> {
    return this.unwrap(
      await this.from()
        .update({ leida_en: new Date().toISOString() })
        .eq('id', id)
        .eq('perfil_id', perfilId)
        .select()
        .maybeSingle(),
      'marcarLeida',
    );
  }
}
