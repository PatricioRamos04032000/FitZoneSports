import { Module, forwardRef } from '@nestjs/common';
import { ReservasCanchaModule } from '../canchas/reservas/reservas-cancha.module';
import { AuthModule } from '../usuarios/auth/auth.module';
import { MembresiasModule } from '../usuarios/membresias/membresias.module';
import { CheckoutSimuladoController } from './checkout-simulado.controller';
import { ComprobantesService } from './comprobantes/comprobantes.service';
import { PagosController } from './pagos.controller';
import { PASARELA_PAGO } from './pasarela-pago';
import { PasarelaSimulada } from './pasarela-simulada';
import { PagosRepository } from './pagos.repository';

@Module({
  imports: [
    AuthModule,
    forwardRef(() => ReservasCanchaModule),
    forwardRef(() => MembresiasModule),
  ],
  controllers: [CheckoutSimuladoController, PagosController],
  providers: [
    PagosRepository,
    PasarelaSimulada,
    ComprobantesService,
    { provide: PASARELA_PAGO, useExisting: PasarelaSimulada },
  ],
  exports: [
    PASARELA_PAGO,
    PasarelaSimulada,
    PagosRepository,
    ComprobantesService,
  ],
})
export class PagosModule {}
