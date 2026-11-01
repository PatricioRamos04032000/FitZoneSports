import { Injectable } from '@nestjs/common';
import {
  CobroRequest,
  PasarelaPago,
  PreferenciaCobro,
  ResultadoCobro,
} from '../../pagos/pasarela-pago';

/**
 * Stub de pasarela (S7-T01): siempre aprueba, no escribe en `pagos`.
 * Útil como doble en tests; en prod el módulo usa `PasarelaSimulada`.
 */
@Injectable()
export class PasarelaStub implements PasarelaPago {
  async cobrar(request: CobroRequest): Promise<ResultadoCobro> {
    return {
      aprobado: true,
      token: `stub-${request.referenciaId}`,
      reservaCanchaId: request.referenciaId,
    };
  }

  async crearPreferencia(request: CobroRequest): Promise<PreferenciaCobro> {
    return {
      pagoId: `stub-pago-${request.referenciaId}`,
      checkoutUrl: `http://localhost:3000/pasarela-simulada/checkout/stub-pago-${request.referenciaId}`,
    };
  }

  async confirmarPago(
    pagoId: string,
    resultado: { aprobado: boolean; token?: string; motivo?: string },
  ): Promise<ResultadoCobro> {
    return {
      aprobado: resultado.aprobado,
      token: resultado.token ?? `stub-${pagoId}`,
      motivo: resultado.motivo,
      pagoId,
    };
  }
}
