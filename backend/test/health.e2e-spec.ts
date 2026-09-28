import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { SWAGGER_PATH, setupSwagger } from './../src/swagger';

describe('Health y Swagger (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    setupSwagger(app);
    await app.init();
  });

  it('/health (GET)', async () => {
    const res = await request(app.getHttpServer()).get('/health').expect(200);

    expect(res.body.status).toBe('ok');
    expect(typeof res.body.timestamp).toBe('string');
    expect(typeof res.body.uptime).toBe('number');
  });

  it('documenta /health en el JSON de Swagger', async () => {
    const res = await request(app.getHttpServer())
      .get(`/${SWAGGER_PATH}-json`)
      .expect(200);

    expect(res.body.paths['/health']).toBeDefined();
  });

  afterEach(async () => {
    await app.close();
  });
});
