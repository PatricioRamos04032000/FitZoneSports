import { Injectable } from '@nestjs/common';
import { SupabaseRepository } from '../supabase/supabase.repository';
import { Clase, ClaseConCupo, InscripcionClase } from './clase.model';

@Injectable()
export class ClasesRepository extends SupabaseRepository<Clase> {
  protected readonly table = 'clases';

  // Usa la vista clases_con_cupo 
  async findConCupoPorSede(sedeId: string): Promise<ClaseConCupo[]> {
    return this.unwrap<ClaseConCupo[]>(
      await this.client
        .from('clases_con_cupo')
        .select('*')
        .eq('sede_id', sedeId)
        .order('inicio'),
      'findConCupoPorSede'
    );
  }

  // Llama a la función SQL de reserva directa (sin sobreventa)
  async inscribir(claseId: string, perfilId: string): Promise<InscripcionClase> {
    return this.rpc<InscripcionClase>('inscribir_en_clase', {
      p_clase_id: claseId,
      p_perfil_id: perfilId,
    });
  }

  // Llama a la función SQL de cancelación
  async cancelar(inscripcionId: string, tardia: boolean, plazoIntervalo: string) {
    return this.rpc('cancelar_inscripcion', {
      p_inscripcion_id: inscripcionId,
      p_cancelacion_tardia: tardia,
      p_plazo: plazoIntervalo,
    });
  }
}