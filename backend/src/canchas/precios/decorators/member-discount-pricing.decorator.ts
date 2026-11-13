import { Injectable } from '@nestjs/common';
import { ContextoPrecio } from '../pricing.types';
import { PricingDecorator } from './pricing.decorator';

/**
 * Decorador de descuento para socios activos (RF-11, RN-03, S4-T09 P5 y P8, C-28).
 * Solo aplica si el socio tiene membresía activa vigente; si tiene cuota vencida,
 * no aplica y abona tarifa de externo (RN-03).
 */
@Injectable()
export class MemberDiscountPricingDecorator extends PricingDecorator {
  readonly nombre = 'MemberDiscountPricing';

  aplica(ctx: ContextoPrecio): boolean {
    return ctx.esSocioActivo && ctx.descuentoSocioPct > 0;
  }

  modificar(precio: number, ctx: ContextoPrecio): number {
    return precio * (1 - ctx.descuentoSocioPct / 100);
  }
}
