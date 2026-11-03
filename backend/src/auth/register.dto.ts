import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'nuevo@ejemplo.com' })
  email: string;

  @ApiProperty({ example: 'Prueba12345', format: 'password' })
  password: string;

  @ApiProperty({ example: '30111222' })
  dni: string;

  @ApiProperty({ example: 'Ana' })
  nombre: string;

  @ApiPropertyOptional({ example: 'Pérez', nullable: true, type: String })
  apellido?: string | null;

  @ApiPropertyOptional({ example: '343 5550000', nullable: true, type: String })
  telefono?: string | null;
}

export class RegisterUserDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'nuevo@ejemplo.com' })
  email: string;
}

export class RegisterResponseDto {
  @ApiProperty({ type: RegisterUserDto })
  user: RegisterUserDto;

  @ApiProperty({
    example: 'Revisá tu email para confirmar la cuenta',
    description: 'No se emite access_token hasta confirmar el email (Supabase Auth)',
  })
  message: string;
}
