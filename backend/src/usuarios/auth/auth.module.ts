import { Module } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { MeController } from './me.controller';
import { PerfilesRolRepository } from '../../common/perfiles-rol.repository';
import { RolesGuard } from '../../common/roles.guard';
import { SupabaseJwtService, supabaseJwksProvider } from '../../common/supabase-jwt.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

/** Los módulos que usen `@RequiereRol` deben importar este módulo. */
@Module({
  controllers: [MeController, AuthController],
  providers: [
    supabaseJwksProvider,
    SupabaseJwtService,
    JwtAuthGuard,
    RolesGuard,
    PerfilesRolRepository,
    AuthService,
  ],
  exports: [SupabaseJwtService, JwtAuthGuard, RolesGuard, PerfilesRolRepository],
})
export class AuthModule {}
