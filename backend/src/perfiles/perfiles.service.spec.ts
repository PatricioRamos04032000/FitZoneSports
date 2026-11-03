import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { RepositoryError } from '../supabase/repository.error';
import type { Perfil } from './perfil.model';
import { PerfilesRepository } from './perfiles.repository';
import { PerfilesService } from './perfiles.service';

const PERFIL: Perfil = {
  id: '3f1c2a9e-8b7d-4c6e-9a1f-2b3c4d5e6f70',
  rol: 'socio',
  dni: '12345678',
  nombre: 'Lucas',
  apellido: 'Coquet',
  telefono: '343 1234567',
  foto_url: null,
  sede_home_id: '42363e91-8c03-4d52-b160-5c1345be8656',
  notificar_por_email: true,
  created_at: '2026-10-01T12:00:00+00:00',
};

describe('PerfilesService', () => {
  const perfiles = { findById: jest.fn(), actualizar: jest.fn() };
  const service = new PerfilesService(perfiles as unknown as PerfilesRepository);

  beforeEach(() => jest.clearAllMocks());

  it('obtenerMio responde 404 si no hay perfil', async () => {
    perfiles.findById.mockResolvedValue(null);

    await expect(service.obtenerMio('p1')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('obtenerMio devuelve el perfil', async () => {
    perfiles.findById.mockResolvedValue(PERFIL);

    await expect(service.obtenerMio(PERFIL.id)).resolves.toEqual(PERFIL);
  });

  it('actualizarMio rechaza body sin campos editables', async () => {
    await expect(service.actualizarMio(PERFIL.id, {})).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(perfiles.actualizar).not.toHaveBeenCalled();
  });

  it('actualizarMio rechaza nombre vacío', async () => {
    await expect(
      service.actualizarMio(PERFIL.id, { nombre: '  ' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('actualizarMio guarda solo la whitelist y trim', async () => {
    perfiles.actualizar.mockResolvedValue({ ...PERFIL, telefono: '343 999' });

    await expect(
      service.actualizarMio(PERFIL.id, { telefono: ' 343 999 ' }),
    ).resolves.toEqual({ ...PERFIL, telefono: '343 999' });

    expect(perfiles.actualizar).toHaveBeenCalledWith(PERFIL.id, {
      telefono: '343 999',
    });
  });

  it('actualizarMio mapea DNI duplicado a 409', async () => {
    perfiles.actualizar.mockRejectedValue(
      new RepositoryError('duplicate key', '23505'),
    );

    await expect(
      service.actualizarMio(PERFIL.id, { dni: '999' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('actualizarMio mapea sede inexistente a 400', async () => {
    perfiles.actualizar.mockRejectedValue(
      new RepositoryError('foreign key', '23503'),
    );

    await expect(
      service.actualizarMio(PERFIL.id, {
        sede_home_id: '42363e91-8c03-4d52-b160-5c1345be8656',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('actualizarMio responde 404 si el update no encuentra fila', async () => {
    perfiles.actualizar.mockResolvedValue(null);

    await expect(
      service.actualizarMio(PERFIL.id, { nombre: 'Ana' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
