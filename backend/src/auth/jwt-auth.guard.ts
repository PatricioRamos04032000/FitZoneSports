import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { errors } from 'jose';
import { AuthUserDto } from './auth-user.dto';
import { SupabaseJwtService } from './supabase-jwt.service';

export type AuthenticatedRequest = Request & { user: AuthUserDto };

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly supabaseJwt: SupabaseJwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = extractBearerToken(request.headers.authorization);

    if (!token) {
      throw new UnauthorizedException('Falta el token Bearer');
    }

    try {
      request.user = await this.supabaseJwt.verify(token);
    } catch (error) {
      if (error instanceof errors.JOSEError) {
        throw new UnauthorizedException('Token inválido o vencido');
      }
      throw error;
    }

    return true;
  }
}

function extractBearerToken(header: string | undefined): string | undefined {
  const [scheme, token] = header?.split(' ') ?? [];
  return scheme?.toLowerCase() === 'bearer' && token ? token : undefined;
}
