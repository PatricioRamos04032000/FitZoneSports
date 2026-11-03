import { Module, forwardRef } from '@nestjs/common';
import { ReservasCanchaModule } from '../canchas/reservas/reservas-cancha.module';
import { CheckoutSimuladoController } from './checkout-simulado.controller';
import { PASARELA_PAGO } from './pasarela-pago';
import { PasarelaSimulada } from './pasarela-simulada';
import { PagosRepository } from './pagos.repository';

@Module({
  imports: [forwardRef(() => ReservasCanchaModule)],
  controllers: [CheckoutSimuladoController],
  providers: [
    PagosRepository,
    PasarelaSimulada,
    { provide: PASARELA_PAGO, useExisting: PasarelaSimulada },
  ],
  exports: [PASARELA_PAGO, PasarelaSimulada, PagosRepository],
})
export class PagosModule {}
