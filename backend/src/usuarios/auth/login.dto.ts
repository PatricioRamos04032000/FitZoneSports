import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'socio@fitzone.com' })
  email: string;

  @ApiProperty({ example: 'Prueba12345', format: 'password' })
  password: string;
}

export class LoginResponseDto {
  @ApiProperty({
    description: 'JWT de Supabase Auth. Enviarlo como Authorization: Bearer <token>',
    example: 'eyJhbGciOiJFUzI1NiIsImtpZCI6Ii4uLiJ9...',
  })
  access_token: string;

  @ApiProperty({
    type: 'object',
    additionalProperties: true,
    description: 'Usuario de Supabase Auth (objeto completo que devuelve Supabase)',
    example: {
      id: '3f1c2a9e-8b7d-4c6e-9a1f-2b3c4d5e6f70',
      email: 'socio@fitzone.com',
      role: 'authenticated',
    },
  })
  user: Record<string, unknown>;
}
