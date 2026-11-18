import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PerfilesController } from './perfiles.controller';
import { PerfilesRepository } from './perfiles.repository';
import { PerfilesService } from './perfiles.service';

@Module({
  imports: [AuthModule],
  controllers: [PerfilesController],
  providers: [PerfilesRepository, PerfilesService],
  exports: [PerfilesService],
})
export class PerfilesModule {}
