import { BadRequestException } from '@nestjs/common';
import { ReservaCancha } from '../reserva-cancha.model';
import { Reserva, ReservaPersistencia } from './reserva';

function fila(
  overrides: Partial<ReservaCancha> = {},
): ReservaCancha {
  return {
    id: 'r1',
    cancha_id: 'c1',
    perfil_id: 'p1',
    inicio: '2026-11-15T19:00:00+00:00',
    fin: '2026-11-15T20:00:00+00:00',
    precio: 20000,
    detalle: {},
    estado: 'pendiente',
    created_at: '2026-10-31T00:00:00+00:00',
    ...overrides,
  };
}

function persistenciaMock(): jest.Mocked<ReservaPersistencia> {
  return {
    confirmar: jest.fn(async (id) => fila({ id, estado: 'confirmada' })),
    cancelar: jest.fn(async (id) => fila({ id, estado: 'cancelada' })),
  };
}

describe('State — ciclo de Reserva (S7-T01)', () => {
  describe('PendienteDePago', () => {
    it('acepta pagar y pasa a confirmada', async () => {
      const persistencia = persistenciaMock();
      const reserva = Reserva.desdeFila(fila({ estado: 'pendiente' }), persistencia);

      const actualizada = await reserva.pagar();

      expect(persistencia.confirmar).toHaveBeenCalledWith('r1');
      expect(actualizada.estado).toBe('confirmada');
      expect(reserva.nombreEstado).toBe('confirmada');
    });

    it('acepta cancelar y pasa a cancelada', async () => {
      const persistencia = persistenciaMock();
      const reserva = Reserva.desdeFila(fila({ estado: 'pendiente' }), persistencia);

      const actualizada = await reserva.cancelar();

      expect(persistencia.cancelar).toHaveBeenCalledWith('r1');
      expect(actualizada.estado).toBe('cancelada');
    });
  });

  describe('Confirmada', () => {
    it('rechaza pagar', async () => {
      const persistencia = persistenciaMock();
      const reserva = Reserva.desdeFila(fila({ estado: 'confirmada' }), persistencia);

      await expect(reserva.pagar()).rejects.toBeInstanceOf(BadRequestException);
      expect(persistencia.confirmar).not.toHaveBeenCalled();
    });

    it('acepta cancelar sin plazo', async () => {
      const persistencia = persistenciaMock();
      const reserva = Reserva.desdeFila(fila({ estado: 'confirmada' }), persistencia);

      const actualizada = await reserva.cancelar();

      expect(persistencia.cancelar).toHaveBeenCalledWith('r1');
      expect(actualizada.estado).toBe('cancelada');
    });
  });

  describe('Cancelada', () => {
    it('rechaza pagar y cancelar', async () => {
      const persistencia = persistenciaMock();
      const reserva = Reserva.desdeFila(fila({ estado: 'cancelada' }), persistencia);

      await expect(reserva.pagar()).rejects.toBeInstanceOf(BadRequestException);
      await expect(reserva.cancelar()).rejects.toBeInstanceOf(BadRequestException);
      expect(persistencia.confirmar).not.toHaveBeenCalled();
      expect(persistencia.cancelar).not.toHaveBeenCalled();
    });
  });
});
