import { NotFoundException } from '@nestjs/common';
import { NotificacionesRepository } from './notificaciones.repository';
import { NotificacionesService } from './notificaciones.service';
import { PreferenciasRepository } from './preferencias.repository';

describe('NotificacionesService', () => {
  const notificaciones = { findByPerfil: jest.fn(), marcarLeida: jest.fn() };
  const preferencias = { findByPerfil: jest.fn(), actualizar: jest.fn() };
  const service = new NotificacionesService(
    notificaciones as unknown as NotificacionesRepository,
    preferencias as unknown as PreferenciasRepository,
  );

  beforeEach(() => jest.clearAllMocks());

  it('marcarLeida responde 404 si la notificación no es del usuario', async () => {
    notificaciones.marcarLeida.mockResolvedValue(null);

    await expect(service.marcarLeida('n1', 'p1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(notificaciones.marcarLeida).toHaveBeenCalledWith('n1', 'p1');
  });

  it('actualizarPreferencias devuelve las preferencias guardadas', async () => {
    preferencias.actualizar.mockResolvedValue({ notificar_por_email: true });

    await expect(
      service.actualizarPreferencias('p1', { notificar_por_email: true }),
    ).resolves.toEqual({ notificar_por_email: true });
  });

  it('getPreferencias responde 404 si el usuario no tiene perfil', async () => {
    preferencias.findByPerfil.mockResolvedValue(null);

    await expect(service.getPreferencias('p1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
