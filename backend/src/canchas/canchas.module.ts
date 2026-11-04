import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PreciosModule } from './precios/precios.module';
import { CanchasController } from './canchas.controller';
import { ConfiguracionPreciosController } from './configuracion-precios.controller';
import { CanchasRepository } from './canchas.repository';
import { CanchasService } from './canchas.service';

@Module({
  imports: [AuthModule, PreciosModule],
  controllers: [CanchasController, ConfiguracionPreciosController],
  providers: [CanchasService, CanchasRepository],
  exports: [CanchasService],
})
export class CanchasModule {}
