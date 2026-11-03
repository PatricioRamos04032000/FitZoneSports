import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { PagosRepository } from './pagos.repository';
import {
  CobroRequest,
  PasarelaPago,
  PreferenciaCobro,
  ResultadoCobro,
  TOKEN_PRUEBA_RECHAZO,
} from './pasarela-pago';

/**
 * Pasarela simulada (RF-13): preferencia + checkout HTML + persistencia en `pagos` (RNF-02).
 */
@Injectable()
export class PasarelaSimulada implements PasarelaPago {
  constructor(
    private readonly pagos: PagosRepository,
    private readonly config: ConfigService,
  ) {}

  async crearPreferencia(request: CobroRequest): Promise<PreferenciaCobro> {
    const existente = await this.pagos.findPendientePorReserva(request.referenciaId);
    if (existente) {
      return {
        pagoId: existente.id,
        checkoutUrl: this.checkoutUrl(existente.id),
      };
    }

    const pago = await this.pagos.registrarCobro({
      perfil_id: request.perfilId,
      concepto: request.concepto,
      monto: request.monto,
      token_pasarela: null,
      estado: 'pendiente',
      reserva_cancha_id:
        request.concepto === 'reserva_cancha' ? request.referenciaId : null,
      membresia_id: null,
    });

    return {
      pagoId: pago.id,
      checkoutUrl: this.checkoutUrl(pago.id),
    };
  }

  async confirmarPago(
    pagoId: string,
    resultado: { aprobado: boolean; token?: string; motivo?: string },
  ): Promise<ResultadoCobro> {
    const pago = await this.pagos.findById(pagoId);
    if (!pago) {
      return { aprobado: false, motivo: 'Pago no encontrado', pagoId };
    }
    if (pago.estado !== 'pendiente') {
      return {
        aprobado: pago.estado === 'aprobado',
        token: pago.token_pasarela ?? undefined,
        motivo:
          pago.estado === 'aprobado'
            ? undefined
            : 'El pago ya fue rechazado',
        reservaCanchaId: pago.reserva_cancha_id ?? undefined,
        pagoId: pago.id,
      };
    }

    const token = resultado.aprobado
      ? (resultado.token ?? `sim-${randomUUID()}`)
      : null;

    const actualizado = await this.pagos.actualizarEstado(pagoId, {
      estado: resultado.aprobado ? 'aprobado' : 'rechazado',
      token_pasarela: token,
    });

    return {
      aprobado: resultado.aprobado,
      token: token ?? undefined,
      motivo: resultado.aprobado
        ? undefined
        : (resultado.motivo ?? 'El pago fue rechazado por la pasarela simulada'),
      reservaCanchaId: actualizado.reserva_cancha_id ?? undefined,
      pagoId: actualizado.id,
    };
  }

  /** Cobro síncrono (tests / compatibilidad). Preferir preferencia + checkout. */
  async cobrar(request: CobroRequest): Promise<ResultadoCobro> {
    const aprobado = request.tokenPrueba !== TOKEN_PRUEBA_RECHAZO;
    const token = aprobado
      ? (request.tokenPrueba ?? `sim-${randomUUID()}`)
      : undefined;

    const pago = await this.pagos.registrarCobro({
      perfil_id: request.perfilId,
      concepto: request.concepto,
      monto: request.monto,
      token_pasarela: token ?? null,
      estado: aprobado ? 'aprobado' : 'rechazado',
      reserva_cancha_id:
        request.concepto === 'reserva_cancha' ? request.referenciaId : null,
      membresia_id: null,
    });

    if (!aprobado) {
      return {
        aprobado: false,
        motivo: 'El pago fue rechazado por la pasarela simulada',
        pagoId: pago.id,
        reservaCanchaId: request.referenciaId,
      };
    }

    return {
      aprobado: true,
      token,
      pagoId: pago.id,
      reservaCanchaId: request.referenciaId,
    };
  }

  private checkoutUrl(pagoId: string): string {
    const base = (
      this.config.get<string>('APP_PUBLIC_URL') ?? 'http://localhost:3000'
    ).replace(/\/$/, '');
    return `${base}/pasarela-simulada/checkout/${pagoId}`;
  }
}
