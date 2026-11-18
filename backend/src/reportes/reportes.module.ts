import { Module } from '@nestjs/common';
import { AuthModule } from '../usuarios/auth/auth.module';
import { ReportesController } from './reportes.controller';
import { ReportesResumenRepository } from './reportes-resumen.repository';
import { ReportesService } from './reportes.service';

@Module({
  imports: [AuthModule],
  controllers: [ReportesController],
  providers: [ReportesService, ReportesResumenRepository],
})
export class ReportesModule {}
