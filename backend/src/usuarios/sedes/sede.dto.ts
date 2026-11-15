import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Sede } from './sede.model';

export class SedeDto implements Sede {
  @ApiProperty({ format: 'uuid', example: '42363e91-8c03-4d52-b160-5c1345be8656' })
  id: string;

  @ApiProperty({ example: 'FitZone Central' })
  nombre: string;

  @ApiProperty({ example: 'San Martín 1234', nullable: true, type: String })
  direccion: string | null;

  @ApiProperty({ example: 100, description: 'Capacidad máxima de personas en la sede' })
  aforo_max: number;

  @ApiProperty({ example: true })
  activa: boolean;

  @ApiProperty({ format: 'date-time', example: '2026-09-21T16:15:30.534949+00:00' })
  created_at: string;
}

export class CrearSedeDto {
  @ApiProperty({ example: 'FitZone Norte' })
  nombre: string;

  @ApiPropertyOptional({
    example: 'Av. Almafuerte 500',
    nullable: true,
    type: String,
  })
  direccion?: string | null;

  @ApiPropertyOptional({
    example: 80,
    description: 'Capacidad máxima. Si se omite, queda en 50.',
  })
  aforo_max?: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Si se omite, la sede nace activa.',
  })
  activa?: boolean;
}

export class ActualizarSedeDto {
  @ApiPropertyOptional({ example: 'FitZone Norte' })
  nombre?: string;

  @ApiPropertyOptional({
    example: 'Av. Almafuerte 500',
    nullable: true,
    type: String,
  })
  direccion?: string | null;

  @ApiPropertyOptional({ example: 120 })
  aforo_max?: number;

  @ApiPropertyOptional({
    example: false,
    description: 'false oculta la sede en los selectores públicos. No borra la fila.',
  })
  activa?: boolean;
}
