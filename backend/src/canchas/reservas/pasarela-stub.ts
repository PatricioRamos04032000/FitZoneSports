import { Injectable } from '@nestjs/common';
import {
  CobroRequest,
  PasarelaPago,
  ResultadoCobro,
} from './pasarela-pago';

/**
 * Stub de pasarela (S7-T01): siempre aprueba, no escribe en `pagos`.
 * En tests se puede reemplazar por un mock que rechaza.
 */
@Injectable()
export class PasarelaStub implements PasarelaPago {
  async cobrar(request: CobroRequest): Promise<ResultadoCobro> {
    return {
      aprobado: true,
      token: `stub-${request.referenciaId}`,
    };
  }
}
