import { Test } from '@nestjs/testing';
import { INestApplication, Logger } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { SUPABASE_JWKS } from './../src/auth/supabase-jwt.service';
import { ListaEsperaPublisher } from './../src/notificaciones/lista-espera.publisher';
import { NotificacionesRepository } from './../src/notificaciones/notificaciones.repository';
import { PreferenciasRepository } from './../src/notificaciones/preferencias.repository';
import { createTestSigner, type TestSigner } from './support/supabase-jwt';

const PERFIL_ID = '3f1c2a9e-8b7d-4c6e-9a1f-2b3c4d5e6f70';

describe('Notificaciones (e2e)', () => {
  let app: INestApplication<App>;
  let signer: TestSigner;
  let token: string;
  const notificaciones = {
    crear: jest.fn(),
    findByPerfil: jest.fn(),
    marcarLeida: jest.fn(),
  };
  const preferencias = {
    findByPerfil: jest.fn(),
    actualizar: jest.fn(),
    findEmail: jest.fn(),
  };

  beforeAll(async () => {
    signer = await createTestSigner();
    token = await signer.sign({ sub: PERFIL_ID, email: 'socio@fitzone.com' });
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(SUPABASE_JWKS)
      .useValue(signer.jwks)
      .overrideProvider(NotificacionesRepository)
      .useValue(notificaciones)
      .overrideProvider(PreferenciasRepository)
      .useValue(preferencias)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  const auth = () => ({ Authorization: `Bearer ${token}` });

  it('exige token', () => {
    return request(app.getHttpServer()).get('/notificaciones').expect(401);
  });

  it('GET /notificaciones lista las del usuario del token', async () => {
    notificaciones.findByPerfil.mockResolvedValue([{ id: 'n1' }]);

    const res = await request(app.getHttpServer())
      .get('/notificaciones')
      .set(auth())
      .expect(200);

    expect(res.body).toEqual([{ id: 'n1' }]);
    expect(notificaciones.findByPerfil).toHaveBeenCalledWith(PERFIL_ID);
  });

  it('PATCH /notificaciones/:id/leida valida el id y responde 404 si no es suya', async () => {
    await request(app.getHttpServer())
      .patch('/notificaciones/no-es-uuid/leida')
      .set(auth())
      .expect(400);

    notificaciones.marcarLeida.mockResolvedValue(null);
    await request(app.getHttpServer())
      .patch('/notificaciones/9b1d6c2e-1a2b-4c3d-8e9f-0a1b2c3d4e5f/leida')
      .set(auth())
      .expect(404);
  });

  it('PATCH /notificaciones/preferencias exige un booleano', async () => {
    await request(app.getHttpServer())
      .patch('/notificaciones/preferencias')
      .set(auth())
      .send({ notificar_por_email: 'si' })
      .expect(400);

    preferencias.actualizar.mockResolvedValue({ notificar_por_email: true });
    const res = await request(app.getHttpServer())
      .patch('/notificaciones/preferencias')
      .set(auth())
      .send({ notificar_por_email: true })
      .expect(200);

    expect(res.body).toEqual({ notificar_por_email: true });
    expect(preferencias.actualizar).toHaveBeenCalledWith(PERFIL_ID, {
      notificar_por_email: true,
    });
  });

  it('al liberarse un lugar, los observadores registrados con @OnEvent guardan la notificación in-app', async () => {
    preferencias.findByPerfil.mockResolvedValue({ notificar_por_email: false });

    app.get(ListaEsperaPublisher).notificarLugaresLiberados(
      { id: 'c1', tipo: 'Spinning', inicio: '2026-10-07T21:00:00Z' },
      [{ id: 'e1', perfil_id: PERFIL_ID, vence_en: '2026-10-07T19:30:00Z' }],
    );
    for (let i = 0; i < 10; i++) {
      await new Promise((resolve) => setImmediate(resolve));
    }

    expect(notificaciones.crear).toHaveBeenCalledWith(
      expect.objectContaining({ perfil_id: PERFIL_ID, tipo: 'lugar_liberado' }),
    );
    expect(preferencias.findByPerfil).toHaveBeenCalledWith(PERFIL_ID);
  });

  afterEach(async () => {
    await app.close();
  });
});
