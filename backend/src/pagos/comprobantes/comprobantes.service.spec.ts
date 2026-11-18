import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pago } from '../pago.model';
import { PagosRepository } from '../pagos.repository';
import { ComprobantesService } from './comprobantes.service';

const PERFIL_ID = '11111111-1111-4111-8111-111111111111';
const OTRO_PERFIL_ID = '22222222-2222-4222-8222-222222222222';
const PAGO_ID = '33333333-3333-4333-8333-333333333333';
const RESERVA_ID = '44444444-4444-4444-8444-444444444444';
const MEMBRESIA_ID = '55555555-5555-4555-8555-555555555555';

function pagoReservaAprobado(overrides: Partial<Pago> = {}): Pago {
  return {
    id: PAGO_ID,
    perfil_id: PERFIL_ID,
    concepto: 'reserva_cancha',
    monto: 20400,
    token_pasarela: 'sim-tok-123',
    estado: 'aprobado',
    reserva_cancha_id: RESERVA_ID,
    membresia_id: null,
    plan: null,
    created_at: '2026-11-15T22:00:00.000Z',
    ...overrides,
  };
}

describe('ComprobantesService (C-04 / RF-14)', () => {
  let service: ComprobantesService;
  let pagos: jest.Mocked<
    Pick<
      PagosRepository,
      | 'findById'
      | 'findAprobadoPorReserva'
      | 'findAprobadosPorPerfil'
      | 'findPerfilComprobante'
      | 'findReservaComprobante'
      | 'findMembresiaComprobante'
    >
  >;

  beforeEach(() => {
    pagos = {
      findById: jest.fn(),
      findAprobadoPorReserva: jest.fn(),
      findAprobadosPorPerfil: jest.fn().mockResolvedValue([pagoReservaAprobado()]),
      findPerfilComprobante: jest.fn().mockResolvedValue({
        id: PERFIL_ID,
        nombre: 'Juan',
        apellido: 'Pérez',
        dni: '30111222',
      }),
      findReservaComprobante: jest.fn().mockResolvedValue({
        id: RESERVA_ID,
        cancha_id: 'cancha-1',
        perfil_id: PERFIL_ID,
        inicio: '2026-11-18T19:00:00-03:00',
        fin: '2026-11-18T20:00:00-03:00',
        precio: 20400,
        estado: 'confirmada',
        detalle: {
          precioBase: 20000,
          reglasAplicadas: ['StandardPricing', 'PeakHourPricingDecorator'],
        },
        canchaNombre: 'Paddle 1',
        canchaTipo: 'paddle',
        sedeNombre: 'Sede Central',
        sedeDireccion: 'Av. Siempreviva 123',
      }),
      findMembresiaComprobante: jest.fn().mockResolvedValue({
        id: MEMBRESIA_ID,
        plan: 'mensual',
        vigente_desde: '2026-11-15',
        vigente_hasta: '2026-12-15',
        estado: 'activo',
      }),
    };

    service = new ComprobantesService(
      pagos as unknown as PagosRepository,
      { get: () => 'test-secret' } as unknown as ConfigService,
    );
  });

  it('generarPorPago emite un PDF válido para reserva_cancha', async () => {
    pagos.findById.mockResolvedValue(pagoReservaAprobado());

    const archivo = await service.generarPorPago(PAGO_ID, PERFIL_ID);

    expect(archivo.filename).toBe(`comprobante-fitzone-${PAGO_ID.slice(0, 8)}.pdf`);
    expect(archivo.buffer.subarray(0, 5).toString('ascii')).toBe('%PDF-');
    expect(pagos.findReservaComprobante).toHaveBeenCalledWith(RESERVA_ID);
  });

  it('generarPorPago emite un PDF válido para membresia', async () => {
    pagos.findById.mockResolvedValue({
      id: PAGO_ID,
      perfil_id: PERFIL_ID,
      concepto: 'membresia',
      monto: 25000,
      token_pasarela: 'sim-mem-1',
      estado: 'aprobado',
      reserva_cancha_id: null,
      membresia_id: MEMBRESIA_ID,
      plan: 'mensual',
      created_at: '2026-11-15T22:00:00.000Z',
    });

    const archivo = await service.generarPorPago(PAGO_ID, PERFIL_ID);

    expect(archivo.buffer.subarray(0, 5).toString('ascii')).toBe('%PDF-');
    expect(pagos.findMembresiaComprobante).toHaveBeenCalledWith(MEMBRESIA_ID);
  });

  it('generarPorPago rechaza UUID inválido, pago ajeno o pago no aprobado', async () => {
    await expect(service.generarPorPago('no-uuid', PERFIL_ID)).rejects.toThrow(
      BadRequestException,
    );

    pagos.findById.mockResolvedValueOnce(null);
    await expect(service.generarPorPago(PAGO_ID, PERFIL_ID)).rejects.toThrow(
      NotFoundException,
    );

    pagos.findById.mockResolvedValueOnce(
      pagoReservaAprobado({ perfil_id: OTRO_PERFIL_ID }),
    );
    await expect(service.generarPorPago(PAGO_ID, PERFIL_ID)).rejects.toThrow(
      ForbiddenException,
    );

    pagos.findById.mockResolvedValueOnce(
      pagoReservaAprobado({ estado: 'pendiente' }),
    );
    await expect(service.generarPorPago(PAGO_ID, PERFIL_ID)).rejects.toThrow(
      ConflictException,
    );
  });

  it('generarPorReserva emite el PDF del pago aprobado y controla titularidad', async () => {
    pagos.findAprobadoPorReserva.mockResolvedValue(pagoReservaAprobado());

    const archivo = await service.generarPorReserva(RESERVA_ID, PERFIL_ID);
    expect(archivo.buffer.subarray(0, 5).toString('ascii')).toBe('%PDF-');

    await expect(
      service.generarPorReserva(RESERVA_ID, OTRO_PERFIL_ID),
    ).rejects.toThrow(ForbiddenException);

    pagos.findAprobadoPorReserva.mockResolvedValueOnce(null);
    await expect(
      service.generarPorReserva(RESERVA_ID, PERFIL_ID),
    ).rejects.toThrow(ConflictException);
  });

  it('generarPorPagoFirmado valida la firma HMAC', async () => {
    pagos.findById.mockResolvedValue(pagoReservaAprobado());
    const sig = service.firmarPago(PAGO_ID);

    const archivo = await service.generarPorPagoFirmado(PAGO_ID, sig);
    expect(archivo.buffer.subarray(0, 5).toString('ascii')).toBe('%PDF-');

    await expect(
      service.generarPorPagoFirmado(PAGO_ID, 'firma-invalida'),
    ).rejects.toThrow(ForbiddenException);
  });

  it('listarAprobadosMios mapea los pagos aprobados del socio', async () => {
    const lista = await service.listarAprobadosMios(PERFIL_ID);

    expect(lista).toEqual([
      {
        id: PAGO_ID,
        concepto: 'reserva_cancha',
        monto: 20400,
        estado: 'aprobado',
        reservaCanchaId: RESERVA_ID,
        membresiaId: null,
        plan: null,
        createdAt: '2026-11-15T22:00:00.000Z',
      },
    ]);
  });
});
