import { Injectable } from '@nestjs/common';
import { SupabaseRepository } from '../supabase/supabase.repository';
import type { ActualizarPerfil, Perfil } from './perfil.model';

const COLUMNAS =
  'id, rol, dni, nombre, apellido, telefono, foto_url, sede_home_id, notificar_por_email, created_at';

@Injectable()
export class PerfilesRepository extends SupabaseRepository<Perfil> {
  protected readonly table = 'perfiles';

  /** Devuelve null si el usuario no tiene fila en perfiles. */
  async findById(id: string): Promise<Perfil | null> {
    return this.unwrap(
      await this.from().select(COLUMNAS).eq('id', id).maybeSingle(),
      'findById',
    );
  }

  async actualizar(id: string, cambios: ActualizarPerfil): Promise<Perfil | null> {
    return this.unwrap(
      await this.from().update(cambios).eq('id', id).select(COLUMNAS).maybeSingle(),
      'actualizar',
    );
  }
}
