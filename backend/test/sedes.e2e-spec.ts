import { Test } from '@nestjs/testing';
import { INestApplication, Logger } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { SupabaseService } from './../src/supabase/supabase.service';

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
    await app.close();
  });
});
