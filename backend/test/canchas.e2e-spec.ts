import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PerfilesRolRepository } from './../src/auth/perfiles-rol.repository';
import { SUPABASE_JWKS } from './../src/auth/supabase-jwt.service';
import { CanchasRepository } from './../src/canchas/canchas.repository';
import { createTestSigner, type TestSigner } from './support/supabase-jwt';

const SEDE_CENTRAL_ID = 'a1000000-0000-4000-8000-000000000001';
const CANCHA_PADDLE_ID = 'a3000000-0000-4000-8000-000000000001';
const USER_ID = '3f1c2a9e-8b7d-4c6e-9a1f-2b3c4d5e6f70';

describe('Canchas API REST — S4-T06 (e2e)', () => {
  let app: INestApplication<App>;
  let signer: TestSigner;

  const canchasRepo = {
    existeSede: jest.fn(),
    esAdminDeSede: jest.fn(),
    findBySede: jest.fn(),
    findById: jest.fn(),
    crearCancha: jest.fn(),
    actualizarCancha: jest.fn(),
    findMantenimientosPorCancha: jest.fn(),
    findMantenimientosEnRango: jest.fn(),
    crearMantenimiento: jest.fn(),
    findMantenimientoById: jest.fn(),
    eliminarMantenimiento: jest.fn(),
    findReservasActivasEnRango: jest.fn(),
    findConfiguracionPico: jest.fn(),
    upsertConfiguracionPico: jest.fn(),
    findConfiguracionCadena: jest.fn(),
    actualizarDescuentoSocio: jest.fn(),
  };

  const perfilesRolRepo = {
    findRol: jest.fn(),
  };

  beforeAll(async () => {
    signer = await createTestSigner();
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    canchasRepo.existeSede.mockResolvedValue(true);
    canchasRepo.esAdminDeSede.mockResolvedValue(true);
    canchasRepo.findBySede.mockResolvedValue([
      {
        id: CANCHA_PADDLE_ID,
        sede_id: SEDE_CENTRAL_ID,
        tipo: 'paddle',
        nombre: 'Paddle 1',
        precio_hora: 20_000,
        activa: true,
        created_at: '2026-10-27T20:00:00.000Z',
      },
    ]);
    canchasRepo.findConfiguracionPico.mockResolvedValue({
      sede_id: SEDE_CENTRAL_ID,
      recargo_pct: 20,
      desde: '19:00:00',
      hasta: '21:00:00',
      dias: [1, 2, 3, 4, 5, 6, 7],
    });
    canchasRepo.findConfiguracionCadena.mockResolvedValue({
      id: true,
      descuento_socio_pct: 15,
      minutos_hold_reserva: 10,
    });
    canchasRepo.findReservasActivasEnRango.mockResolvedValue([]);
    canchasRepo.findMantenimientosEnRango.mockResolvedValue([]);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(SUPABASE_JWKS)
      .useValue(signer.jwks)
      .overrideProvider(CanchasRepository)
      .useValue(canchasRepo)
      .overrideProvider(PerfilesRolRepository)
      .useValue(perfilesRolRepo)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET /canchas?sedeId=... es público y devuelve las canchas activas', async () => {
    const res = await request(app.getHttpServer())
      .get(`/canchas?sedeId=${SEDE_CENTRAL_ID}`)
      .expect(200);

    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toMatchObject({
      id: CANCHA_PADDLE_ID,
      sedeId: SEDE_CENTRAL_ID,
      nombre: 'Paddle 1',
      tipo: 'paddle',
      precioHora: 20_000,
    });
  });

  it('GET /canchas/disponibilidad devuelve grilla con precios Strategy sin requerir token', async () => {
    const res = await request(app.getHttpServer())
      .get(`/canchas/disponibilidad?sedeId=${SEDE_CENTRAL_ID}&fecha=2026-11-10`)
      .expect(200);

    expect(res.body.sedeId).toBe(SEDE_CENTRAL_ID);
    expect(res.body.descuentoSocioPct).toBe(15);
    expect(res.body.canchas).toHaveLength(1);
    const turnoPico = res.body.canchas[0].turnos.find(
      (t: { hora: string }) => t.hora === '19:00',
    );
    expect(turnoPico).toMatchObject({
      estado: 'disponible',
      esHorarioPico: true,
      precioExterno: 24_000,
      precioSocio: 20_400,
    });
  });

  it('POST /canchas exige token (401) y rechaza rol socio (403)', async () => {
    await request(app.getHttpServer()).post('/canchas').send({}).expect(401);

    perfilesRolRepo.findRol.mockResolvedValue('socio');
    const tokenSocio = await signer.sign({ sub: USER_ID });

    await request(app.getHttpServer())
      .post('/canchas')
      .set('Authorization', `Bearer ${tokenSocio}`)
      .send({
        sedeId: SEDE_CENTRAL_ID,
        nombre: 'Paddle 2',
        tipo: 'paddle',
        precioHora: 20_000,
      })
      .expect(403);
  });

  it('PUT /configuracion/descuento-socio solo admite rol gerente', async () => {
    perfilesRolRepo.findRol.mockResolvedValue('admin_sede');
    const tokenAdmin = await signer.sign({ sub: USER_ID });

    await request(app.getHttpServer())
      .put('/configuracion/descuento-socio')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ descuentoSocioPct: 10 })
      .expect(403);

    perfilesRolRepo.findRol.mockResolvedValue('gerente');
    canchasRepo.actualizarDescuentoSocio.mockResolvedValue({
      id: true,
      descuento_socio_pct: 10,
    });
    const tokenGerente = await signer.sign({ sub: USER_ID });

    const res = await request(app.getHttpServer())
      .put('/configuracion/descuento-socio')
      .set('Authorization', `Bearer ${tokenGerente}`)
      .send({ descuentoSocioPct: 10 })
      .expect(200);

    expect(res.body).toEqual({ descuentoSocioPct: 10 });
  });
});
