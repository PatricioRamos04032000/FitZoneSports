import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { RolUsuario } from '../auth/rol-usuario';
import { PreciosService } from './precios/precios.service';
import { ConfiguracionPico } from './precios/pricing.strategy';
import {
  ActualizarCanchaDto,
  ActualizarConfiguracionPicoDto,
  ActualizarDescuentoSocioDto,
  CanchaDisponibilidadDto,
  CanchaResponseDto,
  ConfiguracionPicoDto,
  CrearCanchaDto,
  CrearMantenimientoDto,
  DescuentoSocioResponseDto,
  DisponibilidadSedeResponseDto,
  EstadoTurnoGrilla,
  MantenimientoCanchaResponseDto,
  TIPOS_CANCHA,
  TurnoDisponibilidadDto,
} from './cancha.dto';
import {
  Cancha,
  ConfiguracionPicoFila,
  MantenimientoCancha,
  ReservaOcupacionFila,
} from './cancha.model';
import { CanchasRepository } from './canchas.repository';

export const HORA_APERTURA_GRILLA = 8;
export const HORA_ULTIMO_TURNO_GRILLA = 22;
const MINUTOS_HOLD_DEFAULT = 10;
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const FECHA_ISO_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const HORA_EN_PUNTO_REGEX = /^(?:[01]\d|2[0-3]):00$/;

export interface ActorAutenticado {
  id: string;
  rol: RolUsuario;
}

@Injectable()
export class CanchasService {
  constructor(
    private readonly repository: CanchasRepository,
    private readonly precios: PreciosService,
  ) {}

  async listarPorSede(
    sedeId: string,
    incluirInactivas = false,
  ): Promise<CanchaResponseDto[]> {
    this.assertUuid(sedeId, 'sedeId');
    await this.assertExisteSede(sedeId);
    const filas = await this.repository.findBySede(sedeId, !incluirInactivas);
    return filas.map((fila) => this.aCanchaDto(fila));
  }

  async consultarDisponibilidad(
    sedeId: string,
    fecha: string,
  ): Promise<DisponibilidadSedeResponseDto> {
    this.assertUuid(sedeId, 'sedeId');
    this.assertFechaIso(fecha);
    await this.assertExisteSede(sedeId);

    const [canchas, picoDto, cadena] = await Promise.all([
      this.repository.findBySede(sedeId, true),
      this.obtenerConfiguracionPicoInterna(sedeId),
      this.obtenerConfiguracionCadenaInterna(),
    ]);

    const inicioDia = `${fecha}T00:00:00-03:00`;
    const finDia = `${this.fechaSiguiente(fecha)}T00:00:00-03:00`;
    const canchaIds = canchas.map((c) => c.id);

    const [reservas, mantenimientos] = await Promise.all([
      this.repository.findReservasActivasEnRango(canchaIds, inicioDia, finDia),
      this.repository.findMantenimientosEnRango(canchaIds, inicioDia, finDia),
    ]);

    const reservasVigentes = reservas.filter((r) =>
      this.reservaOcupaTurno(r, cadena.minutosHold),
    );

    const picoCtx: ConfiguracionPico = {
      recargoPct: picoDto.recargoPct,
      desde: picoDto.desde,
      hasta: picoDto.hasta,
      dias: picoDto.dias,
    };

    const grillaCanchas = canchas.map((cancha) =>
      this.armarDisponibilidadCancha(
        cancha,
        fecha,
        picoCtx,
        cadena.descuentoSocioPct,
        reservasVigentes.filter((r) => r.cancha_id === cancha.id),
        mantenimientos.filter((m) => m.cancha_id === cancha.id),
      ),
    );

    return {
      sedeId,
      fecha,
      configuracionPico: picoDto,
      descuentoSocioPct: cadena.descuentoSocioPct,
      canchas: grillaCanchas,
    };
  }

  async crearCancha(
    actor: ActorAutenticado,
    dto: CrearCanchaDto,
  ): Promise<CanchaResponseDto> {
    this.validarCrearCancha(dto);
    await this.assertExisteSede(dto.sedeId);
    await this.assertPuedeAdministrarSede(actor, dto.sedeId);

    const creada = await this.repository.crearCancha({
      sedeId: dto.sedeId,
      nombre: dto.nombre.trim(),
      tipo: dto.tipo,
      precioHora: dto.precioHora,
    });
    return this.aCanchaDto(creada);
  }

