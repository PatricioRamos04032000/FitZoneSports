import { Injectable } from '@nestjs/common';
import { SupabaseRepository } from '../supabase/supabase.repository';
import { RolUsuario } from './rol-usuario';

type FilaRol = { rol: RolUsuario };

@Injectable()
export class PerfilesRolRepository extends SupabaseRepository<FilaRol> {
  protected readonly table = 'perfiles';

  /** Devuelve null si el usuario no tiene perfil. */
  async findRol(perfilId: string): Promise<RolUsuario | null> {
    const fila = this.unwrap<FilaRol | null>(
      await this.from().select('rol').eq('id', perfilId).maybeSingle(),
      'findRol',
    );
    return fila?.rol ?? null;
  }
}
