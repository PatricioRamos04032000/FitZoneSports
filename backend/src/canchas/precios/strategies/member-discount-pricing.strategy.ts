import { Injectable } from '@nestjs/common';
import { ContextoPrecio, PricingStrategy } from '../pricing.strategy';

/**
 * Estrategia de descuento para socios activos (RF-11, RN-03, S4-T09 P5 y P8).
 * Solo aplica si el socio tiene membresía activa vigente; si tiene cuota vencida,
 * no aplica y abona tarifa de externo (RN-03).
 */
@Injectable()
export class MemberDiscountPricing implements PricingStrategy {
  readonly nombre = 'MemberDiscountPricing';

  aplica(ctx: ContextoPrecio): boolean {
    return ctx.esSocioActivo && ctx.descuentoSocioPct > 0;
  }

  calcular(precio: number, ctx: ContextoPrecio): number {
    return precio * (1 - ctx.descuentoSocioPct / 100);
  }
}
