import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { PagosModule } from '../../pagos/pagos.module';
import { PreciosModule } from '../precios/precios.module';
import { ReservasCanchaController } from './reservas-cancha.controller';
import { ReservasCanchaRepository } from './reservas-cancha.repository';
import { ReservasCanchaService } from './reservas-cancha.service';

@Module({
  imports: [AuthModule, PreciosModule, forwardRef(() => PagosModule)],
  controllers: [ReservasCanchaController],
  providers: [ReservasCanchaRepository, ReservasCanchaService],
  exports: [ReservasCanchaService],
})
export class ReservasCanchaModule {}
