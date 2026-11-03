import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ROLES_USUARIO, type RolUsuario } from '../auth/rol-usuario';
import type { ActualizarPerfil, Perfil } from './perfil.model';

export class PerfilDto implements Perfil {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ enum: ROLES_USUARIO, example: 'socio' })
  rol: RolUsuario;

  @ApiProperty({ example: '12345678' })
  dni: string;

  @ApiProperty({ example: 'Lucas' })
  nombre: string;

  @ApiProperty({ example: 'Coquet', nullable: true, type: String })
  apellido: string | null;

  @ApiProperty({ example: '343 1234567', nullable: true, type: String })
  telefono: string | null;

  @ApiProperty({
    example: 'https://cdn.fitzone.example/fotos/lucas.jpg',
    nullable: true,
    type: String,
  })
  foto_url: string | null;

  @ApiProperty({ format: 'uuid', nullable: true, type: String })
  sede_home_id: string | null;

  @ApiProperty({
    description: 'Preferencia de aviso por email',
    example: true,
  })
  notificar_por_email: boolean;

  @ApiProperty({ format: 'date-time' })
  created_at: string;
}

export class PerfilMeDto extends PerfilDto {
  @ApiPropertyOptional({
    example: 'socio@fitzone.com',
    description: 'Email de Supabase Auth (claim del JWT)',
  })
  email?: string;
}

export class ActualizarPerfilDto implements ActualizarPerfil {
  @ApiPropertyOptional({ example: '12345678' })
  dni?: string;

  @ApiPropertyOptional({ example: 'Lucas' })
  nombre?: string;

  @ApiPropertyOptional({ example: 'Coquet', nullable: true, type: String })
  apellido?: string | null;

  @ApiPropertyOptional({ example: '343 1234567', nullable: true, type: String })
  telefono?: string | null;

  @ApiPropertyOptional({
    example: 'https://cdn.fitzone.example/fotos/lucas.jpg',
    nullable: true,
    type: String,
  })
  foto_url?: string | null;

  @ApiPropertyOptional({ format: 'uuid', nullable: true, type: String })
  sede_home_id?: string | null;

  @ApiPropertyOptional({
    example: true,
    description: 'Activar o desactivar notificaciones por email',
  })
  notificar_por_email?: boolean;
}