import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from '../usuarios/auth/auth.module';
import { MembresiasModule } from '../usuarios/membresias/membresias.module';
import { AccesoController } from './acceso.controller';
import { AccesoRepository } from './acceso.repository';
import { AccesoService } from './acceso.service';
import { TotpService } from './totp.service';

@Module({
  imports: [AuthModule, forwardRef(() => MembresiasModule)],
  controllers: [AccesoController],
  providers: [AccesoRepository, AccesoService, TotpService],
  exports: [AccesoService, TotpService],
})
export class AccesoModule {}
