import { Injectable } from '@nestjs/common';
import { RepositoryError } from '../supabase/repository.error';
import { SupabaseRepository } from '../supabase/supabase.repository';
import { PreferenciasNotificacion } from './notificacion.model';

const COLUMNAS = 'notificar_por_email';

@Injectable()
export class PreferenciasRepository extends SupabaseRepository<PreferenciasNotificacion> {
  protected readonly table = 'perfiles';

  /** Devuelve null si el usuario no tiene perfil. */
  async findByPerfil(perfilId: string): Promise<PreferenciasNotificacion | null> {
    return this.unwrap(
      await this.from().select(COLUMNAS).eq('id', perfilId).maybeSingle(),
      'findByPerfil',
    );
  }

  async actualizar(
    perfilId: string,
    preferencias: PreferenciasNotificacion,
  ): Promise<PreferenciasNotificacion | null> {
    return this.unwrap(
      await this.from()
        .update(preferencias)
        .eq('id', perfilId)
        .select(COLUMNAS)
        .maybeSingle(),
      'actualizar',
    );
  }

  /** El email vive en Supabase Auth, no en `perfiles`. */
  async findEmail(perfilId: string): Promise<string | undefined> {
    const { data, error } = await this.client.auth.admin.getUserById(perfilId);
    if (error) {
      this.logger.error(`auth.findEmail: ${error.code ?? 'sin código'} ${error.message}`);
      throw new RepositoryError(error.message, error.code);
    }
    return data.user.email;
  }
}
