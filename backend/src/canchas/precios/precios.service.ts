import { Inject, Injectable } from '@nestjs/common';
import {
  ContextoPrecio,
  PrecioCalculado,
  PRICING_STRATEGIES,
  PricingStrategy,
} from './pricing.strategy';
import { MemberDiscountPricing } from './strategies/member-discount-pricing.strategy';

/**
 * Contexto del patrón Strategy (RF-11, S4-T09).
 * Recibe la cadena ordenada de estrategias de precios e invoca las que aplican
 * acumulando el resultado (P4) y redondeando hacia arriba al peso entero al final (P7, S4-T15).
 */
@Injectable()
export class PreciosService {
  constructor(
    @Inject(PRICING_STRATEGIES)
    private readonly estrategias: PricingStrategy[],
  ) {}

  calcular(ctx: ContextoPrecio): PrecioCalculado {
    const activas = this.estrategias.filter((estrategia) =>
      estrategia.aplica(ctx),
    );

    const precioSinRedondeo = activas.reduce(
      (precioActual, estrategia) => estrategia.calcular(precioActual, ctx),
      ctx.precioBase,
    );

    const reglasAplicadas = activas.map((estrategia) => estrategia.nombre);

    return {
      precioBase: ctx.precioBase,
      precioFinal: this.redondearAlPesoSuperior(precioSinRedondeo),
      reglasAplicadas,
      descuentoSocioAplicado: activas.some(
        (estrategia) => estrategia instanceof MemberDiscountPricing,
      ),
    };
  }

  private redondearAlPesoSuperior(monto: number): number {
    // Limpia residuos de punto flotante IEEE-754 (ej. 20000 * 1.14 = 22800.000000000004)
    // antes de redondear hacia arriba para no sumar $1 sobre resultados enteros exactos.
    return Math.ceil(Number(monto.toFixed(8)));
  }
}
