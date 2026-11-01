import { Injectable } from '@nestjs/common';
import {
  CONFIGURACION_PICO_DEFAULT,
  ConfiguracionPico,
  DESCUENTO_SOCIO_DEFAULT_PCT,
} from '../precios/pricing.strategy';
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
      return CONFIGURACION_PICO_DEFAULT;
    }

    return {
      recargoPct: Number(fila.recargo_pct),
      desde: this.aHhMm(fila.desde),
      hasta: this.aHhMm(fila.hasta),
      dias: fila.dias ?? CONFIGURACION_PICO_DEFAULT.dias,
    };
  }

  async findDescuentoSocioPct(): Promise<number> {
    const fila = await this.unwrap<ConfiguracionCadenaFila | null>(
      await this.client
        .from('configuracion_cadena')
        .select('id, descuento_socio_pct')
        .eq('id', true)
        .maybeSingle(),
      'findDescuentoSocioPct',
    );

    if (!fila) {
      return DESCUENTO_SOCIO_DEFAULT_PCT;
    }
    return Number(fila.descuento_socio_pct);
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
