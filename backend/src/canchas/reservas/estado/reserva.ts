import { ReservaCancha } from '../reserva-cancha.model';
import { Cancelada } from './cancelada';
import { Confirmada } from './confirmada';
import { EstadoReserva } from './estado-reserva';
import { PendienteDePago } from './pendiente-de-pago';

/** Puerto de persistencia que el Context usa al cambiar de estado. */
export interface ReservaPersistencia {
  confirmar(reservaId: string): Promise<ReservaCancha>;
  cancelar(reservaId: string): Promise<ReservaCancha>;
}

/**
 * Context del patrón State.
 * Reconstruye el ConcreteState desde el enum SQL al leer la fila.
 */
export class Reserva {
  private constructor(
    private fila: ReservaCancha,
    private readonly persistencia: ReservaPersistencia,
    private estado: EstadoReserva,
  ) {}

  static desdeFila(
    fila: ReservaCancha,
    persistencia: ReservaPersistencia,
  ): Reserva {
    return new Reserva(fila, persistencia, estadoDesde(fila.estado));
  }

  get id(): string {
    return this.fila.id;
  }

  get perfilId(): string {
    return this.fila.perfil_id;
  }

  get snapshot(): ReservaCancha {
    return this.fila;
  }

  get nombreEstado(): EstadoReserva['nombre'] {
    return this.estado.nombre;
  }

  async pagar(): Promise<ReservaCancha> {
    await this.estado.pagar(this);
    return this.fila;
  }

  async cancelar(): Promise<ReservaCancha> {
    await this.estado.cancelar(this);
    return this.fila;
  }

  /** Llamado por PendienteDePago al confirmar el cobro. */
  async aplicarConfirmacion(): Promise<void> {
    this.fila = await this.persistencia.confirmar(this.fila.id);
    this.estado = new Confirmada();
  }

  /** Llamado por PendienteDePago / Confirmada al cancelar. */
  async aplicarCancelacion(): Promise<void> {
    this.fila = await this.persistencia.cancelar(this.fila.id);
    this.estado = new Cancelada();
  }
}

export function estadoDesde(
  nombre: ReservaCancha['estado'],
): EstadoReserva {
  switch (nombre) {
    case 'pendiente':
      return new PendienteDePago();
    case 'confirmada':
      return new Confirmada();
    case 'cancelada':
      return new Cancelada();
  }
}
