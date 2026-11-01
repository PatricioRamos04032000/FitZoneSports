/**
 * Puerto de cobro usado por el Facade de reserva.
 * S7-T01: stub. S7-T02: Adapter que persiste en `pagos`.
 */
export const PASARELA_PAGO = Symbol('PASARELA_PAGO');

export interface ResultadoCobro {
  aprobado: boolean;
  /** Token opaco de la pasarela; el stub no lo persiste. */
  token?: string;
  motivo?: string;
}

export interface CobroRequest {
  monto: number;
  concepto: 'reserva_cancha';
  referenciaId: string;
}

export interface PasarelaPago {
  cobrar(request: CobroRequest): Promise<ResultadoCobro>;
}
