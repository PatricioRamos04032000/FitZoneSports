import {
  PrecioAcumulado,
  PricingComponent,
} from '../pricing.component';
import { ContextoPrecio } from '../pricing.types';

/**
 * Decorador abstracto (GoF): envuelve un PricingComponent y, si aplica,
 * transforma el precio que devolvió el componente interior.
 */
export abstract class PricingDecorator implements PricingComponent {
  protected inner!: PricingComponent;

  abstract readonly nombre: string;

  abstract aplica(ctx: ContextoPrecio): boolean;

  abstract modificar(precio: number, ctx: ContextoPrecio): number;

  wrap(inner: PricingComponent): PricingComponent {
    this.inner = inner;
    return this;
  }

  calcular(ctx: ContextoPrecio): PrecioAcumulado {
    const acumulado = this.inner.calcular(ctx);
    if (!this.aplica(ctx)) {
      return acumulado;
    }

    return {
      precio: this.modificar(acumulado.precio, ctx),
      reglasAplicadas: [...acumulado.reglasAplicadas, this.nombre],
    };
  }
}
