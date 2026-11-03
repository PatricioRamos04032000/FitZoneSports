import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { AuthenticatedRequest } from './jwt-auth.guard';
import { PerfilesRolRepository } from './perfiles-rol.repository';
import { ROLES_KEY, RolUsuario } from './rol-usuario';

/**
 * Exige que el rol de FitZone del usuario (`perfiles.rol`) esté entre los de `@Roles`.
 * Va después de `JwtAuthGuard`: el token de Supabase no trae el rol de la aplicación.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly perfiles: PerfilesRolRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permitidos = this.reflector.getAllAndOverride<RolUsuario[] | undefined>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!permitidos?.length) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!request.user) {
      throw new UnauthorizedException('Falta el token Bearer');
    }

    const rol = await this.perfiles.findRol(request.user.id);
    if (!rol || !permitidos.includes(rol)) {
      throw new ForbiddenException('Tu rol no tiene permiso para esta operación');
    }

    request.rol = rol;
    return true;
  }
}
