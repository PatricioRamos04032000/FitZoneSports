import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PerfilesRolRepository } from './../src/common/perfiles-rol.repository';
import { SUPABASE_JWKS } from './../src/common/supabase-jwt.service';
import { ComprobantesService } from './../src/pagos/comprobantes/comprobantes.service';
import { PagosRepository } from './../src/pagos/pagos.repository';
import { createTestSigner, type TestSigner } from './support/supabase-jwt';

const SOCIO_ID = '11111111-1111-4111-8111-111111111111';
const OTRO_ID = '22222222-2222-4222-8222-222222222222';
const PAGO_ID = '33333333-3333-4333-8333-333333333333';
const RESERVA_ID = '44444444-4444-4444-8444-444444444444';

describe('Comprobantes PDF — C-04 / RF-14 (e2e)', () => {
  let app: INestApplication<App>;
  let signer: TestSigner;
  let comprobantes: ComprobantesService;

  const pagoAprobado = {
    id: PAGO_ID,
    perfil_id: SOCIO_ID,
    concepto: 'reserva_cancha' as const,
    monto: 20400,
    token_pasarela: 'sim-e2e-1',
    estado: 'aprobado' as const,
    reserva_cancha_id: RESERVA_ID,
    membresia_id: null,
    plan: null,
    created_at: '2026-11-15T22:00:00.000Z',
  };

  const pagosRepo = {
    findById: jest.fn(),
    findAprobadoPorReserva: jest.fn(),
    findAprobadosPorPerfil: jest.fn(),
    findPerfilComprobante: jest.fn(),
    findReservaComprobante: jest.fn(),
    findMembresiaComprobante: jest.fn(),
  };

  const perfilesRolRepo = {
    findRol: jest.fn(),
  };

  beforeAll(async () => {
    signer = await createTestSigner();
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    perfilesRolRepo.findRol.mockResolvedValue('socio');
    pagosRepo.findById.mockResolvedValue(pagoAprobado);
    pagosRepo.findAprobadoPorReserva.mockResolvedValue(pagoAprobado);
    pagosRepo.findAprobadosPorPerfil.mockResolvedValue([pagoAprobado]);
    pagosRepo.findPerfilComprobante.mockResolvedValue({
      id: SOCIO_ID,
      nombre: 'Socio',
      apellido: 'Demo',
      dni: '30111222',
    });
    pagosRepo.findReservaComprobante.mockResolvedValue({
      id: RESERVA_ID,
      cancha_id: 'cancha-1',
      perfil_id: SOCIO_ID,
      inicio: '2026-11-18T19:00:00-03:00',
      fin: '2026-11-18T20:00:00-03:00',
      precio: 20400,
      estado: 'confirmada',
      detalle: { precioBase: 20000, reglasAplicadas: ['StandardPricing'] },
      canchaNombre: 'Paddle 1',
      canchaTipo: 'paddle',
      sedeNombre: 'Sede Central',
      sedeDireccion: 'Av. Siempreviva 123',
    });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(SUPABASE_JWKS)
      .useValue(signer.jwks)
      .overrideProvider(PagosRepository)
      .useValue(pagosRepo)
      .overrideProvider(PerfilesRolRepository)
      .useValue(perfilesRolRepo)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    comprobantes = app.get(ComprobantesService);
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET /pagos/mios exige JWT y devuelve pagos aprobados del usuario', async () => {
    await request(app.getHttpServer()).get('/pagos/mios').expect(401);

    const token = await signer.sign({ sub: SOCIO_ID });
    const res = await request(app.getHttpServer())
      .get('/pagos/mios')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toMatchObject({
      id: PAGO_ID,
      concepto: 'reserva_cancha',
      monto: 20400,
      reservaCanchaId: RESERVA_ID,
    });
  });

  it('GET /pagos/:id/comprobante devuelve PDF al dueño y 403 a otro usuario', async () => {
    const tokenDueño = await signer.sign({ sub: SOCIO_ID });
    const pdfRes = await request(app.getHttpServer())
      .get(`/pagos/${PAGO_ID}/comprobante`)
      .set('Authorization', `Bearer ${tokenDueño}`)
      .buffer(true)
      .expect(200);

    expect(pdfRes.headers['content-type']).toContain('application/pdf');
    expect(Buffer.from(pdfRes.body).subarray(0, 5).toString('ascii')).toBe(
      '%PDF-',
    );

    const tokenOtro = await signer.sign({ sub: OTRO_ID });
    await request(app.getHttpServer())
      .get(`/pagos/${PAGO_ID}/comprobante`)
      .set('Authorization', `Bearer ${tokenOtro}`)
      .expect(403);
  });

  it('GET /canchas/reservas/:id/comprobante devuelve PDF de la reserva confirmada', async () => {
    const token = await signer.sign({ sub: SOCIO_ID });
    const pdfRes = await request(app.getHttpServer())
      .get(`/canchas/reservas/${RESERVA_ID}/comprobante`)
      .set('Authorization', `Bearer ${token}`)
      .buffer(true)
      .expect(200);

    expect(pdfRes.headers['content-type']).toContain('application/pdf');
    expect(Buffer.from(pdfRes.body).subarray(0, 5).toString('ascii')).toBe(
      '%PDF-',
    );
  });

  it('pasarela simulada expone descarga PDF firmada y rechaza firmas inválidas', async () => {
    const sig = comprobantes.firmarPago(PAGO_ID);

    const htmlRes = await request(app.getHttpServer())
      .get(
        `/pasarela-simulada/resultado/success?reservaId=${RESERVA_ID}&pagoId=${PAGO_ID}&sig=${sig}`,
      )
      .expect(200);

    expect(htmlRes.text).toContain(`/pasarela-simulada/comprobante/${PAGO_ID}`);

    const pdfRes = await request(app.getHttpServer())
      .get(`/pasarela-simulada/comprobante/${PAGO_ID}?sig=${sig}`)
      .buffer(true)
      .expect(200);

    expect(pdfRes.headers['content-type']).toContain('application/pdf');
    expect(Buffer.from(pdfRes.body).subarray(0, 5).toString('ascii')).toBe(
      '%PDF-',
    );

    await request(app.getHttpServer())
      .get(`/pasarela-simulada/comprobante/${PAGO_ID}?sig=invalida`)
      .expect(403);
  });
});
