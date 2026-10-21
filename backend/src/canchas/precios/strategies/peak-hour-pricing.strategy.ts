import { Injectable } from '@nestjs/common';
import { ContextoPrecio, PricingStrategy } from '../pricing.strategy';

const ZONA_ARGENTINA = 'America/Argentina/Buenos_Aires';

/**
 * Estrategia de recargo por horario pico (RF-11, S4-T09 P3).
 * Aplica cuando el turno comienza dentro de la franja [desde, hasta) en un día
 * configurado como pico para la sede (evaluado en hora de Argentina).
 */
@Injectable()
export class PeakHourPricing implements PricingStrategy {
  readonly nombre = 'PeakHourPricing';

  aplica(ctx: ContextoPrecio): boolean {
    const { recargoPct, desde, hasta, dias } = ctx.pico;
    if (recargoPct <= 0 || dias.length === 0) {
      return false;
    }

    const { diaIso, minutosDelDia } = this.extraerDiaYHoraArgentina(ctx.inicio);
    if (!dias.includes(diaIso)) {
      return false;
    }

    const desdeMin = this.aMinutos(desde);
    const hastaMin = this.aMinutos(hasta);

    return minutosDelDia >= desdeMin && minutosDelDia < hastaMin;
  }

  calcular(precio: number, ctx: ContextoPrecio): number {
    return precio * (1 + ctx.pico.recargoPct / 100);
  }

  private extraerDiaYHoraArgentina(inicio: Date | string): {
    diaIso: number;
    minutosDelDia: number;
  } {
    const fecha = this.normalizarFecha(inicio);

    const partes = new Intl.DateTimeFormat('en-US', {
      timeZone: ZONA_ARGENTINA,
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(fecha);

    const weekday = partes.find((p) => p.type === 'weekday')?.value ?? '';
    const hour = Number(partes.find((p) => p.type === 'hour')?.value ?? 0);
    const minute = Number(partes.find((p) => p.type === 'minute')?.value ?? 0);

    const mapaDias: Record<string, number> = {
      Mon: 1,
      Tue: 2,
      Wed: 3,
      Thu: 4,
      Fri: 5,
      Sat: 6,
      Sun: 7,
    };

    return {
      diaIso: mapaDias[weekday] ?? 0,
      minutosDelDia: hour * 60 + minute,
    };
  }

  private normalizarFecha(inicio: Date | string): Date {
    if (inicio instanceof Date) {
      return inicio;
    }
    // Si el string ISO no incluye zona horaria (Z o ±HH:mm), se interpreta en hora de Argentina (-03:00)
    const tieneZona = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(inicio.trim());
    return new Date(tieneZona ? inicio : `${inicio}-03:00`);
  }

  private aMinutos(horaHhMm: string): number {
    const [horas, minutos] = horaHhMm.split(':').map(Number);
    return (horas || 0) * 60 + (minutos || 0);
  }
}
