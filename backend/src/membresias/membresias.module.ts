import { Module, forwardRef } from '@nestjs/common';
import { AccesoModule } from '../acceso/acceso.module';
import { MembresiasController } from './membresias.controller';
import { MembresiasService } from './membresias.service';
import { MembresiasRepository } from './membresias.repository';

@Module({
  imports: [forwardRef(() => AccesoModule)],
  controllers: [MembresiasController],
  providers: [MembresiasService, MembresiasRepository],
  exports: [MembresiasService], // Se exporta por si otro módulo (por ejemplo Clases) necesita verificar si alguien tiene membresía activa
})
export class MembresiasModule {}
