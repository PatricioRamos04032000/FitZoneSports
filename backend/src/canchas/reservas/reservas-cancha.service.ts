import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ContextoPrecio } from '../precios/pricing.strategy';
import { PreciosService } from '../precios/precios.service';
import { RepositoryError } from '../../supabase/repository.error';
import { Reserva } from './estado/reserva';
import { PASARELA_PAGO } from './pasarela-pago';
import type { PasarelaPago } from './pasarela-pago';
import { ReservarCanchaDto, ReservaCanchaResponseDto } from './reserva-cancha.dto';
import { ReservaCancha } from './reserva-cancha.model';
import { ReservasCanchaRepository } from './reservas-cancha.repository';

/**
 * Facade (GoF) del caso de uso “reservar cancha”.
 * Orquesta Strategy (precio), RPC de lock/insert, pasarela y State.
 */
@Injectable()
export class ReservasCanchaService {
  constructor(
    private readonly repository: ReservasCanchaRepository,
    private readonly precios: PreciosService,
    @Inject(PASARELA_PAGO) private readonly pasarela: PasarelaPago,
  ) {}

  async reservar(
    perfilId: string,
    dto: ReservarCanchaDto,
  ): Promise<ReservaCanchaResponseDto> {
    this.validarDto(dto);

    const cancha = await this.repository.findCanchaParaPrecio(dto.canchaId);
    if (!cancha) {
      throw new NotFoundException('La cancha solicitada no existe');
    }
    if (!cancha.activa) {
      throw new ConflictException('La cancha está inactiva');
    }

    const [pico, descuentoSocioPct, esSocioActivo] = await Promise.all([
      this.repository.findConfiguracionPico(cancha.sede_id),
      this.repository.findDescuentoSocioPct(),
      this.repository.tieneMembresiaActivaEn(perfilId, dto.inicio),
    ]);

    const ctx: ContextoPrecio = {
      precioBase: Number(cancha.precio_hora),
      inicio: dto.inicio,
      esSocioActivo,
      descuentoSocioPct,
      pico,
    };
    const calculado = this.precios.calcular(ctx);

    const detalle = {
      precioBase: calculado.precioBase,
      precioFinal: calculado.precioFinal,
      reglasAplicadas: calculado.reglasAplicadas,
      descuentoSocioAplicado: calculado.descuentoSocioAplicado,
      motivoSinDescuento: esSocioActivo ? undefined : 'MEMBRESIA_NO_ACTIVA',
    };

    let pendiente: ReservaCancha;
    try {
      pendiente = await this.repository.reservar({
        canchaId: dto.canchaId,
        perfilId,
        inicio: dto.inicio,
        precio: calculado.precioFinal,
        detalle,
        estado: 'pendiente',
      });
    } catch (e) {
      this.rethrowRpc(e);
    }

    const reserva = Reserva.desdeFila(pendiente!, this.repository);
    const cobro = await this.pasarela.cobrar({
      monto: calculado.precioFinal,
      concepto: 'reserva_cancha',
      referenciaId: reserva.id,
    });

    if (!cobro.aprobado) {
      await reserva.cancelar();
      throw new HttpException(
        cobro.motivo ?? 'El pago fue rechazado; la reserva no quedó confirmada',
        HttpStatus.PAYMENT_REQUIRED,
      );
    }

    try {
      const confirmada = await reserva.pagar();
      return this.aDto(confirmada);
    } catch (e) {
      this.rethrowRpc(e);
    }
  }

  async cancelar(
    perfilId: string,
    reservaId: string,
  ): Promise<ReservaCanchaResponseDto> {
    const fila = await this.repository.findById(reservaId);
    if (!fila) {
      throw new NotFoundException('La reserva no fue encontrada');
    }
    if (fila.perfil_id !== perfilId) {
      throw new ForbiddenException('No podés cancelar la reserva de otro usuario');
    }

    const reserva = Reserva.desdeFila(fila, this.repository);
    try {
      const actualizada = await reserva.cancelar();
      return this.aDto(actualizada);
    } catch (e) {
      if (e instanceof BadRequestException) {
        throw e;
      }
      this.rethrowRpc(e);
    }
  }

  private validarDto(dto: ReservarCanchaDto): void {
    if (!dto?.canchaId || typeof dto.canchaId !== 'string') {
      throw new BadRequestException('canchaId es obligatorio');
    }
    if (!dto?.inicio || typeof dto.inicio !== 'string') {
      throw new BadRequestException('inicio es obligatorio');
    }
    if (Number.isNaN(Date.parse(dto.inicio))) {
      throw new BadRequestException('inicio debe ser una fecha ISO válida');
    }
  }

  private aDto(fila: ReservaCancha): ReservaCanchaResponseDto {
    return {
      id: fila.id,
      canchaId: fila.cancha_id,
      perfilId: fila.perfil_id,
      inicio: fila.inicio,
      fin: fila.fin,
      precio: Number(fila.precio),
      detalle: fila.detalle ?? {},
      estado: fila.estado,
      createdAt: fila.created_at,
    };
  }

  private rethrowRpc(e: unknown): never {
    if (e instanceof RepositoryError && e.code === 'P0001') {
      switch (e.message) {
        case 'CANCHA_NO_EXISTE':
          throw new NotFoundException('La cancha solicitada no existe');
        case 'CANCHA_INACTIVA':
          throw new ConflictException('La cancha está inactiva');
        case 'TURNO_OCUPADO':
          throw new ConflictException('Ese turno ya está reservado');
        case 'CANCHA_EN_MANTENIMIENTO':
          throw new ConflictException('La cancha está en mantenimiento en ese horario');
        case 'TURNO_NO_EN_HORA':
          throw new BadRequestException('El turno debe comenzar en hora en punto');
        case 'TURNO_PASADO':
          throw new BadRequestException('No se puede reservar un turno pasado');
        case 'FUERA_DE_HORIZONTE':
          throw new BadRequestException('Solo se puede reservar hasta 1 mes hacia adelante');
        case 'PERFIL_NO_EXISTE':
          throw new NotFoundException('El perfil no existe');
        case 'RESERVA_NO_EXISTE':
          throw new NotFoundException('La reserva no fue encontrada');
        case 'RESERVA_YA_CANCELADA':
          throw new BadRequestException('La reserva ya está cancelada');
        case 'RESERVA_YA_CONFIRMADA':
          throw new BadRequestException('La reserva ya está confirmada');
        case 'RESERVA_CANCELADA':
          throw new BadRequestException('La reserva está cancelada');
        case 'ESTADO_INVALIDO':
          throw new BadRequestException('Estado de reserva inválido');
      }
    }
    throw e;
  }
}
