import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Sede } from './sede.model';
import { SedesRepository } from './sedes.repository';
import { SedesService } from './sedes.service';

const SEDE: Sede = {
  id: 'a1000000-0000-4000-8000-000000000001',
  nombre: 'FitZone Norte',
  direccion: 'Av. Almafuerte 500',
  aforo_max: 80,
  activa: true,
  created_at: '2026-11-14T20:00:00.000Z',
};

describe('SedesService', () => {
  let service: SedesService;
  const sedesRepository = {
    findAll: jest.fn(),
    crear: jest.fn(),
    actualizar: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SedesService,
        { provide: SedesRepository, useValue: sedesRepository },
      ],
    }).compile();

    service = module.get<SedesService>(SedesService);
  });

  it('findAll devuelve las sedes del repositorio', async () => {
    sedesRepository.findAll.mockResolvedValue([SEDE]);

    await expect(service.findAll()).resolves.toEqual([SEDE]);
  });

  it('crear aplica defaults de aforo 50 y activa true', async () => {
    sedesRepository.crear.mockResolvedValue({
      ...SEDE,
      direccion: null,
      aforo_max: 50,
    });

    await service.crear({ nombre: '  FitZone Norte  ' });

    expect(sedesRepository.crear).toHaveBeenCalledWith({
      nombre: 'FitZone Norte',
      direccion: null,
      aforo_max: 50,
      activa: true,
    });
  });

  it('crear rechaza nombre vacío y aforo no positivo', async () => {
    await expect(service.crear({ nombre: '   ' })).rejects.toBeInstanceOf(
      BadRequestException,
    );
    await expect(
      service.crear({ nombre: 'Norte', aforo_max: 0 }),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.crear({ nombre: 'Norte', aforo_max: 10.5 }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(sedesRepository.crear).not.toHaveBeenCalled();
  });

  it('actualizar rechaza un body vacío', async () => {
    await expect(service.actualizar(SEDE.id, {})).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(sedesRepository.actualizar).not.toHaveBeenCalled();
  });

  it('actualizar devuelve 404 si la sede no existe', async () => {
    sedesRepository.actualizar.mockResolvedValue(null);

    await expect(
      service.actualizar(SEDE.id, { activa: false }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('actualizar persiste el cambio de activa', async () => {
    sedesRepository.actualizar.mockResolvedValue({ ...SEDE, activa: false });

    await expect(
      service.actualizar(SEDE.id, { activa: false }),
    ).resolves.toMatchObject({ activa: false });

    expect(sedesRepository.actualizar).toHaveBeenCalledWith(SEDE.id, {
      activa: false,
    });
  });
});
