import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, LoginResponseDto } from './login.dto';
import { RegisterDto, RegisterResponseDto } from './register.dto';

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

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registro de cliente externo',
    description:
      'Valida formato de email en Nest, crea el usuario en Supabase Auth (mail de confirmación) ' +
      'y la fila en perfiles con rol externo. No devuelve access_token hasta confirmar el email.',
  })
  @ApiCreatedResponse({ type: RegisterResponseDto })
  @ApiBadRequestResponse({ description: 'Email con formato inválido u otros datos inválidos' })
  @ApiConflictResponse({ description: 'Email o DNI ya registrados' })
  async register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }
}
