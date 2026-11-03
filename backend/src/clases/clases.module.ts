import { Module } from '@nestjs/common';
import { ClasesController } from './clases.controller';
import { ClasesService } from './clases.service';
import { ClasesRepository } from './clases.repository';

@Module({
  controllers: [ClasesController],
  providers: [ClasesService, ClasesRepository],
  exports: [ClasesService],
})
export class ClasesModule {}