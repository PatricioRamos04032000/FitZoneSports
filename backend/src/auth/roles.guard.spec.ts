import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { AuthenticatedRequest } from './jwt-auth.guard';
import { PerfilesRolRepository } from './perfiles-rol.repository';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';

class Controlador {}
const soloStaff = () => undefined;
const libre = () => undefined;
Roles('gerente', 'recepcionista')(soloStaff);

function contexto(
  handler: () => void,
  user?: { id: string },
): { context: ExecutionContext; request: AuthenticatedRequest } {
  const request = { user } as AuthenticatedRequest;
  const context = {
    getHandler: () => handler,
    getClass: () => Controlador,
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
  return { context, request };
}

describe('RolesGuard', () => {
  const perfiles = { findRol: jest.fn() };
  const guard = new RolesGuard(
    new Reflector(),
    perfiles as unknown as PerfilesRolRepository,
  );
  beforeEach(() => jest.clearAllMocks());

  it('deja pasar sin consultar la base si el endpoint no tiene @Roles', async () => {
    await expect(guard.canActivate(contexto(libre).context)).resolves.toBe(true);
    expect(perfiles.findRol).not.toHaveBeenCalled();
  });

  it('deja pasar un rol permitido y lo guarda en request.rol', async () => {
    perfiles.findRol.mockResolvedValue('gerente');
    const { context, request } = contexto(soloStaff, { id: 'u1' });

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(perfiles.findRol).toHaveBeenCalledWith('u1');
    expect(request.rol).toBe('gerente');
  });

  it('responde 403 a un rol no permitido', async () => {
    perfiles.findRol.mockResolvedValue('socio');

    await expect(
      guard.canActivate(contexto(soloStaff, { id: 'u1' }).context),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('responde 403 si el usuario no tiene perfil', async () => {
    perfiles.findRol.mockResolvedValue(null);

    await expect(
      guard.canActivate(contexto(soloStaff, { id: 'u1' }).context),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('responde 401 si no pasó antes por JwtAuthGuard', async () => {
    await expect(guard.canActivate(contexto(soloStaff).context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
