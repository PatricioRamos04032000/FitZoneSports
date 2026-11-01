import type { Reserva } from './reserva';

/**
 * Interfaz State (GoF) del ciclo de vida de una reserva de cancha.
 * Cada estado concreto acepta o rechaza `pagar` / `cancelar`.
 */
export interface EstadoReserva {
  readonly nombre: 'pendiente' | 'confirmada' | 'cancelada';
  pagar(reserva: Reserva): Promise<void>;
  cancelar(reserva: Reserva): Promise<void>;
}
