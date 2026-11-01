import { Injectable } from '@nestjs/common';
import { ConfiguracionPico } from '../precios/pricing.strategy';
import { RepositoryError } from '../../supabase/repository.error';
import { SupabaseRepository } from '../../supabase/supabase.repository';
import {
  CanchaParaPrecio,
  ConfiguracionCadenaFila,
  ConfiguracionPicoFila,
  EstadoReservaCancha,
  ReservaCancha,
} from './reserva-cancha.model';

@Injectable()
export class ReservasCanchaRepository extends SupabaseRepository<ReservaCancha> {
  protected readonly table = 'reservas_cancha';

  async reservar(params: {
    canchaId: string;
    perfilId: string;
    inicio: string;
    precio: number;
    detalle: Record<string, unknown>;
    estado: EstadoReservaCancha;
  }): Promise<ReservaCancha> {
    return this.rpc<ReservaCancha>('reservar_cancha', {
      p_cancha_id: params.canchaId,
      p_perfil_id: params.perfilId,
      p_inicio: params.inicio,
      p_precio: params.precio,
      p_detalle: params.detalle,
      p_estado: params.estado,
    });
  }

  async confirmar(reservaId: string): Promise<ReservaCancha> {
    return this.rpc<ReservaCancha>('confirmar_reserva_cancha', {
      p_reserva_id: reservaId,
    });
  }

  async cancelar(reservaId: string): Promise<ReservaCancha> {
    return this.rpc<ReservaCancha>('cancelar_reserva_cancha', {
      p_reserva_id: reservaId,
    });
  }

  async findCanchaParaPrecio(canchaId: string): Promise<CanchaParaPrecio | null> {
    return this.unwrap<CanchaParaPrecio | null>(
      await this.client
        .from('canchas')
        .select('id, sede_id, precio_hora, activa')
        .eq('id', canchaId)
        .maybeSingle(),
      'findCanchaParaPrecio',
    );
  }

  async findConfiguracionPico(sedeId: string): Promise<ConfiguracionPico> {
    const fila = await this.unwrap<ConfiguracionPicoFila | null>(
      await this.client
        .from('configuracion_pico')
        .select('sede_id, recargo_pct, desde, hasta, dias')
        .eq('sede_id', sedeId)
        .maybeSingle(),
      'findConfiguracionPico',
    );

    if (!fila) {
      throw new RepositoryError(
        `Falta configuracion_pico para la sede ${sedeId}`,
        'CONFIG_PICO_AUSENTE',
      );
    }
    if (!fila.dias?.length) {
      throw new RepositoryError(
        `configuracion_pico.dias inválido para la sede ${sedeId}`,
        'CONFIG_PICO_INVALIDA',
      );
    }

    return {
      recargoPct: Number(fila.recargo_pct),
      desde: this.aHhMm(fila.desde),
      hasta: this.aHhMm(fila.hasta),
      dias: fila.dias,
    };
  }

  async findDescuentoSocioPct(): Promise<number> {
    const fila = await this.findConfiguracionCadena();
    if (!fila) {
      throw new RepositoryError(
        'Falta configuracion_cadena (descuento_socio_pct)',
        'CONFIG_CADENA_AUSENTE',
      );
    }
    return Number(fila.descuento_socio_pct);
  }

  /** Minutos de hold de reserva `pendiente` (`configuracion_cadena.minutos_hold_reserva`). */
  async findMinutosHoldReserva(): Promise<number> {
    const fila = await this.findConfiguracionCadena();
    if (!fila || fila.minutos_hold_reserva == null) {
      throw new RepositoryError(
        'Falta configuracion_cadena (minutos_hold_reserva)',
        'CONFIG_CADENA_AUSENTE',
      );
    }
    const minutos = Number(fila.minutos_hold_reserva);
    if (!(minutos > 0)) {
      throw new RepositoryError(
        'configuracion_cadena.minutos_hold_reserva inválido',
        'CONFIG_CADENA_INVALIDA',
      );
    }
    return minutos;
  }

  async findByPerfil(perfilId: string): Promise<ReservaCancha[]> {
    return this.unwrap(
      await this.from()
        .select('*')
        .eq('perfil_id', perfilId)
        .order('inicio', { ascending: true }),
      'findByPerfil',
    );
  }

  private async findConfiguracionCadena(): Promise<ConfiguracionCadenaFila | null> {
    return this.unwrap<ConfiguracionCadenaFila | null>(
      await this.client
        .from('configuracion_cadena')
        .select('id, descuento_socio_pct, minutos_hold_reserva')
        .eq('id', true)
        .maybeSingle(),
      'findConfiguracionCadena',
    );
  }

  /**
   * Socio activo = membresía `activo` cuya vigencia cubre el día del turno (RN-03).
   */
  async tieneMembresiaActivaEn(perfilId: string, inicio: string): Promise<boolean> {
    const dia = this.diaLocalArgentina(inicio);
    const fila = await this.unwrap<{ id: string } | null>(
      await this.client
        .from('membresias')
        .select('id')
        .eq('perfil_id', perfilId)
        .eq('estado', 'activo')
        .lte('vigente_desde', dia)
        .gte('vigente_hasta', dia)
        .maybeSingle(),
      'tieneMembresiaActivaEn',
    );
    return fila !== null;
  }

  private aHhMm(hora: string): string {
    const [h, m] = hora.split(':');
    return `${h.padStart(2, '0')}:${(m ?? '00').padStart(2, '0')}`;
  }

  private diaLocalArgentina(inicio: string): string {
    const tieneZona = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(inicio.trim());
    const fecha = new Date(tieneZona ? inicio : `${inicio}-03:00`);
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Argentina/Buenos_Aires',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(fecha);
  }
}
