import { Module } from '@nestjs/common';
import { SedesController } from './sedes.controller';
import { SedesRepository } from './sedes.repository';
import { SedesService } from './sedes.service';

@Module({
  controllers: [SedesController],
  providers: [SedesService, SedesRepository],
})
export class SedesModule {}
