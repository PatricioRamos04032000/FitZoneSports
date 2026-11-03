import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { setupCors } from './../src/cors';

describe('CORS (e2e)', () => {
  let app: INestApplication<App>;
  const corsOriginOriginal = process.env.CORS_ORIGIN;

  beforeEach(async () => {
    process.env.CORS_ORIGIN = 'https://fitzone.vercel.app,http://localhost:5173';
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    setupCors(app);
    await app.init();
  });

  it('permite el preflight de un origen habilitado con Authorization', async () => {
    const res = await request(app.getHttpServer())
      .options('/auth/me')
      .set('Origin', 'https://fitzone.vercel.app')
      .set('Access-Control-Request-Method', 'GET')
      .set('Access-Control-Request-Headers', 'authorization,content-type')
      .expect(204);

    expect(res.headers['access-control-allow-origin']).toBe(
      'https://fitzone.vercel.app',
    );
    expect(res.headers['access-control-allow-headers']).toBe(
      'authorization,content-type',
    );
  });

  it('no habilita un origen desconocido', async () => {
    const res = await request(app.getHttpServer())
      .get('/health')
      .set('Origin', 'https://otro-sitio.com')
      .expect(200);

    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });

  afterEach(async () => {
    await app.close();
    if (corsOriginOriginal === undefined) delete process.env.CORS_ORIGIN;
    else process.env.CORS_ORIGIN = corsOriginOriginal;
  });
});
