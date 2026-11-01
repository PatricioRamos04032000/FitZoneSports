import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PreciosService } from '../precios/precios.service';
import { RepositoryError } from '../../supabase/repository.error';
import { PASARELA_PAGO, PasarelaPago } from '../../pagos/pasarela-pago';
import { reservaCanchaFixture } from './reserva-cancha.fixture';
import { ReservaCancha } from './reserva-cancha.model';
import { ReservasCanchaRepository } from './reservas-cancha.repository';
import { ReservasCanchaService } from './reservas-cancha.service';

const PERFIL = 'perfil-1';
const CANCHA = 'cancha-1';
const INICIO = '2026-11-15T19:00:00-03:00';

function filaPendiente(overrides: Partial<ReservaCancha> = {}): ReservaCancha {
  return reservaCanchaFixture({
    id: 'reserva-1',
    cancha_id: CANCHA,
    perfil_id: PERFIL,
    inicio: INICIO,
    fin: '2026-11-15T20:00:00-03:00',
    precio: 24000,
    detalle: { reglasAplicadas: ['StandardPricing', 'PeakHourPricing'] },
    created_at: new Date().toISOString(),
    ...overrides,
  });
}

describe('ReservasCanchaService (Facade S7-T02b)', () => {
  let service: ReservasCanchaService;
  let repository: jest.Mocked<ReservasCanchaRepository>;
  let precios: { calcular: jest.Mock };
  let pasarela: jest.Mocked<PasarelaPago>;

  beforeEach(async () => {
    repository = {
      findCanchaParaPrecio: jest.fn().mockResolvedValue({
        id: CANCHA,
        sede_id: 'sede-1',
        precio_hora: 20000,
        activa: true,
      }),
      findConfiguracionPico: jest.fn().mockResolvedValue({
        recargoPct: 20,
        desde: '19:00',
        hasta: '21:00',
        dias: [1, 2, 3, 4, 5, 6, 7],
      }),
      findDescuentoSocioPct: jest.fn().mockResolvedValue(15),
      findMinutosHoldReserva: jest.fn().mockResolvedValue(10),
      tieneMembresiaActivaEn: jest.fn().mockResolvedValue(false),
      reservar: jest.fn().mockResolvedValue(filaPendiente()),
      confirmar: jest.fn().mockImplementation(async (id: string) =>
        filaPendiente({ id, estado: 'confirmada' }),
      ),
      cancelar: jest.fn().mockImplementation(async (id: string) =>
        filaPendiente({ id, estado: 'cancelada' }),
      ),
      findById: jest.fn(),
      findByPerfil: jest.fn().mockResolvedValue([filaPendiente()]),
    } as unknown as jest.Mocked<ReservasCanchaRepository>;

    precios = {
      calcular: jest.fn().mockReturnValue({
        precioBase: 20000,
        precioFinal: 24000,
        reglasAplicadas: ['StandardPricing', 'PeakHourPricing'],
        descuentoSocioAplicado: false,
      }),
    };

    pasarela = {
      cobrar: jest.fn(),
      crearPreferencia: jest.fn().mockResolvedValue({
        pagoId: 'pago-1',
        checkoutUrl: 'http://localhost:3000/pasarela-simulada/checkout/pago-1',
      }),
      confirmarPago: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservasCanchaService,
        { provide: ReservasCanchaRepository, useValue: repository },
        { provide: PreciosService, useValue: precios },
        { provide: PASARELA_PAGO, useValue: pasarela },
      ],
    }).compile();

    service = module.get(ReservasCanchaService);
  });

  it('reservar deja pendiente y no cobra ni confirma', async () => {
    const result = await service.reservar(PERFIL, {
      canchaId: CANCHA,
      inicio: INICIO,
    });

    expect(precios.calcular).toHaveBeenCalled();
    expect(repository.reservar).toHaveBeenCalledWith(
      expect.objectContaining({
        canchaId: CANCHA,
        perfilId: PERFIL,
        precio: 24000,
        estado: 'pendiente',
      }),
    );
    expect(pasarela.cobrar).not.toHaveBeenCalled();
    expect(pasarela.crearPreferencia).not.toHaveBeenCalled();
    expect(repository.confirmar).not.toHaveBeenCalled();
    expect(result.estado).toBe('pendiente');
    expect(result.venceEn).toBeDefined();
  });

  it('iniciarPago exige dueño y estado pendiente', async () => {
    repository.findById.mockResolvedValue(filaPendiente());

    const result = await service.iniciarPago(PERFIL, 'reserva-1');

    expect(pasarela.crearPreferencia).toHaveBeenCalledWith({
      monto: 24000,
      concepto: 'reserva_cancha',
      referenciaId: 'reserva-1',
      perfilId: PERFIL,
    });
    expect(result.checkoutUrl).toContain('/pasarela-simulada/checkout/');
  });

  it('iniciarPago rechaza si no está pendiente', async () => {
    repository.findById.mockResolvedValue(
      filaPendiente({ estado: 'confirmada' }),
    );

    await expect(service.iniciarPago(PERFIL, 'reserva-1')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('iniciarPago cancela si el hold venció', async () => {
    repository.findById.mockResolvedValue(
      filaPendiente({
        created_at: new Date(Date.now() - 20 * 60_000).toISOString(),
      }),
    );

    await expect(service.iniciarPago(PERFIL, 'reserva-1')).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(repository.cancelar).toHaveBeenCalledWith('reserva-1');
  });

  it('aplicarResultadoPago confirma si aprobado', async () => {
    repository.findById.mockResolvedValue(filaPendiente());

    const result = await service.aplicarResultadoPago('reserva-1', true);

    expect(repository.confirmar).toHaveBeenCalledWith('reserva-1');
    expect(result.estado).toBe('confirmada');
  });

  it('aplicarResultadoPago cancela si rechazado', async () => {
    repository.findById.mockResolvedValue(filaPendiente());

    const result = await service.aplicarResultadoPago('reserva-1', false);

    expect(repository.cancelar).toHaveBeenCalledWith('reserva-1');
    expect(result.estado).toBe('cancelada');
  });

  it('propaga TURNO_OCUPADO (RN-02) como 409', async () => {
    repository.reservar.mockRejectedValue(
      new RepositoryError('TURNO_OCUPADO', 'P0001'),
    );

    await expect(
      service.reservar(PERFIL, { canchaId: CANCHA, inicio: INICIO }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('propaga RESERVA_VENCIDA como 409', async () => {
    repository.findById.mockResolvedValue(filaPendiente());
    repository.confirmar.mockRejectedValue(
      new RepositoryError('RESERVA_VENCIDA', 'P0001'),
    );

    await expect(
      service.aplicarResultadoPago('reserva-1', true),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('404 si la cancha no existe', async () => {
    repository.findCanchaParaPrecio.mockResolvedValue(null);

    await expect(
      service.reservar(PERFIL, { canchaId: CANCHA, inicio: INICIO }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('listarMias incluye venceEn en pendientes', async () => {
    const list = await service.listarMias(PERFIL);
    expect(list).toHaveLength(1);
    expect(list[0].venceEn).toBeDefined();
  });

  it('cancelar propio via State', async () => {
    repository.findById.mockResolvedValue(
      filaPendiente({ estado: 'confirmada' }),
    );

    const result = await service.cancelar(PERFIL, 'reserva-1');

    expect(repository.cancelar).toHaveBeenCalledWith('reserva-1');
    expect(result.estado).toBe('cancelada');
  });
});
