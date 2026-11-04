import { Injectable } from '@nestjs/common';
import { EsperaNotificada } from '../notificaciones/lista-espera.publisher';
import { SupabaseRepository } from '../supabase/supabase.repository';
import {
  Clase,
  ClaseConCupo,
  ClaseResumenInscripcion,
  InscripcionClase,
  InscripcionConClase,
} from './clase.model';

interface InscripcionJoinCruda {
  id: string;
  perfil_id: string;
  clase_id: string;
  estado: InscripcionConClase['estado'];
  created_at?: string;
  cancelada_en?: string | null;
  cancelacion_tardia?: boolean;
  clase: ClaseResumenInscripcion | ClaseResumenInscripcion[];
}

@Injectable()
export class ClasesRepository extends SupabaseRepository<Clase> {
  protected readonly table = 'clases';

  async findConCupoPorSede(sedeId: string): Promise<ClaseConCupo[]> {
    return this.unwrap<ClaseConCupo[]>(
      await this.client
        .from('clases_con_cupo')
        .select('*')
        .eq('sede_id', sedeId)
        .order('inicio'),
      'findConCupoPorSede',
    );
  }

  async findInscripcionesPorPerfil(perfilId: string): Promise<InscripcionConClase[]> {
    const filas = this.unwrap<InscripcionJoinCruda[]>(
      await this.client
        .from('inscripciones_clase')
        .select(
          'id, perfil_id, clase_id, estado, created_at, cancelada_en, cancelacion_tardia, clase:clases(id, sede_id, tipo, instructor, inicio, fin)',
        )
        .eq('perfil_id', perfilId)
        .order('created_at', { ascending: false }),
      'findInscripcionesPorPerfil',
    );
    return filas.map((f) => this.normalizarInscripcionJoin(f));
  }

  async findInscripcionConClase(id: string): Promise<InscripcionConClase | null> {
    const fila = this.unwrap<InscripcionJoinCruda | null>(
      await this.client
        .from('inscripciones_clase')
        .select(
          'id, perfil_id, clase_id, estado, created_at, cancelada_en, cancelacion_tardia, clase:clases(id, sede_id, tipo, instructor, inicio, fin)',
        )
        .eq('id', id)
        .maybeSingle(),
      'findInscripcionConClase',
    );
    return fila ? this.normalizarInscripcionJoin(fila) : null;
  }

  async inscribir(claseId: string, perfilId: string): Promise<InscripcionClase> {
    return this.rpc<InscripcionClase>('inscribir_en_clase', {
      p_clase_id: claseId,
      p_perfil_id: perfilId,
    });
  }

  async cancelar(
    inscripcionId: string,
    tardia: boolean,
    plazoIntervalo: string,
  ): Promise<EsperaNotificada[]> {
    const notificados = await this.rpc<EsperaNotificada[] | null>(
      'cancelar_inscripcion',
      {
        p_inscripcion_id: inscripcionId,
        p_cancelacion_tardia: tardia,
        p_plazo: plazoIntervalo,
      },
    );
    return notificados ?? [];
  }

  private normalizarInscripcionJoin(fila: InscripcionJoinCruda): InscripcionConClase {
    const clase = Array.isArray(fila.clase) ? fila.clase[0] : fila.clase;
    return {
      id: fila.id,
      perfil_id: fila.perfil_id,
      clase_id: fila.clase_id,
      estado: fila.estado,
      created_at: fila.created_at,
      cancelada_en: fila.cancelada_en,
      cancelacion_tardia: fila.cancelacion_tardia,
      clase,
    };
  }
}
