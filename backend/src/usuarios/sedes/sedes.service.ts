import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ActualizarSedeDto, CrearSedeDto } from './sede.dto';
import { Sede } from './sede.model';
import { NuevaSede, SedesRepository } from './sedes.repository';

const AFORO_POR_DEFECTO = 50;

@Injectable()
export class SedesService {
  constructor(private readonly sedesRepository: SedesRepository) {}

  findAll(): Promise<Sede[]> {
    return this.sedesRepository.findAll();
  }

  async crear(dto: CrearSedeDto): Promise<Sede> {
    const datos: NuevaSede = {
      nombre: this.nombreObligatorio(dto?.nombre),
      direccion: this.direccionOpcional(dto?.direccion),
      aforo_max:
        dto?.aforo_max === undefined
          ? AFORO_POR_DEFECTO
          : this.aforoPositivo(dto.aforo_max),
      activa: dto?.activa === undefined ? true : this.activaBooleana(dto.activa),
    };
    return this.sedesRepository.crear(datos);
  }

  async actualizar(id: string, dto: ActualizarSedeDto): Promise<Sede> {
    const cambios = this.extraerCambios(dto);
    const sede = await this.sedesRepository.actualizar(id, cambios);
    if (!sede) {
      throw new NotFoundException('La sede solicitada no existe');
    }
    return sede;
  }

  private extraerCambios(dto: ActualizarSedeDto): Partial<NuevaSede> {
    const cambios: Partial<NuevaSede> = {};

    if (dto?.nombre !== undefined) {
      cambios.nombre = this.nombreObligatorio(dto.nombre);
    }
    if (dto?.direccion !== undefined) {
      cambios.direccion = this.direccionOpcional(dto.direccion);
    }
    if (dto?.aforo_max !== undefined) {
      cambios.aforo_max = this.aforoPositivo(dto.aforo_max);
    }
    if (dto?.activa !== undefined) {
      cambios.activa = this.activaBooleana(dto.activa);
    }

    if (Object.keys(cambios).length === 0) {
      throw new BadRequestException(
        'Debe enviar al menos un campo para actualizar (nombre, direccion, aforo_max o activa)',
      );
    }
    return cambios;
  }

  private nombreObligatorio(nombre: unknown): string {
    if (typeof nombre !== 'string' || !nombre.trim()) {
      throw new BadRequestException('nombre es obligatorio');
    }
    return nombre.trim();
  }

  private direccionOpcional(direccion: unknown): string | null {
    if (direccion === undefined || direccion === null) {
      return null;
    }
    if (typeof direccion !== 'string') {
      throw new BadRequestException('direccion debe ser un texto');
    }
    const texto = direccion.trim();
    return texto.length > 0 ? texto : null;
  }

  private aforoPositivo(aforo: unknown): number {
    if (typeof aforo !== 'number' || !Number.isInteger(aforo) || aforo <= 0) {
      throw new BadRequestException('aforo_max debe ser un entero mayor a 0');
    }
    return aforo;
  }

  private activaBooleana(activa: unknown): boolean {
    if (typeof activa !== 'boolean') {
      throw new BadRequestException('activa debe ser booleano');
    }
    return activa;
  }
}
