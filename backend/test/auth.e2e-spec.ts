import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PerfilesRolRepository } from './../src/auth/perfiles-rol.repository';
import { SUPABASE_JWKS } from './../src/auth/supabase-jwt.service';
import { createTestSigner, type TestSigner } from './support/supabase-jwt';

describe('Auth /auth/me (e2e)', () => {
  let app: INestApplication<App>;
  let signer: TestSigner;

  beforeAll(async () => {
    signer = await createTestSigner();
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(SUPABASE_JWKS)
      .useValue(signer.jwks)
      .overrideProvider(PerfilesRolRepository)
      .useValue({ findRol: jest.fn().mockResolvedValue('gerente') })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('devuelve 401 sin token', () => {
    return request(app.getHttpServer()).get('/auth/me').expect(401);
  });

  it('devuelve 401 con un token inválido', () => {
    return request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', 'Bearer no-es-un-jwt')
      .expect(401);
  });

  it('devuelve el usuario con un token válido', async () => {
    const token = await signer.sign({
      sub: '3f1c2a9e-8b7d-4c6e-9a1f-2b3c4d5e6f70',
      email: 'gerente@fitzone.com',
    });

    const res = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toEqual({
      id: '3f1c2a9e-8b7d-4c6e-9a1f-2b3c4d5e6f70',
      email: 'gerente@fitzone.com',
      role: 'authenticated',
      rol: 'gerente',
    });
  });

  afterEach(async () => {
    await app.close();
  });
});
