import { EstadoReserva } from './estado-reserva';
import type { Reserva } from './reserva';

/** ConcreteState: admite pagar (→ confirmada) y cancelar (→ cancelada). */
export class PendienteDePago implements EstadoReserva {
  readonly nombre = 'pendiente' as const;

  async pagar(reserva: Reserva): Promise<void> {
    await reserva.aplicarConfirmacion();
  }

  async cancelar(reserva: Reserva): Promise<void> {
    await reserva.aplicarCancelacion();
  }
}
