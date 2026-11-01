/** Valores del enum SQL `estado_reserva_cancha`. */
export type EstadoReservaCancha = 'pendiente' | 'confirmada' | 'cancelada';

/** Fila de `public.reservas_cancha`. */
export interface ReservaCancha {
  id: string;
  cancha_id: string;
  perfil_id: string;
  inicio: string;
  fin: string;
  precio: number;
  detalle: Record<string, unknown>;
  estado: EstadoReservaCancha;
  created_at: string;
}

/** Fila mínima de `public.canchas` para armar el contexto de precio. */
export interface CanchaParaPrecio {
  id: string;
  sede_id: string;
  precio_hora: number;
  activa: boolean;
}

/** Fila de `public.configuracion_pico`. */
export interface ConfiguracionPicoFila {
  sede_id: string;
  recargo_pct: number;
  desde: string;
  hasta: string;
  dias: number[];
}

/** Fila de `public.configuracion_cadena` (singleton). */
export interface ConfiguracionCadenaFila {
  id: boolean;
  descuento_socio_pct: number;
}
