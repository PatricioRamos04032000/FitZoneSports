import { Injectable } from '@nestjs/common';
import { SupabaseRepository } from '../supabase/supabase.repository';
import {
  CheckIn,
  OrigenCheckIn,
  Presencia,
  TotpSeed,
} from './acceso.model';

@Injectable()
export class AccesoRepository extends SupabaseRepository<CheckIn> {
  protected readonly table = 'check_ins';

  async findTotpSeedActivo(perfilId: string): Promise<TotpSeed | null> {
    return this.unwrap<TotpSeed | null>(
      await this.client
        .from('totp_seeds')
        .select('*')
        .eq('perfil_id', perfilId)
        .eq('activo', true)
        .maybeSingle(),
      'findTotpSeedActivo',
    );
  }

  async upsertTotpSeed(params: {
    perfilId: string;
    seedCifrado: string;
  }): Promise<TotpSeed> {
    return this.unwrap<TotpSeed>(
      await this.client
        .from('totp_seeds')
        .upsert(
          {
            perfil_id: params.perfilId,
            seed_cifrado: params.seedCifrado,
            activo: true,
            rotado_en: new Date().toISOString(),
          },
          { onConflict: 'perfil_id' },
        )
        .select('*')
        .single(),
      'upsertTotpSeed',
    );
  }

  async findCheckInByClientEventId(
    clientEventId: string,
  ): Promise<CheckIn | null> {
    return this.unwrap<CheckIn | null>(
      await this.client
        .from('check_ins')
        .select('*')
        .eq('client_event_id', clientEventId)
        .maybeSingle(),
      'findCheckInByClientEventId',
    );
  }

  async registrarCheckIn(params: {
    perfilId: string;
    sedeId: string;
    origen?: OrigenCheckIn;
    ocurrioEn?: string;
    clientEventId?: string | null;
  }): Promise<CheckIn> {
    return this.rpc<CheckIn>('registrar_check_in', {
      p_perfil_id: params.perfilId,
      p_sede_id: params.sedeId,
      p_origen: params.origen ?? 'online',
      p_ocurrio_en: params.ocurrioEn ?? new Date().toISOString(),
      p_client_event_id: params.clientEventId ?? null,
    });
  }

  async registrarCheckOut(params: {
    perfilId: string;
    sedeId: string;
    origen?: OrigenCheckIn;
    ocurrioEn?: string;
    clientEventId?: string | null;
  }): Promise<CheckIn> {
    return this.rpc<CheckIn>('registrar_check_out', {
      p_perfil_id: params.perfilId,
      p_sede_id: params.sedeId,
      p_origen: params.origen ?? 'online',
      p_ocurrio_en: params.ocurrioEn ?? new Date().toISOString(),
      p_client_event_id: params.clientEventId ?? null,
    });
  }

  async listarPresenciasPorSede(sedeId: string): Promise<Presencia[]> {
    type PerfilEmbed = { nombre: string | null; apellido: string | null };
    type Fila = {
      perfil_id: string;
      sede_id: string;
      desde: string;
      perfiles: PerfilEmbed | PerfilEmbed[] | null;
    };

    const filas = await this.unwrap<Fila[]>(
      await this.client
        .from('presencias')
        .select('perfil_id, sede_id, desde, perfiles(nombre, apellido)')
        .eq('sede_id', sedeId)
        .order('desde', { ascending: true }),
      'listarPresenciasPorSede',
    );

    return filas.map((f) => {
      const perfil = Array.isArray(f.perfiles)
        ? (f.perfiles[0] ?? null)
        : f.perfiles;
      return {
        perfil_id: f.perfil_id,
        sede_id: f.sede_id,
        desde: f.desde,
        nombre: perfil?.nombre ?? null,
        apellido: perfil?.apellido ?? null,
      };
    });
  }

  async listarCheckInsPorSede(
    sedeId: string,
    limit = 50,
  ): Promise<CheckIn[]> {
    return this.unwrap<CheckIn[]>(
      await this.client
        .from('check_ins')
        .select('*')
        .eq('sede_id', sedeId)
        .order('ocurrio_en', { ascending: false })
        .limit(limit),
      'listarCheckInsPorSede',
    );
  }

  async findAforoMax(sedeId: string): Promise<number | null> {
    const fila = await this.unwrap<{ aforo_max: number } | null>(
      await this.client
        .from('sedes')
        .select('aforo_max')
        .eq('id', sedeId)
        .maybeSingle(),
      'findAforoMax',
    );
    return fila?.aforo_max ?? null;
  }

  async esAdminDeSede(perfilId: string, sedeId: string): Promise<boolean> {
    const fila = await this.unwrap<{ perfil_id: string } | null>(
      await this.client
        .from('admins_sede')
        .select('perfil_id')
        .eq('perfil_id', perfilId)
        .eq('sede_id', sedeId)
        .maybeSingle(),
      'esAdminDeSede',
    );
    return Boolean(fila);
  }
}
