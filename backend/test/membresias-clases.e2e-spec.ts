import { ForbiddenException, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PerfilesRolRepository } from './../src/auth/perfiles-rol.repository';
import { SUPABASE_JWKS } from './../src/auth/supabase-jwt.service';
import { ClasesService } from './../src/clases/clases.service';
import { MembresiasService } from './../src/membresias/membresias.service';
import { setupSwagger } from './../src/swagger';
import { createTestSigner, type TestSigner } from './support/supabase-jwt';

const SEDE_ID = '42363e91-8c03-4d52-b160-5c1345be8656';
const CLASE_ID = 'c1000000-0000-4000-8000-000000000001';
const INSCRIPCION_ID = 'd1000000-0000-4000-8000-000000000001';
const ESPERA_ID = 'e1000000-0000-4000-8000-000000000001';
const SOCIO_ID = 'a1000000-0000-4000-8000-000000000001';
const OTRO_SOCIO_ID = 'a1000000-0000-4000-8000-000000000002';

describe('Membresías, Clases y Lista de Espera — Seguridad y Swagger (e2e)', () => {
  let app: INestApplication<App>;
  let signer: TestSigner;
  let tokenSocio: string;

  const perfiles = { findRol: jest.fn() };
  const clasesService = {
    findConCupoPorSede: jest.fn().mockResolvedValue([]),
    listarMisInscripciones: jest.fn().mockResolvedValue([]),
    listarMiListaEspera: jest.fn().mockResolvedValue([]),
    inscribir: jest.fn().mockResolvedValue({
      id: INSCRIPCION_ID,
      clase_id: CLASE_ID,
      perfil_id: SOCIO_ID,
      estado: 'inscripto',
      created_at: '2026-11-04T19:00:00Z',
      cancelacion_tardia: false,
    }),
    cancelar: jest.fn().mockResolvedValue(undefined),
    anotarseEnListaEspera: jest.fn().mockResolvedValue({
      id: ESPERA_ID,
      clase_id: CLASE_ID,
      perfil_id: SOCIO_ID,
      estado: 'esperando',
      created_at: '2026-11-04T20:00:00Z',
    }),
    confirmarLugarEspera: jest.fn().mockResolvedValue({
      id: INSCRIPCION_ID,
      clase_id: CLASE_ID,
      perfil_id: SOCIO_ID,
      estado: 'inscripto',
      created_at: '2026-11-04T20:05:00Z',
      cancelacion_tardia: false,
    }),
    retirarDeListaEspera: jest.fn().mockResolvedValue(undefined),
  };
  const membresiasService = {
    listarPlanes: jest.fn().mockResolvedValue([]),
    obtenerMia: jest.fn().mockResolvedValue({
      id: 'b1000000-0000-4000-8000-000000000001',
      perfil_id: SOCIO_ID,
      plan: 'mensual',
      estado: 'activo',
      vigente_desde: '2026-11-01',
      vigente_hasta: '2026-12-01',
    }),
    findAll: jest.fn().mockResolvedValue([]),
    findActivaPorPerfil: jest.fn(),
    crear: jest.fn().mockResolvedValue({
      id: 'b1000000-0000-4000-8000-000000000001',
      perfil_id: SOCIO_ID,
      plan: 'mensual',
      estado: 'activo',
      vigente_desde: '2026-11-04',
      vigente_hasta: '2026-12-04',
    }),
  };

  beforeAll(async () => {
    signer = await createTestSigner();
    tokenSocio = await signer.sign({ sub: SOCIO_ID });
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(SUPABASE_JWKS)
      .useValue(signer.jwks)
      .overrideProvider(PerfilesRolRepository)
      .useValue(perfiles)
      .overrideProvider(ClasesService)
      .useValue(clasesService)
      .overrideProvider(MembresiasService)
      .useValue(membresiasService)
      .compile();

    app = moduleFixture.createNestApplication();
    setupSwagger(app);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('401 sin token Bearer', () => {
    it('rechaza endpoints protegidos de clases, lista de espera y membresías sin autenticación', async () => {
      await request(app.getHttpServer())
        .get(`/clases?sedeId=${SEDE_ID}`)
        .expect(401);
      await request(app.getHttpServer())
        .post('/clases/inscripciones')
        .send({ claseId: CLASE_ID })
        .expect(401);
      await request(app.getHttpServer())
        .delete(`/clases/inscripciones/${INSCRIPCION_ID}`)
        .expect(401);
      await request(app.getHttpServer())
        .get('/clases/lista-espera/mias')
        .expect(401);
      await request(app.getHttpServer())
        .post('/clases/lista-espera')
        .send({ claseId: CLASE_ID })
        .expect(401);
      await request(app.getHttpServer())
        .post(`/clases/lista-espera/${ESPERA_ID}/confirmar`)
        .expect(401);
      await request(app.getHttpServer())
        .delete(`/clases/lista-espera/${ESPERA_ID}`)
        .expect(401);
      await request(app.getHttpServer()).get('/membresias/mia').expect(401);
      await request(app.getHttpServer()).get('/membresias').expect(401);
      await request(app.getHttpServer())
        .post('/membresias')
        .send({ perfil_id: SOCIO_ID, plan: 'mensual' })
        .expect(401);
    });
  });

  describe('403 por rol insuficiente o titularidad ajena', () => {
    it('impide a un externo inscribirse, entrar a lista de espera o consultar /membresias/mia', async () => {
      perfiles.findRol.mockResolvedValue('externo');

      await request(app.getHttpServer())
        .post('/clases/inscripciones')
        .set('Authorization', `Bearer ${tokenSocio}`)
        .send({ claseId: CLASE_ID })
        .expect(403);

      await request(app.getHttpServer())
        .post('/clases/lista-espera')
        .set('Authorization', `Bearer ${tokenSocio}`)
        .send({ claseId: CLASE_ID })
        .expect(403);

      await request(app.getHttpServer())
        .get('/membresias/mia')
        .set('Authorization', `Bearer ${tokenSocio}`)
        .expect(403);
    });

    it('impide a un socio listar todas las membresías, ver activas ajenas o crear membresías', async () => {
      perfiles.findRol.mockResolvedValue('socio');

      await request(app.getHttpServer())
        .get('/membresias')
        .set('Authorization', `Bearer ${tokenSocio}`)
        .expect(403);

      await request(app.getHttpServer())
        .get(`/membresias/activas/${OTRO_SOCIO_ID}`)
        .set('Authorization', `Bearer ${tokenSocio}`)
        .expect(403);

      await request(app.getHttpServer())
        .post('/membresias')
        .set('Authorization', `Bearer ${tokenSocio}`)
        .send({ perfil_id: SOCIO_ID, plan: 'mensual' })
        .expect(403);
    });

    it('devuelve 403 cuando un socio intenta cancelar o confirmar recursos de otro usuario', async () => {
      perfiles.findRol.mockResolvedValue('socio');
      clasesService.cancelar.mockRejectedValueOnce(
        new ForbiddenException('No podés cancelar la inscripción de otro usuario'),
      );
      clasesService.confirmarLugarEspera.mockRejectedValueOnce(
        new ForbiddenException('No podés confirmar el lugar de otro usuario'),
      );

      await request(app.getHttpServer())
        .delete(`/clases/inscripciones/${INSCRIPCION_ID}`)
        .set('Authorization', `Bearer ${tokenSocio}`)
        .expect(403);

      await request(app.getHttpServer())
        .post(`/clases/lista-espera/${ESPERA_ID}/confirmar`)
        .set('Authorization', `Bearer ${tokenSocio}`)
        .expect(403);
    });
  });

  describe('Flujo de lista de espera e identidad desde el JWT', () => {
    it('usa siempre el sub del JWT al inscribir, anotarse, confirmar y retirarse de lista de espera', async () => {
      perfiles.findRol.mockResolvedValue('socio');

      await request(app.getHttpServer())
        .post('/clases/inscripciones')
        .set('Authorization', `Bearer ${tokenSocio}`)
        .send({ claseId: CLASE_ID, perfilId: OTRO_SOCIO_ID })
        .expect(201);
      expect(clasesService.inscribir).toHaveBeenCalledWith(CLASE_ID, SOCIO_ID);

      await request(app.getHttpServer())
        .post('/clases/lista-espera')
        .set('Authorization', `Bearer ${tokenSocio}`)
        .send({ claseId: CLASE_ID, perfilId: OTRO_SOCIO_ID })
        .expect(201);
      expect(clasesService.anotarseEnListaEspera).toHaveBeenCalledWith(
        CLASE_ID,
        SOCIO_ID,
      );

      await request(app.getHttpServer())
        .post(`/clases/lista-espera/${ESPERA_ID}/confirmar`)
        .set('Authorization', `Bearer ${tokenSocio}`)
        .expect(200);
      expect(clasesService.confirmarLugarEspera).toHaveBeenCalledWith(
        ESPERA_ID,
        SOCIO_ID,
      );

      await request(app.getHttpServer())
        .delete(`/clases/lista-espera/${ESPERA_ID}`)
        .set('Authorization', `Bearer ${tokenSocio}`)
        .expect(204);
      expect(clasesService.retirarDeListaEspera).toHaveBeenCalledWith(
        ESPERA_ID,
        SOCIO_ID,
        'socio',
      );
    });

    it('permite a admin_sede dar de alta membresías y responde 400 ante UUIDs inválidos', async () => {
      perfiles.findRol.mockResolvedValue('admin_sede');

      await request(app.getHttpServer())
        .post('/membresias')
        .set('Authorization', `Bearer ${tokenSocio}`)
        .send({ perfil_id: SOCIO_ID, plan: 'mensual' })
        .expect(201);

      await request(app.getHttpServer())
        .get('/clases?sedeId=no-es-uuid')
        .set('Authorization', `Bearer ${tokenSocio}`)
        .expect(400);

      await request(app.getHttpServer())
        .post('/clases/lista-espera/no-es-uuid/confirmar')
        .set('Authorization', `Bearer ${tokenSocio}`)
        .expect(403);
    });

    it('documenta canchas, perfiles, membresías, clases y lista de espera en el OpenAPI JSON de Swagger', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/docs-json')
        .expect(200);

      const paths = Object.keys(res.body.paths as Record<string, unknown>);
      expect(paths).toEqual(
        expect.arrayContaining([
          '/canchas',
          '/canchas/disponibilidad',
          '/perfiles/me',
          '/membresias/mia',
          '/membresias/planes',
          '/clases',
          '/clases/inscripciones',
          '/clases/lista-espera',
          '/clases/lista-espera/mias',
          '/clases/lista-espera/{id}/confirmar',
          '/clases/lista-espera/{id}',
        ]),
      );
    });
  });
});
