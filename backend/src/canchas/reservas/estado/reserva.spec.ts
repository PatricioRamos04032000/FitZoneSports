import { BadRequestException } from '@nestjs/common';
import { ReservaCancha } from '../reserva-cancha.model';
import { reservaCanchaFixture } from '../reserva-cancha.fixture';
import { Reserva, ReservaPersistencia } from './reserva';

function persistenciaMock(): jest.Mocked<ReservaPersistencia> {
  return {
    confirmar: jest.fn(async (id) =>
      reservaCanchaFixture({ id, estado: 'confirmada' }),
    ),
    cancelar: jest.fn(async (id) =>
      reservaCanchaFixture({ id, estado: 'cancelada' }),
    ),
  };
}

function armar(estado: ReservaCancha['estado']) {
  const persistencia = persistenciaMock();
  const reserva = Reserva.desdeFila(
    reservaCanchaFixture({ estado }),
    persistencia,
  );
  return { persistencia, reserva };
}

describe('State — ciclo de Reserva (S7-T01)', () => {
  it('pendiente: pagar confirma', async () => {
    const { persistencia, reserva } = armar('pendiente');

    const actualizada = await reserva.pagar();

    expect(persistencia.confirmar).toHaveBeenCalledWith('r1');
    expect(actualizada.estado).toBe('confirmada');
    expect(reserva.nombreEstado).toBe('confirmada');
  });

  it.each(['pendiente', 'confirmada'] as const)(
    '%s: cancelar pasa a cancelada',
    async (estado) => {
      const { persistencia, reserva } = armar(estado);

      const actualizada = await reserva.cancelar();

      expect(persistencia.cancelar).toHaveBeenCalledWith('r1');
      expect(actualizada.estado).toBe('cancelada');
    },
  );

  it('confirmada: rechaza pagar', async () => {
    const { persistencia, reserva } = armar('confirmada');

    await expect(reserva.pagar()).rejects.toBeInstanceOf(BadRequestException);
    expect(persistencia.confirmar).not.toHaveBeenCalled();
  });

  it('cancelada: rechaza pagar y cancelar', async () => {
    const { persistencia, reserva } = armar('cancelada');

    await expect(reserva.pagar()).rejects.toBeInstanceOf(BadRequestException);
    await expect(reserva.cancelar()).rejects.toBeInstanceOf(BadRequestException);
    expect(persistencia.confirmar).not.toHaveBeenCalled();
    expect(persistencia.cancelar).not.toHaveBeenCalled();
  });
});
