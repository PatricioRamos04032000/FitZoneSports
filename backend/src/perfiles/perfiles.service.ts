import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RepositoryError } from '../supabase/repository.error';
import type { ActualizarPerfil, Perfil } from './perfil.model';
import { PerfilesRepository } from './perfiles.repository';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Injectable()
export class PerfilesService {
  constructor(private readonly perfiles: PerfilesRepository) {}

  async obtenerMio(perfilId: string): Promise<Perfil> {
    return this.conPerfil(await this.perfiles.findById(perfilId));
  }

  async actualizarMio(perfilId: string, body: ActualizarPerfil): Promise<Perfil> {
    const cambios = this.sanitizar(body);
    if (Object.keys(cambios).length === 0) {
      throw new BadRequestException(
        'Debés enviar al menos un campo editable: dni, nombre, apellido, telefono, foto_url o sede_home_id',
      );
    }

    try {
      return this.conPerfil(await this.perfiles.actualizar(perfilId, cambios));
    } catch (e) {
      if (e instanceof RepositoryError && e.code === '23505') {
        throw new ConflictException('Ya existe un perfil con ese DNI');
      }
      if (e instanceof RepositoryError && e.code === '23503') {
        throw new BadRequestException('sede_home_id no corresponde a una sede existente');
      }
      throw e;
    }
  }

  private conPerfil(perfil: Perfil | null): Perfil {
    if (!perfil) throw new NotFoundException('El usuario no tiene perfil');
    return perfil;
  }

  /** Whitelist + tipado básico (no hay ValidationPipe global). */
  private sanitizar(body: ActualizarPerfil): ActualizarPerfil {
    if (body == null || typeof body !== 'object' || Array.isArray(body)) {
      throw new BadRequestException('Body inválido');
    }

    const cambios: ActualizarPerfil = {};

    if ('dni' in body) {
      if (typeof body.dni !== 'string' || body.dni.trim() === '') {
        throw new BadRequestException('dni debe ser un string no vacío');
      }
      cambios.dni = body.dni.trim();
    }

    if ('nombre' in body) {
      if (typeof body.nombre !== 'string' || body.nombre.trim() === '') {
        throw new BadRequestException('nombre debe ser un string no vacío');
      }
      cambios.nombre = body.nombre.trim();
    }

    if ('apellido' in body) {
      cambios.apellido = this.textoONull(body.apellido, 'apellido');
    }

    if ('telefono' in body) {
      cambios.telefono = this.textoONull(body.telefono, 'telefono');
    }

    if ('foto_url' in body) {
      cambios.foto_url = this.textoONull(body.foto_url, 'foto_url');
    }

    if ('sede_home_id' in body) {
      if (body.sede_home_id === null) {
        cambios.sede_home_id = null;
      } else if (
        typeof body.sede_home_id === 'string' &&
        UUID_RE.test(body.sede_home_id)
      ) {
        cambios.sede_home_id = body.sede_home_id;
      } else {
        throw new BadRequestException('sede_home_id debe ser un UUID o null');
      }
    }

    return cambios;
  }

  private textoONull(valor: unknown, campo: string): string | null {
    if (valor === null) return null;
    if (typeof valor === 'string') {
      const t = valor.trim();
      return t === '' ? null : t;
    }
    throw new BadRequestException(`${campo} debe ser string o null`);
  }
}
