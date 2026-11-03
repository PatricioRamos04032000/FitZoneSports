export type ConceptoPago = 'membresia' | 'reserva_cancha';
export type EstadoPago = 'pendiente' | 'aprobado' | 'rechazado';

/** Fila de `public.pagos`. */
export interface Pago {
  id: string;
  perfil_id: string;
  concepto: ConceptoPago;
  monto: number;
  token_pasarela: string | null;
  estado: EstadoPago;
  reserva_cancha_id: string | null;
  membresia_id: string | null;
  created_at: string;
}

export type NuevoPago = {
  perfil_id: string;
  concepto: ConceptoPago;
  monto: number;
  token_pasarela: string | null;
  estado: EstadoPago;
  reserva_cancha_id: string | null;
  membresia_id: string | null;
};
