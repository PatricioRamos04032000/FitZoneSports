import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { ReportesController } from './reportes.controller';
import { ReportesService } from './reportes.service';

describe('ReportesController', () => {
  const resumen = {
    fecha: '2026-11-17',
    sedes: [],
    cadena: {
      ocupacion: 0,
      aforo_max: 0,
      reservas_del_dia: 0,
      clases_del_dia: 0,
    },
  };

  it('delega el resumen en el servicio', async () => {
    const reportesService = { resumen: jest.fn().mockResolvedValue(resumen) };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportesController],
      providers: [{ provide: ReportesService, useValue: reportesService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    const controller = module.get(ReportesController);

    await expect(controller.resumen()).resolves.toEqual(resumen);
    expect(reportesService.resumen).toHaveBeenCalled();
  });
});
