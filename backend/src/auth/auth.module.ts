import { Module } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { MeController } from './me.controller';
import { SupabaseJwtService, supabaseJwksProvider } from './supabase-jwt.service';

@Module({
  controllers: [MeController],
  providers: [supabaseJwksProvider, SupabaseJwtService, JwtAuthGuard],
  exports: [SupabaseJwtService, JwtAuthGuard],
})
export class AuthModule {}
