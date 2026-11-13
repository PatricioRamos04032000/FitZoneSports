import { Module } from '@nestjs/common';
import { PreciosService } from './precios.service';
import {
  PRICING_CHAIN,
  PRICING_DECORATORS,
  PricingComponent,
} from './pricing.component';
import { PricingDecorator } from './decorators/pricing.decorator';
import { MemberDiscountPricingDecorator } from './decorators/member-discount-pricing.decorator';
import { PeakHourPricingDecorator } from './decorators/peak-hour-pricing.decorator';
import { StandardPricing } from './decorators/standard-pricing';

/**
 * Módulo de cálculo de precios de canchas (C-28).
 * Arma la cadena Decorator desde una lista ordenada de decoradores
 * (PeakHour → MemberDiscount) envolviendo StandardPricing.
 */
@Module({
  providers: [
    StandardPricing,
    PeakHourPricingDecorator,
    MemberDiscountPricingDecorator,
    {
      provide: PRICING_DECORATORS,
      useFactory: (
        peak: PeakHourPricingDecorator,
        memberDiscount: MemberDiscountPricingDecorator,
      ): PricingDecorator[] => [peak, memberDiscount],
      inject: [PeakHourPricingDecorator, MemberDiscountPricingDecorator],
    },
    {
      provide: PRICING_CHAIN,
      useFactory: (
        standard: StandardPricing,
        decorators: PricingDecorator[],
      ): PricingComponent =>
        decorators.reduce<PricingComponent>(
          (inner, decorator) => decorator.wrap(inner),
          standard,
        ),
      inject: [StandardPricing, PRICING_DECORATORS],
    },
    PreciosService,
  ],
  exports: [PreciosService],
})
export class PreciosModule {}
