import { Test } from '@nestjs/testing';
import { INestApplication, Logger } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { PerfilesRolRepository } from './../src/common/perfiles-rol.repository';
import { SUPABASE_JWKS } from './../src/common/supabase-jwt.service';
import { AppModule } from './../src/app.module';
import { SedesRepository } from './../src/usuarios/sedes/sedes.repository';
import { SupabaseService } from './../src/supabase/supabase.service';
import { createTestSigner, type TestSigner } from './support/supabase-jwt';

describe('Sedes (e2e)', () => {
  let app: INestApplication<App>;
  const select = jest.fn();

  beforeEach(async () => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(SupabaseService)
      .useValue({ getClient: () => ({ from: () => ({ select }) }) })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('GET /sedes devuelve las sedes del repositorio', async () => {
    const sedes = [{ id: '1', nombre: 'FitZone Central' }];
    select.mockResolvedValue({ data: sedes, error: null });

    const res = await request(app.getHttpServer()).get('/sedes').expect(200);

    expect(res.body).toEqual(sedes);
  });

  it('GET /sedes responde 500 genérico si falla Supabase', async () => {
    select.mockResolvedValue({
      data: null,
      error: { message: 'permission denied for table sedes', code: '42501' },
    });

    const res = await request(app.getHttpServer()).get('/sedes').expect(500);

    expect(res.body.message).toBe('Error al acceder a los datos');
    expect(JSON.stringify(res.body)).not.toContain('permission denied');
  });

  afterEach(async () => {
    await app?.close();
  });
});

describe('Sedes alta y edición (e2e)', () => {
  let app: INestApplication<App>;
  let signer: TestSigner;

  const USER_ID = '3f1c2a9e-8b7d-4c6e-9a1f-2b3c4d5e6f70';
  const SEDE_ID = 'a1000000-0000-4000-8000-000000000009';
  const sedeCreada = {
    id: SEDE_ID,
    nombre: 'FitZone Sur',
    direccion: null,
    aforo_max: 50,
    activa: true,
    created_at: '2026-11-14T20:00:00.000Z',
  };

  const sedesRepository = {
    findAll: jest.fn(),
    crear: jest.fn(),
    actualizar: jest.fn(),
  };
  const perfilesRolRepo = { findRol: jest.fn() };

  beforeAll(async () => {
    signer = await createTestSigner();
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    sedesRepository.crear.mockResolvedValue(sedeCreada);
    sedesRepository.actualizar.mockResolvedValue({
      ...sedeCreada,
      aforo_max: 90,
    });

    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(SUPABASE_JWKS)
      .useValue(signer.jwks)
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

  it('POST /sedes exige token (401) y rechaza socio y admin_sede (403)', async () => {
    await request(app.getHttpServer())
      .post('/sedes')
      .send({ nombre: 'FitZone Sur' })
      .expect(401);

    for (const rol of ['socio', 'admin_sede'] as const) {
      perfilesRolRepo.findRol.mockResolvedValue(rol);
      const token = await signer.sign({ sub: USER_ID });
      await request(app.getHttpServer())
        .post('/sedes')
        .set('Authorization', `Bearer ${token}`)
        .send({ nombre: 'FitZone Sur' })
        .expect(403);
    }

    expect(sedesRepository.crear).not.toHaveBeenCalled();
  });

  it('POST /sedes crea la sede cuando el rol es gerente (201)', async () => {
    perfilesRolRepo.findRol.mockResolvedValue('gerente');
    const token = await signer.sign({ sub: USER_ID });

    const res = await request(app.getHttpServer())
      .post('/sedes')
      .set('Authorization', `Bearer ${token}`)
      .send({ nombre: 'FitZone Sur' })
      .expect(201);

    expect(res.body).toEqual(sedeCreada);
    expect(sedesRepository.crear).toHaveBeenCalledWith({
      nombre: 'FitZone Sur',
      direccion: null,
      aforo_max: 50,
      activa: true,
    });
  });

  it('PATCH /sedes/:id exige token (401), rechaza admin_sede (403) y actualiza con gerente (200)', async () => {
    await request(app.getHttpServer())
      .patch(`/sedes/${SEDE_ID}`)
      .send({ aforo_max: 90 })
      .expect(401);

    perfilesRolRepo.findRol.mockResolvedValue('admin_sede');
    const tokenAdmin = await signer.sign({ sub: USER_ID });
    await request(app.getHttpServer())
      .patch(`/sedes/${SEDE_ID}`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ aforo_max: 90 })
      .expect(403);

    perfilesRolRepo.findRol.mockResolvedValue('gerente');
    const tokenGerente = await signer.sign({ sub: USER_ID });
    const res = await request(app.getHttpServer())
      .patch(`/sedes/${SEDE_ID}`)
      .set('Authorization', `Bearer ${tokenGerente}`)
      .send({ aforo_max: 90 })
      .expect(200);

    expect(res.body).toMatchObject({ id: SEDE_ID, aforo_max: 90 });
    expect(sedesRepository.actualizar).toHaveBeenCalledWith(SEDE_ID, {
      aforo_max: 90,
    });
  });
});
