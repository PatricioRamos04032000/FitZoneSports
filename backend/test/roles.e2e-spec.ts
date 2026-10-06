import { Controller, Get, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { AuthModule } from './../src/auth/auth.module';
import { PerfilesRolRepository } from './../src/auth/perfiles-rol.repository';
import { RequiereRol } from './../src/auth/roles.decorator';
import { SUPABASE_JWKS } from './../src/auth/supabase-jwt.service';
import { createTestSigner, type TestSigner } from './support/supabase-jwt';

@Controller('prueba-roles')
class PruebaRolesController {
  @Get('gerente')
  @RequiereRol('gerente')
  gerente() {
    return { ok: true };
  }

  @Get('staff')
  @RequiereRol('gerente', 'recepcionista')
  staff() {
    return { ok: true };
  }
}

describe('RolesGuard (e2e)', () => {
  let app: INestApplication<App>;
  let signer: TestSigner;
  let token: string;
  const perfiles = { findRol: jest.fn() };

  beforeAll(async () => {
    signer = await createTestSigner();
    token = await signer.sign({ sub: '3f1c2a9e-8b7d-4c6e-9a1f-2b3c4d5e6f70' });
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule, AuthModule],
      controllers: [PruebaRolesController],
    })
      .overrideProvider(SUPABASE_JWKS)
      .useValue(signer.jwks)
      .overrideProvider(PerfilesRolRepository)
      .useValue(perfiles)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  const get = (path: string) =>
    request(app.getHttpServer()).get(path).set('Authorization', `Bearer ${token}`);

  it('401 sin token, antes de consultar el rol', async () => {
    await request(app.getHttpServer()).get('/prueba-roles/gerente').expect(401);
    expect(perfiles.findRol).not.toHaveBeenCalled();
  });

  it('200 para el rol permitido', async () => {
    perfiles.findRol.mockResolvedValue('gerente');
    await get('/prueba-roles/gerente').expect(200);
  });

  it('403 para otro rol', async () => {
    perfiles.findRol.mockResolvedValue('socio');
    const res = await get('/prueba-roles/gerente').expect(403);
    expect(res.body.message).toBe('Tu rol no tiene permiso para esta operación');
  });

  it('acepta cualquiera de varios roles', async () => {
    perfiles.findRol.mockResolvedValue('recepcionista');
    await get('/prueba-roles/staff').expect(200);
    await get('/prueba-roles/gerente').expect(403);
  });

  it('GET /auth/me incluye el rol de FitZone', async () => {
    perfiles.findRol.mockResolvedValue('socio');
    const res = await get('/auth/me').expect(200);
    expect(res.body.rol).toBe('socio');
  });

  afterEach(async () => {
    await app.close();
  });
});
