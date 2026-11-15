import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { PerfilesRolRepository } from './../src/common/perfiles-rol.repository';
import { SUPABASE_JWKS } from './../src/common/supabase-jwt.service';
import { AppModule } from './../src/app.module';
import { ClasesRepository } from './../src/clases/clases.repository';
import { SedesRepository } from './../src/usuarios/sedes/sedes.repository';
import { createTestSigner, type TestSigner } from './support/supabase-jwt';

describe('Clases agenda (e2e)', () => {
  let app: INestApplication<App>;
  let signer: TestSigner;

  const USER_ID = '3f1c2a9e-8b7d-4c6e-9a1f-2b3c4d5e6f70';
  const SEDE_ID = '42363e91-8c03-4d52-b160-5c1345be8656';
  const CLASE_ID = 'c1000000-0000-4000-8000-000000000001';
  const INICIO = '2026-11-20T18:00:00-03:00';
  const FIN = '2026-11-20T19:00:00-03:00';

  const claseCreada = {
    id: CLASE_ID,
    sede_id: SEDE_ID,
    tipo: 'Yoga',
    instructor: 'Ana Pérez',
    inicio: new Date(INICIO).toISOString(),
    fin: new Date(FIN).toISOString(),
    capacidad_max: 12,
    estado: 'programada' as const,
    created_at: '2026-11-14T20:00:00.000Z',
  };
  const alta = {
    sedeId: SEDE_ID,
    tipo: 'Yoga',
    instructor: 'Ana Pérez',
    inicio: INICIO,
    fin: FIN,
    capacidadMax: 12,
  };

  const clasesRepository = {
    crear: jest.fn(),
    actualizar: jest.fn(),
    findById: jest.fn(),
    findConCupoById: jest.fn(),
  };
  const sedesRepository = { findById: jest.fn() };
  const perfilesRolRepo = { findRol: jest.fn() };

  beforeAll(async () => {
    signer = await createTestSigner();
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    sedesRepository.findById.mockResolvedValue({
      id: SEDE_ID,
      nombre: 'FitZone Central',
      direccion: null,
      aforo_max: 100,
      activa: true,
      created_at: '2026-11-01T10:00:00.000Z',
    });
    clasesRepository.crear.mockResolvedValue(claseCreada);
    clasesRepository.findById.mockResolvedValue(claseCreada);
    clasesRepository.actualizar.mockResolvedValue({
      ...claseCreada,
      instructor: 'Lucía Fernández',
    });

    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(SUPABASE_JWKS)
      .useValue(signer.jwks)
      .overrideProvider(ClasesRepository)
      .useValue(clasesRepository)
      .overrideProvider(SedesRepository)
      .useValue(sedesRepository)
      .overrideProvider(PerfilesRolRepository)
      .useValue(perfilesRolRepo)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app?.close();
  });

  it('POST /clases exige token (401) y rechaza socio, admin_sede y externo (403)', async () => {
    await request(app.getHttpServer()).post('/clases').send(alta).expect(401);

    for (const rol of ['socio', 'admin_sede', 'externo'] as const) {
      perfilesRolRepo.findRol.mockResolvedValue(rol);
      const token = await signer.sign({ sub: USER_ID });
      await request(app.getHttpServer())
        .post('/clases')
        .set('Authorization', `Bearer ${token}`)
        .send(alta)
        .expect(403);
    }

    expect(clasesRepository.crear).not.toHaveBeenCalled();
  });

  it('POST /clases crea la clase cuando el rol es gerente (201)', async () => {
    perfilesRolRepo.findRol.mockResolvedValue('gerente');
    const token = await signer.sign({ sub: USER_ID });

    const res = await request(app.getHttpServer())
      .post('/clases')
      .set('Authorization', `Bearer ${token}`)
      .send(alta)
      .expect(201);

    expect(res.body).toEqual(claseCreada);
    expect(clasesRepository.crear).toHaveBeenCalledWith({
      sede_id: SEDE_ID,
      tipo: 'Yoga',
      instructor: 'Ana Pérez',
      inicio: new Date(INICIO).toISOString(),
      fin: new Date(FIN).toISOString(),
      capacidad_max: 12,
      estado: 'programada',
    });
  });

  it('PATCH /clases/:id exige token (401), rechaza admin_sede (403), niega el cambio de sede (400) y actualiza con gerente (200)', async () => {
    await request(app.getHttpServer())
      .patch(`/clases/${CLASE_ID}`)
      .send({ instructor: 'Lucía Fernández' })
      .expect(401);

    perfilesRolRepo.findRol.mockResolvedValue('admin_sede');
    const tokenAdmin = await signer.sign({ sub: USER_ID });
    await request(app.getHttpServer())
      .patch(`/clases/${CLASE_ID}`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ instructor: 'Lucía Fernández' })
      .expect(403);

    perfilesRolRepo.findRol.mockResolvedValue('gerente');
    const tokenGerente = await signer.sign({ sub: USER_ID });
    await request(app.getHttpServer())
      .patch(`/clases/${CLASE_ID}`)
      .set('Authorization', `Bearer ${tokenGerente}`)
      .send({ sedeId: SEDE_ID, instructor: 'Lucía Fernández' })
      .expect(400);

    const res = await request(app.getHttpServer())
      .patch(`/clases/${CLASE_ID}`)
      .set('Authorization', `Bearer ${tokenGerente}`)
      .send({ instructor: 'Lucía Fernández' })
      .expect(200);

    expect(res.body).toMatchObject({
      id: CLASE_ID,
      instructor: 'Lucía Fernández',
    });
    expect(clasesRepository.actualizar).toHaveBeenCalledTimes(1);
    expect(clasesRepository.actualizar).toHaveBeenCalledWith(CLASE_ID, {
      instructor: 'Lucía Fernández',
    });
  });
});
