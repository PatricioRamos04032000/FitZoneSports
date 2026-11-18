import type { PlanMembresia } from '../usuarios/membresias/membresia.model';

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
  plan: PlanMembresia | null;
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
  plan: PlanMembresia | null;
};

export interface TitularComprobante {
  id: string;
  nombre: string | null;
  apellido: string | null;
  dni: string | null;
}

export interface ReservaComprobante {
  id: string;
  cancha_id: string;
  perfil_id: string;
  inicio: string;
  fin: string;
  precio: number;
  estado: string;
  detalle: Record<string, unknown>;
  canchaNombre: string;
  canchaTipo: string;
  sedeNombre: string;
  sedeDireccion: string | null;
}

export interface MembresiaComprobante {
  id: string;
  plan: PlanMembresia;
  vigente_desde: string;
  vigente_hasta: string;
  estado: string;
}

export interface ResumenPago {
  id: string;
  concepto: ConceptoPago;
  monto: number;
  estado: EstadoPago;
  reservaCanchaId: string | null;
  membresiaId: string | null;
  plan: PlanMembresia | null;
  createdAt: string;
}
