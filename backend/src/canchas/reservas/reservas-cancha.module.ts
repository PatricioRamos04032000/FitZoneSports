import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { PreciosModule } from '../precios/precios.module';
import { PASARELA_PAGO } from './pasarela-pago';
import { PasarelaStub } from './pasarela-stub';
import { ReservasCanchaController } from './reservas-cancha.controller';
import { ReservasCanchaRepository } from './reservas-cancha.repository';
import { ReservasCanchaService } from './reservas-cancha.service';

@Module({
  imports: [AuthModule, PreciosModule],
  controllers: [ReservasCanchaController],
  providers: [
    ReservasCanchaRepository,
    ReservasCanchaService,
    PasarelaStub,
    { provide: PASARELA_PAGO, useExisting: PasarelaStub },
  ],
  exports: [ReservasCanchaService],
})
export class ReservasCanchaModule {}
