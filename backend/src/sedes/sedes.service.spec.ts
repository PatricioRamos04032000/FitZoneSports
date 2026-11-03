import { Test, TestingModule } from '@nestjs/testing';
import { SedesRepository } from './sedes.repository';
import { SedesService } from './sedes.service';

describe('SedesService', () => {
  let service: SedesService;
  const sedesRepository = { findAll: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SedesService,
        { provide: SedesRepository, useValue: sedesRepository },
      ],
    }).compile();

    service = module.get<SedesService>(SedesService);
  });

  it('findAll devuelve las sedes del repositorio', async () => {
    const sedes = [{ id: '1', nombre: 'FitZone Central' }];
    sedesRepository.findAll.mockResolvedValue(sedes);

    await expect(service.findAll()).resolves.toBe(sedes);
  });
});
