import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createRemoteJWKSet, errors, jwtVerify, type JWTVerifyGetKey } from 'jose';
import { AuthUserDto } from './auth-user.dto';

export const SUPABASE_JWKS = Symbol('SUPABASE_JWKS');

export function supabaseIssuer(supabaseUrl: string): string {
  return `${supabaseUrl.replace(/\/+$/, '')}/auth/v1`;
}

export const supabaseJwksProvider = {
  provide: SUPABASE_JWKS,
  inject: [ConfigService],
  useFactory: (config: ConfigService): JWTVerifyGetKey => {
    const issuer = supabaseIssuer(config.getOrThrow<string>('SUPABASE_URL'));
    return createRemoteJWKSet(new URL(`${issuer}/.well-known/jwks.json`));
  },
};

@Injectable()
export class SupabaseJwtService {
  private readonly issuer: string;

  constructor(
    config: ConfigService,
    @Inject(SUPABASE_JWKS) private readonly jwks: JWTVerifyGetKey,
  ) {
    this.issuer = supabaseIssuer(config.getOrThrow<string>('SUPABASE_URL'));
  }

  async verify(token: string): Promise<AuthUserDto> {
    const { payload } = await jwtVerify(token, this.jwks, {
      issuer: this.issuer,
      audience: 'authenticated',
    });

    if (!payload.sub) {
      throw new errors.JWTClaimValidationFailed(
        'El token no tiene sub',
        payload,
        'sub',
        'missing',
      );
    }

    return {
      id: payload.sub,
      email: typeof payload.email === 'string' ? payload.email : undefined,
      role: typeof payload.role === 'string' ? payload.role : 'authenticated',
    };
  }
}
