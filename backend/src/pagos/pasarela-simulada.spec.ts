import { ConfigService } from '@nestjs/config';
import { PasarelaSimulada } from './pasarela-simulada';
import { PagosRepository } from './pagos.repository';
import {
  TOKEN_PRUEBA_APROBADO,
  TOKEN_PRUEBA_RECHAZO,
} from './pasarela-pago';

describe('PasarelaSimulada (S7-T02b)', () => {
  let pasarela: PasarelaSimulada;
  let pagos: jest.Mocked<
    Pick<
      PagosRepository,
      'registrarCobro' | 'findPendientePorReserva' | 'findById' | 'actualizarEstado'
    >
  >;

  beforeEach(() => {
    pagos = {
      registrarCobro: jest.fn().mockImplementation(async (nuevo) => ({
        id: 'pago-nuevo',
        created_at: '2026-11-01T12:00:00Z',
        ...nuevo,
      })),
      findPendientePorReserva: jest.fn().mockResolvedValue(null),
      findById: jest.fn(),
      actualizarEstado: jest.fn().mockImplementation(async (id, cambios) => ({
        id,
        perfil_id: 'perfil-1',
        concepto: 'reserva_cancha',
        monto: 1000,
        reserva_cancha_id: 'reserva-1',
        membresia_id: null,
        created_at: '2026-11-01T12:00:00Z',
        ...cambios,
      })),
    };
    pasarela = new PasarelaSimulada(
      pagos as unknown as PagosRepository,
      { get: () => 'http://localhost:3000' } as unknown as ConfigService,
    );
  });

  it('crearPreferencia inserta pendiente y arma checkoutUrl', async () => {
    const result = await pasarela.crearPreferencia({
      monto: 24000,
      concepto: 'reserva_cancha',
      referenciaId: 'reserva-1',
      perfilId: 'perfil-1',
    });

    expect(result.pagoId).toBe('pago-nuevo');
    expect(result.checkoutUrl).toBe(
      'http://localhost:3000/pasarela-simulada/checkout/pago-nuevo',
    );
    expect(pagos.registrarCobro).toHaveBeenCalledWith(
      expect.objectContaining({
        estado: 'pendiente',
        token_pasarela: null,
        reserva_cancha_id: 'reserva-1',
      }),
    );
  });

  it('crearPreferencia reutiliza pago pendiente existente', async () => {
    pagos.findPendientePorReserva.mockResolvedValue({
      id: 'pago-existente',
      perfil_id: 'perfil-1',
      concepto: 'reserva_cancha',
      monto: 24000,
      token_pasarela: null,
      estado: 'pendiente',
      reserva_cancha_id: 'reserva-1',
      membresia_id: null,
      created_at: '2026-11-01T12:00:00Z',
    });

    const result = await pasarela.crearPreferencia({
      monto: 24000,
      concepto: 'reserva_cancha',
      referenciaId: 'reserva-1',
      perfilId: 'perfil-1',
    });

    expect(result.pagoId).toBe('pago-existente');
    expect(pagos.registrarCobro).not.toHaveBeenCalled();
  });

  it('confirmarPago aprueba y guarda token', async () => {
    pagos.findById.mockResolvedValue({
      id: 'pago-1',
      perfil_id: 'perfil-1',
      concepto: 'reserva_cancha',
      monto: 1000,
      token_pasarela: null,
      estado: 'pendiente',
      reserva_cancha_id: 'reserva-1',
      membresia_id: null,
      created_at: '2026-11-01T12:00:00Z',
    });

    const result = await pasarela.confirmarPago('pago-1', {
      aprobado: true,
      token: 'sim-abc',
    });

    expect(result.aprobado).toBe(true);
    expect(result.token).toBe('sim-abc');
    expect(pagos.actualizarEstado).toHaveBeenCalledWith('pago-1', {
      estado: 'aprobado',
      token_pasarela: 'sim-abc',
    });
  });

  it('confirmarPago rechaza sin token', async () => {
    pagos.findById.mockResolvedValue({
      id: 'pago-1',
      perfil_id: 'perfil-1',
      concepto: 'reserva_cancha',
      monto: 1000,
      token_pasarela: null,
      estado: 'pendiente',
      reserva_cancha_id: 'reserva-1',
      membresia_id: null,
      created_at: '2026-11-01T12:00:00Z',
    });

    const result = await pasarela.confirmarPago('pago-1', {
      aprobado: false,
      motivo: 'rechazo',
    });

    expect(result.aprobado).toBe(false);
    expect(result.token).toBeUndefined();
    expect(pagos.actualizarEstado).toHaveBeenCalledWith('pago-1', {
      estado: 'rechazado',
      token_pasarela: null,
    });
  });

  it('cobrar síncrono con tok_fail rechaza', async () => {
    const result = await pasarela.cobrar({
      monto: 1000,
      concepto: 'reserva_cancha',
      referenciaId: 'reserva-3',
      perfilId: 'perfil-1',
      tokenPrueba: TOKEN_PRUEBA_RECHAZO,
    });

    expect(result.aprobado).toBe(false);
    expect(pagos.registrarCobro).toHaveBeenCalledWith(
      expect.objectContaining({ estado: 'rechazado', token_pasarela: null }),
    );
  });

  it('cobrar síncrono con tok_ok aprueba', async () => {
    const result = await pasarela.cobrar({
      monto: 1000,
      concepto: 'reserva_cancha',
      referenciaId: 'reserva-2',
      perfilId: 'perfil-1',
      tokenPrueba: TOKEN_PRUEBA_APROBADO,
    });

    expect(result).toEqual(
      expect.objectContaining({
        aprobado: true,
        token: TOKEN_PRUEBA_APROBADO,
      }),
    );
  });
});
