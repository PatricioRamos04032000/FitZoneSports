import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'crypto';
import {
  Pago,
  ResumenPago,
  TitularComprobante,
} from '../pago.model';
import { PagosRepository } from '../pagos.repository';
import { ComprobanteMembresiaPdf } from './comprobante-membresia.pdf';
import { ComprobanteReservaPdf } from './comprobante-reserva.pdf';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface ArchivoComprobante {
  buffer: Buffer;
  filename: string;
}

@Injectable()
export class ComprobantesService {
  private readonly pdfReserva = new ComprobanteReservaPdf();
  private readonly pdfMembresia = new ComprobanteMembresiaPdf();

  constructor(
    private readonly pagos: PagosRepository,
    private readonly config: ConfigService,
  ) {}

  async listarAprobadosMios(perfilId: string): Promise<ResumenPago[]> {
    this.validarUuid(perfilId, 'perfilId');
    const filas = await this.pagos.findAprobadosPorPerfil(perfilId);
    return filas.map((p) => ({
      id: p.id,
      concepto: p.concepto,
      monto: Number(p.monto),
      estado: p.estado,
      reservaCanchaId: p.reserva_cancha_id,
      membresiaId: p.membresia_id,
      plan: p.plan,
      createdAt: p.created_at,
    }));
  }

  async generarPorPago(
    pagoId: string,
    perfilId: string,
  ): Promise<ArchivoComprobante> {
    this.validarUuid(pagoId, 'pagoId');
    const pago = await this.pagos.findById(pagoId);
    if (!pago) {
      throw new NotFoundException('Pago no encontrado');
    }
    if (pago.perfil_id !== perfilId) {
      throw new ForbiddenException(
        'No podés descargar el comprobante de otro usuario',
      );
    }
    return this.emitirComprobante(pago);
  }

  async generarPorReserva(
    reservaId: string,
    perfilId: string,
  ): Promise<ArchivoComprobante> {
    this.validarUuid(reservaId, 'reservaId');
    const reserva = await this.pagos.findReservaComprobante(reservaId);
    if (!reserva) {
      throw new NotFoundException('La reserva no fue encontrada');
    }
    if (reserva.perfil_id !== perfilId) {
      throw new ForbiddenException(
        'No podés descargar el comprobante de otro usuario',
      );
    }

    const pago = await this.pagos.findAprobadoPorReserva(reservaId);
    if (!pago) {
      throw new ConflictException(
        'La reserva no tiene un pago aprobado para emitir comprobante',
      );
    }

    return this.emitirParaReserva(pago, reserva);
  }

  async generarPorPagoFirmado(
    pagoId: string,
    sig: string | undefined,
  ): Promise<ArchivoComprobante> {
    this.validarUuid(pagoId, 'pagoId');
    if (!sig || !this.verificarFirma(pagoId, sig)) {
      throw new ForbiddenException('Enlace de descarga inválido');
    }
    const pago = await this.pagos.findById(pagoId);
    if (!pago) {
      throw new NotFoundException('Pago no encontrado');
    }
    return this.emitirComprobante(pago);
  }

  firmarPago(pagoId: string): string {
    return createHmac('sha256', this.claveFirma())
      .update(pagoId)
      .digest('hex');
  }

  private verificarFirma(pagoId: string, sig: string): boolean {
    const esperada = this.firmarPago(pagoId);
    const bufA = Buffer.from(esperada, 'utf8');
    const bufB = Buffer.from(sig, 'utf8');
    if (bufA.length !== bufB.length) {
      return false;
    }
    return timingSafeEqual(bufA, bufB);
  }

  private claveFirma(): string {
    return (
      this.config.get<string>('COMPROBANTE_SIGNING_SECRET') ??
      this.config.get<string>('SUPABASE_SERVICE_ROLE_KEY') ??
      'fitzone-comprobante-dev'
    );
  }

