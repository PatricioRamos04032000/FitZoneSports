import { BadRequestException } from '@nestjs/common';
import { EstadoReserva } from './estado-reserva';
import type { Reserva } from './reserva';

/**
 * ConcreteState: no se vuelve a pagar; cancelar sin plazo (S7-T01).
 * Un plazo de cancelación se documentará cuando el equipo lo defina.
 */
export class Confirmada implements EstadoReserva {
  readonly nombre = 'confirmada' as const;

  async pagar(_reserva: Reserva): Promise<void> {
    throw new BadRequestException('La reserva ya está confirmada y no admite pago');
  }

  async cancelar(reserva: Reserva): Promise<void> {
    await reserva.aplicarCancelacion();
  }
}
