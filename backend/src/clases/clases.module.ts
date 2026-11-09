import { Module } from '@nestjs/common';
import { AuthModule } from '../usuarios/auth/auth.module';
import { MembresiasModule } from '../usuarios/membresias/membresias.module';
import { NotificacionesModule } from './notificaciones/notificaciones.module';
import { ClasesController } from './clases.controller';
import { ClasesRepository } from './clases.repository';
import { ClasesService } from './clases.service';

@Module({
  imports: [AuthModule, MembresiasModule, NotificacionesModule],
  controllers: [ClasesController],
  providers: [ClasesService, ClasesRepository],
  exports: [ClasesService],
})
export class ClasesModule {}
