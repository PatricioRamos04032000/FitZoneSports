import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SedesController } from './sedes.controller';
import { SedesRepository } from './sedes.repository';
import { SedesService } from './sedes.service';

@Module({
  imports: [AuthModule],
  controllers: [SedesController],
  providers: [SedesService, SedesRepository],
})
export class SedesModule {}
