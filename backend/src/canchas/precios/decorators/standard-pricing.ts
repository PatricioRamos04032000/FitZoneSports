import { Injectable } from '@nestjs/common';
import {
  PrecioAcumulado,
  PricingComponent,
} from '../pricing.component';
import { ContextoPrecio } from '../pricing.types';

/**
 * Componente concreto del Decorator (RF-11, C-28).
 * Punto de partida de la cadena: el precio base de la cancha.
 */
@Injectable()
export class StandardPricing implements PricingComponent {
  readonly nombre = 'StandardPricing';

  calcular(ctx: ContextoPrecio): PrecioAcumulado {
    return {
      precio: ctx.precioBase,
      reglasAplicadas: [this.nombre],
    };
  }
}
