import {
  createLocalJWKSet,
  exportJWK,
  generateKeyPair,
  SignJWT,
  type CryptoKey,
  type JWTPayload,
  type JWTVerifyGetKey,
} from 'jose';
import { supabaseIssuer } from '../../src/auth/supabase-jwt.service';

export const TEST_SUPABASE_URL = 'https://fitzone-test.supabase.co';
export const TEST_ISSUER = supabaseIssuer(TEST_SUPABASE_URL);

export interface TestSigner {
  jwks: JWTVerifyGetKey;
  sign(payload?: JWTPayload, options?: SignOptions): Promise<string>;
}

interface SignOptions {
  issuer?: string;
  audience?: string;
  expiresIn?: string | number;
}

export async function createTestSigner(): Promise<TestSigner> {
  const { publicKey, privateKey } = await generateKeyPair('ES256');
  const publicJwk = { ...(await exportJWK(publicKey)), kid: 'test', alg: 'ES256' };

  return {
    jwks: createLocalJWKSet({ keys: [publicJwk] }),
    sign: (payload, options) => signToken(privateKey, payload, options),
  };
}

function signToken(
  privateKey: CryptoKey,
  payload: JWTPayload = {},
  { issuer = TEST_ISSUER, audience = 'authenticated', expiresIn = '1h' }: SignOptions = {},
): Promise<string> {
  return new SignJWT({ role: 'authenticated', ...payload })
    .setProtectedHeader({ alg: 'ES256', kid: 'test' })
    .setIssuer(issuer)
    .setAudience(audience)
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(privateKey);
}
