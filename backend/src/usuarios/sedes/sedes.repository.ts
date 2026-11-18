import { Injectable } from '@nestjs/common';
import { SupabaseRepository } from '../../supabase/supabase.repository';
import { Sede } from './sede.model';

export interface NuevaSede {
  nombre: string;
  direccion: string | null;
  aforo_max: number;
  activa: boolean;
}

@Injectable()
export class SedesRepository extends SupabaseRepository<Sede> {
  protected readonly table = 'sedes';

  /**
   * Inserta solo en `sedes`. El trigger `sedes_after_insert_configuracion_pico`
   * crea la fila de horario pico en la misma operación de Postgres.
   */
  async crear(datos: NuevaSede): Promise<Sede> {
    return this.unwrap<Sede>(
      await this.from()
        .insert({
          nombre: datos.nombre,
          direccion: datos.direccion,
          aforo_max: datos.aforo_max,
          activa: datos.activa,
        })
        .select('*')
        .single(),
      'crear',
    );
  }

  async actualizar(
    id: string,
    cambios: Partial<NuevaSede>,
  ): Promise<Sede | null> {
    return this.unwrap<Sede | null>(
      await this.from().update(cambios).eq('id', id).select('*').maybeSingle(),
      'actualizar',
    );
  }
}
