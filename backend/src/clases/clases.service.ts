import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { RolUsuario } from '../common/rol-usuario';
import { MembresiasService } from '../usuarios/membresias/membresias.service';
import { SedesRepository } from '../usuarios/sedes/sedes.repository';
import { ListaEsperaPublisher } from './notificaciones/lista-espera.publisher';
import { RepositoryError } from '../supabase/repository.error';
import { EditarClaseDto, CrearClaseDto } from './clase.dto';
import {
  Clase,
  ClaseConCupo,
  EntradaListaEspera,
  EsperaConClase,
  EstadoClase,
  InscripcionClase,
  InscripcionConClase,
} from './clase.model';
import { ClasesRepository, NuevaClase } from './clases.repository';

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
    private readonly sedesRepository: SedesRepository,
  ) {}

  async findConCupoPorSede(sedeId: string): Promise<ClaseConCupo[]> {
    this.validarUuid(sedeId, 'sedeId');
    return this.repository.findConCupoPorSede(sedeId);
  }

  async crear(dto: CrearClaseDto): Promise<Clase> {
    const sedeId = this.textoObligatorio(dto?.sedeId, 'sedeId');
    this.validarUuid(sedeId, 'sedeId');
    await this.asegurarSedeActiva(sedeId);

    const inicio = this.fechaObligatoria(dto?.inicio, 'inicio');
    const fin = this.fechaObligatoria(dto?.fin, 'fin');
    this.asegurarFinPosterior(inicio, fin);

    return this.repository.crear({
      sede_id: sedeId,
      tipo: this.textoObligatorio(dto?.tipo, 'tipo'),
      instructor: this.textoObligatorio(dto?.instructor, 'instructor'),
      inicio: inicio.toISOString(),
      fin: fin.toISOString(),
      capacidad_max: this.capacidadPositiva(dto?.capacidadMax),
      estado: 'programada',
    });
  }

  async editar(id: string, dto: EditarClaseDto): Promise<Clase> {
    this.validarUuid(id, 'id');
    this.rechazarCambioDeSede(dto);
    const cambios = this.extraerCambios(dto);

    const clase = await this.repository.findById(id);
    if (!clase) {
      throw new NotFoundException('La clase solicitada no existe');
    }

    if (cambios.inicio !== undefined || cambios.fin !== undefined) {
      this.asegurarFinPosterior(
        new Date(cambios.inicio ?? clase.inicio),
        new Date(cambios.fin ?? clase.fin),
      );
    }

    if (cambios.capacidad_max !== undefined) {
      await this.asegurarCapacidadAlcanza(id, cambios.capacidad_max);
    }

    const actualizada = await this.repository.actualizar(id, cambios);
    if (!actualizada) {
      throw new NotFoundException('La clase solicitada no existe');
    }
    return actualizada;
  }

  async listarMisInscripciones(perfilId: string): Promise<InscripcionConClase[]> {
    this.validarUuid(perfilId, 'perfilId');
    return this.repository.findInscripcionesPorPerfil(perfilId);
  }

  async listarMiListaEspera(perfilId: string): Promise<EsperaConClase[]> {
    this.validarUuid(perfilId, 'perfilId');
    return this.repository.findListaEsperaPorPerfil(perfilId);
  }

  async inscribir(
    claseId: string,
    perfilId: string,
    ahora: Date = new Date(),
  ): Promise<InscripcionClase> {
    this.validarUuid(claseId, 'claseId');
    this.validarUuid(perfilId, 'perfilId');

    await this.asegurarMembresiaActiva(perfilId, ahora);

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

    // D7: resuelve en forma lazy eventuales plazos vencidos antes de evaluar cupo libre.
    await this.procesarYNotificarListaEspera(clase);

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

  async anotarseEnListaEspera(
    claseId: string,
    perfilId: string,
    ahora: Date = new Date(),
  ): Promise<EntradaListaEspera> {
    this.validarUuid(claseId, 'claseId');
    this.validarUuid(perfilId, 'perfilId');

    await this.asegurarMembresiaActiva(perfilId, ahora);

    const claseInicial = await this.repository.findConCupoById(claseId);
    if (!claseInicial) {
      throw new NotFoundException('La clase solicitada no existe');
    }
    if (claseInicial.estado !== 'programada') {
      throw new ConflictException(
        'La clase ha sido cancelada y no admite lista de espera',
      );
    }
    if (new Date(claseInicial.inicio).getTime() <= ahora.getTime()) {
      throw new BadRequestException(
        'No es posible anotarse en una clase que ya comenzó',
      );
    }

    // Resuelve primero notificados vencidos antes de verificar si hay cupo libre.
    await this.procesarYNotificarListaEspera(claseInicial);

    if (await this.repository.tieneInscripcionVigente(claseId, perfilId)) {
      throw new ConflictException('Ya estás inscripto en esta clase');
    }

    const claseActual =
      (await this.repository.findConCupoById(claseId)) ?? claseInicial;
    if (claseActual.cupos_libres > 0 && claseActual.en_espera === 0) {
      throw new ConflictException(
        'La clase tiene cupos disponibles; podés inscribirte directamente',
      );
    }

    try {
      return await this.repository.crearEntradaListaEspera(claseId, perfilId);
    } catch (e) {
      if (e instanceof RepositoryError && e.code === '23505') {
        throw new ConflictException(
          'Ya estás anotado en la lista de espera de esta clase',
        );
      }
      this.traducirErrorRepositorio(e);
    }
  }

  async confirmarLugarEspera(
    esperaId: string,
    perfilId: string,
    ahora: Date = new Date(),
  ): Promise<InscripcionClase> {
    this.validarUuid(esperaId, 'esperaId');
    this.validarUuid(perfilId, 'perfilId');

    const espera = await this.repository.findEsperaConClase(esperaId);
    if (!espera) {
      throw new NotFoundException(
        'El registro en lista de espera no fue encontrado',
      );
    }
    if (espera.perfil_id !== perfilId) {
      throw new ForbiddenException(
        'No podés confirmar el lugar de otro usuario',
      );
    }

    await this.asegurarMembresiaActiva(perfilId, ahora);

    try {
      return await this.repository.confirmarLugarEspera(esperaId);
    } catch (e) {
      if (
        e instanceof RepositoryError &&
        e.code === 'P0001' &&
        e.message === 'PLAZO_VENCIDO'
      ) {
        // Avanza la cola inmediatamente para notificar al siguiente socio (D7 + RF-08).
        await this.procesarYNotificarListaEspera(espera.clase);
        throw new ConflictException(
          'El plazo para confirmar tu lugar venció y el cupo pasó al siguiente en la lista',
        );
      }
      this.traducirErrorRepositorio(e);
    }
  }

  async retirarDeListaEspera(
    esperaId: string,
    perfilId: string,
    rol?: RolUsuario,
  ): Promise<void> {
    this.validarUuid(esperaId, 'esperaId');
    this.validarUuid(perfilId, 'perfilId');

    const espera = await this.repository.findEsperaConClase(esperaId);
    if (!espera) {
      throw new NotFoundException(
        'El registro en lista de espera no fue encontrado',
      );
    }

    const esStaff = rol === 'admin_sede' || rol === 'gerente';
    if (!esStaff && espera.perfil_id !== perfilId) {
      throw new ForbiddenException(
        'No podés retirar a otro usuario de la lista de espera',
      );
    }

    if (espera.estado !== 'esperando' && espera.estado !== 'notificado') {
      throw new BadRequestException(
        'El registro en lista de espera ya no se encuentra vigente',
      );
    }

    const retirada = await this.repository.retirarEspera(esperaId);
    if (!retirada) {
      throw new BadRequestException(
        'El registro en lista de espera ya no se encuentra vigente',
      );
    }

    // Si tenía un cupo reservado ('notificado'), se libera para el siguiente en la cola.
    if (espera.estado === 'notificado') {
      await this.procesarYNotificarListaEspera(espera.clase);
    }
  }

  private async asegurarMembresiaActiva(
    perfilId: string,
    ahora: Date,
  ): Promise<void> {
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
  }

  private async procesarYNotificarListaEspera(clase: {
    id: string;
    tipo: string;
    inicio: string;
  }): Promise<void> {
    const notificados = await this.repository.procesarListaEspera(
      clase.id,
      PLAZO_CONFIRMACION_ESPERA,
    );
    this.listaEspera.notificarLugaresLiberados(clase, notificados);
  }

  private rechazarCambioDeSede(dto: EditarClaseDto | undefined): void {
    if (
      dto != null &&
      Object.prototype.hasOwnProperty.call(dto, 'sedeId')
    ) {
      throw new BadRequestException(
        'La sede de una clase no se cambia. Cancelala y creá otra en la sede nueva.',
      );
    }
  }

  private extraerCambios(dto: EditarClaseDto | undefined): Partial<NuevaClase> {
    const cambios: Partial<NuevaClase> = {};

    if (dto?.tipo !== undefined) {
      cambios.tipo = this.textoObligatorio(dto.tipo, 'tipo');
    }
    if (dto?.instructor !== undefined) {
      cambios.instructor = this.textoObligatorio(dto.instructor, 'instructor');
    }
    if (dto?.inicio !== undefined) {
      cambios.inicio = this.fechaObligatoria(dto.inicio, 'inicio').toISOString();
    }
    if (dto?.fin !== undefined) {
      cambios.fin = this.fechaObligatoria(dto.fin, 'fin').toISOString();
    }
    if (dto?.capacidadMax !== undefined) {
      cambios.capacidad_max = this.capacidadPositiva(dto.capacidadMax);
    }
    if (dto?.estado !== undefined) {
      cambios.estado = this.estadoValido(dto.estado);
    }

    if (Object.keys(cambios).length === 0) {
      throw new BadRequestException(
        'Debe enviar al menos un campo para actualizar (tipo, instructor, inicio, fin, capacidadMax o estado)',
      );
    }
    return cambios;
  }

  private async asegurarSedeActiva(sedeId: string): Promise<void> {
    const sede = await this.sedesRepository.findById(sedeId);
    if (!sede) {
      throw new NotFoundException('La sede solicitada no existe');
    }
    if (!sede.activa) {
      throw new BadRequestException(
        'La sede está inactiva y no admite clases nuevas',
      );
    }
  }

  private async asegurarCapacidadAlcanza(
    claseId: string,
    capacidad: number,
  ): Promise<void> {
    const clase = await this.repository.findConCupoById(claseId);
    if (!clase) {
      throw new NotFoundException('La clase solicitada no existe');
    }
    const ocupados = clase.capacidad_max - clase.cupos_libres;
    if (capacidad < ocupados) {
      throw new BadRequestException(
        `La capacidad no puede quedar por debajo de los ${ocupados} lugares ya ocupados`,
      );
    }
  }

  private textoObligatorio(valor: unknown, campo: string): string {
    if (typeof valor !== 'string' || !valor.trim()) {
      throw new BadRequestException(`${campo} es obligatorio`);
    }
    return valor.trim();
  }

  private fechaObligatoria(valor: unknown, campo: string): Date {
    if (typeof valor !== 'string' || !valor.trim()) {
      throw new BadRequestException(`${campo} es obligatorio`);
    }
    const fecha = new Date(valor);
    if (Number.isNaN(fecha.getTime())) {
      throw new BadRequestException(`${campo} debe ser una fecha válida`);
    }
    return fecha;
  }

  private asegurarFinPosterior(inicio: Date, fin: Date): void {
    if (fin.getTime() <= inicio.getTime()) {
      throw new BadRequestException('fin tiene que ser posterior a inicio');
    }
  }

  private capacidadPositiva(capacidad: unknown): number {
    if (
      typeof capacidad !== 'number' ||
      !Number.isInteger(capacidad) ||
      capacidad <= 0
    ) {
      throw new BadRequestException(
        'capacidadMax debe ser un entero mayor a 0',
      );
    }
    return capacidad;
  }

  private estadoValido(estado: unknown): EstadoClase {
    if (estado !== 'programada' && estado !== 'cancelada') {
      throw new BadRequestException(
        'estado debe ser programada o cancelada',
      );
    }
    return estado;
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
          case 'ESPERA_NO_EXISTE':
            throw new NotFoundException(
              'El registro en lista de espera no fue encontrado',
            );
          case 'ESPERA_NO_NOTIFICADA':
            throw new ConflictException(
              'Todavía no tenés un lugar asignado para confirmar o ya fue procesado',
            );
        }
      }
    }
    throw error;
  }
}
