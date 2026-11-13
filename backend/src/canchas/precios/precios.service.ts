import { Inject, Injectable } from '@nestjs/common';
import { PRICING_CHAIN, PricingComponent } from './pricing.component';
import { ContextoPrecio, PrecioCalculado } from './pricing.types';

/**
 * Contexto del patrón Decorator (RF-11, C-28).
 * Invoca la raíz de la cadena ordenada, redondea hacia arriba al peso entero (P7, S4-T15).
 */
@Injectable()
export class PreciosService {
  constructor(
    @Inject(PRICING_CHAIN)
    private readonly cadena: PricingComponent,
  ) {}

  calcular(ctx: ContextoPrecio): PrecioCalculado {
    const acumulado = this.cadena.calcular(ctx);

    return {
      precioBase: ctx.precioBase,
      precioFinal: this.redondearAlPesoSuperior(acumulado.precio),
      reglasAplicadas: acumulado.reglasAplicadas,
      descuentoSocioAplicado: acumulado.reglasAplicadas.includes(
        'MemberDiscountPricing',
      ),
    };
  }

  private redondearAlPesoSuperior(monto: number): number {
    // Limpia residuos de punto flotante IEEE-754 (ej. 20000 * 1.14 = 22800.000000000004)
    // antes de redondear hacia arriba para no sumar $1 sobre resultados enteros exactos.
    return Math.ceil(Number(monto.toFixed(8)));
  }
}
