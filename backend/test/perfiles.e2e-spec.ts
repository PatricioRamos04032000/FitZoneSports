import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { SUPABASE_JWKS } from './../src/auth/supabase-jwt.service';
import { PerfilesRepository } from './../src/perfiles/perfiles.repository';
import type { Perfil } from './../src/perfiles/perfil.model';
import { createTestSigner, type TestSigner } from './support/supabase-jwt';

const PERFIL_ID = '3f1c2a9e-8b7d-4c6e-9a1f-2b3c4d5e6f70';

const PERFIL: Perfil = {
  id: PERFIL_ID,
  rol: 'socio',
  dni: '12345678',
  nombre: 'Lucas',
  apellido: 'Coquet',
  telefono: '343 1234567',
  foto_url: null,
  sede_home_id: '42363e91-8c03-4d52-b160-5c1345be8656',
  notificar_por_email: true,
  created_at: '2026-10-01T12:00:00+00:00',
};

describe('Perfiles /perfiles/me (e2e)', () => {
  let app: INestApplication<App>;
  let signer: TestSigner;
  const perfiles = {
    findById: jest.fn(),
    actualizar: jest.fn(),
  };

  beforeAll(async () => {
    signer = await createTestSigner();
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(SUPABASE_JWKS)
      .useValue(signer.jwks)
      .overrideProvider(PerfilesRepository)
      .useValue(perfiles)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('GET /perfiles/me responde 401 sin token', () => {
    return request(app.getHttpServer()).get('/perfiles/me').expect(401);
  });

  it('GET /perfiles/me devuelve el perfil del token', async () => {
    perfiles.findById.mockResolvedValue(PERFIL);
    const token = await signer.sign({
      sub: PERFIL_ID,
      email: 'socio@fitzone.com',
    });

    const res = await request(app.getHttpServer())
      .get('/perfiles/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(perfiles.findById).toHaveBeenCalledWith(PERFIL_ID);
    expect(res.body).toEqual({ ...PERFIL, email: 'socio@fitzone.com' });
  });

  it('GET /perfiles/me responde 404 sin fila de perfil', async () => {
    perfiles.findById.mockResolvedValue(null);
    const token = await signer.sign({ sub: PERFIL_ID });

    await request(app.getHttpServer())
      .get('/perfiles/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });

  it('PATCH /perfiles/me actualiza con el id del token', async () => {
    const actualizado = { ...PERFIL, telefono: '343 9999999' };
    perfiles.actualizar.mockResolvedValue(actualizado);
    const token = await signer.sign({
      sub: PERFIL_ID,
      email: 'socio@fitzone.com',
    });

    const res = await request(app.getHttpServer())
      .patch('/perfiles/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ telefono: '343 9999999' })
      .expect(200);

    expect(perfiles.actualizar).toHaveBeenCalledWith(PERFIL_ID, {
      telefono: '343 9999999',
    });
    expect(res.body).toEqual({ ...actualizado, email: 'socio@fitzone.com' });
  });

  it('PATCH /perfiles/me responde 400 con body vacío', async () => {
    const token = await signer.sign({ sub: PERFIL_ID });

    await request(app.getHttpServer())
      .patch('/perfiles/me')
      .set('Authorization', `Bearer ${token}`)
      .send({})
      .expect(400);

    expect(perfiles.actualizar).not.toHaveBeenCalled();
  });

  afterEach(async () => {
    await app.close();
  });
});
