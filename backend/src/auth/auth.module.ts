import { Module } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { MeController } from './me.controller';
import { SupabaseJwtService, supabaseJwksProvider } from './supabase-jwt.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  controllers: [MeController, AuthController],
  providers: [supabaseJwksProvider, SupabaseJwtService, JwtAuthGuard, AuthService],
  exports: [SupabaseJwtService, JwtAuthGuard],
})
export class AuthModule {}
