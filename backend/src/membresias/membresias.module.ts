import { Module } from '@nestjs/common';
import { MembresiasController } from './membresias.controller';
import { MembresiasService } from './membresias.service';
import { MembresiasRepository } from './membresias.repository';

@Module({
  controllers: [MembresiasController],
  providers: [MembresiasService, MembresiasRepository],
  exports: [MembresiasService], // Se exporta por si otro módulo (por ejemplo Clases) necesita verificar si alguien tiene membresía activa
})
export class MembresiasModule {}