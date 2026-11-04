import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { RolUsuario } from '../auth/rol-usuario';
import { MembresiasService } from '../membresias/membresias.service';
import { ListaEsperaPublisher } from '../notificaciones/lista-espera.publisher';
import { RepositoryError } from '../supabase/repository.error';
import {
  ClaseConCupo,
  InscripcionClase,
  InscripcionConClase,
} from './clase.model';
import { ClasesRepository } from './clases.repository';

/** Decisión D5 (RF-07): la ventana de inscripción cierra 48 h antes del inicio de la clase. */
export const VENTANA_RESERVA_CLASE_MS = 48 * 60 * 60 * 1000;

/** Decisión D6: cancelación marcada como tardía si restan menos de 2 h para el inicio. */
export const VENTANA_CANCELACION_TARDIA_MS = 2 * 60 * 60 * 1000;

/** Decisión D7: intervalo otorgado al siguiente socio en lista de espera para confirmar. */
export const PLAZO_CONFIRMACION_ESPERA = '30 minutes';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Injectable()
export class ClasesService {
  constructor(
    private readonly repository: ClasesRepository,
    private readonly membresias: MembresiasService,
    private readonly listaEspera: ListaEsperaPublisher,
  ) {}

  async findConCupoPorSede(sedeId: string): Promise<ClaseConCupo[]> {
    this.validarUuid(sedeId, 'sedeId');
    return this.repository.findConCupoPorSede(sedeId);
  }

  async listarMisInscripciones(perfilId: string): Promise<InscripcionConClase[]> {
    this.validarUuid(perfilId, 'perfilId');
    return this.repository.findInscripcionesPorPerfil(perfilId);
  }

  async inscribir(
    claseId: string,
    perfilId: string,
    ahora: Date = new Date(),
  ): Promise<InscripcionClase> {
    this.validarUuid(claseId, 'claseId');
    this.validarUuid(perfilId, 'perfilId');

    // RN-03: solo socios con membresía activa y vigente pueden reservar clases grupales.
    try {
      await this.membresias.findActivaPorPerfil(perfilId, ahora);
    } catch (e) {
      if (e instanceof NotFoundException) {
        throw new ForbiddenException(
          'Necesitás una membresía activa vigente para inscribirte a una clase',
        );
      }
      throw e;
    }

    const clase = await this.repository.findById(claseId);
    if (!clase) {
      throw new NotFoundException('La clase solicitada no existe');
    }
    if (clase.estado !== 'programada') {
      throw new ConflictException(
        'La clase ha sido cancelada y no admite reservas',
      );
    }

    // D5: solo se puede reservar mientras falten 48 horas o más para el inicio.
    const anticipacionMs = new Date(clase.inicio).getTime() - ahora.getTime();
    if (anticipacionMs < VENTANA_RESERVA_CLASE_MS) {
      throw new BadRequestException(
        'Solo se puede reservar una clase con al menos 48 horas de anticipación',
      );
    }

    try {
      return await this.repository.inscribir(claseId, perfilId);
    } catch (e) {
      this.traducirErrorRepositorio(e);
    }
  }

  async cancelar(
    inscripcionId: string,
    perfilId: string,
    rol?: RolUsuario,
    ahora: Date = new Date(),
  ): Promise<void> {
    this.validarUuid(inscripcionId, 'inscripcionId');
    this.validarUuid(perfilId, 'perfilId');

    const inscripcion =
      await this.repository.findInscripcionConClase(inscripcionId);
    if (!inscripcion) {
      throw new NotFoundException('La inscripción no fue encontrada');
    }

    const esStaff = rol === 'admin_sede' || rol === 'gerente';
    if (!esStaff && inscripcion.perfil_id !== perfilId) {
      throw new ForbiddenException(
        'No podés cancelar la inscripción de otro usuario',
      );
    }

    // D6: la hora de inicio proviene siempre de la base, nunca del cliente.
    const inicioMs = new Date(inscripcion.clase.inicio).getTime();
    const esTardia =
      ahora.getTime() > inicioMs - VENTANA_CANCELACION_TARDIA_MS;

    let notificados;
    try {
      notificados = await this.repository.cancelar(
        inscripcionId,
        esTardia,
        PLAZO_CONFIRMACION_ESPERA,
      );
    } catch (e) {
      this.traducirErrorRepositorio(e);
    }

    // RF-08 (Observer): avisa de forma desacoplada a quienes pasaron a 'notificado'.
    this.listaEspera.notificarLugaresLiberados(inscripcion.clase, notificados);
  }

  private validarUuid(valor: string | undefined, campo: string): void {
    if (!valor || typeof valor !== 'string' || !UUID_REGEX.test(valor)) {
      throw new BadRequestException(`${campo} debe ser un UUID válido`);
    }
  }

  private traducirErrorRepositorio(error: unknown): never {
    if (error instanceof RepositoryError) {
      if (error.code === '23505') {
        throw new ConflictException('Ya estás inscripto en esta clase');
      }
      if (error.code === '22P02') {
        throw new BadRequestException('Identificador con formato UUID inválido');
      }
      if (error.code === 'P0001') {
        switch (error.message) {
          case 'CLASE_NO_EXISTE':
            throw new NotFoundException('La clase solicitada no existe');
          case 'CLASE_CANCELADA':
            throw new ConflictException(
              'La clase ha sido cancelada y no admite reservas',
            );
          case 'CLASE_LLENA':
            throw new ConflictException(
              'La clase ya alcanzó su capacidad máxima',
            );
          case 'HAY_LISTA_DE_ESPERA':
            throw new ConflictException(
              'La clase tiene lista de espera activa. Debes anotarte allí.',
            );
          case 'INSCRIPCION_NO_EXISTE':
            throw new NotFoundException('La inscripción no fue encontrada');
          case 'INSCRIPCION_NO_VIGENTE':
            throw new BadRequestException(
              'La inscripción ya se encontraba cancelada o vencida',
            );
        }
      }
    }
    throw error;
  }
}
