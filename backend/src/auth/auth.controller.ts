import { Controller, Post, Body } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, LoginResponseDto } from './login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Inicia sesión con email y contraseña (pasarela a Supabase Auth)' })
  @ApiCreatedResponse({ type: LoginResponseDto })
  @ApiUnauthorizedResponse({ description: 'Credenciales inválidas' })
  async login(@Body() body: LoginDto) {
    return this.authService.login(body.email, body.password);
  }
}
