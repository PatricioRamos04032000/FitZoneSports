import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { ROLES_KEY, RolUsuario } from './rol-usuario';

/** Roles de FitZone que pueden usar el endpoint. Requiere `RolesGuard`. */
export const Roles = (...roles: RolUsuario[]) => SetMetadata(ROLES_KEY, roles);

/**
 * Token válido + uno de los roles indicados, con su documentación en Swagger.
 * Uso: `@RequiereRol('gerente')` en un controller o en un método.
 */
export function RequiereRol(...roles: RolUsuario[]) {
  return applyDecorators(
    Roles(...roles),
    UseGuards(JwtAuthGuard, RolesGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Token ausente, inválido o vencido' }),
    ApiForbiddenResponse({ description: `Solo para: ${roles.join(', ')}` }),
  );
}
