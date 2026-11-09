import { Module, forwardRef } from '@nestjs/common';
import { AccesoModule } from '../../acceso/acceso.module';
import { AuthModule } from '../auth/auth.module';
import { MembresiasController } from './membresias.controller';
import { MembresiasRepository } from './membresias.repository';
import { MembresiasService } from './membresias.service';

@Module({
  imports: [AuthModule, forwardRef(() => AccesoModule)],
  controllers: [MembresiasController],
  providers: [MembresiasService, MembresiasRepository],
  exports: [MembresiasService],
})
export class MembresiasModule {}
