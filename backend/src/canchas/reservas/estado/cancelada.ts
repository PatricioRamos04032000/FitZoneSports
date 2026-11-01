import { BadRequestException } from '@nestjs/common';
import { EstadoReserva } from './estado-reserva';
import type { Reserva } from './reserva';

/** ConcreteState: estado terminal; no admite más acciones. */
export class Cancelada implements EstadoReserva {
  readonly nombre = 'cancelada' as const;

  async pagar(_reserva: Reserva): Promise<void> {
    throw new BadRequestException('La reserva está cancelada y no admite pago');
  }

  async cancelar(_reserva: Reserva): Promise<void> {
    throw new BadRequestException('La reserva ya está cancelada');
  }
}