  async actualizarCancha(
    actor: ActorAutenticado,
    canchaId: string,
    dto: ActualizarCanchaDto,
  ): Promise<CanchaResponseDto> {
    this.assertUuid(canchaId, 'id');
    const cambios = this.extraerCambiosCancha(dto);

    const actual = await this.obtenerCanchaExistente(canchaId);
    await this.assertPuedeAdministrarSede(actor, actual.sede_id);

    const actualizada = await this.repository.actualizarCancha(
      canchaId,
      cambios,
    );
    if (!actualizada) {
      throw new NotFoundException('La cancha solicitada no existe');
    }
    return this.aCanchaDto(actualizada);
  }

  async listarMantenimientos(
    canchaId: string,
  ): Promise<MantenimientoCanchaResponseDto[]> {
    this.assertUuid(canchaId, 'canchaId');
    await this.obtenerCanchaExistente(canchaId);
    const filas = await this.repository.findMantenimientosPorCancha(canchaId);
    return filas.map((m) => this.aMantenimientoDto(m));
  }

  async crearMantenimiento(
    actor: ActorAutenticado,
    canchaId: string,
    dto: CrearMantenimientoDto,
  ): Promise<MantenimientoCanchaResponseDto> {
    this.assertUuid(canchaId, 'canchaId');
    this.validarRangoMantenimiento(dto);

    const cancha = await this.obtenerCanchaExistente(canchaId);
    await this.assertPuedeAdministrarSede(actor, cancha.sede_id);

    const creado = await this.repository.crearMantenimiento({
      canchaId,
      desde: dto.desde,
      hasta: dto.hasta,
      motivo: dto.motivo?.trim() || null,
    });
    return this.aMantenimientoDto(creado);
  }

  async eliminarMantenimiento(
    actor: ActorAutenticado,
    canchaId: string,
    mantenimientoId: string,
  ): Promise<void> {
    this.assertUuid(canchaId, 'canchaId');
    this.assertUuid(mantenimientoId, 'mantenimientoId');

    const cancha = await this.obtenerCanchaExistente(canchaId);
    await this.assertPuedeAdministrarSede(actor, cancha.sede_id);

    const existente =
      await this.repository.findMantenimientoById(mantenimientoId);
    if (!existente || existente.cancha_id !== canchaId) {
      throw new NotFoundException(
        'El período de mantenimiento no fue encontrado para esta cancha',
      );
    }

    await this.repository.eliminarMantenimiento(mantenimientoId);
  }

  async obtenerConfiguracionPico(sedeId: string): Promise<ConfiguracionPicoDto> {
    this.assertUuid(sedeId, 'sedeId');
    await this.assertExisteSede(sedeId);
    return this.obtenerConfiguracionPicoInterna(sedeId);
  }

  async actualizarConfiguracionPico(
    actor: ActorAutenticado,
    sedeId: string,
    dto: ActualizarConfiguracionPicoDto,
  ): Promise<ConfiguracionPicoDto> {
    this.assertUuid(sedeId, 'sedeId');
    const diasNormalizados = this.validarConfiguracionPico(dto);
    await this.assertExisteSede(sedeId);
    await this.assertPuedeAdministrarSede(actor, sedeId);

    const fila = await this.repository.upsertConfiguracionPico(sedeId, {
      recargo_pct: dto.recargoPct,
      desde: dto.desde,
      hasta: dto.hasta,
      dias: diasNormalizados,
    });
    return this.aConfiguracionPicoDto(fila);
  }

  async obtenerDescuentoSocio(): Promise<DescuentoSocioResponseDto> {
    const cadena = await this.obtenerConfiguracionCadenaInterna();
    return { descuentoSocioPct: cadena.descuentoSocioPct };
  }

