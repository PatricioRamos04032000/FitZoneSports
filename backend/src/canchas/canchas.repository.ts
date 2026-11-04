import { Injectable } from '@nestjs/common';
import { SupabaseRepository } from '../supabase/supabase.repository';
import {
  Cancha,
  ConfiguracionCadenaFila,
  ConfiguracionPicoFila,
  MantenimientoCancha,
  ReservaOcupacionFila,
  TipoCancha,
} from './cancha.model';

@Injectable()
export class CanchasRepository extends SupabaseRepository<Cancha> {
  protected readonly table = 'canchas';

  async existeSede(sedeId: string): Promise<boolean> {
    const fila = this.unwrap<{ id: string } | null>(
      await this.client
        .from('sedes')
        .select('id')
        .eq('id', sedeId)
        .maybeSingle(),
      'existeSede',
    );
    return fila !== null;
  }

  async esAdminDeSede(perfilId: string, sedeId: string): Promise<boolean> {
    const fila = this.unwrap<{ perfil_id: string } | null>(
      await this.client
        .from('admins_sede')
        .select('perfil_id')
        .eq('perfil_id', perfilId)
        .eq('sede_id', sedeId)
        .maybeSingle(),
      'esAdminDeSede',
    );
    return fila !== null;
  }

  async findBySede(sedeId: string, soloActivas = true): Promise<Cancha[]> {
    let query = this.from().select('*').eq('sede_id', sedeId);
    if (soloActivas) {
      query = query.eq('activa', true);
    }
    return this.unwrap<Cancha[]>(
      await query.order('nombre', { ascending: true }),
      'findBySede',
    );
  }

  async crearCancha(datos: {
    sedeId: string;
    nombre: string;
    tipo: TipoCancha;
    precioHora: number;
  }): Promise<Cancha> {
    return this.unwrap<Cancha>(
      await this.from()
        .insert({
          sede_id: datos.sedeId,
          nombre: datos.nombre,
          tipo: datos.tipo,
          precio_hora: datos.precioHora,
          activa: true,
        })
        .select('*')
        .single(),
      'crearCancha',
    );
  }

  async actualizarCancha(
    id: string,
    cambios: Partial<Pick<Cancha, 'nombre' | 'precio_hora' | 'activa'>>,
  ): Promise<Cancha | null> {
    return this.unwrap<Cancha | null>(
      await this.from()
        .update(cambios)
        .eq('id', id)
        .select('*')
        .maybeSingle(),
      'actualizarCancha',
    );
  }

  async findMantenimientosPorCancha(
    canchaId: string,
  ): Promise<MantenimientoCancha[]> {
    return this.unwrap<MantenimientoCancha[]>(
      await this.client
        .from('mantenimientos_cancha')
        .select('*')
        .eq('cancha_id', canchaId)
        .order('desde', { ascending: true }),
      'findMantenimientosPorCancha',
    );
  }

  async findMantenimientosEnRango(
    canchaIds: string[],
    desdeIso: string,
    hastaIso: string,
  ): Promise<MantenimientoCancha[]> {
    if (canchaIds.length === 0) {
      return [];
    }
    return this.unwrap<MantenimientoCancha[]>(
      await this.client
        .from('mantenimientos_cancha')
        .select('*')
        .in('cancha_id', canchaIds)
        .lt('desde', hastaIso)
        .gt('hasta', desdeIso),
      'findMantenimientosEnRango',
    );
  }

  async crearMantenimiento(datos: {
    canchaId: string;
    desde: string;
    hasta: string;
    motivo: string | null;
  }): Promise<MantenimientoCancha> {
    return this.unwrap<MantenimientoCancha>(
      await this.client
        .from('mantenimientos_cancha')
        .insert({
          cancha_id: datos.canchaId,
          desde: datos.desde,
          hasta: datos.hasta,
          motivo: datos.motivo,
        })
        .select('*')
        .single(),
      'crearMantenimiento',
    );
  }

  async findMantenimientoById(id: string): Promise<MantenimientoCancha | null> {
    return this.unwrap<MantenimientoCancha | null>(
      await this.client
        .from('mantenimientos_cancha')
        .select('*')
        .eq('id', id)
        .maybeSingle(),
      'findMantenimientoById',
    );
  }

  async eliminarMantenimiento(id: string): Promise<void> {
    this.unwrap(
      await this.client.from('mantenimientos_cancha').delete().eq('id', id),
      'eliminarMantenimiento',
    );
  }

  async findReservasActivasEnRango(
    canchaIds: string[],
    desdeIso: string,
    hastaIso: string,
  ): Promise<ReservaOcupacionFila[]> {
    if (canchaIds.length === 0) {
      return [];
    }
    return this.unwrap<ReservaOcupacionFila[]>(
      await this.client
        .from('reservas_cancha')
        .select('id, cancha_id, inicio, fin, estado, created_at')
        .in('cancha_id', canchaIds)
        .in('estado', ['pendiente', 'confirmada'])
        .lt('inicio', hastaIso)
        .gt('fin', desdeIso),
      'findReservasActivasEnRango',
    );
  }

  async findConfiguracionPico(
    sedeId: string,
  ): Promise<ConfiguracionPicoFila | null> {
    return this.unwrap<ConfiguracionPicoFila | null>(
      await this.client
        .from('configuracion_pico')
        .select('sede_id, recargo_pct, desde, hasta, dias, updated_at')
        .eq('sede_id', sedeId)
        .maybeSingle(),
      'findConfiguracionPico',
    );
  }

  async upsertConfiguracionPico(
    sedeId: string,
    datos: {
      recargo_pct: number;
      desde: string;
      hasta: string;
      dias: number[];
    },
  ): Promise<ConfiguracionPicoFila> {
    return this.unwrap<ConfiguracionPicoFila>(
      await this.client
        .from('configuracion_pico')
        .upsert(
          {
            sede_id: sedeId,
            recargo_pct: datos.recargo_pct,
            desde: datos.desde,
            hasta: datos.hasta,
            dias: datos.dias,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'sede_id' },
        )
        .select('sede_id, recargo_pct, desde, hasta, dias, updated_at')
        .single(),
      'upsertConfiguracionPico',
    );
  }

  async findConfiguracionCadena(): Promise<ConfiguracionCadenaFila | null> {
    return this.unwrap<ConfiguracionCadenaFila | null>(
      await this.client
        .from('configuracion_cadena')
        .select('id, descuento_socio_pct, minutos_hold_reserva, updated_at')
        .eq('id', true)
        .maybeSingle(),
      'findConfiguracionCadena',
    );
  }

  async actualizarDescuentoSocio(
    descuentoSocioPct: number,
  ): Promise<ConfiguracionCadenaFila> {
    return this.unwrap<ConfiguracionCadenaFila>(
      await this.client
        .from('configuracion_cadena')
        .upsert(
          {
            id: true,
            descuento_socio_pct: descuentoSocioPct,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' },
        )
        .select('id, descuento_socio_pct, minutos_hold_reserva, updated_at')
        .single(),
      'actualizarDescuentoSocio',
    );
  }
}
