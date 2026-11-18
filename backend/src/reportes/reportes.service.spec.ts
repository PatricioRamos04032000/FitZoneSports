import { Test, TestingModule } from '@nestjs/testing';
import { FilaReporteSede } from './reporte.model';
import { ReportesResumenRepository } from './reportes-resumen.repository';
import { ReportesService } from './reportes.service';

const NORTE: FilaReporteSede = {
  id: 'a1000000-0000-4000-8000-000000000001',
  nombre: 'FitZone Norte',
  activa: true,
  aforo_max: 80,
  ocupacion: 3,
  reservas_del_dia: 4,
  clases_del_dia: 2,
  fecha: '2026-11-17',
};

const SUR: FilaReporteSede = {
  id: 'a1000000-0000-4000-8000-000000000002',
  nombre: 'FitZone Sur',
  activa: false,
  aforo_max: 50,
  ocupacion: 1,
  reservas_del_dia: 0,
  clases_del_dia: 1,
  fecha: '2026-11-17T00:00:00.000Z',
};

describe('ReportesService', () => {
  let service: ReportesService;
  const reportes = { listar: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportesService,
        { provide: ReportesResumenRepository, useValue: reportes },
      ],
    }).compile();

    service = module.get(ReportesService);
  });

  it('suma la cadena y copia el día de la vista', async () => {
    reportes.listar.mockResolvedValue([NORTE, SUR]);

    await expect(service.resumen()).resolves.toEqual({
      fecha: '2026-11-17',
      sedes: [
        {
          id: NORTE.id,
          nombre: NORTE.nombre,
          activa: true,
          aforo_max: 80,
          ocupacion: 3,
          reservas_del_dia: 4,
          clases_del_dia: 2,
        },
        {
          id: SUR.id,
          nombre: SUR.nombre,
          activa: false,
          aforo_max: 50,
          ocupacion: 1,
          reservas_del_dia: 0,
          clases_del_dia: 1,
        },
      ],
      cadena: {
        ocupacion: 4,
        aforo_max: 130,
        reservas_del_dia: 4,
        clases_del_dia: 3,
      },
    });
  });

  it('acepta conteos que llegan como texto', async () => {
    reportes.listar.mockResolvedValue([
      {
        ...NORTE,
        aforo_max: '80',
        ocupacion: '3',
        reservas_del_dia: '4',
        clases_del_dia: '2',
      },
    ]);

    const resumen = await service.resumen();

    expect(resumen.sedes[0]).toMatchObject({
      aforo_max: 80,
      ocupacion: 3,
      reservas_del_dia: 4,
      clases_del_dia: 2,
    });
    expect(resumen.cadena.ocupacion).toBe(3);
  });

  it('sin sedes devuelve ceros y un día de Argentina', async () => {
    reportes.listar.mockResolvedValue([]);

    const resumen = await service.resumen();

    expect(resumen.sedes).toEqual([]);
    expect(resumen.cadena).toEqual({
      ocupacion: 0,
      aforo_max: 0,
      reservas_del_dia: 0,
      clases_del_dia: 0,
    });
    expect(resumen.fecha).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