  async actualizarDescuentoSocio(
    dto: ActualizarDescuentoSocioDto,
  ): Promise<DescuentoSocioResponseDto> {
    if (
      typeof dto?.descuentoSocioPct !== 'number' ||
      !Number.isFinite(dto.descuentoSocioPct) ||
      dto.descuentoSocioPct < 0 ||
      dto.descuentoSocioPct > 100
    ) {
      throw new BadRequestException(
        'descuentoSocioPct debe ser un número entre 0 y 100',
      );
    }
    const fila = await this.repository.actualizarDescuentoSocio(
      dto.descuentoSocioPct,
    );
    return { descuentoSocioPct: Number(fila.descuento_socio_pct) };
  }

  private armarDisponibilidadCancha(
    cancha: Cancha,
    fecha: string,
    pico: ConfiguracionPico,
    descuentoSocioPct: number,
    reservas: ReservaOcupacionFila[],
    mantenimientos: MantenimientoCancha[],
  ): CanchaDisponibilidadDto {
    const precioBase = Number(cancha.precio_hora);
    const turnos: TurnoDisponibilidadDto[] = [];

    for (
      let h = HORA_APERTURA_GRILLA;
      h <= HORA_ULTIMO_TURNO_GRILLA;
      h += 1
    ) {
      const hora = `${String(h).padStart(2, '0')}:00`;
      const inicio = `${fecha}T${hora}:00-03:00`;
      const fin =
        h === 23
          ? `${this.fechaSiguiente(fecha)}T00:00:00-03:00`
          : `${fecha}T${String(h + 1).padStart(2, '0')}:00:00-03:00`;

      const estado = this.resolverEstadoTurno(
        inicio,
        fin,
        reservas,
        mantenimientos,
      );
      const calcExterno = this.precios.calcular({
        precioBase,
        inicio,
        esSocioActivo: false,
        descuentoSocioPct,
        pico,
      });
      const calcSocio = this.precios.calcular({
        precioBase,
        inicio,
        esSocioActivo: true,
        descuentoSocioPct,
        pico,
      });

      turnos.push({
        hora,
        inicio,
        fin,
        estado,
        esHorarioPico: calcExterno.reglasAplicadas.includes('PeakHourPricing'),
        precioExterno: calcExterno.precioFinal,
        precioSocio: calcSocio.precioFinal,
      });
    }

    return {
      id: cancha.id,
      sedeId: cancha.sede_id,
      nombre: cancha.nombre,
      tipo: cancha.tipo,
      precioHora: precioBase,
      turnos,
    };
  }

  private resolverEstadoTurno(
    inicioIso: string,
    finIso: string,
    reservas: ReservaOcupacionFila[],
    mantenimientos: MantenimientoCancha[],
  ): EstadoTurnoGrilla {
    const inicioMs = new Date(inicioIso).getTime();
    const finMs = new Date(finIso).getTime();

    const ocupado = reservas.some(
      (r) =>
        new Date(r.inicio).getTime() < finMs &&
        new Date(r.fin).getTime() > inicioMs,
    );
    if (ocupado) {
      return 'ocupado';
    }

    const enMantenimiento = mantenimientos.some(
      (m) =>
        new Date(m.desde).getTime() < finMs &&
        new Date(m.hasta).getTime() > inicioMs,
    );
    if (enMantenimiento) {
      return 'mantenimiento';
    }

    return 'disponible';
  }

  private reservaOcupaTurno(
    reserva: ReservaOcupacionFila,
    minutosHold: number,
  ): boolean {
    if (reserva.estado === 'confirmada') {
      return true;
    }
    const venceMs =
      new Date(reserva.created_at).getTime() + minutosHold * 60_000;
    return Date.now() <= venceMs;
  }

  private async obtenerConfiguracionPicoInterna(
    sedeId: string,
  ): Promise<ConfiguracionPicoDto> {
    const fila = await this.repository.findConfiguracionPico(sedeId);
    if (!fila) {
      throw new ServiceUnavailableException(
        `Falta configuracion_pico para la sede ${sedeId}`,
      );
    }
    if (!fila.dias?.length) {
      throw new ServiceUnavailableException(
        `configuracion_pico.dias inválido para la sede ${sedeId}`,
      );
    }
    return this.aConfiguracionPicoDto(fila);
  }

