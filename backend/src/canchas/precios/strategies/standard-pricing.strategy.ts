import { Injectable } from '@nestjs/common';
import { ContextoPrecio, PricingStrategy } from '../pricing.strategy';

/**
 * Estrategia de tarifa estándar (RF-11).
 * Siempre aplica como punto de partida y establece el precio base de la cancha.
 */
@Injectable()
export class StandardPricing implements PricingStrategy {
  readonly nombre = 'StandardPricing';

  aplica(_ctx: ContextoPrecio): boolean {
    return true;
  }

  calcular(_precio: number, ctx: ContextoPrecio): number {
    return ctx.precioBase;
  }
}
