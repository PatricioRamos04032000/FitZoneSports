import { Module } from '@nestjs/common';
import { PreciosService } from './precios.service';
import { PRICING_STRATEGIES, PricingStrategy } from './pricing.strategy';
import { MemberDiscountPricing } from './strategies/member-discount-pricing.strategy';
import { PeakHourPricing } from './strategies/peak-hour-pricing.strategy';
import { StandardPricing } from './strategies/standard-pricing.strategy';

/**
 * Módulo de cálculo de precios de canchas (S4-T01).
 * Inyecta la lista ordenada de estrategias en `PreciosService` mediante el token
 * de colección `PRICING_STRATEGIES` (StandardPricing -> PeakHourPricing -> MemberDiscountPricing).
 */
@Module({
  providers: [
    StandardPricing,
    PeakHourPricing,
    MemberDiscountPricing,
    {
      provide: PRICING_STRATEGIES,
      useFactory: (
        standard: StandardPricing,
        peak: PeakHourPricing,
        memberDiscount: MemberDiscountPricing,
      ): PricingStrategy[] => [standard, peak, memberDiscount],
      inject: [StandardPricing, PeakHourPricing, MemberDiscountPricing],
    },
    PreciosService,
  ],
  exports: [PreciosService],
})
export class PreciosModule {}