  private async obtenerConfiguracionCadenaInterna(): Promise<{
    descuentoSocioPct: number;
    minutosHold: number;
  }> {
    const fila = await this.repository.findConfiguracionCadena();
    if (!fila) {
      throw new ServiceUnavailableException(
        'Falta configuracion_cadena en la base de datos',
      );
    }
    const minutosHold =
      fila.minutos_hold_reserva != null
        ? Number(fila.minutos_hold_reserva)
        : MINUTOS_HOLD_DEFAULT;
    return {
      descuentoSocioPct: Number(fila.descuento_socio_pct),
      minutosHold: minutosHold > 0 ? minutosHold : MINUTOS_HOLD_DEFAULT,
    };
  }

  private async obtenerCanchaExistente(canchaId: string): Promise<Cancha> {
    const cancha = await this.repository.findById(canchaId);
    if (!cancha) {
      throw new NotFoundException('La cancha solicitada no existe');
    }
    return cancha;
  }

  private async assertExisteSede(sedeId: string): Promise<void> {
    const existe = await this.repository.existeSede(sedeId);
    if (!existe) {
      throw new NotFoundException('La sede solicitada no existe');
    }
  }

  private async assertPuedeAdministrarSede(
    actor: ActorAutenticado,
    sedeId: string,
  ): Promise<void> {
    if (actor.rol === 'gerente') {
      return;
    }
    if (actor.rol !== 'admin_sede') {
      throw new ForbiddenException(
        'Tu rol no tiene permisos para administrar canchas de esta sede',
      );
    }
    const asignada = await this.repository.esAdminDeSede(actor.id, sedeId);
    if (!asignada) {
      throw new ForbiddenException({
        code: 'SEDE_NO_ASIGNADA',
        message: 'No administrás esa sede',
      });
    }
  }

  private validarCrearCancha(dto: CrearCanchaDto): void {
    this.assertUuid(dto?.sedeId, 'sedeId');
    if (typeof dto.nombre !== 'string' || !dto.nombre.trim()) {
      throw new BadRequestException('nombre es obligatorio');
    }
    if (!TIPOS_CANCHA.includes(dto.tipo)) {
      throw new BadRequestException(
        `tipo debe ser uno de: ${TIPOS_CANCHA.join(', ')}`,
      );
    }
    this.validarPrecioHora(dto.precioHora);
  }

  private extraerCambiosCancha(
    dto: ActualizarCanchaDto,
  ): Partial<Pick<Cancha, 'nombre' | 'precio_hora' | 'activa'>> {
    const cambios: Partial<Pick<Cancha, 'nombre' | 'precio_hora' | 'activa'>> =
      {};

    if (dto?.nombre !== undefined) {
      if (typeof dto.nombre !== 'string' || !dto.nombre.trim()) {
        throw new BadRequestException('nombre no puede estar vacío');
      }
      cambios.nombre = dto.nombre.trim();
    }
    if (dto?.precioHora !== undefined) {
      this.validarPrecioHora(dto.precioHora);
      cambios.precio_hora = dto.precioHora;
    }
    if (dto?.activa !== undefined) {
      if (typeof dto.activa !== 'boolean') {
        throw new BadRequestException('activa debe ser booleano');
      }
      cambios.activa = dto.activa;
    }

    if (Object.keys(cambios).length === 0) {
      throw new BadRequestException(
        'Debe enviar al menos un campo para actualizar (nombre, precioHora o activa)',
      );
    }
    return cambios;
  }

  private validarPrecioHora(precioHora: unknown): void {
    if (
      typeof precioHora !== 'number' ||
      !Number.isFinite(precioHora) ||
      precioHora < 0
    ) {
      throw new BadRequestException(
        'precioHora debe ser un número mayor o igual a 0',
      );
    }
  }

