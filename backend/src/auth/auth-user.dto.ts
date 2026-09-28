import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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