  private async emitirComprobante(pago: Pago): Promise<ArchivoComprobante> {
    if (pago.estado !== 'aprobado') {
      throw new ConflictException(
        'Solo se emite comprobante para pagos aprobados',
      );
    }

    if (pago.concepto === 'reserva_cancha') {
      if (!pago.reserva_cancha_id) {
        throw new BadRequestException('El pago no tiene una reserva vinculada');
      }
      const reserva = await this.pagos.findReservaComprobante(
        pago.reserva_cancha_id,
      );
      if (!reserva) {
        throw new NotFoundException('La reserva vinculada al pago no existe');
      }
      return this.emitirParaReserva(pago, reserva);
    }

    const [perfil, membresia] = await Promise.all([
      this.pagos.findPerfilComprobante(pago.perfil_id),
      pago.membresia_id
        ? this.pagos.findMembresiaComprobante(pago.membresia_id)
        : Promise.resolve(null),
    ]);

    const buffer = await this.pdfMembresia.generar({
      pagoId: pago.id,
      fechaPagoIso: pago.created_at,
      monto: Number(pago.monto),
      tokenPasarela: pago.token_pasarela,
      titularNombre: this.nombreTitular(perfil, pago.perfil_id),
      titularDni: perfil?.dni ?? null,
      membresiaId: pago.membresia_id,
      plan: membresia?.plan ?? pago.plan ?? 'membresia',
      vigenteDesde: membresia?.vigente_desde ?? null,
      vigenteHasta: membresia?.vigente_hasta ?? null,
      estadoMembresia: membresia?.estado ?? null,
    });

    return {
      buffer,
      filename: `comprobante-fitzone-${pago.id.slice(0, 8)}.pdf`,
    };
  }

  private async emitirParaReserva(
    pago: Pago,
    reserva: NonNullable<
      Awaited<ReturnType<PagosRepository['findReservaComprobante']>>
    >,
  ): Promise<ArchivoComprobante> {
    if (pago.estado !== 'aprobado') {
      throw new ConflictException(
        'Solo se emite comprobante para pagos aprobados',
      );
    }

    const perfil = await this.pagos.findPerfilComprobante(pago.perfil_id);
    const detalle = reserva.detalle ?? {};
    const precioBase =
      typeof detalle.precioBase === 'number' ? detalle.precioBase : null;
    const reglasAplicadas = Array.isArray(detalle.reglasAplicadas)
      ? detalle.reglasAplicadas.filter(
          (item): item is string => typeof item === 'string',
        )
      : [];

    const buffer = await this.pdfReserva.generar({
      pagoId: pago.id,
      fechaPagoIso: pago.created_at,
      monto: Number(pago.monto),
      tokenPasarela: pago.token_pasarela,
      titularNombre: this.nombreTitular(perfil, pago.perfil_id),
      titularDni: perfil?.dni ?? null,
      reservaId: reserva.id,
      sedeNombre: reserva.sedeNombre,
      sedeDireccion: reserva.sedeDireccion,
      canchaNombre: reserva.canchaNombre,
      canchaTipo: reserva.canchaTipo,
      inicioIso: reserva.inicio,
      finIso: reserva.fin,
      precioBase,
      reglasAplicadas,
    });

    return {
      buffer,
      filename: `comprobante-fitzone-${pago.id.slice(0, 8)}.pdf`,
    };
  }

  private nombreTitular(
    perfil: TitularComprobante | null,
    perfilId: string,
  ): string {
    const completo = [perfil?.nombre, perfil?.apellido]
      .filter((parte): parte is string => Boolean(parte?.trim()))
      .join(' ')
      .trim();
    return completo || `Socio (${perfilId.slice(0, 8)})`;
  }

  private validarUuid(valor: string | undefined, campo: string): void {
    if (!valor || typeof valor !== 'string' || !UUID_REGEX.test(valor)) {
      throw new BadRequestException(`${campo} debe ser un UUID válido`);
    }
  }
}