  private validarRangoMantenimiento(dto: CrearMantenimientoDto): void {
    if (typeof dto?.desde !== 'string' || Number.isNaN(Date.parse(dto.desde))) {
      throw new BadRequestException('desde debe ser una fecha ISO 8601 válida');
    }
    if (typeof dto?.hasta !== 'string' || Number.isNaN(Date.parse(dto.hasta))) {
      throw new BadRequestException('hasta debe ser una fecha ISO 8601 válida');
    }
    if (new Date(dto.hasta).getTime() <= new Date(dto.desde).getTime()) {
      throw new BadRequestException('hasta debe ser posterior a desde');
    }
    if (dto.motivo !== undefined && typeof dto.motivo !== 'string') {
      throw new BadRequestException('motivo debe ser texto');
    }
  }

  private validarConfiguracionPico(
    dto: ActualizarConfiguracionPicoDto,
  ): number[] {
    if (
      typeof dto?.recargoPct !== 'number' ||
      !Number.isFinite(dto.recargoPct) ||
      dto.recargoPct < 0 ||
      dto.recargoPct > 100
    ) {
      throw new BadRequestException(
        'recargoPct debe ser un número entre 0 y 100',
      );
    }
    if (
      typeof dto.desde !== 'string' ||
      !HORA_EN_PUNTO_REGEX.test(dto.desde) ||
      typeof dto.hasta !== 'string' ||
      !HORA_EN_PUNTO_REGEX.test(dto.hasta)
    ) {
      throw new BadRequestException(
        'desde y hasta deben ser horas en punto en formato HH:00',
      );
    }
    if (dto.desde >= dto.hasta) {
      throw new BadRequestException('desde debe ser anterior a hasta');
    }
    if (!Array.isArray(dto.dias) || dto.dias.length === 0) {
      throw new BadRequestException(
        'dias debe ser una lista no vacía de enteros entre 1 y 7',
      );
    }
    for (const d of dto.dias) {
      if (!Number.isInteger(d) || d < 1 || d > 7) {
        throw new BadRequestException(
          'dias solo admite valores enteros entre 1 (lunes) y 7 (domingo)',
        );
      }
    }
    return [...new Set(dto.dias)].sort((a, b) => a - b);
  }

  private assertUuid(valor: unknown, campo: string): void {
    if (typeof valor !== 'string' || !UUID_REGEX.test(valor.trim())) {
      throw new BadRequestException(
        `${campo} es obligatorio y debe ser un UUID válido`,
      );
    }
  }

  private assertFechaIso(fecha: unknown): void {
    if (typeof fecha !== 'string' || !FECHA_ISO_REGEX.test(fecha)) {
      throw new BadRequestException(
        'fecha es obligatoria y debe tener formato YYYY-MM-DD',
      );
    }
    const parsed = new Date(`${fecha}T00:00:00.000Z`);
    if (
      Number.isNaN(parsed.getTime()) ||
      parsed.toISOString().slice(0, 10) !== fecha
    ) {
      throw new BadRequestException('fecha no corresponde a un día válido');
    }
  }

  private fechaSiguiente(fecha: string): string {
    const base = new Date(`${fecha}T00:00:00.000Z`);
    base.setUTCDate(base.getUTCDate() + 1);
    return base.toISOString().slice(0, 10);
  }

  private aCanchaDto(fila: Cancha): CanchaResponseDto {
    return {
      id: fila.id,
      sedeId: fila.sede_id,
      nombre: fila.nombre,
      tipo: fila.tipo,
      precioHora: Number(fila.precio_hora),
      activa: fila.activa,
      createdAt: fila.created_at,
    };
  }

  private aMantenimientoDto(
    fila: MantenimientoCancha,
  ): MantenimientoCanchaResponseDto {
    return {
      id: fila.id,
      canchaId: fila.cancha_id,
      desde: fila.desde,
      hasta: fila.hasta,
      motivo: fila.motivo,
      createdAt: fila.created_at,
    };
  }

  private aConfiguracionPicoDto(
    fila: ConfiguracionPicoFila,
  ): ConfiguracionPicoDto {
    return {
      sedeId: fila.sede_id,
      recargoPct: Number(fila.recargo_pct),
      desde: this.aHhMm(fila.desde),
      hasta: this.aHhMm(fila.hasta),
      dias: fila.dias,
    };
  }

  private aHhMm(hora: string): string {
    const [h, m] = hora.split(':');
    return `${h.padStart(2, '0')}:${(m ?? '00').padStart(2, '0')}`;
  }
}
