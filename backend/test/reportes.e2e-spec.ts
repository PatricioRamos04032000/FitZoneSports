import { Test } from '@nestjs/testing';
import { INestApplication, Logger } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { PerfilesRolRepository } from '../src/common/perfiles-rol.repository';
import { SUPABASE_JWKS } from '../src/common/supabase-jwt.service';
import { AppModule } from '../src/app.module';
import { ReportesResumenRepository } from '../src/reportes/reportes-resumen.repository';
import { setupSwagger } from '../src/swagger';
import { createTestSigner, type TestSigner } from './support/supabase-jwt';

describe('Reportes resumen (e2e)', () => {
  let app: INestApplication<App>;
  let signer: TestSigner;

  const USER_ID = '3f1c2a9e-8b7d-4c6e-9a1f-2b3c4d5e6f70';
  const filas = [
    {
      id: 'a1000000-0000-4000-8000-000000000001',
      nombre: 'FitZone Central',
      activa: true,
      aforo_max: 50,
      ocupacion: 3,
      reservas_del_dia: 4,
      clases_del_dia: 2,
      fecha: '2026-11-17',
    },
  ];
  const esperado = {
    fecha: '2026-11-17',
    sedes: [
      {
        id: filas[0].id,
        nombre: 'FitZone Central',
        activa: true,
        aforo_max: 50,
        ocupacion: 3,
        reservas_del_dia: 4,
        clases_del_dia: 2,
      },
    ],
    cadena: {
      ocupacion: 3,
      aforo_max: 50,
      reservas_del_dia: 4,
      clases_del_dia: 2,
    },
  };

  const reportes = { listar: jest.fn() };
  const perfilesRolRepo = { findRol: jest.fn() };

  beforeAll(async () => {
    signer = await createTestSigner();
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    reportes.listar.mockResolvedValue(filas);

    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(SUPABASE_JWKS)
      .useValue(signer.jwks)
      .overrideProvider(ReportesResumenRepository)
      .useValue(reportes)
      .overrideProvider(PerfilesRolRepository)
      .useValue(perfilesRolRepo)
      .compile();

    app = moduleFixture.createNestApplication();
    setupSwagger(app);
    await app.init();
  });

  afterEach(async () => {
    await app?.close();
  });

  it('GET /reportes/resumen exige token (401) y rechaza socio y admin_sede (403)', async () => {
    await request(app.getHttpServer()).get('/reportes/resumen').expect(401);

    for (const rol of ['socio', 'admin_sede'] as const) {
      perfilesRolRepo.findRol.mockResolvedValue(rol);
      const token = await signer.sign({ sub: USER_ID });
      await request(app.getHttpServer())
        .get('/reportes/resumen')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    }

    expect(reportes.listar).not.toHaveBeenCalled();
  });

  it('GET /reportes/resumen devuelve las cifras cuando el rol es gerente', async () => {
    perfilesRolRepo.findRol.mockResolvedValue('gerente');
    const token = await signer.sign({ sub: USER_ID });

    const res = await request(app.getHttpServer())
      .get('/reportes/resumen')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toEqual(esperado);
    expect(reportes.listar).toHaveBeenCalledTimes(1);
  });

  it('documenta GET /reportes/resumen en el JSON de Swagger', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/docs-json')
      .expect(200);

    const operacion = res.body.paths['/reportes/resumen'].get;
    expect(operacion.responses['200']).toBeDefined();
    expect(operacion.responses['401']).toBeDefined();
    expect(operacion.responses['403']).toBeDefined();
    expect(
      operacion.responses['200'].content['application/json'].schema.$ref,
    ).toBe('#/components/schemas/ResumenReporteDto');
  });
});
