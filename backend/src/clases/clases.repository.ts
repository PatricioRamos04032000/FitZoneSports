import { Injectable } from '@nestjs/common';
import { EsperaNotificada } from './notificaciones/lista-espera.publisher';
import { SupabaseRepository } from '../supabase/supabase.repository';
import {
  Clase,
  ClaseConCupo,
  ClaseResumenInscripcion,
  EntradaListaEspera,
  EsperaConClase,
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

interface EsperaJoinCruda {
  id: string;
  clase_id: string;
  perfil_id: string;
  estado: EsperaConClase['estado'];
  created_at: string;
  notificado_en?: string | null;
  vence_en?: string | null;
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

  async findConCupoById(claseId: string): Promise<ClaseConCupo | null> {
    return this.unwrap<ClaseConCupo | null>(
      await this.client
        .from('clases_con_cupo')
        .select('*')
        .eq('id', claseId)
        .maybeSingle(),
      'findConCupoById',
    );
  }

  async tieneInscripcionVigente(
    claseId: string,
    perfilId: string,
  ): Promise<boolean> {
    const fila = this.unwrap<{ id: string } | null>(
      await this.client
        .from('inscripciones_clase')
        .select('id')
        .eq('clase_id', claseId)
        .eq('perfil_id', perfilId)
        .eq('estado', 'inscripto')
        .maybeSingle(),
      'tieneInscripcionVigente',
    );
    return fila !== null;
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

  async crearEntradaListaEspera(
    claseId: string,
    perfilId: string,
  ): Promise<EntradaListaEspera> {
    return this.unwrap<EntradaListaEspera>(
      await this.client
        .from('lista_espera')
        .insert({ clase_id: claseId, perfil_id: perfilId })
        .select('*')
        .single(),
      'crearEntradaListaEspera',
    );
  }

  async findListaEsperaPorPerfil(perfilId: string): Promise<EsperaConClase[]> {
    const filas = this.unwrap<EsperaJoinCruda[]>(
      await this.client
        .from('lista_espera')
        .select(
          'id, clase_id, perfil_id, estado, created_at, notificado_en, vence_en, clase:clases(id, sede_id, tipo, instructor, inicio, fin)',
        )
        .eq('perfil_id', perfilId)
        .order('created_at', { ascending: false }),
      'findListaEsperaPorPerfil',
    );
    return filas.map((f) => this.normalizarEsperaJoin(f));
  }

  async findEsperaConClase(esperaId: string): Promise<EsperaConClase | null> {
    const fila = this.unwrap<EsperaJoinCruda | null>(
      await this.client
        .from('lista_espera')
        .select(
          'id, clase_id, perfil_id, estado, created_at, notificado_en, vence_en, clase:clases(id, sede_id, tipo, instructor, inicio, fin)',
        )
        .eq('id', esperaId)
        .maybeSingle(),
      'findEsperaConClase',
    );
    return fila ? this.normalizarEsperaJoin(fila) : null;
  }

  async retirarEspera(esperaId: string): Promise<EntradaListaEspera | null> {
    return this.unwrap<EntradaListaEspera | null>(
      await this.client
        .from('lista_espera')
        .update({ estado: 'retirado' })
        .eq('id', esperaId)
        .in('estado', ['esperando', 'notificado'])
        .select('*')
        .maybeSingle(),
      'retirarEspera',
    );
  }

  async procesarListaEspera(
    claseId: string,
    plazoIntervalo: string,
  ): Promise<EsperaNotificada[]> {
    const notificados = await this.rpc<EsperaNotificada[] | null>(
      'procesar_lista_espera',
      {
        p_clase_id: claseId,
        p_plazo: plazoIntervalo,
      },
    );
    return notificados ?? [];
  }

  async confirmarLugarEspera(esperaId: string): Promise<InscripcionClase> {
    return this.rpc<InscripcionClase>('confirmar_lugar_espera', {
      p_espera_id: esperaId,
    });
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

  private normalizarEsperaJoin(fila: EsperaJoinCruda): EsperaConClase {
    const clase = Array.isArray(fila.clase) ? fila.clase[0] : fila.clase;
    return {
      id: fila.id,
      clase_id: fila.clase_id,
      perfil_id: fila.perfil_id,
      estado: fila.estado,
      created_at: fila.created_at,
      notificado_en: fila.notificado_en,
      vence_en: fila.vence_en,
      clase,
    };
  }
}
