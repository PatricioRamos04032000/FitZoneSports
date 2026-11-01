import {
  ConflictException,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PreciosService } from '../precios/precios.service';
import { RepositoryError } from '../../supabase/repository.error';
import { PASARELA_PAGO, PasarelaPago } from './pasarela-pago';
import { ReservaCancha } from './reserva-cancha.model';
import { ReservasCanchaRepository } from './reservas-cancha.repository';
import { ReservasCanchaService } from './reservas-cancha.service';

const PERFIL = 'perfil-1';
const CANCHA = 'cancha-1';
const INICIO = '2026-11-15T19:00:00-03:00';

function filaPendiente(overrides: Partial<ReservaCancha> = {}): ReservaCancha {
  return {
    id: 'reserva-1',
    cancha_id: CANCHA,
    perfil_id: PERFIL,
    inicio: INICIO,
    fin: '2026-11-15T20:00:00-03:00',
    precio: 24000,
    detalle: { reglasAplicadas: ['StandardPricing', 'PeakHourPricing'] },
    estado: 'pendiente',
    created_at: '2026-10-31T12:00:00Z',
    ...overrides,
  };
}

describe('ReservasCanchaService (Facade S7-T01)', () => {
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
      tieneMembresiaActivaEn: jest.fn().mockResolvedValue(false),
      reservar: jest.fn().mockResolvedValue(filaPendiente()),
      confirmar: jest.fn().mockImplementation(async (id: string) =>
        filaPendiente({ id, estado: 'confirmada' }),
      ),
      cancelar: jest.fn().mockImplementation(async (id: string) =>
        filaPendiente({ id, estado: 'cancelada' }),
      ),
      findById: jest.fn(),
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
      cobrar: jest.fn().mockResolvedValue({ aprobado: true, token: 'tok' }),
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

  it('con pasarela aprobada queda confirmada y usa Strategy', async () => {
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
    expect(pasarela.cobrar).toHaveBeenCalledWith(
      expect.objectContaining({ monto: 24000, referenciaId: 'reserva-1' }),
    );
    expect(repository.confirmar).toHaveBeenCalledWith('reserva-1');
    expect(result.estado).toBe('confirmada');
    expect(result.precio).toBe(24000);
  });

  it('con pago rechazado cancela y no confirma', async () => {
    pasarela.cobrar.mockResolvedValue({
      aprobado: false,
      motivo: 'Fondos insuficientes',
    });

    await expect(
      service.reservar(PERFIL, { canchaId: CANCHA, inicio: INICIO }),
    ).rejects.toMatchObject({
      status: HttpStatus.PAYMENT_REQUIRED,
    });

    expect(repository.cancelar).toHaveBeenCalledWith('reserva-1');
    expect(repository.confirmar).not.toHaveBeenCalled();
  });

  it('propaga TURNO_OCUPADO (RN-02) como 409', async () => {
    repository.reservar.mockRejectedValue(
      new RepositoryError('TURNO_OCUPADO', 'P0001'),
    );

    await expect(
      service.reservar(PERFIL, { canchaId: CANCHA, inicio: INICIO }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('404 si la cancha no existe', async () => {
    repository.findCanchaParaPrecio.mockResolvedValue(null);

    await expect(
      service.reservar(PERFIL, { canchaId: CANCHA, inicio: INICIO }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('cancelar propio via State', async () => {
    repository.findById.mockResolvedValue(
      filaPendiente({ estado: 'confirmada' }),
    );

    const result = await service.cancelar(PERFIL, 'reserva-1');

    expect(repository.cancelar).toHaveBeenCalledWith('reserva-1');
    expect(result.estado).toBe('cancelada');
  });

  it('no permite cancelar reserva ajena', async () => {
    repository.findById.mockResolvedValue(
      filaPendiente({ perfil_id: 'otro' }),
    );

    await expect(service.cancelar(PERFIL, 'reserva-1')).rejects.toMatchObject({
      status: HttpStatus.FORBIDDEN,
    });
  });

  it('excepción HttpException tipada en rechazo de pago', async () => {
    pasarela.cobrar.mockResolvedValue({ aprobado: false });

    await expect(
      service.reservar(PERFIL, { canchaId: CANCHA, inicio: INICIO }),
    ).rejects.toBeInstanceOf(HttpException);
  });
});
