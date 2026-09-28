import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createTestSigner,
  TEST_SUPABASE_URL,
  type TestSigner,
} from '../../test/support/supabase-jwt';
import { JwtAuthGuard, type AuthenticatedRequest } from './jwt-auth.guard';
import { SupabaseJwtService } from './supabase-jwt.service';

const USER_ID = '3f1c2a9e-8b7d-4c6e-9a1f-2b3c4d5e6f70';

function contextWith(authorization?: string) {
  const request = { headers: { authorization } } as AuthenticatedRequest;
  const context = {
    switchToHttp: () => ({ getRequest: () => request }),
  } as ExecutionContext;
  return { request, context };
}

describe('JwtAuthGuard', () => {
  let signer: TestSigner;
  let guard: JwtAuthGuard;

  beforeAll(async () => {
    signer = await createTestSigner();
    const config = new ConfigService({ SUPABASE_URL: TEST_SUPABASE_URL });
    guard = new JwtAuthGuard(new SupabaseJwtService(config, signer.jwks));
  });

  it('acepta un token válido y deja el usuario en request.user', async () => {
    const token = await signer.sign({ sub: USER_ID, email: 'socio@fitzone.com' });
    const { request, context } = contextWith(`Bearer ${token}`);

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.user).toEqual({
      id: USER_ID,
      email: 'socio@fitzone.com',
      role: 'authenticated',
    });
  });

  it('rechaza si falta el header Authorization', async () => {
    await expect(guard.canActivate(contextWith().context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('rechaza si el esquema no es Bearer', async () => {
    const token = await signer.sign({ sub: USER_ID });
    await expect(
      guard.canActivate(contextWith(`Basic ${token}`).context),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('rechaza un token vencido', async () => {
    const token = await signer.sign(
      { sub: USER_ID },
      { expiresIn: Math.floor(Date.now() / 1000) - 60 },
    );
    await expect(
      guard.canActivate(contextWith(`Bearer ${token}`).context),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('rechaza un token de otro proyecto Supabase', async () => {
    const token = await signer.sign(
      { sub: USER_ID },
      { issuer: 'https://otro-proyecto.supabase.co/auth/v1' },
    );
    await expect(
      guard.canActivate(contextWith(`Bearer ${token}`).context),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('rechaza un token firmado con otra clave', async () => {
    const otherSigner = await createTestSigner();
    const token = await otherSigner.sign({ sub: USER_ID });
    await expect(
      guard.canActivate(contextWith(`Bearer ${token}`).context),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('rechaza un token sin sub', async () => {
    const token = await signer.sign();
    await expect(
      guard.canActivate(contextWith(`Bearer ${token}`).context),
    ).rejects.toThrow(UnauthorizedException);
  });
});
