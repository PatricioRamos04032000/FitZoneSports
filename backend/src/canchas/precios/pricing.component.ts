import { ContextoPrecio } from './pricing.types';

/** Lista ordenada de decoradores que envuelven al componente base (C-28). */
export const PRICING_DECORATORS = Symbol('PRICING_DECORATORS');

/** Raíz de la cadena Decorator inyectada en PreciosService. */
export const PRICING_CHAIN = Symbol('PRICING_CHAIN');

export interface PrecioAcumulado {
  precio: number;
  reglasAplicadas: string[];
}

/**
 * Componente del patrón Decorator (GoF) para el precio dinámico de canchas (RF-11, C-28).
 */
export interface PricingComponent {
  readonly nombre: string;
  calcular(ctx: ContextoPrecio): PrecioAcumulado;
}
