import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ROLES_USUARIO, type RolUsuario } from './rol-usuario';

export class AuthUserDto {
  @ApiProperty({
    example: '3f1c2a9e-8b7d-4c6e-9a1f-2b3c4d5e6f70',
    description: 'ID del usuario en Supabase Auth (claim sub)',
  })
  id: string;

  @ApiPropertyOptional({ example: 'socio@fitzone.com' })
  email?: string;

  @ApiProperty({
    example: 'authenticated',
    description: 'Rol de Supabase Auth, no el rol de la aplicación',
  })
  role: string;
}

export class MeResponseDto extends AuthUserDto {
  @ApiProperty({
    enum: ROLES_USUARIO,
    nullable: true,
    example: 'socio',
    description: 'Rol de FitZone (perfiles.rol). null si el usuario todavía no tiene perfil',
  })
  rol: RolUsuario | null;
}
