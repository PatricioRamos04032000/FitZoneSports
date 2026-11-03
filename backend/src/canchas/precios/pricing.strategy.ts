export const PRICING_STRATEGIES = Symbol('PRICING_STRATEGIES');

export const DESCUENTO_SOCIO_DEFAULT_PCT = 15;

export interface ConfiguracionPico {
  /** Porcentaje de recargo entre 0 y 100 (0 = sin recargo). */
  recargoPct: number;
  /** Hora de inicio del rango pico en formato HH:mm (ej. '19:00'). */
  desde: string;
  /** Hora de fin del rango pico en formato HH:mm (ej. '21:00', exclusivo). */
  hasta: string;
  /** Días de la semana en que aplica: 1 = lunes … 7 = domingo. */
  dias: number[];
}

export const CONFIGURACION_PICO_DEFAULT: ConfiguracionPico = {
  recargoPct: 20,
  desde: '19:00',
  hasta: '21:00',
  dias: [1, 2, 3, 4, 5, 6, 7],
};

export interface ContextoPrecio {
  /** Precio base por hora de la cancha (`canchas.precio_hora`). */
  precioBase: number;
  /** Fecha y hora de inicio del turno (ISO 8601 o Date). */
  inicio: Date | string;
  /** True si el cliente tiene una membresía activa vigente el día del turno (RN-03). */
  esSocioActivo: boolean;
  /** Porcentaje de descuento para socios activos (`configuracion_cadena.descuento_socio_pct`). */
  descuentoSocioPct: number;
  /** Configuración de horario pico de la sede (`configuracion_pico`). */
  pico: ConfiguracionPico;
}

export interface PrecioCalculado {
  precioBase: number;
  precioFinal: number;
  reglasAplicadas: string[];
  descuentoSocioAplicado: boolean;
}

/**
 * Interfaz Strategy (GoF) para el cálculo dinámico de precios de canchas (RF-11).
 * Cada regla determina si aplica al contexto de la reserva y transforma el precio acumulado.
 */
export interface PricingStrategy {
  readonly nombre: string;
  aplica(ctx: ContextoPrecio): boolean;
  calcular(precio: number, ctx: ContextoPrecio): number;
}
