/** Valores del enum SQL `public.tipo_cancha`. */
export type TipoCancha = 'paddle' | 'futbol5' | 'otro';

/** Fila de `public.canchas`. */
export interface Cancha {
  id: string;
  sede_id: string;
  tipo: TipoCancha;
  nombre: string;
  precio_hora: number;
  activa: boolean;
  created_at: string;
}

/** Fila de `public.mantenimientos_cancha`. */
export interface MantenimientoCancha {
  id: string;
  cancha_id: string;
  desde: string;
  hasta: string;
  motivo: string | null;
  created_at: string;
}

/** Proyección mínima de `public.reservas_cancha` para armar la grilla (RNF-03). */
export interface ReservaOcupacionFila {
  id: string;
  cancha_id: string;
  inicio: string;
  fin: string;
  estado: 'pendiente' | 'confirmada';
  created_at: string;
}

/** Fila de `public.configuracion_pico`. */
export interface ConfiguracionPicoFila {
  sede_id: string;
  recargo_pct: number;
  desde: string;
  hasta: string;
  dias: number[];
  updated_at?: string;
}

/** Fila singleton de `public.configuracion_cadena`. */
export interface ConfiguracionCadenaFila {
  id: boolean;
  descuento_socio_pct: number;
  minutos_hold_reserva?: number;
  updated_at?: string;
}
