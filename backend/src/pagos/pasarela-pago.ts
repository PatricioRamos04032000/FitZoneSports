/**
 * Puerto de cobro (target Adapter / simulacro).
 * S7-T02b: preferencia + checkout simulado. MercadoPago real queda para después.
 */
export const PASARELA_PAGO = Symbol('PASARELA_PAGO');

/** Token de prueba que el simulacro rechaza (RF-13). */
export const TOKEN_PRUEBA_RECHAZO = 'tok_fail';

/** Token de prueba que el simulacro aprueba (RF-13). */
export const TOKEN_PRUEBA_APROBADO = 'tok_ok';

/** Tarjeta de prueba aprobada (checkout simulado; no se persiste). */
export const TARJETA_PRUEBA_OK = '4111111111111111';

/** Tarjeta de prueba rechazada (checkout simulado; no se persiste). */
export const TARJETA_PRUEBA_FAIL = '4000000000000002';

export interface ResultadoCobro {
  aprobado: boolean;
  /** Token opaco de la pasarela (RNF-02); no hay PAN/CVV. */
  token?: string;
  motivo?: string;
  /** Reserva vinculada (útil tras confirmar desde checkout). */
  reservaCanchaId?: string;
  pagoId?: string;
}

export interface CobroRequest {
  monto: number;
  concepto: 'reserva_cancha';
  /** Id de `reservas_cancha` (o membresía en el futuro). */
  referenciaId: string;
  perfilId: string;
  /** Opcional: `tok_ok` / `tok_fail` para forzar resultado del simulacro síncrono. */
  tokenPrueba?: string;
}

export interface PreferenciaCobro {
  pagoId: string;
  checkoutUrl: string;
}

export interface PasarelaPago {
  /**
   * @deprecated Preferir crearPreferencia + confirmarPago (flujo checkout).
   * Se mantiene para dobles de test del cobro síncrono.
   */
  cobrar(request: CobroRequest): Promise<ResultadoCobro>;

  /** Crea o reutiliza un pago `pendiente` y devuelve URL de checkout. */
  crearPreferencia(request: CobroRequest): Promise<PreferenciaCobro>;

  /** Cierra el pago (aprobado/rechazado) sin recibir datos de tarjeta. */
  confirmarPago(
    pagoId: string,
    resultado: { aprobado: boolean; token?: string; motivo?: string },
  ): Promise<ResultadoCobro>;
}
